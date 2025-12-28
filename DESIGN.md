<!--
  DESIGN NOTES — SKULK CLI
  The Human Pattern Lab

  This document explains *why* Skulk behaves the way it does.
  It is not required reading, but it is canonical.
-->
# Skulk CLI — Design Notes

> Looking for usage or setup?  
> Go back to → [README.md](./README.md)

---

## Design Goals

Skulk is designed to be:
- predictable
- automation-safe
- easy to reason about
- boring in the right ways

The goal is not cleverness.
The goal is trust.

---

## AI-Forward Engineering (for Humans)

“AI-forward” does not mean “built for AI.”

It means building tools that:
- behave consistently
- communicate clearly
- don’t require guesswork when automated

As tooling increasingly interacts with agents and scripts, ambiguity becomes technical debt.

Skulk treats that as a first-class concern.

---

## Output Is a Contract

Skulk has two explicit output modes:

### Human Mode (default)
- readable progress
- contextual information
- friendly summaries

### Machine Mode (`--json`)
- stdout contains **only valid JSON**
- no logging, banners, or commentary
- errors are written to stderr
- exit codes are deterministic

---

## JSON Purity Enforcement

The project includes a hard verification step:

```bash
npm run json:check
```

This runs Skulk in JSON mode and pipes stdout directly into `JSON.parse`.

If *anything* other than valid JSON is emitted, the command fails immediately.

---

## Separation of Concerns

- Core logic is pure and side-effect free
- Commands orchestrate behavior
- Output formatting happens at the command boundary
- Exit codes reflect real success or failure

---

## Why This Matters

Most CLI bugs don’t come from broken logic — they come from:
- unexpected output
- mixed streams
- silent contract changes

Skulk is designed to avoid those classes of problems entirely.

---

## Final Note

These constraints are intentional.

They make Skulk easier to automate, easier to test, and easier to trust — now and later.

If a future change breaks these guarantees, it should break loudly.
