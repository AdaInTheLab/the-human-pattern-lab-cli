/* ===========================================================
   🌌 HUMAN PATTERN LAB — CLI EXIT CODES (Alpha Tier)
   -----------------------------------------------------------
   Purpose: Consistent meanings across commands (machine-parseable).
   Contract: "Errors & Exit Codes" predictable and structured.
   =========================================================== */

/**
 * Exit code meanings are stable across commands.
 * Additive only; do not repurpose existing numeric values.
 */
export const EXIT = {
  OK: 0,
  USAGE: 2,        // bad args / invalid flags
  NOT_FOUND: 3,    // 404 semantics
  AUTH: 4,         // auth required / invalid token
  FORBIDDEN: 5,    // insufficient scope/permission
  NETWORK: 10,     // DNS/timeout/unreachable
  SERVER: 11,      // 5xx or unexpected response
  CONTRACT: 12,    // schema mismatch / invalid JSON contract
  UNKNOWN: 1,
} as const;

export type ExitCode = (typeof EXIT)[keyof typeof EXIT];
