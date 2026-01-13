<!--
  CONTRIBUTING — HPL CLI
  The Human Pattern Lab
-->

# Contributing to HPL CLI

Thanks for your interest in contributing.

HPL is intentionally conservative. Please read carefully.

---

## Guiding Principles

- Predictability beats cleverness
- Explicit contracts beat convenience
- Breaking loudly beats failing silently

---

## Before You Submit

Ask yourself:

- Does this change alter stdout or stderr?
- Does it affect JSON output shape?
- Does it introduce ambiguity?
- Does it add hidden behavior?

If yes, it likely needs discussion first.

---

## Output Discipline

- Never write logs to stdout in `--json` mode
- Treat JSON shape as a contract
- Add or update tests when output changes

---

## Tests

All changes that affect behavior must include tests.

If output changes, `npm run json:check` must still pass.

---

## Style

- Prefer clarity over terseness
- Avoid clever abstractions
- Keep logic testable and boring

---

If in doubt, open an issue first.
