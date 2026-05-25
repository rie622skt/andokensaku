import type { Panel9Board } from "@/data/models";
import { pickRandom } from "@/core/utils/shuffle";

import {
  PanelState,
  applyPlay,
  countLines,
  lookupAndHit,
} from "./engine";

export type CpuDifficulty = "easy" | "normal" | "hard";

interface CandidateMove {
  panelIndex: number;
  handWord: string;
  hit: number;
}

function enumerateCandidates(
  panels: PanelState[],
  board: Panel9Board,
  hand: readonly string[],
): CandidateMove[] {
  const moves: CandidateMove[] = [];
  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];
    if (!panel) continue;
    if (panel.owner === "cpu") {
      // Skip strengthening your own panel unless higher; we filter below.
    }
    for (const handWord of hand) {
      const hit = lookupAndHit(board, panel.panel_word, handWord);
      const previous = panel.lastHitCount ?? 0;
      if (panel.owner === "player" && hit <= previous) continue;
      if (panel.owner === "cpu" && hit <= previous) continue;
      moves.push({ panelIndex: i, handWord, hit });
    }
  }
  return moves;
}

function evaluatePosition(panels: PanelState[]): number {
  const { playerLines, cpuLines } = countLines(panels);
  let cpuTiles = 0;
  let playerTiles = 0;
  for (const p of panels) {
    if (p.owner === "cpu") cpuTiles++;
    if (p.owner === "player") playerTiles++;
  }
  return (
    (cpuLines - playerLines) * 1000 + (cpuTiles - playerTiles) * 50
  );
}

export function chooseCpuMove(
  panels: PanelState[],
  board: Panel9Board,
  hand: readonly string[],
  difficulty: CpuDifficulty,
  rng: () => number = Math.random,
): CandidateMove | null {
  const candidates = enumerateCandidates(panels, board, hand);
  if (candidates.length === 0) return null;

  if (difficulty === "easy") {
    return pickRandom(candidates, rng);
  }

  if (difficulty === "normal") {
    candidates.sort((a, b) => b.hit - a.hit);
    const top = candidates.slice(0, Math.max(3, Math.ceil(candidates.length * 0.3)));
    return pickRandom(top, rng);
  }

  // hard: 1-ply lookahead — pick the move that maximises evaluatePosition.
  let bestScore = -Infinity;
  let best: CandidateMove | null = null;
  for (const move of candidates) {
    const cloned = panels.map((p) => ({ ...p }));
    applyPlay(cloned, board, move.panelIndex, move.handWord, "cpu");
    const score = evaluatePosition(cloned);
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }
  return best ?? pickRandom(candidates, rng);
}
