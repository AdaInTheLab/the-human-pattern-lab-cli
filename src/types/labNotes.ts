/* ===========================================================
   🌌 HUMAN PATTERN LAB — TYPES: Lab Notes (CLI)
   -----------------------------------------------------------
   Purpose: API contract types for Lab Notes used by the CLI.
   Notes:
     - Keep permissive: API may add fields (additive).
   =========================================================== */

import { z } from "zod";

export const LabNoteSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string().optional().default(""),
  contentHtml: z.string().optional().default(""),
  published: z.string().optional().nullable(),
  status: z.string().optional(),
  type: z.string().optional(),
  locale: z.string().optional(),
  department_id: z.string().optional(),
  shadow_density: z.number().optional(),
  safer_landing: z.boolean().optional(),
  tags: z.array(z.string()).optional().default([]),
  readingTime: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}).passthrough();

export type LabNote = z.infer<typeof LabNoteSchema>;

export const LabNoteListSchema = z.array(LabNoteSchema);
