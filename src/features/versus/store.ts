import { create } from "zustand";

import type { Mode } from "@/data/models";

/**
 * Modes that use the "sequential same-seed duel" flow: player 1 plays a full
 * solo session, hands the device over, then player 2 plays the *same* seed.
 * panel9 is excluded — it alternates two humans on one shared board and feeds
 * its final scores in directly via `setScores`.
 */
export type VersusMode = "compare" | "speed" | "stairs";

export type VersusWinner = "p1" | "p2" | "tie";

interface VersusState {
  active: boolean;
  /** The mode being played (sequential modes set this via `begin`). */
  mode: Mode | null;
  /** Fixed once per match so both players get identical questions/boards. */
  seed: number | null;
  current: 1 | 2;
  p1Score: number | null;
  p2Score: number | null;

  /** Start a sequential-duel match: fix the seed, reset scores, P1 first. */
  begin: (mode: VersusMode, seed?: number) => void;
  /**
   * Record the current player's score and advance. Returns the next phase:
   * `"handoff"` after P1, `"result"` after P2.
   */
  reportScore: (score: number) => "handoff" | "result";
  /** Set both scores at once (used by panel9, which is self-contained). */
  setScores: (mode: Mode, p1Score: number, p2Score: number) => void;
  /** Compute the winner from whatever scores are present. */
  winner: () => VersusWinner;
  reset: () => void;
}

export const useVersusStore = create<VersusState>((set, get) => ({
  active: false,
  mode: null,
  seed: null,
  current: 1,
  p1Score: null,
  p2Score: null,

  begin: (mode, seed = Date.now()) =>
    set({
      active: true,
      mode,
      seed,
      current: 1,
      p1Score: null,
      p2Score: null,
    }),

  reportScore: (score) => {
    const { current } = get();
    if (current === 1) {
      set({ p1Score: score, current: 2 });
      return "handoff";
    }
    set({ p2Score: score });
    return "result";
  },

  setScores: (mode, p1Score, p2Score) =>
    set({ active: true, mode, p1Score, p2Score }),

  winner: () => {
    const { p1Score, p2Score } = get();
    const a = p1Score ?? 0;
    const b = p2Score ?? 0;
    if (a > b) return "p1";
    if (b > a) return "p2";
    return "tie";
  },

  reset: () =>
    set({
      active: false,
      mode: null,
      seed: null,
      current: 1,
      p1Score: null,
      p2Score: null,
    }),
}));
