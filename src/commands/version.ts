/* ===========================================================
   🌌 HUMAN PATTERN LAB — COMMAND: version
   =========================================================== */

import { Command } from "commander";
import { writeHuman, writeJson } from "../io.js";
import { EXIT } from "../contract/exitCodes.js";
import { createRequire } from "node:module";
import { getAlphaIntent } from "../contract/intents";
import { ok } from "../contract/envelope";

type GlobalOpts = { json?: boolean }

const require = createRequire(import.meta.url);
const pkg = require("../../package.json") as { name: string; version: string };

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
