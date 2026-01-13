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
