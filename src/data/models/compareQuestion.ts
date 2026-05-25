import { z } from "zod";

import { QuestionBase, WordHit } from "./questionBase";

export const CompareQuestion = QuestionBase.extend({
  mode: z.literal("compare"),
  left: WordHit,
  right: WordHit,
  explanation: z.string().optional(),
});
export type CompareQuestion = z.infer<typeof CompareQuestion>;

export const ComparePack = z.object({
  id: z.string(),
  mode: z.literal("compare"),
  version: z.number().int().positive(),
  questions: z.array(CompareQuestion),
});
export type ComparePack = z.infer<typeof ComparePack>;
