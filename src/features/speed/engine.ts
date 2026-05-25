import type { SpeedRound, SpeedComparator } from "@/data/models";

export type SpeedDecision = "yes" | "no";

export interface SpeedJudgement {
  correct: boolean;
  expected: SpeedDecision;
}

export function expectedAnswer(
  hitCount: number,
  threshold: number,
  comparator: SpeedComparator,
): SpeedDecision {
  if (comparator === "over") {
    return hitCount > threshold ? "yes" : "no";
  }
  return hitCount < threshold ? "yes" : "no";
}

export function judgeSpeed(
  round: SpeedRound,
  wordHit: number,
  decision: SpeedDecision,
): SpeedJudgement {
  const expected = expectedAnswer(wordHit, round.threshold, round.comparator);
  return { correct: decision === expected, expected };
}

export interface SpeedScoreInput {
  currentScore: number;
  combo: number;
  correct: boolean;
  elapsedMs: number;
}

/**
 * Score per correct answer: base 100, +30 if answered within 1.5s,
 * +10% per combo step up to 5x. Wrong answer wipes combo and costs 50.
 */
export function nextSpeedScore({
  currentScore,
  combo,
  correct,
  elapsedMs,
}: SpeedScoreInput): { score: number; combo: number; gained: number } {
  if (!correct) {
    return {
      score: Math.max(0, currentScore - 50),
      combo: 0,
      gained: -50,
    };
  }
  const speedBonus = elapsedMs < 1500 ? 30 : elapsedMs < 3000 ? 10 : 0;
  const newCombo = combo + 1;
  const multiplier = 1 + Math.min(newCombo - 1, 5) * 0.1;
  const gained = Math.round((100 + speedBonus) * multiplier);
  return { score: currentScore + gained, combo: newCombo, gained };
}
