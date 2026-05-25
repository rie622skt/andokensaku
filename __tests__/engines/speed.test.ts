import {
  expectedAnswer,
  judgeSpeed,
  nextSpeedScore,
} from "@/features/speed/engine";
import type { SpeedRound } from "@/data/models";

const overRound: SpeedRound = {
  id: "spd-test",
  mode: "speed",
  difficulty: "normal",
  snapshot_date: "2026-05-24",
  source: "test",
  threshold: 100,
  comparator: "over",
  duration_sec: 30,
  words: [
    { word: "a", hit_count: 50 },
    { word: "b", hit_count: 200 },
    { word: "c", hit_count: 100 },
    { word: "d", hit_count: 90 },
    { word: "e", hit_count: 150 },
  ],
};

describe("speed engine", () => {
  test("expectedAnswer for over comparator", () => {
    expect(expectedAnswer(200, 100, "over")).toBe("yes");
    expect(expectedAnswer(50, 100, "over")).toBe("no");
    expect(expectedAnswer(100, 100, "over")).toBe("no"); // strict >
  });

  test("expectedAnswer for under comparator", () => {
    expect(expectedAnswer(50, 100, "under")).toBe("yes");
    expect(expectedAnswer(200, 100, "under")).toBe("no");
  });

  test("judgeSpeed flags correct answer", () => {
    const j = judgeSpeed(overRound, 200, "yes");
    expect(j.correct).toBe(true);
    expect(j.expected).toBe("yes");
  });

  test("speed bonus when answered quickly", () => {
    const fast = nextSpeedScore({
      currentScore: 0,
      combo: 0,
      correct: true,
      elapsedMs: 1000,
    });
    const slow = nextSpeedScore({
      currentScore: 0,
      combo: 0,
      correct: true,
      elapsedMs: 5000,
    });
    expect(fast.gained).toBeGreaterThan(slow.gained);
  });

  test("wrong answer deducts and resets combo", () => {
    const r = nextSpeedScore({
      currentScore: 200,
      combo: 5,
      correct: false,
      elapsedMs: 1000,
    });
    expect(r.score).toBe(150);
    expect(r.combo).toBe(0);
  });

  test("score never goes below zero", () => {
    const r = nextSpeedScore({
      currentScore: 10,
      combo: 0,
      correct: false,
      elapsedMs: 1000,
    });
    expect(r.score).toBe(0);
  });
});
