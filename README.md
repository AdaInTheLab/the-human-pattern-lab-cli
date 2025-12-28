<!--
  Skulk CLI
  The Human Pattern Lab

  This README is written for humans.
  Design rationale lives in DESIGN.md.
-->
# Skulk CLI

[![AI-Forward CLI](https://img.shields.io/badge/AI--Forward%20CLI-automation--safe%20by%20design-7c3aed?style=flat-square)](./DESIGN.md) ![Carmel Judgment](https://github.com/AdaInTheLab/the-human-pattern-lab-cli/actions/workflows/carmel-judgment.yml/badge.svg) ![npm](https://img.shields.io/npm/v/@thehumanpatternlab/skulk)


> A modern, automation-safe CLI for The Human Pattern Lab.

Skulk is a command-line tool for syncing and managing Lab Notes — built to work just as well for humans at the keyboard as it does for automation, CI, and agent-driven workflows.

---
## What Skulk Connects To

Skulk is the CLI for **The Human Pattern Lab API**.

By default it targets a Human Pattern Lab API instance. You can override the API endpoint with `--base-url` to use staging or a self-hosted deployment of the same API.

> Note: `--base-url` is intended for alternate deployments of the Human Pattern Lab API, not arbitrary third-party APIs.

---
## Configuration

### Environment variables

- `SKULK_TOKEN` — API token used to authenticate requests.
- `SKULK_BASE_URL` — Base URL for a Human Pattern Lab API instance (overridden by `--base-url`).

Example:

```bash
export SKULK_TOKEN="..."
export SKULK_BASE_URL="https://thehumanpatternlab.com/api"
skulk notes sync --dir ./src/labnotes/en
```
---

## Why Skulk Exists

Command-line tools no longer live in a human-only world.

They’re run by:
- developers exploring and iterating
- scripts and CI pipelines
- automation layers and AI-assisted workflows

Skulk was designed from the start to behave **predictably and honestly** in all of those contexts — without sacrificing human usability.

---

## 🤖 AI-Forward (for Humans)

Skulk follows **AI-forward engineering principles** — not for AIs, but for the people who build tools that increasingly interact with them.

### Dual Output Modes

By default, Skulk is human-readable:

```bash
skulk notes sync
```

When `--json` is enabled:

```bash
skulk --json notes sync
```

Skulk switches to machine-readable output:
- stdout contains **only valid JSON**
- no banners, emojis, or progress chatter
- errors go to stderr
- exit codes are deterministic

This makes Skulk safe to use in:
- scripts
- CI pipelines
- automation
- AI-assisted workflows

---

## JSON Output Contract

Structured output is treated as a **contract**, not a courtesy.

The repository includes a built-in verification:

```bash
npm run json:check
```

This command runs Skulk in `--json` mode and fails immediately if *any* non-JSON output appears on stdout.

---

## Design & Philosophy

Curious why Skulk works this way?  
→ [DESIGN.md](./DESIGN.md)

---

## Philosophy

> Automation shouldn’t require guessing what a tool *meant* to say.

Skulk is boring in the best way:
predictable, explicit, and dependable.
