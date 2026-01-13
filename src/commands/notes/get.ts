/* ===========================================================
   🦊 THE HUMAN PATTERN LAB — HPL CLI
   -----------------------------------------------------------
   File: get.ts
   Role: Notes subcommand: `hpl notes get <slug>`
   Author: Ada (The Human Pattern Lab)
   Assistant: Lyric
   Lab Unit: SCMS — Systems & Code Management Suite
   Status: Active
   -----------------------------------------------------------
   Design:
     - Core function returns { envelope, exitCode }
     - Commander adapter decides json vs human rendering
     - Markdown is canonical (content_markdown)
   =========================================================== */

import { Command } from "commander";

import { getOutputMode, printJson } from "../../cli/output.js";
import { renderText } from "../../render/text.js";

import { LabNoteDetailSchema } from "../../types/labNotes.js";

import { getAlphaIntent } from "../../contract/intents.js";
import { ok, err } from "../../contract/envelope.js";
import { EXIT } from "../../contract/exitCodes.js";
import { getJson, HttpError } from "../../http/client.js";

/**
 * Core: fetch a single published Lab Note (detail).
 * Returns structured envelope + exitCode (no printing here).
 */
export async function runNotesGet(slug: string, commandName = "notes.get") {
  const intent = getAlphaIntent("render_lab_note");

  try {
    const payload = await getJson<unknown>(`/lab-notes/${encodeURIComponent(slug)}`);
    const parsed = LabNoteDetailSchema.safeParse(payload);

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

    return { envelope: ok(commandName, intent, parsed.data), exitCode: EXIT.OK };
  } catch (e) {
    if (e instanceof HttpError) {
      if (e.status === 404) {
        return {
          envelope: err(commandName, intent, {
            code: "E_NOT_FOUND",
            message: `No lab note found for slug: ${slug}`,
          }),
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

/**
 * Commander: `hpl notes get <slug>`
 */
export function notesGetSubcommand() {
  return new Command("get")
      .description("Get a Lab Note by slug (contract: render_lab_note)")
      .argument("<slug>", "Lab Note slug")
      .action(async (slug: string, opts, cmd) => {
        const mode = getOutputMode(cmd);
        const { envelope, exitCode } = await runNotesGet(slug, "notes.get");

        if (mode === "json") {
          printJson(envelope);
        } else {
          renderText(envelope);
        }

        process.exitCode = exitCode;
      });
}
