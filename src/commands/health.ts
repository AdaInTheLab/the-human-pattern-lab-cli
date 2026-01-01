/* ===========================================================
   🌌 HUMAN PATTERN LAB — COMMAND: health
   =========================================================== */

import { z } from "zod";
import { getAlphaIntent } from "../contract/intents";
import { ok, err } from "../contract/envelope";
import { EXIT } from "../contract/exitCodes";
import { getJson, HttpError } from "../http/client";

const HealthSchema = z.object({
  status: z.string(),
  dbPath: z.string().optional(),
});

export type HealthData = z.infer<typeof HealthSchema>;

export async function runHealth(commandName = "health") {
  const intent = getAlphaIntent("check_health");

  try {
    const payload = await getJson<unknown>("/health");
    const parsed = HealthSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        envelope: err(commandName, intent, {
          code: "E_CONTRACT",
          message: "Health response did not match expected schema",
          details: parsed.error.flatten(),
        }),
        exitCode: EXIT.CONTRACT,
      };
    }

    return { envelope: ok(commandName, intent, parsed.data), exitCode: EXIT.OK };
  } catch (e) {
    if (e instanceof HttpError) {
      const code = e.status && e.status >= 500 ? "E_SERVER" : "E_HTTP";
      return {
        envelope: err(commandName, intent, {
          code,
          message: `API request failed (${e.status ?? "unknown"})`,
          details: e.body ? e.body.slice(0, 500) : undefined,
        }),
        exitCode: e.status && e.status >= 500 ? EXIT.SERVER : EXIT.NETWORK,
      };
    }

    const msg = e instanceof Error ? e.message : String(e);
    return {
      envelope: err(commandName, intent, { code: "E_UNKNOWN", message: msg }),
      exitCode: EXIT.UNKNOWN,
    };
  }
}
