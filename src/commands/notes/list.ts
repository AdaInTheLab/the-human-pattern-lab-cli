/* ===========================================================
   🦊 THE HUMAN PATTERN LAB — HPL CLI
   -----------------------------------------------------------
   File: list.ts
   Role: Notes subcommand: `hpl notes list`
   Author: Ada (The Human Pattern Lab)
   Assistant: Lyric
   Lab Unit: SCMS — Systems & Code Management Suite
   Status: Active
   -----------------------------------------------------------
   Design:
     - Core function returns { envelope, exitCode }
     - Commander adapter decides json vs human rendering
     - JSON mode emits stdout-only structured data
   =========================================================== */

import { Command } from "commander";

import { getOutputMode, printJson } from "../../cli/output.js";
import {Column, formatTags, renderTable, safeLine} from "../../render/table.js";
import { renderText } from "../../render/text.js";

import { LabNotePreviewListSchema } from "../../types/labNotes.js";

import { getAlphaIntent } from "../../contract/intents.js";
import { ok, err } from "../../contract/envelope.js";
import { EXIT } from "../../contract/exitCodes.js";
import { getJson, HttpError } from "../../http/client.js";


/**
 * Core: fetch the published lab note previews.
 * Returns structured envelope + exitCode (no printing here).
 */
export async function runNotesList(commandName = "notes.list", locale?: string) {
  const intent = getAlphaIntent("render_lab_note");

  try {
    const qp = locale ? `?locale=${encodeURIComponent(locale)}` : "";
    const payload = await getJson<unknown>(`/lab-notes${qp}`);

    const parsed = LabNotePreviewListSchema.safeParse(payload);
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
    return { envelope: err(commandName, intent, { code: "E_UNKNOWN", message: msg }), exitCode: EXIT.UNKNOWN };
  }
}

/* ----------------------------------------
   Helper: human table renderer for notes
----------------------------------------- */
function renderNotesListTable(envelope: any) {
  const rows = Array.isArray(envelope?.data) ? envelope.data : [];

  const cols: Column<any>[] = [
    { header: "Title",  width: 32, value: (r) => safeLine(r?.title ?? "-") },
    { header: "Slug",   width: 26, value: (r) => safeLine(r?.slug ?? "-") },
    { header: "Locale", width: 6,  value: (r) => safeLine(r?.locale ?? "-") },
    { header: "Type",   width: 8,  value: (r) => safeLine(r?.type ?? "-") },
    { header: "Tags",   width: 24, value: (r) => formatTags(r?.tags) },
  ];

  console.log(renderTable(rows, cols));
}

/* ----------------------------------------
   Subcommand builder
----------------------------------------- */
export function notesListSubcommand() {
  return new Command("list")
      .description("List published Lab Notes (contract: render_lab_note)")
      .action(async (opts, cmd) => {
        const mode = getOutputMode(cmd);
        const { envelope, exitCode } = await runNotesList("notes.list", opts.locale);

        if (mode === "json") {
          printJson(envelope);
        } else {
          try {
            renderNotesListTable(envelope);
          } catch {
            renderText(envelope);
          }
        }

        process.exitCode = exitCode;
      });
}
