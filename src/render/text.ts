/* ===========================================================
   🌌 HUMAN PATTERN LAB — TEXT RENDER UTILS
   -----------------------------------------------------------
   Purpose: Deterministic, dependency-free formatting for terminals.
   =========================================================== */
import type { BaseEnvelope } from "../contract/envelope.js";
import {formatTags, safeLine} from "./table";

export function stripHtml(input: string): string {
  const s = (input || "");

  // Convert common structure to deterministic newlines first
  const withBreaks = s
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\/\s*p\s*>/gi, "\n\n")
      .replace(/<\s*p[^>]*>/gi, "")
      .replace(/<\s*hr\s*\/?>/gi, "\n---\n")
      .replace(/<\/\s*li\s*>/gi, "\n")
      .replace(/<\s*li[^>]*>/gi, "- ")
      .replace(/<\/\s*ul\s*>/gi, "\n")
      .replace(/<\s*ul[^>]*>/gi, "");

  // Strip scripts/styles then remaining tags
  const stripped = withBreaks
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, "");

  // Decode a few entities + normalize whitespace
  return stripped
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
}

function renderError(env: any) {
  console.error(`✖ ${env.command}`);

  if (env.error?.message) {
    console.error(safeLine(env.error.message));
  }

  if (env.error?.details) {
    console.error();
    console.error(stripHtml(String(env.error.details)));
  }
}

function renderWarn(env: any) {
  console.log(`⚠ ${env.command}`);

  for (const w of env.warnings ?? []) {
    console.log(`- ${safeLine(w)}`);
  }

  if (env.data !== undefined) {
    console.log();
    renderData(env.data);
  }
}

function renderSuccess(env: any) {
  renderData(env.data);
}

function renderData(data: any) {
  if (Array.isArray(data)) {
    for (const item of data) {
      renderItem(item);
      console.log();
    }
    return;
  }

  if (typeof data === "object" && data !== null) {
    renderItem(data);
    return;
  }

  console.log(String(data));
}

function renderItem(note: any) {
  if (note.title) {
    console.log(safeLine(note.title));
  }

  if (note.subtitle) {
    console.log(`  ${safeLine(note.subtitle)}`);
  }

  if (note.summary || note.excerpt) {
    console.log();
    console.log(stripHtml(note.summary ?? note.excerpt));
  }

  if (note.tags) {
    console.log();
    console.log(`Tags: ${formatTags(note.tags)}`);
  }
}

export function renderText(envelope: BaseEnvelope) {
  switch (envelope.status) {
    case "error":
      renderError(envelope);
      return;

    case "warn":
      renderWarn(envelope);
      return;

    case "ok":
      renderSuccess(envelope);
      return;

    default:
      // Exhaustiveness guard
      console.error("Unknown envelope status");
  }
}
