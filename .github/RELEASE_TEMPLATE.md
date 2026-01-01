# HPL CLI v{{version}}

> Contract-first CLI release for **The Human Pattern Lab**  
> This release follows the same change classification and discipline as the Lab API.

---

## 🔎 Summary

Brief, high-signal description of what this CLI release delivers and **why it exists**.

Example:  
This release introduces the first contract-stable CLI interface for reading Lab Notes from the ledger-backed API, with explicit intent metadata and machine-parseable output.

---

## 📦 Compatibility

| Component | Version |
|---------|--------|
| **CLI package** | `{{version}}` |
| **CLI schemaVersion** | `{{schemaVersion}}` |
| **Compatible API versions** | `>= {{apiVersion}}` |

Compatibility is defined by the **CLI contract**, not by implementation details.

---

## 🚨 Breaking Changes

> Only include this section if applicable.

- Describe **what changed**
- Describe **why it changed**
- Describe **what users or agents must do**

Example:
- CLI JSON output for `notes list` now nests results under `data.notes`  
  (previously returned a top-level array)

Breaking changes **always** imply:
- CLI `schemaVersion` bump
- Explicit callout here
- Compatibility table update

---

## ➕ Additive Changes

New functionality that does **not** break existing usage.

Example:
- Added `notes get <slug>` command
- Added `--limit` flag to `notes list`
- Added intent metadata to all JSON outputs

Additive changes may bump the CLI package version, but **do not require** a contract bump.

---

## 🔧 Internal Changes

Refactors, fixes, or improvements that do not affect external behavior.

Example:
- Refactored HTTP client to support raw and enveloped API responses
- Improved Windows stability by removing hard process exits
- Internal rendering utilities for deterministic terminal output

---

## 🧠 Contract Notes

This release maintains the following guarantees:

- All `--json` output conforms to `schemaVersion: {{schemaVersion}}`
- Intent identifiers are stable and unchanged
- Exit code meanings are unchanged

If this release introduces new intents, they are **additive** and documented below.

---

## 🎯 Supported Intents (Alpha Tier)

```
show_version
show_capabilities
check_health
render_lab_note
```

Intent semantics are unchanged unless explicitly stated.

---

## 🧪 Validation

Recommended verification steps:

```bash
hpl version --json
hpl capabilities --json
hpl health --json
hpl notes list --json
hpl notes get <slug> --json
```

Successful execution confirms contract compatibility.

---

## 📚 Notes

- This CLI release aligns with the **Lab API release discipline**
- v0.x does not imply instability — it implies **explicit governance**
- Humans are a tolerated interface

---

## 🔗 References

- API Release: `{{apiReleaseLink}}`
- CLI Contract: `schemaVersion {{schemaVersion}}`
- Documentation: https://thehumanpatternlab.com/docs

---

🦊  
*The foxes are watching. The contract holds.*
