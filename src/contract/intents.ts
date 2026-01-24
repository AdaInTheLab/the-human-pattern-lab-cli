/* ===========================================================
   🌌 HUMAN PATTERN LAB — CLI INTENT REGISTRY (Alpha Tier)
   -----------------------------------------------------------
   Purpose: Machine-legible, stable intent identifiers for CLI commands.
   Contract: Lab CLI MVP Contract v0.x (Intent Registry + Explicit Intent)
   Notes:
     - Intent IDs are snake_case and treated as contractual identifiers.
     - Changing the meaning of an intent is breaking, even in v0.x.
   =========================================================== */

export type IntentTier = "alpha" | "full";

export type IntentDescriptor = {
  /** Stable identifier (snake_case). */
  intent: string;
  /** Intent schema version (string to allow semver-ish). */
  intentVersion: "1";
  /** What resources the command reads or touches. */
  scope: string[];
  /** Declared side effects. Empty for read-only. */
  sideEffects: string[];
  /** True if the command's effects can be undone without data loss. */
  reversible: boolean;
};

/**
 * Alpha Tier intents (MVP).
 * Additive only. Do not change semantics of existing IDs.
 */
export const INTENTS_ALPHA = {
  show_version: {
    intent: "show_version",
    intentVersion: "1",
    scope: ["cli"],
    sideEffects: [],
    reversible: true,
  },
  show_capabilities: {
    intent: "show_capabilities",
    intentVersion: "1",
    scope: ["cli"],
    sideEffects: [],
    reversible: true,
  },
  check_health: {
    intent: "check_health",
    intentVersion: "1",
    scope: ["remote_api"],
    sideEffects: [],
    reversible: true,
  },
  render_lab_note: {
    intent: "render_lab_note",
    intentVersion: "1",
    scope: ["lab_notes", "remote_api"],
    sideEffects: [],
    reversible: true,
  },
  create_lab_note: {
    intent: "create_lab_note",
    intentVersion: "1",
    scope: ["lab_notes", "remote_api"],
    sideEffects: ["write_remote"],
    reversible: false,
  },
  update_lab_note: {
    intent: "update_lab_note",
    intentVersion: "1",
    scope: ["lab_notes", "remote_api"],
    sideEffects: ["write_remote"],
    reversible: false,
  },
} as const satisfies Record<string, IntentDescriptor>;

export type AlphaIntentId = keyof typeof INTENTS_ALPHA;

export function getAlphaIntent(id: AlphaIntentId): IntentDescriptor {
  return INTENTS_ALPHA[id];
}

export function listAlphaIntents(): IntentDescriptor[] {
  return Object.values(INTENTS_ALPHA);
}
