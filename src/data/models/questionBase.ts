import { z } from "zod";

export const DifficultyEnum = z.enum(["easy", "normal", "hard"]);
export type Difficulty = z.infer<typeof DifficultyEnum>;

export const ModeEnum = z.enum(["compare", "speed", "panel9", "stairs"]);
export type Mode = z.infer<typeof ModeEnum>;

export const QuestionBase = z.object({
  id: z.string().min(1),
  mode: ModeEnum,
  difficulty: DifficultyEnum.default("normal"),
  snapshot_date: z.string(),
  source: z.string().default("google-cse"),
});
export type QuestionBase = z.infer<typeof QuestionBase>;

export const WordHit = z.object({
  word: z.string().min(1),
  hit_count: z.number().int().nonnegative(),
});
export type WordHit = z.infer<typeof WordHit>;

export const PackManifestEntry = z.object({
  id: z.string(),
  mode: ModeEnum,
  version: z.number().int().positive(),
  checksum: z.string().optional(),
  question_count: z.number().int().nonnegative(),
  created_at: z.string(),
  min_app_version: z.string().default("0.1.0"),
});
export type PackManifestEntry = z.infer<typeof PackManifestEntry>;

export const PackManifest = z.object({
  schema_version: z.number().int().positive(),
  packs: z.array(PackManifestEntry),
});
export type PackManifest = z.infer<typeof PackManifest>;
