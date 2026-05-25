import { create } from "zustand";

import type { CompareQuestion, ComparePack } from "@/data/models";
import { progressRepository } from "@/data/repositories/progressRepository";
import { questionRepository } from "@/data/repositories/questionRepository";
import { createRng, sampleN } from "@/core/utils/shuffle";

import {
  CompareChoice,
  CompareJudgement,
  judgeCompare,
  nextCompareScore,
} from "./engine";

interface CompareState {
  pack: ComparePack | null;
  queue: CompareQuestion[];
  current: CompareQuestion | null;
  index: number;
  totalQuestions: number;
  score: number;
  combo: number;
  bestCombo: number;
  lastJudgement: CompareJudgement | null;
  finished: boolean;
  start: (questionsCount?: number, seed?: number) => void;
  answer: (choice: CompareChoice) => CompareJudgement | null;
  next: () => void;
  reset: () => void;
}

const DEFAULT_COUNT = 10;

export const useCompareStore = create<CompareState>((set, get) => ({
  pack: null,
  queue: [],
  current: null,
  index: 0,
  totalQuestions: 0,
  score: 0,
  combo: 0,
  bestCombo: 0,
  lastJudgement: null,
  finished: false,

  start: (questionsCount = DEFAULT_COUNT, seed = Date.now()) => {
    const pack = questionRepository.getComparePack();
    const rng = createRng(seed);
    const queue = sampleN(pack.questions, questionsCount, rng);
    set({
      pack,
      queue,
      current: queue[0] ?? null,
      index: 0,
      totalQuestions: queue.length,
      score: 0,
      combo: 0,
      bestCombo: 0,
      lastJudgement: null,
      finished: queue.length === 0,
    });
  },

  answer: (choice) => {
    const state = get();
    if (!state.current || state.finished) return null;
    const judgement = judgeCompare(state.current, choice);
    const { score, combo, gained: _gained } = nextCompareScore({
      currentScore: state.score,
      currentCombo: state.combo,
      correct: judgement.correct,
      difficulty: state.current.difficulty,
    });
    set({
      score,
      combo,
      bestCombo: Math.max(state.bestCombo, combo),
      lastJudgement: judgement,
    });
    return judgement;
  },

  next: () => {
    const state = get();
    const nextIndex = state.index + 1;
    if (nextIndex >= state.queue.length) {
      progressRepository.recordResult("compare", state.score);
      set({
        finished: true,
        current: null,
        lastJudgement: null,
      });
      return;
    }
    set({
      index: nextIndex,
      current: state.queue[nextIndex] ?? null,
      lastJudgement: null,
    });
  },

  reset: () =>
    set({
      pack: null,
      queue: [],
      current: null,
      index: 0,
      totalQuestions: 0,
      score: 0,
      combo: 0,
      bestCombo: 0,
      lastJudgement: null,
      finished: false,
    }),
}));
