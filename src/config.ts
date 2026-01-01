/* ===========================================================
   🌌 HUMAN PATTERN LAB — CLI CONFIG
   -----------------------------------------------------------
   Purpose: Single source of truth for config resolution.
   Contract: Deterministic defaults.
   =========================================================== */

export type CliConfig = {
  apiBaseUrl: string;
};

export function getConfig(): CliConfig {
  const apiBaseUrl = (process.env.HPL_API_BASE_URL || "https://api.thehumanpatternlab.com").replace(/\/+$/, "");
  return { apiBaseUrl };
}
