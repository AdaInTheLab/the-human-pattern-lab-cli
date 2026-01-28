/* ===========================================================
   🌌 HUMAN PATTERN LAB — COMMAND: capabilities
   =========================================================== */

import { Command } from "commander";
import { writeHuman, writeJson } from "../io.js";
import { EXIT } from "../contract/exitCodes.js";
import { getAlphaIntent } from "../contract/intents.js";
import { ok } from "../contract/envelope.js";
import { getCapabilitiesAlpha } from "../contract/capabilities.js";

type GlobalOpts = { json?: boolean };

export function capabilitiesCommand(): Command {
  return new Command("capabilities")
      .description("Show CLI capabilities for agents (contract: show_capabilities)")
      .action((...args: any[]) => {
        const cmd = args[args.length - 1] as Command;
        const rootOpts = (((cmd as any).parent?.opts?.() ?? {}) as GlobalOpts);

        const envelope = runCapabilities("capabilities");

        if (rootOpts.json) {
          writeJson(envelope);
        } else {
          const d: any = (envelope as any).data ?? {};
          writeHuman(`intentTier: ${d.intentTier ?? "-"}`);
          writeHuman(`schemaVersions: ${(d.schemaVersions ?? []).join(", ")}`);
          writeHuman(`supportedIntents:`);
          for (const i of d.supportedIntents ?? []) writeHuman(`  - ${i}`);
        }

        process.exitCode = EXIT.OK;
      });
}

export function runCapabilities(commandName = "capabilities") {
  const intent = getAlphaIntent("show_capabilities");
  return ok(commandName, intent, getCapabilitiesAlpha());
}
