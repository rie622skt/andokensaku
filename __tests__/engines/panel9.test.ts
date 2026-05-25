import {
  applyPlay,
  buildInitialBoard,
  countLines,
  finalScore,
} from "@/features/panel9/engine";
import { chooseCpuMove } from "@/features/panel9/cpuAi";
import { createRng } from "@/core/utils/shuffle";
import type { Panel9Board } from "@/data/models";

const board: Panel9Board = {
  id: "p9-test",
  mode: "panel9",
  difficulty: "normal",
  snapshot_date: "2026-05-24",
  source: "test",
  panels: [
    { row: 0, col: 0, panel_word: "A" },
    { row: 0, col: 1, panel_word: "B" },
    { row: 0, col: 2, panel_word: "C" },
    { row: 1, col: 0, panel_word: "D" },
    { row: 1, col: 1, panel_word: "E" },
    { row: 1, col: 2, panel_word: "F" },
    { row: 2, col: 0, panel_word: "G" },
    { row: 2, col: 1, panel_word: "H" },
    { row: 2, col: 2, panel_word: "I" },
  ],
  hand_pool: ["x", "y", "z", "w", "u", "v", "s", "t"],
  and_hit_table: {
    "A|x": 100,
    "A|y": 50,
    "B|x": 30,
    "B|y": 80,
    "C|x": 60,
    "C|y": 70,
    "D|x": 100,
    "D|y": 50,
    "E|x": 30,
    "E|y": 80,
    "F|x": 60,
    "F|y": 70,
    "G|x": 100,
    "G|y": 50,
    "H|x": 30,
    "H|y": 80,
    "I|x": 60,
    "I|y": 70,
  },
  rounds: 5,
};

describe("panel9 engine", () => {
  test("buildInitialBoard yields 9 unowned panels", () => {
    const panels = buildInitialBoard(board);
    expect(panels).toHaveLength(9);
    expect(panels.every((p) => p.owner === "none")).toBe(true);
  });

  test("claiming an unowned panel grants ownership", () => {
    const panels = buildInitialBoard(board);
    const result = applyPlay(panels, board, 0, "x", "player");
    expect(panels[0]?.owner).toBe("player");
    expect(panels[0]?.lastHitCount).toBe(100);
    expect(result.conquered).toBe(true);
  });

  test("challenger with higher AND hit count takes the panel", () => {
    const panels = buildInitialBoard(board);
    applyPlay(panels, board, 1, "x", "player"); // B|x = 30 (player)
    const result = applyPlay(panels, board, 1, "y", "cpu"); // B|y = 80
    expect(panels[1]?.owner).toBe("cpu");
    expect(result.conquered).toBe(true);
  });

  test("challenger with lower AND hit count fails", () => {
    const panels = buildInitialBoard(board);
    applyPlay(panels, board, 0, "x", "player"); // A|x = 100
    const result = applyPlay(panels, board, 0, "y", "cpu"); // A|y = 50
    expect(panels[0]?.owner).toBe("player");
    expect(result.conquered).toBe(false);
  });

  test("countLines counts horizontal/vertical/diagonal", () => {
    const panels = buildInitialBoard(board);
    panels.forEach((p, i) => {
      if (i < 3) p.owner = "player";
    });
    expect(countLines(panels).playerLines).toBe(1);
  });

  test("finalScore: more lines wins outright", () => {
    const panels = buildInitialBoard(board);
    // Player has row 0 (1 line, 3 tiles); CPU has 2 scattered tiles, 0 lines.
    panels[0]!.owner = "player";
    panels[1]!.owner = "player";
    panels[2]!.owner = "player";
    panels[4]!.owner = "cpu";
    panels[6]!.owner = "cpu";
    const score = finalScore(panels);
    expect(score.winner).toBe("player");
    expect(score.playerLines).toBe(1);
    expect(score.cpuLines).toBe(0);
  });

  test("finalScore: line tie broken by tile count", () => {
    const panels = buildInitialBoard(board);
    // Both have 1 line; CPU has more total tiles.
    panels[0]!.owner = "player";
    panels[1]!.owner = "player";
    panels[2]!.owner = "player";
    panels[3]!.owner = "cpu";
    panels[4]!.owner = "cpu";
    panels[5]!.owner = "cpu";
    panels[6]!.owner = "cpu";
    const score = finalScore(panels);
    expect(score.winner).toBe("cpu");
    expect(score.playerLines).toBe(1);
    expect(score.cpuLines).toBe(1);
    expect(score.cpuTiles).toBe(4);
    expect(score.playerTiles).toBe(3);
  });

  test("chooseCpuMove returns a legal move for easy difficulty", () => {
    const panels = buildInitialBoard(board);
    const rng = createRng(42);
    const move = chooseCpuMove(panels, board, ["x", "y"], "easy", rng);
    expect(move).not.toBeNull();
    expect(["x", "y"]).toContain(move!.handWord);
    expect(move!.panelIndex).toBeGreaterThanOrEqual(0);
    expect(move!.panelIndex).toBeLessThan(9);
  });

  test("hard CPU prefers immediate line completion", () => {
    const panels = buildInitialBoard(board);
    panels[0]!.owner = "cpu";
    panels[0]!.lastHitCount = 10;
    panels[1]!.owner = "cpu";
    panels[1]!.lastHitCount = 10;
    // panel 2 unowned — taking it completes row 0 for CPU
    const rng = createRng(1);
    const move = chooseCpuMove(panels, board, ["x", "y"], "hard", rng);
    expect(move?.panelIndex).toBe(2);
  });
});
