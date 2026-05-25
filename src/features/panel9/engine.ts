import type { Panel, Panel9Board } from "@/data/models";

export type PanelOwner = "none" | "player" | "cpu";

export interface PanelState extends Panel {
  owner: PanelOwner;
  lastHitCount: number | null;
}

export interface PlayResult {
  panelIndex: number;
  handWord: string;
  hitCount: number;
  winnerHitCount: number;
  challengerHitCount: number | null;
  conquered: boolean;
}

export function buildInitialBoard(board: Panel9Board): PanelState[] {
  return board.panels.map((p) => ({
    ...p,
    owner: "none",
    lastHitCount: null,
  }));
}

export function lookupAndHit(
  board: Panel9Board,
  panelWord: string,
  handWord: string,
): number {
  const key = `${panelWord}|${handWord}`;
  return board.and_hit_table[key] ?? 0;
}

/**
 * Apply a play: if the panel is unowned, the player claims it. If owned by
 * the opponent, the challenge wins iff the new AND-hit count is higher.
 * Returns the result; mutates `panels` for in-place state stores.
 */
export function applyPlay(
  panels: PanelState[],
  board: Panel9Board,
  panelIndex: number,
  handWord: string,
  player: "player" | "cpu",
): PlayResult {
  const target = panels[panelIndex];
  if (!target) {
    throw new Error(`Invalid panel index ${panelIndex}`);
  }
  const hit = lookupAndHit(board, target.panel_word, handWord);
  const previousHit = target.lastHitCount;
  const previousOwner = target.owner;

  let conquered = false;
  let winnerHit = previousHit ?? 0;

  if (previousOwner === "none") {
    target.owner = player;
    target.lastHitCount = hit;
    winnerHit = hit;
    conquered = true;
  } else if (previousOwner === player) {
    // Reinforcing your own panel: take if higher.
    if (hit > (previousHit ?? 0)) {
      target.lastHitCount = hit;
      winnerHit = hit;
      conquered = true;
    }
  } else {
    // Challenging opponent: take if strictly higher.
    if (hit > (previousHit ?? 0)) {
      target.owner = player;
      target.lastHitCount = hit;
      winnerHit = hit;
      conquered = true;
    }
  }

  return {
    panelIndex,
    handWord,
    hitCount: hit,
    winnerHitCount: winnerHit,
    challengerHitCount: hit,
    conquered,
  };
}

const WINNING_LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export interface LineSummary {
  playerLines: number;
  cpuLines: number;
}

export function countLines(panels: PanelState[]): LineSummary {
  let playerLines = 0;
  let cpuLines = 0;
  for (const [a, b, c] of WINNING_LINES) {
    const owners = [panels[a]?.owner, panels[b]?.owner, panels[c]?.owner];
    if (owners.every((o) => o === "player")) playerLines++;
    if (owners.every((o) => o === "cpu")) cpuLines++;
  }
  return { playerLines, cpuLines };
}

export interface FinalScore {
  playerLines: number;
  cpuLines: number;
  playerTiles: number;
  cpuTiles: number;
  winner: "player" | "cpu" | "tie";
  score: number;
}

export function finalScore(panels: PanelState[]): FinalScore {
  const { playerLines, cpuLines } = countLines(panels);
  let playerTiles = 0;
  let cpuTiles = 0;
  for (const p of panels) {
    if (p.owner === "player") playerTiles++;
    if (p.owner === "cpu") cpuTiles++;
  }
  let winner: "player" | "cpu" | "tie";
  if (playerLines > cpuLines) winner = "player";
  else if (cpuLines > playerLines) winner = "cpu";
  else if (playerTiles > cpuTiles) winner = "player";
  else if (cpuTiles > playerTiles) winner = "cpu";
  else winner = "tie";

  const base =
    winner === "player" ? 1000 : winner === "tie" ? 500 : 200;
  const tileBonus = playerTiles * 80;
  const lineBonus = playerLines * 150;
  return {
    playerLines,
    cpuLines,
    playerTiles,
    cpuTiles,
    winner,
    score: base + tileBonus + lineBonus,
  };
}
