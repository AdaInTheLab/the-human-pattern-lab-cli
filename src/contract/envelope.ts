/* ===========================================================
   🌌 HUMAN PATTERN LAB — CLI ENVELOPE BUILDERS (Alpha Tier)
   -----------------------------------------------------------
   Purpose: Single source of truth for contract-compliant JSON output.
   Guarantee: When --json, stdout emits JSON only (no logs).
   =========================================================== */

import type { IntentDescriptor } from "./intents.js";
import { CLI_SCHEMA_VERSION, type ErrorPayload } from "./schema.js";

export type CommandStatus = "ok" | "warn" | "error";

export type BaseEnvelope = {
  schemaVersion: typeof CLI_SCHEMA_VERSION;
  command: string;
  status: CommandStatus;
  intent: IntentDescriptor;
};

export type SuccessEnvelope<T> = BaseEnvelope & {
  status: "ok";
  data: T;
};

export type WarnEnvelope<T = unknown> = BaseEnvelope & {
  status: "warn";
  warnings: string[];
  data?: T;
};

export type ErrorEnvelope = BaseEnvelope & {
  status: "error";
  error: ErrorPayload;
};

export function ok<T>(command: string, intent: IntentDescriptor, data: T): SuccessEnvelope<T> {
  return { schemaVersion: CLI_SCHEMA_VERSION, command, status: "ok", intent, data };
}

export function warn<T>(
  command: string,
  intent: IntentDescriptor,
  warnings: string[],
  data?: T
): WarnEnvelope<T> {
  return { schemaVersion: CLI_SCHEMA_VERSION, command, status: "warn", intent, warnings, data };
}

export function err(command: string, intent: IntentDescriptor, error: ErrorPayload): ErrorEnvelope {
  return { schemaVersion: CLI_SCHEMA_VERSION, command, status: "error", intent, error };
}
