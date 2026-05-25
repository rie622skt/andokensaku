export type SfxName =
  | "tap"
  | "correct"
  | "wrong"
  | "combo"
  | "tick"
  | "clearJingle"
  | "stairsUp"
  | "panelFlip";

// NOTE: paths point to assets/audio/sfx/*.wav. Assets are loaded lazily by
// audioService. Files do not exist yet — they ship in Week 2 along with
// the first SFX pass.
export const sfxAssetPaths: Record<SfxName, number | null> = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  tap: null,
  correct: null,
  wrong: null,
  combo: null,
  tick: null,
  clearJingle: null,
  stairsUp: null,
  panelFlip: null,
};
