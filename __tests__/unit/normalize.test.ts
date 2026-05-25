import { createRng, sampleN, shuffleInPlace } from "@/core/utils/shuffle";

describe("createRng", () => {
  test("same seed → same sequence", () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });
  test("output is in [0,1)", () => {
    const rng = createRng(123);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("shuffleInPlace", () => {
  test("preserves elements", () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    shuffleInPlace(arr, createRng(7));
    expect(arr.sort()).toEqual(original);
  });
});

describe("sampleN", () => {
  test("returns N elements", () => {
    const sample = sampleN([1, 2, 3, 4, 5], 3, createRng(1));
    expect(sample).toHaveLength(3);
    sample.forEach((v) => expect([1, 2, 3, 4, 5]).toContain(v));
  });
  test("returns all elements when N >= length", () => {
    expect(sampleN([1, 2, 3], 10, createRng(1)).sort()).toEqual([1, 2, 3]);
  });
});
