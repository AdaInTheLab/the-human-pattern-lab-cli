/* ===========================================================
   🌌 HUMAN PATTERN LAB — TYPES: Lab Notes (CLI)
   -----------------------------------------------------------
   Purpose: API contract types for Lab Notes used by the CLI.
   Notes:
     - Keep permissive: API may add fields (additive).
   =========================================================== */

// - GET /lab-notes         -> LabNotePreview[]
// - GET /lab-notes/:slug   -> LabNoteDetail (LabNoteView + content_markdown)

import { z } from "zod";

/** Mirrors API LabNoteType */
export const LabNoteTypeSchema = z.enum(["labnote", "paper", "memo", "lore", "weather"]);
export type LabNoteType = z.infer<typeof LabNoteTypeSchema>;

/** Mirrors API LabNoteStatus */
export const LabNoteStatusSchema = z.enum(["published", "draft", "archived"]);
export type LabNoteStatus = z.infer<typeof LabNoteStatusSchema>;

export const ALLOWED_NOTE_TYPES: ReadonlySet<LabNoteType> = new Set([
  "labnote",
  "paper",
  "memo",
  "lore",
  "weather",
]);

/**
 * GET /lab-notes (list)
 * You are selecting from v_lab_notes without content_html/markdown,
 * then mapping via mapToLabNotePreview(...).
 *
 * We infer likely fields from the SELECT + typical preview mapper.
 * Keep passthrough to allow additive changes.
 */
export const LabNotePreviewSchema = z
    .object({
      id: z.string(),
      slug: z.string(),

      title: z.string(),
      subtitle: z.string().optional(),
      summary: z.string().optional(),
      excerpt: z.string().optional(),

      status: LabNoteStatusSchema.optional(),
      type: LabNoteTypeSchema.optional(),
      dept: z.string().optional(),
      locale: z.string().optional(),

      department_id: z.string().optional(), // DB has it; mapper may include it
      shadow_density: z.number().optional(),
      safer_landing: z.boolean().optional(), // DB is number-ish; mapper likely coerces

      readingTime: z.number().optional(), // from read_time_minutes
      published: z.string().optional(),    // from published_at (if mapper emits it)
      created_at: z.string().optional(),
      updated_at: z.string().optional(),

      tags: z.array(z.string()).optional(), // mapper adds tags
    })
    .passthrough();

export type LabNotePreview = z.infer<typeof LabNotePreviewSchema>;
export const LabNotePreviewListSchema = z.array(LabNotePreviewSchema);

/**
 * API LabNoteView shape (detail rendering fields).
 * This aligns to your LabNoteView interface.
 */
export const LabNoteViewSchema = z
    .object({
      id: z.string(),
      slug: z.string(),

      title: z.string(),
      subtitle: z.string().optional(),
      summary: z.string().optional(),

      // NOTE: contentHtml intentionally excluded.
      // Markdown is the canonical source of truth for CLI clients.
      published: z.string(),

      status: LabNoteStatusSchema.optional(),
      type: LabNoteTypeSchema.optional(),
      dept: z.string().optional(),
      locale: z.string().optional(),

      author: z
          .object({
            kind: z.enum(["human", "ai", "hybrid"]),
            name: z.string().optional(),
            id: z.string().optional(),
          })
          .optional(),

      department_id: z.string(),
      shadow_density: z.number(),
      safer_landing: z.boolean(),
      tags: z.array(z.string()),
      readingTime: z.number(),

      created_at: z.string().optional(),
      updated_at: z.string().optional(),
    })
    .passthrough();

export type LabNoteView = z.infer<typeof LabNoteViewSchema>;

/**
 * GET /lab-notes/:slug returns LabNoteView + content_markdown (canonical truth).
 */
export const LabNoteDetailSchema = LabNoteViewSchema.extend({
  content_markdown: z.string().optional(), // API always includes it in your code, but keep optional for safety
});

export type LabNoteDetail = z.infer<typeof LabNoteDetailSchema>;

/**
 * CLI → API payload for upsert (notes sync and admin create/update).
 * Uses content_markdown to match the API's field name.
 * Strict: our outbound contract.
 */
export const LabNoteUpsertSchema = z
    .object({
      slug: z.string().min(1),
      title: z.string().min(1),
      content_markdown: z.string().min(1),

      locale: z.string().optional(),

      subtitle: z.string().optional(),
      summary: z.string().optional(),
      tags: z.array(z.string()).optional(),
      published: z.string().optional(),
      status: LabNoteStatusSchema.optional(),
      type: LabNoteTypeSchema.optional(),
      dept: z.string().optional(),
    })
    .strict();

export type LabNoteUpsertPayload = z.infer<typeof LabNoteUpsertSchema>;