# HPL CLI (Alpha) 🧭🦊

<span>
  <img src="https://img.shields.io/badge/AI--Forward%20CLI-black?style=flat-square" />
  <img src="https://img.shields.io/badge/automation--safe%20by%20design-8b5cf6?style=flat-square" />
</span>
 
 [![Carmel Judgment Protocol 😼](https://github.com/AdaInTheLab/the-human-pattern-lab-cli/actions/workflows/carmel-judgment.yml/badge.svg)](https://github.com/AdaInTheLab/the-human-pattern-lab-cli/actions/workflows/carmel-judgment.yml)

Contract-first CLI for The Human Pattern Lab.

## Install (local dev)

```bash
npm install
npm run dev -- --help
```

## Config

- `HPL_API_BASE_URL` (default: `https://api.thehumanpatternlab.com`)

## Commands (MVP)

- `hpl version`
- `hpl capabilities`
- `hpl health`
- `hpl notes list [--limit N]`
- `hpl notes get <slug> [--raw]`

## JSON contract

Add `--json` to emit machine-readable JSON only on stdout.

### Examples

```bash
hpl capabilities --json
hpl health --json
hpl notes list --json
hpl notes get the-invitation --json
```
