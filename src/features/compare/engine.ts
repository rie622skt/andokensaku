import type { CompareQuestion } from "@/data/models";

export type CompareChoice = "left" | "right";

export interface CompareJudgement {
  correct: boolean;
  winner: CompareChoice | "tie";
  /** Ratio of larger / smaller hit count. */
  ratio: number;
}

export function judgeCompare(
  question: CompareQuestion,
  choice: CompareChoice,
): CompareJudgement {
  const { left, right } = question;
  const winner: CompareChoice | "tie" =
    left.hit_count === right.hit_count
      ? "tie"
      : left.hit_count > right.hit_count
        ? "left"
        : "right";
  const max = Math.max(left.hit_count, right.hit_count);
  const min = Math.min(left.hit_count, right.hit_count);
  const ratio = min === 0 ? Infinity : max / min;
  const correct = winner === "tie" ? true : winner === choice;
  return { correct, winner, ratio };
}

export interface CompareScoreInput {
  currentScore: number;
  currentCombo: number;
  correct: boolean;
  difficulty: "easy" | "normal" | "hard";
}

export function nextCompareScore({
  currentScore,
  currentCombo,
  correct,
  difficulty,
}: CompareScoreInput): { score: number; combo: number; gained: number } {
  if (!correct) {
    return { score: currentScore, combo: 0, gained: 0 };
  }
  const base = difficulty === "hard" ? 150 : difficulty === "normal" ? 100 : 70;
  const combo = currentCombo + 1;
  const multiplier = 1 + Math.min(combo - 1, 5) * 0.2;
  const gained = Math.round(base * multiplier);
  return { score: currentScore + gained, combo, gained };
}
