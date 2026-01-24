/* ===========================================================
   🦊 THE HUMAN PATTERN LAB — HPL CLI
   -----------------------------------------------------------
   File: update.ts
   Role: Notes subcommand: `hpl notes update`
   Author: Ada (The Human Pattern Lab)
   Assistant: Claude
   Lab Unit: SCMS — Systems & Code Management Suite
   Status: Active
   -----------------------------------------------------------
   Purpose:
     Update an existing Lab Note via API using the upsert endpoint.
     Supports both markdown file input and inline content.
   -----------------------------------------------------------
   Design:
     - Core function returns { envelope, exitCode }
     - Commander adapter decides json vs human rendering
     - Requires authentication via HPL_TOKEN
     - Uses upsert endpoint (same as create)
   =========================================================== */

import fs from "node:fs";
import { Command } from "commander";

import { getOutputMode, printJson } from "../../cli/output.js";
import { renderText } from "../../render/text.js";

import { LabNoteUpsertSchema, type LabNoteUpsertPayload } from "../../types/labNotes.js";
import { HPL_TOKEN } from "../../lib/config.js";

import { getAlphaIntent } from "../../contract/intents.js";
import { ok, err } from "../../contract/envelope.js";
import { EXIT } from "../../contract/exitCodes.js";
import { postJson, HttpError } from "../../http/client.js";

type UpdateNoteResponse = {
  ok: boolean;
  slug: string;
  action?: "created" | "updated";
};

type UpdateNoteOptions = {
  slug: string;
  title?: string;
  markdown?: string;
  file?: string;
  locale?: string;
  subtitle?: string;
  summary?: string;
  tags?: string[];
  published?: string;
  status?: "draft" | "published" | "archived";
  type?: "labnote" | "paper" | "memo" | "lore" | "weather";
  dept?: string;
};

/**
 * Core: update an existing Lab Note.
 * Returns structured envelope + exitCode (no printing here).
 */
export async function runNotesUpdate(options: UpdateNoteOptions, commandName = "notes.update") {
  const intent = getAlphaIntent("update_lab_note");

  // Authentication check
  const token = HPL_TOKEN();
  if (!token) {
    return {
      envelope: err(commandName, intent, {
        code: "E_AUTH",
        message: "Authentication required. Set HPL_TOKEN environment variable or configure token in ~/.humanpatternlab/hpl.json",
      }),
      exitCode: EXIT.AUTH,
    };
  }

  // Get markdown content if provided
  let markdown: string | undefined;
  
  if (options.file) {
    if (!fs.existsSync(options.file)) {
      return {
        envelope: err(commandName, intent, {
          code: "E_NOT_FOUND",
          message: `File not found: ${options.file}`,
        }),
        exitCode: EXIT.NOT_FOUND,
      };
    }
    try {
      markdown = fs.readFileSync(options.file, "utf-8");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        envelope: err(commandName, intent, {
          code: "E_IO",
          message: `Failed to read file: ${msg}`,
        }),
        exitCode: EXIT.IO,
      };
    }
  } else if (options.markdown) {
    markdown = options.markdown;
  }

  // For updates, we need at least title OR markdown
  if (!options.title && !markdown) {
    return {
      envelope: err(commandName, intent, {
        code: "E_VALIDATION",
        message: "Must provide at least --title or --markdown/--file for update",
      }),
      exitCode: EXIT.VALIDATION,
    };
  }

  // Build payload - use required fields from what's provided
  // The API will handle partial updates if it supports them, 
  // or we provide what we have
  const payload: Partial<LabNoteUpsertPayload> = {
    slug: options.slug,
  };

  if (options.title) payload.title = options.title;
  if (markdown) payload.content_markdown = markdown;
  if (options.locale) payload.locale = options.locale;
  if (options.subtitle) payload.subtitle = options.subtitle;
  if (options.summary) payload.summary = options.summary;
  if (options.tags) payload.tags = options.tags;
  if (options.published) payload.published = options.published;
  if (options.status) payload.status = options.status;
  if (options.type) payload.type = options.type;
  if (options.dept) payload.dept = options.dept;

  // The upsert endpoint requires title and content_markdown
  // For an update operation, if these aren't provided, we should fetch the existing note first
  if (!payload.title || !payload.content_markdown) {
    return {
      envelope: err(commandName, intent, {
        code: "E_VALIDATION",
        message: "Update requires both --title and (--markdown or --file). For partial updates, use the API directly or fetch the existing note first.",
      }),
      exitCode: EXIT.VALIDATION,
    };
  }

  // Validate payload
  const parsed = LabNoteUpsertSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      envelope: err(commandName, intent, {
        code: "E_VALIDATION",
        message: "Invalid note data",
        details: parsed.error.flatten(),
      }),
      exitCode: EXIT.VALIDATION,
    };
  }

  // Make API request
  try {
    const response = await postJson<UpdateNoteResponse>(
      "/admin/notes",
      parsed.data,
      token
    );

    return {
      envelope: ok(commandName, intent, {
        slug: response.slug,
        action: response.action ?? "updated",
        message: `Lab Note ${response.action ?? "updated"}: ${response.slug}`,
      }),
      exitCode: EXIT.OK,
    };
  } catch (e) {
    if (e instanceof HttpError) {
      if (e.status === 401 || e.status === 403) {
        return {
          envelope: err(commandName, intent, {
            code: "E_AUTH",
            message: "Authentication failed. Check your HPL_TOKEN.",
          }),
          exitCode: EXIT.AUTH,
        };
      }

      if (e.status === 404) {
        return {
          envelope: err(commandName, intent, {
            code: "E_NOT_FOUND",
            message: `No lab note found for slug: ${options.slug}`,
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
    return {
      envelope: err(commandName, intent, {
        code: "E_UNKNOWN",
        message: msg,
      }),
      exitCode: EXIT.UNKNOWN,
    };
  }
}

/**
 * Commander: `hpl notes update`
 */
export function notesUpdateSubcommand() {
  return new Command("update")
    .description("Update an existing Lab Note (contract: update_lab_note)")
    .argument("<slug>", "Note slug to update")
    .option("--title <title>", "Note title")
    .option("--markdown <text>", "Markdown content (inline)")
    .option("--file <path>", "Path to markdown file")
    .option("--locale <code>", "Locale code")
    .option("--subtitle <text>", "Note subtitle")
    .option("--summary <text>", "Note summary")
    .option("--tags <tags>", "Comma-separated tags", (val) => val.split(",").map((t) => t.trim()))
    .option("--published <date>", "Publication date (ISO format)")
    .option("--status <status>", "Note status (draft|published|archived)")
    .option("--type <type>", "Note type (labnote|paper|memo|lore|weather)")
    .option("--dept <dept>", "Department code")
    .action(async (slug: string, opts, cmd) => {
      const mode = getOutputMode(cmd);
      const { envelope, exitCode } = await runNotesUpdate(
        { ...opts, slug },
        "notes.update"
      );

      if (mode === "json") {
        printJson(envelope);
      } else {
        renderText(envelope);
      }

      process.exitCode = exitCode;
    });
}
