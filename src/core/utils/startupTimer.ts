/**
 * 起動時間計測。モジュール読み込み時刻を基準に、各ライフサイクル時点で
 * `markStartup(label)` を呼ぶと経過 ms を `console.info` に出力する。
 *
 * 同じ label は最初の1回だけ出力する（HMR やマウント再発火で重複しない）。
 * `__DEV__` 環境でのみ動作する。
 *
 * 計測の起点は本モジュールの初回 import 時刻。`expo-router/entry` 経由で
 * RootLayout が最初に読み込まれた直後に評価される。
 */

const startTimeMs: number =
  typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now();

const recorded = new Set<string>();

export function markStartup(label: string): void {
  if (!__DEV__) return;
  if (recorded.has(label)) return;
  recorded.add(label);
  const now =
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now();
  const elapsedMs = now - startTimeMs;
  const formatted = elapsedMs.toFixed(0).padStart(4, " ");
  // eslint-disable-next-line no-console
  console.info(`[startup ${formatted}ms] ${label}`);
}

/** テスト/デバッグ用にリセット。プロダクションでは使わない。 */
export function resetStartupTimer(): void {
  recorded.clear();
}
