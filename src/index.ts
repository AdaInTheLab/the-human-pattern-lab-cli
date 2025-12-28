#!/usr/bin/env node
/* ===========================================================
   🦊 THE HUMAN PATTERN LAB — SKULK CLI
   -----------------------------------------------------------
   File: notesSync.ts
   Role: Command Implementation
   Author: Ada (The Human Pattern Lab)
   Assistant: Lyric
   Status: Active
   Description:
     Implements the `skulk notes sync` command.
     Handles human-readable and machine-readable output modes
     with enforced JSON purity for automation safety.
   -----------------------------------------------------------
   Design Notes:
     - Output format is a contract
     - JSON mode emits stdout-only structured data
     - Errors are written to stderr
     - Exit codes are deterministic
   =========================================================== */

import { Command } from "commander";
import { notesSyncCommand } from "./commands/notesSync.js";

const program = new Command();

program
    .name("skulk")
    .description("Skulk CLI for The Human Pattern Lab")
    .version("0.1.0")
    .option("--json", "Output machine-readable JSON")
    .configureHelp({ helpWidth: 100 });

const argv = process.argv.slice(2);

if (argv.length === 0) {
    program.outputHelp();
    process.exit(0);
}

program.addCommand(notesSyncCommand());
program.parse(process.argv);
