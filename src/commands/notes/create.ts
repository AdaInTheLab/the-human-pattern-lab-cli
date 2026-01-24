/* ===========================================================
   🦊 THE HUMAN PATTERN LAB — HPL CLI
   -----------------------------------------------------------
   File: create.ts
   Role: Notes subcommand: `hpl notes create`
   Author: Ada (The Human Pattern Lab)
   Assistant: Claude
   Lab Unit: SCMS — Systems & Code Management Suite
   Status: Active
   -----------------------------------------------------------
   Purpose:
     Create a new Lab Note via API using the upsert endpoint.
     Supports both markdown file input and inline content.
   -----------------------------------------------------------
   Design:
     - Core function returns { envelope, exitCode }
     - Commander adapter decides json vs human rendering
     - Requires authentication via HPL_TOKEN
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

type CreateNoteResponse = {
  ok: boolean;
  slug: string;
  action?: "created" | "updated";
};

type CreateNoteOptions = {
  title: string;
  slug: string;
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
 * Core: create a new Lab Note.
 * Returns structured envelope + exitCode (no printing here).
 */
export async function runNotesCreate(options: CreateNoteOptions, commandName = "notes.create") {
  const intent = getAlphaIntent("create_lab_note");

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

  // Get markdown content
  let markdown: string;
  
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
  } else {
    return {
      envelope: err(commandName, intent, {
        code: "E_VALIDATION",
        message: "Either --markdown or --file is required",
      }),
      exitCode: EXIT.VALIDATION,
    };
  }

  // Build payload
  const payload: LabNoteUpsertPayload = {
    slug: options.slug,
    title: options.title,
    content_markdown: markdown,
    locale: options.locale,
    subtitle: options.subtitle,
    summary: options.summary,
    tags: options.tags,
    published: options.published,
    status: options.status,
    type: options.type,
    dept: options.dept,
  };

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
    const response = await postJson<CreateNoteResponse>(
      "/admin/notes",
      parsed.data,
      token
    );

    return {
      envelope: ok(commandName, intent, {
        slug: response.slug,
        action: response.action ?? "created",
        message: `Lab Note ${response.action ?? "created"}: ${response.slug}`,
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
 * Commander: `hpl notes create`
 */
export function notesCreateSubcommand() {
  return new Command("create")
    .description("Create a new Lab Note (contract: create_lab_note)")
    .requiredOption("--title <title>", "Note title")
    .requiredOption("--slug <slug>", "Note slug (unique identifier)")
    .option("--markdown <text>", "Markdown content (inline)")
    .option("--file <path>", "Path to markdown file")
    .option("--locale <code>", "Locale code (default: en)", "en")
    .option("--subtitle <text>", "Note subtitle")
    .option("--summary <text>", "Note summary")
    .option("--tags <tags>", "Comma-separated tags", (val) => val.split(",").map((t) => t.trim()))
    .option("--published <date>", "Publication date (ISO format)")
    .option("--status <status>", "Note status (draft|published|archived)", "draft")
    .option("--type <type>", "Note type (labnote|paper|memo|lore|weather)", "labnote")
    .option("--dept <dept>", "Department code")
    .action(async (opts, cmd) => {
      const mode = getOutputMode(cmd);
      const { envelope, exitCode } = await runNotesCreate(opts, "notes.create");

      if (mode === "json") {
        printJson(envelope);
      } else {
        renderText(envelope);
      }

      process.exitCode = exitCode;
    });
}
