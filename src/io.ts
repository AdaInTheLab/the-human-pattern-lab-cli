/* ===========================================================
   🌌 HUMAN PATTERN LAB — CLI IO GATE
   -----------------------------------------------------------
   Purpose: Enforce "--json means JSON only on stdout".
   =========================================================== */

export type OutputMode = "human" | "json";

export function writeJson(obj: unknown): void {
  process.stdout.write(JSON.stringify(obj, null, 2) + "\n");
}

export function writeHuman(text: string): void {
  process.stdout.write(text.endsWith("\n") ? text : text + "\n");
}

/** Logs to stderr only. Safe to call even in --json mode (but we avoid it by policy). */
export function logErr(message: string): void {
  process.stderr.write(message.endsWith("\n") ? message : message + "\n");
}
