import {
  buildSteps,
  judgeStep,
  nextStairsScore,
} from "@/features/stairs/engine";
import type { StairsRun } from "@/data/models";

const run: StairsRun = {
  id: "stair-test",
  mode: "stairs",
  difficulty: "normal",
  snapshot_date: "2026-05-24",
  source: "test",
  seed_word: "seed",
  seed_hit_count: 100,
  max_steps: 5,
  step_rules: { must_exceed: true, choice_count_per_step: 4 },
  word_pool: Array.from({ length: 25 }, (_, i) => ({
    word: `w${i}`,
    hit_count: (i + 1) * 50,
  })),
};

describe("stairs engine", () => {
  test("buildSteps respects must_exceed rule for the correct choice", () => {
    const steps = buildSteps(run, 7);
    expect(steps.length).toBeGreaterThan(0);
    let previous = run.seed_hit_count;
    for (const step of steps) {
      const correct = step.choices[step.correctIndex];
      expect(correct).toBeDefined();
      expect(correct!.hit_count).toBeGreaterThan(previous);
      previous = correct!.hit_count;
    }
  });

  test("buildSteps presents N choices each step", () => {
    const steps = buildSteps(run, 1);
    for (const step of steps) {
      expect(step.choices).toHaveLength(run.step_rules.choice_count_per_step);
    }
  });

  test("buildSteps is deterministic for the same seed", () => {
    const a = buildSteps(run, 42);
    const b = buildSteps(run, 42);
    expect(a).toEqual(b);
  });

  test("judgeStep correctly identifies the right choice", () => {
    const steps = buildSteps(run, 3);
    const step = steps[0]!;
    const j = judgeStep(step, step.correctIndex);
    expect(j.correct).toBe(true);
  });

  test("nextStairsScore scales with step index", () => {
    const a = nextStairsScore(0, 0);
    const b = nextStairsScore(0, 4);
    expect(b.gained).toBeGreaterThan(a.gained);
  });
});
