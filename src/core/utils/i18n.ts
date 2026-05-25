import * as Localization from "expo-localization";
import { I18n } from "i18n-js";

import en from "@locales/en.json";
import ja from "@locales/ja.json";
import { usePreferences } from "@/core/storage/preferences";

export const i18n = new I18n({ ja, en });
i18n.enableFallback = true;
i18n.defaultLocale = "ja";

const deviceLocale = (Localization.getLocales()[0]?.languageCode ?? "ja") as
  | "ja"
  | "en";
i18n.locale = deviceLocale === "en" ? "en" : "ja";

// Keep i18n in sync with user preference.
usePreferences.subscribe((state) => {
  i18n.locale = state.language;
});

export function t(scope: string, options?: object): string {
  return i18n.t(scope, options);
}
