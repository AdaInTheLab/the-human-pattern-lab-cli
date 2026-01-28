/* ===========================================================
   🌌 HUMAN PATTERN LAB — COMMAND: version
   =========================================================== */

import { Command } from "commander";
import { writeHuman, writeJson } from "../io.js";
import { EXIT } from "../contract/exitCodes.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync, existsSync } from "fs";
import { getAlphaIntent } from "../contract/intents.js";
import { ok } from "../contract/envelope.js";

type GlobalOpts = { json?: boolean }

// Resolve package.json from current file location (works for both tsx and compiled)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try source location first (tsx), then compiled location
let pkgPath = join(__dirname, "../../package.json");
if (!existsSync(pkgPath)) {
  pkgPath = join(__dirname, "../../../package.json");
}

const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as { name: string; version: string };

export function versionCommand(): Command {
  return new Command("version")
      .description("Show CLI version (contract: show_version)")
      .action((...args: any[]) => {
        const cmd = args[args.length - 1] as Command;
        const rootOpts = (((cmd as any).parent?.opts?.() ?? {}) as GlobalOpts);

        const envelope = runVersion("version");

        if (rootOpts.json) writeJson(envelope);
        else writeHuman(`${(envelope as any).data?.name} ${(envelope as any).data?.version}`.trim());

        process.exitCode = EXIT.OK;
      });
}

export function runVersion(commandName = "version") {
  const intent = getAlphaIntent("show_version");
  return ok(commandName, intent, { name: pkg.name, version: pkg.version });
}
