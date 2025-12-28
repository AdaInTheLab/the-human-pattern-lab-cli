"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notesSyncCommand = notesSyncCommand;
const commander_1 = require("commander");
const config_js_1 = require("../lib/config.js");
const http_js_1 = require("../lib/http.js");
const notes_js_1 = require("../lib/notes.js");
async function upsertNote(baseUrl, token, note) {
    // Adjust this to match your API.
    // Recommended: POST /api/lab-notes/upsert  OR POST /api/lab-notes (upsert by slug)
    return (0, http_js_1.httpJson)({ baseUrl, token }, "POST", "/lab-notes", note);
}
function notesSyncCommand() {
    const notes = new commander_1.Command("notes").description("Lab Notes commands");
    notes
        .command("sync")
        .description("Sync local markdown notes to the API")
        .option("--dir <path>", "Directory containing markdown notes", "./labnotes/en")
        .option("--locale <code>", "Locale code", "en")
        .option("--base-url <url>", "Override API base URL (ex: https://thehumanpatternlab.com/api)")
        .option("--dry-run", "Print what would be sent, but do not call the API", false)
        .action(async (opts) => {
        const baseUrl = (0, config_js_1.resolveApiBaseUrl)(opts.baseUrl);
        const token = (0, config_js_1.resolveToken)();
        const files = (0, notes_js_1.listMarkdownFiles)(opts.dir);
        if (files.length === 0) {
            console.log(`No .md/.mdx files found in: ${opts.dir}`);
            process.exitCode = 1;
            return;
        }
        console.log(`Skulk syncing ${files.length} note(s) from ${opts.dir}`);
        console.log(`API: ${baseUrl}`);
        console.log(`Locale: ${opts.locale}`);
        console.log(opts.dryRun ? "Mode: DRY RUN (no writes)" : "Mode: LIVE (writing)");
        let ok = 0;
        let fail = 0;
        for (const file of files) {
            try {
                const note = (0, notes_js_1.readNote)(file, opts.locale);
                if (opts.dryRun) {
                    console.log(`\n---\n${note.slug}\n${file}\nfrontmatter keys: ${Object.keys(note.attributes).join(", ")}`);
                    continue;
                }
                const res = await upsertNote(baseUrl, token, note);
                ok++;
                console.log(`✅ ${note.slug} (${res.action ?? "ok"})`);
            }
            catch (e) {
                fail++;
                console.error(`❌ ${file}`);
                console.error(String(e));
            }
        }
        console.log(`\nDone. Success: ${ok}, Failed: ${fail}`);
        if (fail > 0)
            process.exitCode = 1;
    });
    return notes;
}
