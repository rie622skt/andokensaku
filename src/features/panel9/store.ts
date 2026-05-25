import { create } from "zustand";

import type { Panel9Board } from "@/data/models";
import { progressRepository } from "@/data/repositories/progressRepository";
import { questionRepository } from "@/data/repositories/questionRepository";
import { createRng, sampleN } from "@/core/utils/shuffle";

import { CpuDifficulty, chooseCpuMove } from "./cpuAi";
import {
  FinalScore,
  PanelState,
  PlayResult,
  applyPlay,
  buildInitialBoard,
  finalScore,
} from "./engine";

interface Panel9State {
  board: Panel9Board | null;
  panels: PanelState[];
  hand: string[];
  round: number;
  totalRounds: number;
  turn: "player" | "cpu";
  difficulty: CpuDifficulty;
  finished: boolean;
  lastResult: PlayResult | null;
  result: FinalScore | null;

  start: (difficulty?: CpuDifficulty, seed?: number) => void;
  playerPlay: (panelIndex: number, handWord: string) => PlayResult | null;
  cpuPlay: (rngSeed?: number) => PlayResult | null;
  finish: () => FinalScore | null;
  reset: () => void;
}

export const usePanel9Store = create<Panel9State>((set, get) => ({
  board: null,
  panels: [],
  hand: [],
  round: 0,
  totalRounds: 5,
  turn: "player",
  difficulty: "normal",
  finished: false,
  lastResult: null,
  result: null,

  start: (difficulty = "normal", seed = Date.now()) => {
    const pack = questionRepository.getPanel9Pack();
    const rng = createRng(seed);
    const board = sampleN(pack.boards, 1, rng)[0];
    if (!board) {
      set({ finished: true });
      return;
    }
    const hand = sampleN(board.hand_pool, board.hand_pool.length, rng);
    set({
      board,
      panels: buildInitialBoard(board),
      hand,
      round: 0,
      totalRounds: board.rounds,
      turn: "player",
      difficulty,
      finished: false,
      lastResult: null,
      result: null,
    });
  },

  playerPlay: (panelIndex, handWord) => {
    const state = get();
    if (!state.board || state.turn !== "player" || state.finished) return null;
    const panels = state.panels.map((p) => ({ ...p }));
    const result = applyPlay(panels, state.board, panelIndex, handWord, "player");
    const hand = state.hand.filter((w) => w !== handWord);
    set({
      panels,
      hand,
      turn: "cpu",
      lastResult: result,
    });
    return result;
  },

  cpuPlay: (rngSeed = Date.now()) => {
    const state = get();
    if (!state.board || state.turn !== "cpu" || state.finished) return null;
    const rng = createRng(rngSeed);
    const move = chooseCpuMove(
      state.panels,
      state.board,
      state.hand,
      state.difficulty,
      rng,
    );
    if (!move) {
      // No legal CPU move — advance turn without action.
      const round = state.round + 1;
      const finished = round >= state.totalRounds;
      set({
        turn: "player",
        round,
        finished,
        result: finished ? finalScore(state.panels) : null,
      });
      if (finished && state.board) {
        progressRepository.recordResult("panel9", finalScore(state.panels).score);
      }
      return null;
    }
    const panels = state.panels.map((p) => ({ ...p }));
    const result = applyPlay(
      panels,
      state.board,
      move.panelIndex,
      move.handWord,
      "cpu",
    );
    const round = state.round + 1;
    const finished = round >= state.totalRounds;
    set({
      panels,
      turn: "player",
      round,
      finished,
      lastResult: result,
      result: finished ? finalScore(panels) : null,
    });
    if (finished) {
      progressRepository.recordResult("panel9", finalScore(panels).score);
    }
    return result;
  },

  finish: () => {
    const state = get();
    if (state.finished) return state.result;
    const result = finalScore(state.panels);
    progressRepository.recordResult("panel9", result.score);
    set({ finished: true, result });
    return result;
  },

  reset: () =>
    set({
      board: null,
      panels: [],
      hand: [],
      round: 0,
      totalRounds: 5,
      turn: "player",
      difficulty: "normal",
      finished: false,
      lastResult: null,
      result: null,
    }),
}));
