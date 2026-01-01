/* ===========================================================
   🌌 HUMAN PATTERN LAB — CLI OUTPUT SCHEMAS (Alpha Tier)
   -----------------------------------------------------------
   Purpose: Enforce the "JSON is a Contract" guarantee for --json mode.
   Contract: Lab CLI MVP Contract v0.x (Schema Versioning + Determinism)
   =========================================================== */

import { z } from "zod";

/** Global structured output schema version (CLI contract layer). */
export const CLI_SCHEMA_VERSION = "0.1" as const;

export const StatusSchema = z.enum(["ok", "warn", "error"]);

export const IntentBlockSchema = z.object({
  intent: z.string(),
  intentVersion: z.literal("1"),
  scope: z.array(z.string()),
  sideEffects: z.array(z.string()),
  reversible: z.boolean(),
});

/**
 * Base envelope required by the contract for all --json outputs.
 * Commands extend this with typed `data` for success, or `error` for failures.
 */
export const BaseEnvelopeSchema = z.object({
  schemaVersion: z.literal(CLI_SCHEMA_VERSION),
  command: z.string(),
  status: StatusSchema,
  intent: IntentBlockSchema,
});

export type BaseEnvelope = z.infer<typeof BaseEnvelopeSchema>;

/** Standard error payload (machine-parseable). */
export const ErrorPayloadSchema = z.object({
  code: z.string(),               // stable error code (e.g., "E_NETWORK", "E_AUTH")
  message: z.string(),            // short human-readable
  details: z.unknown().optional() // optional machine-parseable context
});

export type ErrorPayload = z.infer<typeof ErrorPayloadSchema>;

/**
 * Success envelope: { ...base, data: T }
 */
export function successSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return BaseEnvelopeSchema.extend({
    status: z.literal("ok"),
    data: dataSchema,
  });
}

/**
 * Warning envelope: { ...base, warnings: [...], data?: T }
 */
export function warnSchema<T extends z.ZodTypeAny>(dataSchema?: T) {
  const base = BaseEnvelopeSchema.extend({
    status: z.literal("warn"),
    warnings: z.array(z.string()).min(1),
  });
  return dataSchema ? base.extend({ data: dataSchema }) : base;
}

/**
 * Error envelope: { ...base, error: { code, message, details? } }
 */
export const ErrorEnvelopeSchema = BaseEnvelopeSchema.extend({
  status: z.literal("error"),
  error: ErrorPayloadSchema,
});

export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;
