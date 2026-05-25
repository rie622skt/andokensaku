import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { storage } from "./mmkv";

const mmkvJsonStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};

export type AppLanguage = "ja" | "en";
export type ColorScheme = "system" | "light" | "dark";

export interface Preferences {
  bgmVolume: number;
  sfxVolume: number;
  hapticEnabled: boolean;
  language: AppLanguage;
  colorScheme: ColorScheme;
  tutorialCompleted: boolean;
  setBgmVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  setHapticEnabled: (b: boolean) => void;
  setLanguage: (lang: AppLanguage) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  completeTutorial: () => void;
}

export const usePreferences = create<Preferences>()(
  persist(
    (set) => ({
      bgmVolume: 0.5,
      sfxVolume: 0.8,
      hapticEnabled: true,
      language: "ja",
      colorScheme: "system",
      tutorialCompleted: false,
      setBgmVolume: (v) => set({ bgmVolume: Math.max(0, Math.min(1, v)) }),
      setSfxVolume: (v) => set({ sfxVolume: Math.max(0, Math.min(1, v)) }),
      setHapticEnabled: (b) => set({ hapticEnabled: b }),
      setLanguage: (language) => set({ language }),
      setColorScheme: (colorScheme) => set({ colorScheme }),
      completeTutorial: () => set({ tutorialCompleted: true }),
    }),
    {
      name: "preferences",
      storage: createJSONStorage(() => mmkvJsonStorage),
    },
  ),
);
