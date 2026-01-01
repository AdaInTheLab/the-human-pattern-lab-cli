#!/usr/bin/env node
/* ===========================================================
   🌌 HUMAN PATTERN LAB — CLI ENTRYPOINT
   -----------------------------------------------------------
   Commands:
     - version
     - capabilities
     - health
     - notes list
     - notes get <slug>
   Contract: --json => JSON only on stdout
   Notes:
     - Avoid process.exit() inside command handlers (can trip libuv on Windows + tsx).
   =========================================================== */

import { Command } from "commander";
import { writeHuman, writeJson } from "../src/io";
import { EXIT } from "../src/contract/exitCodes";
import { runVersion } from "../src/commands/version";
import { runCapabilities } from "../src/commands/capabilities";
import { runHealth } from "../src/commands/health";
import { runNotesList } from "../src/commands/notes/list";
import { runNotesGet } from "../src/commands/notes/get";
import { renderTable } from "../src/render/table";
import { formatTags, safeLine, stripHtml } from "../src/render/text";

type GlobalOpts = { json?: boolean };

const program = new Command();

program
  .name("hpl")
  .description("Human Pattern Lab CLI (alpha)")
  .option("--json", "Emit contract JSON only on stdout")
  .showHelpAfterError();

function setExit(code: number) {
  // Let Node exit naturally (important for Windows + tsx stability).
  process.exitCode = code;
}

program
  .command("version")
  .description("Show CLI version (contract: show_version)")
  .action(() => {
    const opts = program.opts<GlobalOpts>();
    const envelope = runVersion("version");
    if (opts.json) writeJson(envelope);
    else writeHuman(`${envelope.data.name} ${envelope.data.version}`);
    setExit(EXIT.OK);
  });

program
  .command("capabilities")
  .description("Show CLI capabilities for agents (contract: show_capabilities)")
  .action(() => {
    const opts = program.opts<GlobalOpts>();
    const envelope = runCapabilities("capabilities");
    if (opts.json) writeJson(envelope);
    else {
      writeHuman(`intentTier: ${envelope.data.intentTier}`);
      writeHuman(`schemaVersions: ${envelope.data.schemaVersions.join(", ")}`);
      writeHuman(`supportedIntents:`);
      for (const i of envelope.data.supportedIntents) writeHuman(`  - ${i}`);
    }
    setExit(EXIT.OK);
  });

program
  .command("health")
  .description("Check API health (contract: check_health)")
  .action(async () => {
    const opts = program.opts<GlobalOpts>();
    const result = await runHealth("health");

    if (opts.json) {
      writeJson(result.envelope);
    } else {
      if (result.envelope.status === "ok") {
        const d: any = (result.envelope as any).data;
        const db = d.dbPath ? ` (db: ${d.dbPath})` : "";
        writeHuman(`ok${db}`);
      } else {
        const e: any = (result.envelope as any).error;
        writeHuman(`error: ${e.code} — ${e.message}`);
      }
    }
    setExit(result.exitCode);
  });

const notes = program.command("notes").description("Lab Notes commands");

notes
  .command("list")
  .description("List lab notes (contract: render_lab_note)")
  .option("--limit <n>", "Limit number of rows (client-side)", (v) => parseInt(v, 10))
  .action(async (cmdOpts: { limit?: number }) => {
    const opts = program.opts<GlobalOpts>();
    const result = await runNotesList("notes list");

    if (opts.json) {
      writeJson(result.envelope);
      setExit(result.exitCode);
      return;
    }

    if (result.envelope.status !== "ok") {
      const e: any = (result.envelope as any).error;
      writeHuman(`error: ${e.code} — ${e.message}`);
      setExit(result.exitCode);
      return;
    }

    const data: any = (result.envelope as any).data;
    const rows = (data.notes as any[]) ?? [];
    const limit = Number.isFinite(cmdOpts.limit) && (cmdOpts.limit as any) > 0 ? (cmdOpts.limit as any) : rows.length;
    const slice = rows.slice(0, limit);

    const table = renderTable(slice, [
      { header: "slug", width: 28, value: (n) => safeLine(String((n as any).slug ?? "")) },
      { header: "title", width: 34, value: (n) => safeLine(String((n as any).title ?? "")) },
      { header: "status", width: 10, value: (n) => safeLine(String((n as any).status ?? "-")) },
      { header: "dept", width: 8, value: (n) => safeLine(String((n as any).department_id ?? "-")) },
      { header: "tags", width: 22, value: (n) => formatTags((n as any).tags) },
    ]);

    writeHuman(table);
    writeHuman(`\ncount: ${data.count}`);
    setExit(result.exitCode);
  });

notes
  .command("get")
  .description("Get a lab note by slug (contract: render_lab_note)")
  .argument("<slug>", "Lab Note slug")
  .option("--raw", "Print raw contentHtml (no HTML stripping)")
  .action(async (slug: string, cmdOpts: { raw?: boolean }) => {
    const opts = program.opts<GlobalOpts>();
    const result = await runNotesGet(slug, "notes get");

    if (opts.json) {
      writeJson(result.envelope);
      setExit(result.exitCode);
      return;
    }

    if (result.envelope.status !== "ok") {
      const e: any = (result.envelope as any).error;
      writeHuman(`error: ${e.code} — ${e.message}`);
      setExit(result.exitCode);
      return;
    }

    const n: any = (result.envelope as any).data;

    writeHuman(`# ${n.title}`);
    writeHuman(`slug: ${n.slug}`);
    if (n.status) writeHuman(`status: ${n.status}`);
    if (n.type) writeHuman(`type: ${n.type}`);
    if (n.department_id) writeHuman(`department_id: ${n.department_id}`);
    if (n.published) writeHuman(`published: ${n.published}`);
    if (Array.isArray(n.tags)) writeHuman(`tags: ${formatTags(n.tags)}`);
    writeHuman("");

    const body = cmdOpts.raw ? String(n.contentHtml ?? "") : stripHtml(String(n.contentHtml ?? ""));
    writeHuman(body || "(no content)");
    setExit(result.exitCode);
  });

// Let commander handle errors; set exit code without hard exit.
program.parseAsync(process.argv).catch(() => setExit(EXIT.UNKNOWN));
