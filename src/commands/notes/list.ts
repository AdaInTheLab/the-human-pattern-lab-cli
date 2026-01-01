/* ===========================================================
   🌌 HUMAN PATTERN LAB — COMMAND: notes list
   =========================================================== */

import { getAlphaIntent } from "../../contract/intents";
import { ok, err } from "../../contract/envelope";
import { EXIT } from "../../contract/exitCodes";
import { getJson, HttpError } from "../../http/client";
import { LabNoteListSchema, type LabNote } from "../../types/labNotes";

export async function runNotesList(commandName = "notes list") {
  const intent = getAlphaIntent("render_lab_note");

  try {
    const payload = await getJson<unknown>("/lab-notes");
    const parsed = LabNoteListSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        envelope: err(commandName, intent, {
          code: "E_CONTRACT",
          message: "Lab Notes list did not match expected schema",
          details: parsed.error.flatten(),
        }),
        exitCode: EXIT.CONTRACT,
      };
    }

    // Deterministic: preserve API order, but ensure stable array type.
    const notes: LabNote[] = parsed.data;

    return { envelope: ok(commandName, intent, { count: notes.length, notes }), exitCode: EXIT.OK };
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
    return { envelope: err(commandName, intent, { code: "E_UNKNOWN", message: msg }), exitCode: EXIT.UNKNOWN };
  }
}
