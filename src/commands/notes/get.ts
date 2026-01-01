/* ===========================================================
   🌌 HUMAN PATTERN LAB — COMMAND: notes get <slug>
   =========================================================== */

import { getAlphaIntent } from "../../contract/intents";
import { ok, err } from "../../contract/envelope";
import { EXIT } from "../../contract/exitCodes";
import { getJson, HttpError } from "../../http/client";
import { LabNoteSchema, type LabNote } from "../../types/labNotes";

export async function runNotesGet(slug: string, commandName = "notes get") {
  const intent = getAlphaIntent("render_lab_note");

  try {
    const payload = await getJson<unknown>(`/lab-notes/${encodeURIComponent(slug)}`);
    const parsed = LabNoteSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        envelope: err(commandName, intent, {
          code: "E_CONTRACT",
          message: "Lab Note did not match expected schema",
          details: parsed.error.flatten(),
        }),
        exitCode: EXIT.CONTRACT,
      };
    }

    const note: LabNote = parsed.data;
    return { envelope: ok(commandName, intent, note), exitCode: EXIT.OK };
  } catch (e) {
    if (e instanceof HttpError) {
      if (e.status == 404) {
        return {
          envelope: err(commandName, intent, { code: "E_NOT_FOUND", message: `No lab note found for slug: ${slug}` }),
          exitCode: EXIT.NOT_FOUND,
        };
      }
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
    return { envelope: err(commandName, intent, { code: "E_UNKNOWN", message: msg }), exitCode: EXIT.UNKNOWN };
  }
}
