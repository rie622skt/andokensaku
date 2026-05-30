import { create } from "zustand";

import type { SpeedRound, WordHit } from "@/data/models";
import { progressRepository } from "@/data/repositories/progressRepository";
import { questionRepository } from "@/data/repositories/questionRepository";
import { createRng, sampleN } from "@/core/utils/shuffle";

import {
  SpeedDecision,
  SpeedJudgement,
  judgeSpeed,
  nextSpeedScore,
} from "./engine";

interface SpeedState {
  round: SpeedRound | null;
  /** Words shuffled for the round. */
  bag: WordHit[];
  currentWord: WordHit | null;
  cursor: number;
  score: number;
  combo: number;
  bestCombo: number;
  correctCount: number;
  wrongCount: number;
  remainingMs: number;
  started: boolean;
  finished: boolean;
  questionStartedAt: number;
  lastJudgement: SpeedJudgement | null;
  /** When true, results are NOT recorded to solo best scores. */
  versus: boolean;

  start: (seed?: number, versus?: boolean) => void;
  answer: (decision: SpeedDecision) => SpeedJudgement | null;
  tick: (deltaMs: number) => void;
  finish: () => void;
  reset: () => void;
}

const TICK_DEFAULT_DURATION_MS = 30_000;

export const useSpeedStore = create<SpeedState>((set, get) => ({
  round: null,
  bag: [],
  currentWord: null,
  cursor: 0,
  score: 0,
  combo: 0,
  bestCombo: 0,
  correctCount: 0,
  wrongCount: 0,
  remainingMs: TICK_DEFAULT_DURATION_MS,
  started: false,
  finished: false,
  questionStartedAt: 0,
  lastJudgement: null,
  versus: false,

  start: (seed = Date.now(), versus = false) => {
    const pack = questionRepository.getSpeedPack();
    const rng = createRng(seed);
    const round = sampleN(pack.rounds, 1, rng)[0];
    if (!round) {
      set({ finished: true });
      return;
    }
    const bag = sampleN(round.words, round.words.length, rng);
    set({
      round,
      bag,
      currentWord: bag[0] ?? null,
      cursor: 0,
      score: 0,
      combo: 0,
      bestCombo: 0,
      correctCount: 0,
      wrongCount: 0,
      remainingMs: round.duration_sec * 1000,
      started: true,
      finished: false,
      questionStartedAt: Date.now(),
      lastJudgement: null,
      versus,
    });
  },

  answer: (decision) => {
    const state = get();
    if (!state.currentWord || !state.round || state.finished) return null;
    const elapsedMs = Date.now() - state.questionStartedAt;
    const judgement = judgeSpeed(
      state.round,
      state.currentWord.hit_count,
      decision,
    );
    const { score, combo, gained: _gained } = nextSpeedScore({
      currentScore: state.score,
      combo: state.combo,
      correct: judgement.correct,
      elapsedMs,
    });
    const nextCursor = state.cursor + 1;
    const nextWord =
      nextCursor < state.bag.length ? state.bag[nextCursor] ?? null : null;
    set({
      score,
      combo,
      bestCombo: Math.max(state.bestCombo, combo),
      correctCount: state.correctCount + (judgement.correct ? 1 : 0),
      wrongCount: state.wrongCount + (judgement.correct ? 0 : 1),
      currentWord: nextWord,
      cursor: nextCursor,
      questionStartedAt: Date.now(),
      lastJudgement: judgement,
      finished: nextWord === null,
    });
    return judgement;
  },

  tick: (deltaMs) => {
    const state = get();
    if (!state.started || state.finished) return;
    const next = Math.max(0, state.remainingMs - deltaMs);
    if (next === 0) {
      get().finish();
      return;
    }
    set({ remainingMs: next });
  },

  finish: () => {
    const state = get();
    if (state.finished) return;
    if (!state.versus) {
      progressRepository.recordResult("speed", state.score);
    }
    set({ finished: true, currentWord: null });
  },

  reset: () =>
    set({
      round: null,
      bag: [],
      currentWord: null,
      cursor: 0,
      score: 0,
      combo: 0,
      bestCombo: 0,
      correctCount: 0,
      wrongCount: 0,
      remainingMs: TICK_DEFAULT_DURATION_MS,
      started: false,
      finished: false,
      questionStartedAt: 0,
      lastJudgement: null,
      versus: false,
    }),
}));
