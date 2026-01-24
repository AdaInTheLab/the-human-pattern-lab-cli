/* ===========================================================
   🦊 THE HUMAN PATTERN LAB — HPL CLI
   -----------------------------------------------------------
   File: notes.ts
   Role: Notes command assembler (domain root)
   Author: Ada (The Human Pattern Lab)
   Assistant: Lyric
   Lab Unit: SCMS — Systems & Code Management Suite
   Status: Active
   -----------------------------------------------------------
   Purpose:
     Defines the `hpl notes` command tree and mounts subcommands:
       - hpl notes list
       - hpl notes get <slug>
       - hpl notes sync
   -----------------------------------------------------------
   Design:
     - This file is wiring only (no network calls, no rendering)
     - Subcommands own their own output logic and contracts
   =========================================================== */

import { Command } from "commander";

import { notesListSubcommand } from "./list.js";
import { notesGetSubcommand } from "./get.js";
import { notesSyncSubcommand } from "./notesSync.js";
import { notesCreateSubcommand } from "./create.js";
import { notesUpdateSubcommand } from "./update.js";

export function notesCommand() {
    const notes = new Command("notes").description("Lab Notes commands");

    // Subcommands
    notes.addCommand(notesListSubcommand());
    notes.addCommand(notesGetSubcommand());
    notes.addCommand(notesCreateSubcommand());
    notes.addCommand(notesUpdateSubcommand());
    notes.addCommand(notesSyncSubcommand());

    return notes;
}
