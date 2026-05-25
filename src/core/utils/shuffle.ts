/**
 * Mulberry32 — deterministic PRNG for replayable test runs.
 * Same seed → same sequence; ideal for unit-testing engines.
 */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleInPlace<T>(
  array: T[],
  rng: () => number = Math.random,
): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = array[i] as T;
    array[i] = array[j] as T;
    array[j] = tmp;
  }
  return array;
}

export function pickRandom<T>(
  array: readonly T[],
  rng: () => number = Math.random,
): T {
  if (array.length === 0) {
    throw new Error("pickRandom: empty array");
  }
  const idx = Math.floor(rng() * array.length);
  return array[idx] as T;
}

export function sampleN<T>(
  array: readonly T[],
  n: number,
  rng: () => number = Math.random,
): T[] {
  if (n >= array.length) return [...array];
  const pool = [...array];
  shuffleInPlace(pool, rng);
  return pool.slice(0, n);
}
