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

This package is in **active alpha development**. Interfaces are stabilizing, but expect iteration.

---

## What HPL Connects To

HPL is the CLI for the **Human Pattern Lab API**.

By default, it targets a Human Pattern Lab API instance. You can override the API endpoint with `--base-url` to use staging or a self-hosted deployment of the same API.

> Note: `--base-url` is intended for alternate deployments of the Human Pattern Lab API, not arbitrary third-party APIs.

---

## Authentication

HPL supports token-based authentication via the `SKULK_TOKEN` environment variable.

```bash
export SKULK_TOKEN="your-api-token"
```

(Optional) Override the API endpoint:

```bash
export SKULK_BASE_URL="https://api.thehumanpatternlab.com"
```

> `SKULK_BASE_URL` should point to the **root** of a Human Pattern Lab API deployment.  
> Do not include additional path segments.

Some API endpoints may require authentication depending on server configuration.

---

## Quick Start

### Install (alpha)

```bash
npm install -g @thehumanpatternlab/hpl@alpha
```

### Run a command

```bash
hpl notes sync --dir ./src/labnotes/en
```

For machine-readable output:

```bash
hpl --json notes sync
```

---

## Commands

```text
hpl <domain> <action> [options]
```

### notes

- `hpl notes list`
- `hpl notes get <slug>`
- `hpl notes sync --dir <path>`

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

```bash
npm run json:check
```

Fails if any non-JSON output appears on stdout.


---

**The Human Pattern Lab**  
https://thehumanpatternlab.com

*The lantern is lit.  
The foxes are watching.*
