/**
 * Format a search-hit count for display in Japanese so it reads at a glance.
 * Large values collapse to 万 / 億 units instead of long digit strings.
 *
 *   540        → "540"
 *   5,400      → "5,400"
 *   50,000     → "5万"
 *   500,000    → "50万"
 *   1,234,567  → "123万"
 *   54,000     → "5.4万"
 *   250,000,000→ "2.5億"
 */
export function formatHitCountJa(n: number): string {
  if (!Number.isFinite(n)) return "∞";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);

  if (abs < 10_000) {
    return sign + Math.round(abs).toLocaleString("en-US");
  }
  if (abs < 100_000_000) {
    return `${sign}${formatUnit(abs / 10_000)}万`;
  }
  return `${sign}${formatUnit(abs / 100_000_000)}億`;
}

/** One decimal below 100, integer at/above (e.g. 5.4, 50, 123). */
function formatUnit(v: number): string {
  if (v >= 100) return String(Math.round(v));
  const r = Math.round(v * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}
