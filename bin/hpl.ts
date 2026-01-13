#!/usr/bin/env node
/* ===========================================================
   🌌 HUMAN PATTERN LAB — CLI ENTRYPOINT
   -----------------------------------------------------------
   Purpose:
     - Register top-level commands
     - Define global flags (--json)
     - Parse argv
   Contract:
     --json => JSON only on stdout (enforced in command handlers)
   Notes:
     Avoid process.exit() inside handlers (Windows + tsx stability).
   =========================================================== */

import { Command } from "commander";

import { versionCommand } from "../src/commands/version.js";
import { capabilitiesCommand } from "../src/commands/capabilities.js";
import { healthCommand } from "../src/commands/health.js";
import { notesCommand } from "../src/commands/notes/notes.js";

import { EXIT } from "../src/contract/exitCodes.js";

const program = new Command();

program
    .name("hpl")
    .description("Human Pattern Lab CLI (alpha)")
    .option("--json", "Emit contract JSON only on stdout")
    .showHelpAfterError()
    .configureHelp({ helpWidth: 100 });

program.addCommand(versionCommand());
program.addCommand(capabilitiesCommand());
program.addCommand(healthCommand());
program.addCommand(notesCommand());

program.parseAsync(process.argv).catch(() => {
    process.exitCode = EXIT.UNKNOWN;
});
