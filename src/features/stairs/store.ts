import { create } from "zustand";

import type { StairsRun } from "@/data/models";
import { progressRepository } from "@/data/repositories/progressRepository";
import { questionRepository } from "@/data/repositories/questionRepository";
import { createRng, sampleN } from "@/core/utils/shuffle";

import {
  StairsJudgement,
  StairsStep,
  buildSteps,
  judgeStep,
  nextStairsScore,
} from "./engine";

interface StairsState {
  run: StairsRun | null;
  steps: StairsStep[];
  cursor: number;
  current: StairsStep | null;
  score: number;
  highestStep: number;
  finished: boolean;
  lastJudgement: StairsJudgement | null;
  /** When true, results are NOT recorded to solo best scores. */
  versus: boolean;

  start: (seed?: number, versus?: boolean) => void;
  answer: (choiceIndex: number) => StairsJudgement | null;
  reset: () => void;
}

export const useStairsStore = create<StairsState>((set, get) => ({
  run: null,
  steps: [],
  cursor: 0,
  current: null,
  score: 0,
  highestStep: 0,
  finished: false,
  lastJudgement: null,
  versus: false,

  start: (seed = Date.now(), versus = false) => {
    const pack = questionRepository.getStairsPack();
    const rng = createRng(seed);
    const run = sampleN(pack.runs, 1, rng)[0];
    if (!run) {
      set({ finished: true });
      return;
    }
    const steps = buildSteps(run, seed);
    set({
      run,
      steps,
      cursor: 0,
      current: steps[0] ?? null,
      score: 0,
      highestStep: 0,
      finished: steps.length === 0,
      lastJudgement: null,
      versus,
    });
  },

  answer: (choiceIndex) => {
    const state = get();
    if (!state.current || state.finished) return null;
    const judgement = judgeStep(state.current, choiceIndex);
    if (!judgement.correct) {
      // Wrong answer ends the run.
      if (!state.versus) {
        progressRepository.recordResult("stairs", state.score);
      }
      set({
        finished: true,
        lastJudgement: judgement,
        current: null,
      });
      return judgement;
    }
    const { score } = nextStairsScore(state.score, state.cursor);
    const nextCursor = state.cursor + 1;
    const nextStep =
      nextCursor < state.steps.length ? state.steps[nextCursor] ?? null : null;
    set({
      score,
      cursor: nextCursor,
      current: nextStep,
      highestStep: Math.max(state.highestStep, state.cursor + 1),
      lastJudgement: judgement,
      finished: nextStep === null,
    });
    if (nextStep === null && !state.versus) {
      progressRepository.recordResult("stairs", score);
    }
    return judgement;
  },

  reset: () =>
    set({
      run: null,
      steps: [],
      cursor: 0,
      current: null,
      score: 0,
      highestStep: 0,
      finished: false,
      lastJudgement: null,
      versus: false,
    }),
}));
