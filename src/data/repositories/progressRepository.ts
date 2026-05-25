import { readJson, writeJson } from "@/core/storage/mmkv";
import type { Mode } from "@/data/models";

interface ModeProgress {
  bestScore: number;
  playCount: number;
  lastPlayedAt: string | null;
}

const defaultProgress: ModeProgress = {
  bestScore: 0,
  playCount: 0,
  lastPlayedAt: null,
};

const key = (mode: Mode) => `progress.${mode}`;

class ProgressRepository {
  get(mode: Mode): ModeProgress {
    return readJson<ModeProgress>(key(mode), defaultProgress);
  }

  recordResult(mode: Mode, score: number): ModeProgress {
    const prev = this.get(mode);
    const next: ModeProgress = {
      bestScore: Math.max(prev.bestScore, score),
      playCount: prev.playCount + 1,
      lastPlayedAt: new Date().toISOString(),
    };
    writeJson(key(mode), next);
    return next;
  }

  all(): Record<Mode, ModeProgress> {
    return {
      compare: this.get("compare"),
      speed: this.get("speed"),
      panel9: this.get("panel9"),
      stairs: this.get("stairs"),
    };
  }
}

export const progressRepository = new ProgressRepository();
