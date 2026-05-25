import { z } from "zod";

import { QuestionBase, WordHit } from "./questionBase";

export const StairsRules = z.object({
  must_exceed: z.boolean().default(true),
  choice_count_per_step: z.number().int().min(2).max(6).default(4),
});

export const StairsRun = QuestionBase.extend({
  mode: z.literal("stairs"),
  seed_word: z.string().min(1),
  seed_hit_count: z.number().int().nonnegative(),
  max_steps: z.number().int().positive(),
  word_pool: z.array(WordHit).min(20),
  step_rules: StairsRules,
});
export type StairsRun = z.infer<typeof StairsRun>;

export const StairsPack = z.object({
  id: z.string(),
  mode: z.literal("stairs"),
  version: z.number().int().positive(),
  runs: z.array(StairsRun),
});
export type StairsPack = z.infer<typeof StairsPack>;
