/* ===========================================================
   🌌 HUMAN PATTERN LAB — TABLE RENDERER (tiny)
   -----------------------------------------------------------
   Purpose: Deterministic fixed-width table output.
   =========================================================== */

export type Column<T> = {
  header: string;
  width: number;
  value: (row: T) => string;
};

function pad(s: string, width: number): string {
  const str = (s ?? "").toString();
  if (str.length >= width) return str.slice(0, Math.max(0, width - 1)) + "…";
  return str + " ".repeat(width - str.length);
}

export function renderTable<T>(rows: T[], cols: Column<T>[]): string {
  const header = cols.map((c) => pad(c.header, c.width)).join("  ");
  const sep = cols.map((c) => "-".repeat(c.width)).join("  ");
  const body = rows.map((r) => cols.map((c) => pad(c.value(r), c.width)).join("  ")).join("\n");
  return [header, sep, body].filter(Boolean).join("\n");
}
