/* ===========================================================
   🦊 THE HUMAN PATTERN LAB — HPL CLI
   -----------------------------------------------------------
   File: notesSync.ts
   Role: Notes subcommand: `hpl notes sync`
   Author: Ada (The Human Pattern Lab)
   Assistant: Lyric
   Lab Unit: SCMS — Systems & Code Management Suite
   Status: Active
   -----------------------------------------------------------
   Purpose:
     Sync local markdown Lab Notes to the Lab API with predictable
     behavior in both human and automation contexts.

     Supports content-ledger workflows via --content-repo (clones
     the content repo locally, then syncs from it).
   -----------------------------------------------------------
   Key Behaviors:
     - Human mode: readable progress + summaries
     - JSON mode (--json): stdout emits ONLY valid JSON (contract)
     - Errors: stderr only
     - Exit codes: deterministic (non-zero only on failure)
   =========================================================== */

import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";

import { HPL_BASE_URL, HPL_TOKEN } from "../../lib/config.js";
import { httpJson } from "../../lib/http.js";
import { listMarkdownFiles, readNote } from "../../lib/notes.js";

import { getOutputMode, printJson } from "../../cli/output.js";
import { buildSyncReport } from "../../cli/outputContract.js";

import { resolveContentRepo } from "../../lib/contentRepo.js";
import { LabNoteUpsertSchema, type LabNoteUpsertPayload } from "../../types/labNotes.js";

type UpsertResponse = {
  ok: boolean;
  slug: string;
  action?: "created" | "updated";
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
    // Optional fields if your note parser provides them
    subtitle: note.attributes.subtitle,
    summary: note.attributes.summary,
    tags: note.attributes.tags,
    published: note.attributes.published,
    status: note.attributes.status,
    type: note.attributes.type,
    dept: note.attributes.dept,
  };

  const parsed = LabNoteUpsertSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(`Invalid LabNoteUpsertPayload: ${parsed.error.message}`);
  }

  return httpJson<UpsertResponse>(
      { baseUrl, token },
      "POST",
      "/lab-notes/upsert",
      parsed.data,
  );
}

/**
 * Commander: `hpl notes sync`
 */
export function notesSyncSubcommand() {
  return new Command("sync")
      .description("Sync markdown notes to the API")
      // IMPORTANT: do NOT default --dir here (it conflicts with repo-first flows)
      .option("--dir <path>", "Directory containing markdown notes")
      .option(
          "--content-repo <repo>",
          "GitHub owner/name or URL for Lab Notes content repo (or HPL_CONTENT_REPO env)",
      )
      .option("--content-ref <ref>", "Branch, tag, or SHA to checkout (default: main)")
      .option("--content-subdir <path>", "Subdirectory inside repo containing labnotes (default: labnotes)")
      .option("--cache-dir <path>", "Local cache directory for cloned content repos")
      .option("--locale <code>", "Locale code", "en")
      .option("--base-url <url>", "Override API base URL (ex: https://api.thehumanpatternlab.com)")
      .option("--dry-run", "Print what would be sent, but do not call the API", false)
      .option("--only <slug>", "Sync only a single note by slug")
      .option("--limit <n>", "Sync only the first N notes", (v) => parseInt(v, 10))
      .action(async (opts, cmd) => {
        const mode = getOutputMode(cmd); // "json" | "human"

        const jsonError = (message: string, extra?: unknown) => {
          if (mode === "json") {
            process.stderr.write(JSON.stringify({ ok: false, error: { message, extra } }, null, 2) + "\n");
          } else {
            console.error(message);
            if (extra) console.error(extra);
          }
          process.exitCode = 1;
        };

        // -----------------------------
        // Resolve content source → rootDir
        // -----------------------------
        const envRepo = String(process.env.SKULK_CONTENT_REPO ?? "").trim();
        const repoArg = String(opts.contentRepo ?? "").trim() || envRepo;

        const dirRaw = String(opts.dir ?? "").trim();
        const dirArg = dirRaw || (!repoArg ? "./src/labnotes/en" : "");

        const ref = String(opts.contentRef ?? "main").trim() || "main";
        const subdir = String(opts.contentSubdir ?? "labnotes").trim() || "labnotes";
        const cacheDir = String(opts.cacheDir ?? "").trim() || undefined;

        if (dirArg && repoArg) {
          jsonError(
              "Use only one content source: either --dir OR --content-repo (or SKULK_CONTENT_REPO), not both.",
              { dir: dirArg, contentRepo: repoArg },
          );
          return;
        }

        let rootDir: string;
        let source:
            | { kind: "dir"; dir: string }
            | { kind: "repo"; repo: string; ref: string; subdir: string; dir: string };

        try {
          if (repoArg) {
            const resolved = await resolveContentRepo({
              repo: repoArg,
              ref,
              cacheDir,
              quietStdout: mode === "json", // keep stdout clean for JSON mode
            });

            rootDir = path.join(resolved.dir, subdir);
            source = { kind: "repo", repo: repoArg, ref, subdir, dir: rootDir };
          } else {
            rootDir = dirArg;
            source = { kind: "dir", dir: rootDir };
          }
        } catch (e) {
          jsonError("Failed to resolve content source.", {
            error: String(e),
            repo: repoArg || undefined,
            dir: dirArg || undefined,
          });
          return;
        }

        if (!fs.existsSync(rootDir)) {
          jsonError(`Notes directory not found: ${rootDir}`, {
            hintRepo: "If using repo mode, verify the repo contains labnotes/<locale>/",
            hintDir: `Try: hpl notes sync --dir "..\\\\the-human-pattern-lab\\\\src\\\\labnotes\\\\en"`,
            source,
          });
          return;
        }

        // -----------------------------
        // Continue with existing sync flow
        // -----------------------------
        const baseUrl = HPL_BASE_URL(opts.baseUrl);
        const token = HPL_TOKEN();

        const files = listMarkdownFiles(rootDir);
        let selectedFiles = files;

        if (opts.only) {
          selectedFiles = files.filter((f) => f.toLowerCase().includes(String(opts.only).toLowerCase()));
        }

        if (opts.limit && Number.isFinite(opts.limit)) {
          selectedFiles = selectedFiles.slice(0, opts.limit);
        }

        if (selectedFiles.length === 0) {
          if (mode === "json") {
            printJson({
              ok: true,
              action: "noop",
              message: "No matching notes found.",
              matched: 0,
              source,
            });
          } else {
            console.log("No matching notes found.");
          }
          process.exitCode = 0;
          return;
        }

        if (mode === "human") {
          console.log(`HPL syncing ${selectedFiles.length} note(s) from ${rootDir}`);
          if (source.kind === "repo") {
            console.log(`Content Repo: ${source.repo} @ ${source.ref} (${source.subdir})`);
          }
          console.log(`API: ${baseUrl}`);
          console.log(`Locale: ${opts.locale}`);
          console.log(opts.dryRun ? "Mode: DRY RUN (no writes)" : "Mode: LIVE (writing)");
        }

        const results: Array<{
          file: string;
          slug?: string;
          status: "ok" | "fail" | "dry-run";
          action?: "created" | "updated";
          error?: string;
        }> = [];

        for (const file of selectedFiles) {
          try {
            const note = readNote(file, opts.locale);

            if (opts.dryRun) {
              results.push({ file, slug: note.slug, status: "dry-run" });
              if (mode === "human") {
                console.log(
                    `\n---\n${note.slug}\n${file}\nfrontmatter keys: ${Object.keys(note.attributes).join(", ")}`,
                );
              }
              continue;
            }

            const res = await upsertNote(baseUrl, token, note, opts.locale);
            results.push({ file, slug: note.slug, status: "ok", action: res.action });

            if (mode === "human") {
              console.log(`✅ ${note.slug} (${res.action ?? "ok"})`);
            }
          } catch (e) {
            const msg = String(e);
            results.push({ file, status: "fail", error: msg });

            if (mode === "human") {
              console.error(`❌ ${file}`);
              console.error(msg);
            }
          }
        }

        const report = buildSyncReport({
          results,
          dryRun: Boolean(opts.dryRun),
          locale: opts.locale,
          baseUrl,
        });

        if (mode === "json") {
          // Attach source without rewriting your contract builder (minimal + safe).
          printJson({ ...report, source });
          if (!report.ok) process.exitCode = 1;
        } else {
          const { synced, dryRun, failed } = report.summary;
          if (report.dryRun) {
            console.log(`\nDone. ${dryRun} note(s) would be synced (dry-run). Failures: ${failed}`);
          } else {
            console.log(`\nDone. ${synced} note(s) synced successfully. Failures: ${failed}`);
          }
          if (!report.ok) process.exitCode = 1;
        }
      });
}
