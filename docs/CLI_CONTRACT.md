<!--
  CLI CONTRACT — HPL
  The Human Pattern Lab

  Public guarantees for users and automation.
-->

# HPL CLI — Contract

This document defines the **public, stability-sensitive guarantees** of the HPL CLI.

Anything listed here is considered part of the supported interface.

---

## Output Guarantees

When `--json` is provided:

- stdout contains **only valid JSON**
- stderr is used for logs, diagnostics, and progress
- JSON output is a single top-level value
- Output shape changes are breaking changes

Human-readable mode makes no guarantees about formatting.

---

## Exit Codes

Exit codes are part of the public interface:

- `0` — success
- non-zero — failure

Changes to exit code behavior are breaking changes.

---

## Determinism

Given the same inputs and environment:
- HPL produces the same outputs
- No randomness is introduced
- No hidden state is relied upon

---

## Side Effects

HPL does not:
- modify user files unless explicitly instructed
- write outside declared cache directories
- perform network calls not required by the command

---

## `notes sync` Output

`hpl --json notes sync` prints one `SyncReport` on stdout. Shapes are defined in
`src/sync/types.ts`, the accounting in `src/sync/summary.ts`, the normalisation in
`src/cli/outputContract.ts`; `tests/outputContract.test.ts` pins them.

```ts
type SyncResult = {
  file: string;                    // path relative to the CLI's working directory
  slug?: string;                   // absent on results that failed before parsing
  status: "ok" | "failed";
  action?: "created" | "updated" | "unchanged";
  error?: string;
  written?: boolean;               // true only for an ok result in a live (non dry-run) run
};

type SyncSummary = { synced: number; dryRun: number; failed: number; total: number };

type SyncReport = {
  ok: boolean;                     // failed === 0
  summary: SyncSummary;
  results: SyncResult[];
  dryRun?: boolean;
  locale?: string;
  baseUrl?: string;
  source: { kind: "dir"; dir: string }
        | { kind: "repo"; repo: string; ref: string; subdir: string; dir: string };
};
```

Invariants (the CLI throws rather than emit a report that violates them):

- `synced + dryRun + failed === total`
- a dry run has `synced === 0`: its ok results are counted under `dryRun`
- `results.length === total`

Two other stdout shapes exist:

- No notes matched (`--only`, `--limit`, empty directory):
  `{ "ok": true, "action": "noop", "message": "No matching notes found.", "matched": 0, "source": {...} }`
- The run could not start (bad content source, missing directory): **nothing on stdout**,
  a `{ "ok": false, "error": { "message", "extra" } }` object on stderr, exit `1`.

Exit code is `1` whenever `ok` is `false`, so `hpl --json notes sync > report.json` writes a
complete report even when files failed; only the no-start case leaves the file empty.

Consumers should not assume a two-term invariant (`synced + failed === total`) or a
per-result `locale`; neither is part of this contract.

---

## Stability Policy

If a change:
- breaks JSON output
- alters exit codes
- mixes stdout/stderr
- weakens determinism

…it must be treated as a breaking change.

---

## Non-Goals

HPL will not:
- infer intent
- guess formats
- silently recover from contract violations
- adapt behavior based on environment heuristics

---

This contract exists to protect users, automation, and future maintainers.
