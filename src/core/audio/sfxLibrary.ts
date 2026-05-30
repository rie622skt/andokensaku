export type SfxName =
  | "tap"
  | "correct"
  | "wrong"
  | "combo"
  | "tick"
  | "clearJingle"
  | "stairsUp"
  | "panelFlip";

// Short synthesized cues bundled at assets/audio/sfx/*.wav. Loaded lazily by
// audioService and scaled by the sfxVolume preference. Replace any file to
// swap a sound.
/* eslint-disable @typescript-eslint/no-require-imports */
export const sfxAssetPaths: Record<SfxName, number | null> = {
  tap: require("../../../assets/audio/sfx/tap.wav"),
  correct: require("../../../assets/audio/sfx/correct.wav"),
  wrong: require("../../../assets/audio/sfx/wrong.wav"),
  combo: require("../../../assets/audio/sfx/combo.wav"),
  tick: require("../../../assets/audio/sfx/tick.wav"),
  clearJingle: require("../../../assets/audio/sfx/clearJingle.wav"),
  stairsUp: require("../../../assets/audio/sfx/stairsUp.wav"),
  panelFlip: require("../../../assets/audio/sfx/panelFlip.wav"),
};
/* eslint-enable @typescript-eslint/no-require-imports */
