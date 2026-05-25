import { z } from "zod";

import { QuestionBase, WordHit } from "./questionBase";

export const SpeedComparator = z.enum(["over", "under"]);
export type SpeedComparator = z.infer<typeof SpeedComparator>;

export const SpeedRound = QuestionBase.extend({
  mode: z.literal("speed"),
  threshold: z.number().int().nonnegative(),
  comparator: SpeedComparator,
  duration_sec: z.number().int().positive(),
  words: z.array(WordHit).min(5),
});
export type SpeedRound = z.infer<typeof SpeedRound>;

export const SpeedPack = z.object({
  id: z.string(),
  mode: z.literal("speed"),
  version: z.number().int().positive(),
  rounds: z.array(SpeedRound),
});
export type SpeedPack = z.infer<typeof SpeedPack>;
