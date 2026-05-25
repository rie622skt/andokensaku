import { z } from "zod";

import { QuestionBase } from "./questionBase";

export const Panel = z.object({
  row: z.number().int().min(0).max(2),
  col: z.number().int().min(0).max(2),
  panel_word: z.string().min(1),
});
export type Panel = z.infer<typeof Panel>;

export const Panel9Board = QuestionBase.extend({
  mode: z.literal("panel9"),
  panels: z.array(Panel).length(9),
  hand_pool: z.array(z.string().min(1)).min(8),
  /**
   * Map of "panelWord|handWord" -> AND hit count.
   * Both terms appear in the key exactly as written (NFKC-normalized).
   */
  and_hit_table: z.record(z.string(), z.number().int().nonnegative()),
  rounds: z.number().int().positive().default(5),
});
export type Panel9Board = z.infer<typeof Panel9Board>;

export const Panel9Pack = z.object({
  id: z.string(),
  mode: z.literal("panel9"),
  version: z.number().int().positive(),
  boards: z.array(Panel9Board),
});
export type Panel9Pack = z.infer<typeof Panel9Pack>;
