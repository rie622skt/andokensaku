import type { StairsRun, WordHit } from "@/data/models";
import { createRng, sampleN } from "@/core/utils/shuffle";

export interface StairsStep {
  index: number;
  previousWord: WordHit;
  choices: WordHit[];
  /**
   * The canonical "correct" choice index — the valid pick we singled out
   * when generating the step. `judgeStep` accepts any choice that satisfies
   * the rule (multiple valids may exist when the invalid pool is small).
   */
  correctIndex: number;
}

const isValidPick = (
  candidate: WordHit,
  previous: WordHit,
  mustExceed: boolean,
): boolean =>
  mustExceed
    ? candidate.hit_count > previous.hit_count
    : candidate.hit_count < previous.hit_count;

/**
 * Build the step sequence for a run. Each step yields exactly
 * `choice_count_per_step` distinct choices (assuming the word pool is large
 * enough), with one canonical correct pick singled out. When the invalid
 * decoy pool is too small, we pad with extra valid words — `judgeStep` then
 * accepts any choice that satisfies the comparator.
 */
export function buildSteps(run: StairsRun, seed: number): StairsStep[] {
  const rng = createRng(seed);
  const steps: StairsStep[] = [];
  let prev: WordHit = {
    word: run.seed_word,
    hit_count: run.seed_hit_count,
  };
  const usedWords = new Set<string>([run.seed_word]);
  const N = run.step_rules.choice_count_per_step;
  const mustExceed = run.step_rules.must_exceed;

  for (let i = 0; i < run.max_steps; i++) {
    const remaining = run.word_pool.filter((w) => !usedWords.has(w.word));
    if (remaining.length < N) break;

    const valid = remaining.filter((w) => isValidPick(w, prev, mustExceed));
    if (valid.length === 0) break;
    const invalid = remaining.filter((w) => !isValidPick(w, prev, mustExceed));

    const canonical = sampleN(valid, 1, rng)[0]!;
    const otherValids = valid.filter((w) => w.word !== canonical.word);

    let decoys: WordHit[] = sampleN(invalid, Math.min(N - 1, invalid.length), rng);
    if (decoys.length < N - 1) {
      const padCount = N - 1 - decoys.length;
      decoys = [...decoys, ...sampleN(otherValids, padCount, rng)];
    }

    const choices = sampleN([canonical, ...decoys], N, rng);
    const correctIndex = choices.findIndex((c) => c.word === canonical.word);

    steps.push({
      index: i,
      previousWord: prev,
      choices,
      correctIndex,
    });
    prev = canonical;
    usedWords.add(canonical.word);
  }
  return steps;
}

export interface StairsJudgement {
  correct: boolean;
  picked: WordHit;
  expected: WordHit;
}

/**
 * Accepts any choice that satisfies the rule (exceeds/undercuts previous),
 * not strictly the canonical pick. This handles the "padded-with-valids"
 * case from buildSteps gracefully.
 */
export function judgeStep(
  step: StairsStep,
  choiceIndex: number,
): StairsJudgement {
  const picked = step.choices[choiceIndex];
  const expected = step.choices[step.correctIndex];
  if (!picked || !expected) {
    throw new Error("Invalid choice index");
  }
  const mustExceed = expected.hit_count > step.previousWord.hit_count;
  const correct = mustExceed
    ? picked.hit_count > step.previousWord.hit_count
    : picked.hit_count < step.previousWord.hit_count;
  return { correct, picked, expected };
}

export function nextStairsScore(
  currentScore: number,
  stepIndex: number,
): { score: number; gained: number } {
  const gained = 100 + stepIndex * 25;
  return { score: currentScore + gained, gained };
}
