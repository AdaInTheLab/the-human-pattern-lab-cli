/* ===========================================================
   🌌 HUMAN PATTERN LAB — TEXT RENDER UTILS
   -----------------------------------------------------------
   Purpose: Deterministic, dependency-free formatting for terminals.
   =========================================================== */

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


export function safeLine(s: string): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

export function formatTags(tags: string[] | undefined): string {
  const t = (tags ?? []).filter(Boolean);
  return t.length ? t.join(", ") : "-";
}
