/* ===========================================================
   🌌 HUMAN PATTERN LAB — CLI CAPABILITIES (Alpha Tier)
   -----------------------------------------------------------
   Purpose: Capability disclosure for AI agents (no assumptions).
   Contract: show_capabilities MUST emit tier, intents, schema versions.
   =========================================================== */

import { CLI_SCHEMA_VERSION } from "./schema.js";
import { listAlphaIntents } from "./intents.js";

export type Capabilities = {
  intentTier: "alpha" | "full";
  supportedIntents: string[];
  schemaVersions: string[];
};

export function getCapabilitiesAlpha(): Capabilities {
  return {
    intentTier: "alpha",
    supportedIntents: listAlphaIntents().map((i) => i.intent),
    schemaVersions: [CLI_SCHEMA_VERSION],
  };
}
