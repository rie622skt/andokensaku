import {
  judgeCompare,
  nextCompareScore,
} from "@/features/compare/engine";
import type { CompareQuestion } from "@/data/models";

const baseQuestion: CompareQuestion = {
  id: "q1",
  mode: "compare",
  difficulty: "normal",
  snapshot_date: "2026-05-24",
  source: "test",
  left: { word: "犬", hit_count: 540 },
  right: { word: "猫", hit_count: 720 },
};

describe("compare engine", () => {
  test("right has more hits → right wins → choosing right is correct", () => {
    const j = judgeCompare(baseQuestion, "right");
    expect(j.winner).toBe("right");
    expect(j.correct).toBe(true);
    expect(j.ratio).toBeCloseTo(720 / 540, 2);
  });

  test("choosing the losing side is incorrect", () => {
    const j = judgeCompare(baseQuestion, "left");
    expect(j.correct).toBe(false);
  });

  test("tie counts as correct regardless of choice", () => {
    const tied: CompareQuestion = {
      ...baseQuestion,
      left: { word: "A", hit_count: 100 },
      right: { word: "B", hit_count: 100 },
    };
    expect(judgeCompare(tied, "left").correct).toBe(true);
    expect(judgeCompare(tied, "right").correct).toBe(true);
  });

  test("combo multiplier increases score", () => {
    let combo = 0;
    let score = 0;
    for (let i = 0; i < 3; i++) {
      const r = nextCompareScore({
        currentScore: score,
        currentCombo: combo,
        correct: true,
        difficulty: "normal",
      });
      score = r.score;
      combo = r.combo;
    }
    expect(combo).toBe(3);
    // 100 + 120 + 140 = 360
    expect(score).toBe(360);
  });

  test("wrong answer resets combo without losing score", () => {
    const r = nextCompareScore({
      currentScore: 500,
      currentCombo: 4,
      correct: false,
      difficulty: "normal",
    });
    expect(r.score).toBe(500);
    expect(r.combo).toBe(0);
    expect(r.gained).toBe(0);
  });
});
