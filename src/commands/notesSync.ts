/* ===========================================================
   🦊 THE HUMAN PATTERN LAB — SKULK CLI
   -----------------------------------------------------------
   Author: Ada (Founder, The Human Pattern Lab)
   Assistant: Lyric (AI Lab Companion)
   File: notesSync.ts
   Module: Notes Command Suite
   Lab Unit: SCMS — Systems & Code Management Suite
   Status: Active
   -----------------------------------------------------------
   Purpose:
     Implements `skulk notes sync` — syncing local markdown Lab Notes
     to the Lab API with predictable behavior in both human and
     automation contexts.
   -----------------------------------------------------------
   Key Behaviors:
     - Human mode: readable progress + summaries
     - JSON mode (--json): stdout emits ONLY valid JSON (contract)
     - Errors: stderr only
     - Exit codes: deterministic (non-zero only on failure)
   -----------------------------------------------------------
   Notes:
     JSON output is a contract. If it breaks, it should break loudly.
   =========================================================== */
/**
 * @file notesSync.ts
 * @author Ada
 * @assistant Lyric
 * @lab-unit SCMS — Systems & Code Management Suite
 * @since 2025-12-28
 * @description Syncs markdown Lab Notes to the API via `skulk notes sync`.
 *              Supports human + JSON output modes; JSON mode is stdout-pure.
 */
import { Command } from 'commander';
import { SKULK_BASE_URL, SKULK_TOKEN } from '../lib/config.js';
import { httpJson } from '../lib/http.js';
import { listMarkdownFiles, readNote, type NotePayload } from '../lib/notes.js';
import { getOutputMode, printJson } from '../cli/output.js';
import { buildSyncReport } from '../cli/outputContract.js';
import fs from 'node:fs';

type UpsertResponse = {
  ok: boolean;
  slug: string;
  action?: 'created' | 'updated';
};

type LabNoteUpsertPayload = {
  slug: string;
  title: string;
  markdown: string;
  locale?: string;
  // optional extras if your API supports them:
  // subtitle?: string;
  // tags?: string[];
  // published?: string;
  // status?: string;
  // dept?: string;
};

async function upsertNote(
  baseUrl: string,
  token: string | undefined,
  note: any,
  locale?: string,
) {
  const payload: LabNoteUpsertPayload = {
    slug: note.slug,
    title: note.attributes.title,
    markdown: note.markdown,
    locale,
  };
  if (!payload.slug || !payload.title || !payload.markdown) {
    throw new Error(
      `Invalid note payload: slug/title/markdown missing for ${payload.slug ?? 'unknown'}`,
    );
  }
  return httpJson<UpsertResponse>(
    { baseUrl, token },
    'POST',
    '/lab-notes/upsert',
    payload,
  );
}

export function notesSyncCommand() {
  const notes = new Command('notes').description('Lab Notes commands');

  notes
    .command('sync')
    .description('Sync local markdown notes to the API')
    .option(
      '--dir <path>',
      'Directory containing markdown notes',
      './src/labnotes/en',
    )
    //.option("--dir <path>", "Directory containing markdown notes", "./labnotes/en")
    .option('--locale <code>', 'Locale code', 'en')
    .option(
      '--base-url <url>',
      'Override API base URL (ex: https://thehumanpatternlab.com/api)',
    )
    .option(
      '--dry-run',
      'Print what would be sent, but do not call the API',
      false,
    )
    .option('--only <slug>', 'Sync only a single note by slug')
    .option('--limit <n>', 'Sync only the first N notes', (v) =>
      parseInt(v, 10),
    )

    .action(async (opts, cmd) => {
      const mode = getOutputMode(cmd); // "json" | "human"

      const jsonError = (message: string, extra?: unknown) => {
        if (mode === 'json') {
          process.stderr.write(
            JSON.stringify({ ok: false, error: { message, extra } }, null, 2) +
              '\n',
          );
        } else {
          console.error(message);
          if (extra) console.error(extra);
        }
        process.exitCode = 1;
      };

      if (!fs.existsSync(opts.dir)) {
        jsonError(`Notes directory not found: ${opts.dir}`, {
          hint: `Try: skulk notes sync --dir "..\\\\the-human-pattern-lab\\\\src\\\\labnotes\\\\en"`,
        });
        return;
      }

      const baseUrl = SKULK_BASE_URL(opts.baseUrl);
      const token = SKULK_TOKEN();

      const files = listMarkdownFiles(opts.dir);
      let selectedFiles = files;

      if (opts.only) {
        selectedFiles = files.filter((f) =>
          f.toLowerCase().includes(opts.only.toLowerCase()),
        );
      }

      if (opts.limit && Number.isFinite(opts.limit)) {
        selectedFiles = selectedFiles.slice(0, opts.limit);
      }

      if (selectedFiles.length === 0) {
        if (mode === 'json') {
          printJson({
            ok: true,
            action: 'noop',
            message: 'No matching notes found.',
            matched: 0,
          });
        } else {
          console.log('No matching notes found.');
        }
        process.exitCode = 0;
        return;
      }

      // Human-mode header chatter
      if (mode === 'human') {
        console.log(
          `Skulk syncing ${selectedFiles.length} note(s) from ${opts.dir}`,
        );
        console.log(`API: ${baseUrl}`);
        console.log(`Locale: ${opts.locale}`);
        console.log(
          opts.dryRun ? 'Mode: DRY RUN (no writes)' : 'Mode: LIVE (writing)',
        );
      }

      let ok = 0;
      let fail = 0;

      const results: Array<{
        file: string;
        slug?: string;
        status: 'ok' | 'fail' | 'dry-run';
        action?: 'created' | 'updated';
        error?: string;
      }> = [];

      for (const file of selectedFiles) {
        try {
          const note = readNote(file, opts.locale);

          if (opts.dryRun) {
            ok++;
            results.push({
              file,
              slug: note.slug,
              status: 'dry-run',
            });

            if (mode === 'human') {
              console.log(
                `\n---\n${note.slug}\n${file}\nfrontmatter keys: ${Object.keys(note.attributes).join(', ')}`,
              );
            }

            continue;
          }

          const res = await upsertNote(baseUrl, token, note, opts.locale);
          ok++;

          results.push({
            file,
            slug: note.slug,
            status: 'ok',
            action: res.action,
          });

          if (mode === 'human') {
            console.log(`✅ ${note.slug} (${res.action ?? 'ok'})`);
          }
        } catch (e) {
          fail++;
          const msg = String(e);

          results.push({
            file,
            status: 'fail',
            error: msg,
          });

          if (mode === 'human') {
            console.error(`❌ ${file}`);
            console.error(msg);
          }
        }
      }

      if (mode === 'json') {
        const report = buildSyncReport({
          results,
          dryRun: Boolean(opts.dryRun),
          locale: opts.locale,
          baseUrl,
        });

        printJson(report);

        if (!report.ok) process.exitCode = 1;
      } else {
        const report = buildSyncReport({
          results,
          dryRun: Boolean(opts.dryRun),
          locale: opts.locale,
          baseUrl,
        });

        const { synced, dryRun, failed } = report.summary;

        if (report.dryRun) {
          console.log(
            `\nDone. ${dryRun} note(s) would be synced (dry-run). Failures: ${failed}`,
          );
        } else {
          console.log(
            `\nDone. ${synced} note(s) synced successfully. Failures: ${failed}`,
          );
        }

        if (!report.ok) process.exitCode = 1;
      }
    });

  return notes;
}
