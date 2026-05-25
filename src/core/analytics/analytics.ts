// Analytics is intentionally a no-op stub. Plug in PostHog / Amplitude
// later if needed. Keeping the call sites instrumented now so that wiring
// is a one-file change.

export type AnalyticsEvent =
  | { name: "app_launched"; props?: Record<string, unknown> }
  | { name: "mode_started"; props: { mode: string } }
  | { name: "mode_completed"; props: { mode: string; score: number } }
  | { name: "tutorial_completed"; props?: Record<string, unknown> };

export const analytics = {
  track: (_event: AnalyticsEvent): void => {
    // no-op
  },
};
