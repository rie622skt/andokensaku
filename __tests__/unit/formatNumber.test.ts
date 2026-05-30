import { formatHitCountJa } from "@/core/utils/formatNumber";

describe("formatHitCountJa", () => {
  test("small numbers keep comma separators", () => {
    expect(formatHitCountJa(540)).toBe("540");
    expect(formatHitCountJa(5400)).toBe("5,400");
    expect(formatHitCountJa(9999)).toBe("9,999");
  });

  test("ten-thousands collapse to 万", () => {
    expect(formatHitCountJa(10000)).toBe("1万");
    expect(formatHitCountJa(50000)).toBe("5万");
    expect(formatHitCountJa(500000)).toBe("50万");
    expect(formatHitCountJa(54000)).toBe("5.4万");
  });

  test("large 万 values round to integers", () => {
    expect(formatHitCountJa(1234567)).toBe("123万");
  });

  test("hundred-millions collapse to 億", () => {
    expect(formatHitCountJa(100000000)).toBe("1億");
    expect(formatHitCountJa(250000000)).toBe("2.5億");
  });

  test("zero and non-finite", () => {
    expect(formatHitCountJa(0)).toBe("0");
    expect(formatHitCountJa(Infinity)).toBe("∞");
  });
});
