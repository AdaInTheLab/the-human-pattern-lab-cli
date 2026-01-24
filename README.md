<!--
  HPL CLI
  The Human Pattern Lab

  This README is written for humans.
  Design rationale lives in DESIGN.md.
-->

# HPL CLI (Alpha) 🧭🦊

![AI-Forward CLI](https://img.shields.io/badge/AI--Forward%20CLI-black?style=flat-square)
![automation-safe by design](https://img.shields.io/badge/automation--safe%20by%20design-8b5cf6?style=flat-square)
![npm (alpha)](https://img.shields.io/npm/v/@thehumanpatternlab/hpl/alpha?label=alpha&color=8b5cf6&style=flat-square)
![Carmel Judgment](https://github.com/AdaInTheLab/the-human-pattern-lab-cli/actions/workflows/carmel-judgment.yml/badge.svg)

> **Status:** Alpha  
> A modern, automation-safe CLI for The Human Pattern Lab.

**HPL** is the official command-line interface for **The Human Pattern Lab**.

Formerly developed under the codename **Skulk**, HPL is built to work just as well for humans at the keyboard as it does for automation, CI, and agent-driven workflows.

This package is in **active alpha development**. Interfaces are stabilizing, but iteration is expected.

---

## What HPL Connects To

HPL is a deterministic bridge between:

- the **Human Pattern Lab Content Repository** (source of truth)
- the **Human Pattern Lab API** (runtime index and operations)

Written content lives as Markdown in a dedicated content repository.  
The API syncs and indexes that content so it can be rendered by user interfaces.

By default, HPL targets a Human Pattern Lab API instance. You can override the API endpoint with `--base-url` to use staging or a self-hosted deployment of the same API.

> Note: `--base-url` is intended for alternate deployments of the Human Pattern Lab API, not arbitrary third-party APIs.

---

## Authentication

HPL supports token-based authentication via the `HPL_TOKEN` environment variable.

```bash
export HPL_TOKEN="your-api-token"
```

(Optional) Override the API endpoint:

```bash
export HPL_BASE_URL="https://api.thehumanpatternlab.com"
```

> `HPL_BASE_URL` should point to the **root** of a Human Pattern Lab API deployment.  
> Do not include additional path segments.

Some API endpoints may require authentication depending on server configuration.

---

## Quick Start

### Install (alpha)

```bash
npm install -g @thehumanpatternlab/hpl@alpha
```

### Sync Lab Notes from the content repository

```bash
hpl notes sync --content-repo AdaInTheLab/the-human-pattern-lab-content
```

This pulls structured Markdown content from the repository and synchronizes it into the Human Pattern Lab system.

### Machine-readable output

```bash
hpl --json notes sync
```

---

## Content Source Configuration (Optional)

By default, `notes sync` expects a content repository with the following structure:

```text
labnotes/
  en/
    *.md
  ko/
    *.md
```

You may pin a default content repository using an environment variable:

```bash
export HPL_CONTENT_REPO="AdaInTheLab/the-human-pattern-lab-content"
```

This allows `hpl notes sync` to run without explicitly passing `--content-repo`.

---

## Commands

```text
hpl <domain> <action> [options]
```

### notes

**Read operations:**
- `hpl notes list` - List all published Lab Notes
- `hpl notes get <slug>` - Get a specific Lab Note by slug

**Write operations:** (requires `HPL_TOKEN`)
- `hpl notes create --title "..." --slug "..." --file note.md` - Create a new Lab Note
- `hpl notes update <slug> --title "..." --file note.md` - Update an existing Lab Note

**Bulk operations:**
- `hpl notes sync --content-repo <owner/name|url>` - Sync from content repository
- `hpl notes sync --dir <path>` - Sync from local directory (advanced / local development)

See [WRITE_OPERATIONS_GUIDE.md](./WRITE_OPERATIONS_GUIDE.md) for detailed write operations documentation.

### health

```bash
hpl health
```

### version

```bash
hpl version
```

---

## JSON Output Contract

Structured output is treated as a **contract**, not a courtesy.

When `--json` is provided:

- stdout contains **only valid JSON**
- stderr is used for logs and diagnostics
- exit codes are deterministic

A verification step is included:

```bash
npm run json:check
```

This command fails if any non-JSON output appears on stdout.

---

## What HPL Is Not

HPL is not:
- a chatbot interface
- an agent framework
- a memory system
- an inference layer

It is a command-line tool for interacting with Human Pattern Lab systems in a predictable, human-owned way.

---

**The Human Pattern Lab**  
https://thehumanpatternlab.com

*The lantern is lit.  
The foxes are watching.*
