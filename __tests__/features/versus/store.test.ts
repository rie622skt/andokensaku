import { useVersusStore } from "@/features/versus/store";

const reset = () => useVersusStore.getState().reset();

describe("versus store", () => {
  beforeEach(reset);
  afterEach(reset);

  test("begin fixes a numeric seed and starts with player 1", () => {
    useVersusStore.getState().begin("compare", 12345);
    const s = useVersusStore.getState();
    expect(s.active).toBe(true);
    expect(s.mode).toBe("compare");
    expect(s.seed).toBe(12345);
    expect(s.current).toBe(1);
    expect(s.p1Score).toBeNull();
    expect(s.p2Score).toBeNull();
  });

  test("begin without an explicit seed still produces a number", () => {
    useVersusStore.getState().begin("speed");
    expect(typeof useVersusStore.getState().seed).toBe("number");
  });

  test("reportScore records P1 then P2 and advances the phase", () => {
    const { begin, reportScore } = useVersusStore.getState();
    begin("compare", 1);

    expect(reportScore(120)).toBe("handoff");
    let s = useVersusStore.getState();
    expect(s.p1Score).toBe(120);
    expect(s.current).toBe(2);

    expect(useVersusStore.getState().reportScore(80)).toBe("result");
    s = useVersusStore.getState();
    expect(s.p2Score).toBe(80);
  });

  test("winner reflects the higher score, ties when equal", () => {
    const store = useVersusStore.getState();

    store.begin("compare", 1);
    store.reportScore(120);
    useVersusStore.getState().reportScore(80);
    expect(useVersusStore.getState().winner()).toBe("p1");

    reset();
    useVersusStore.getState().begin("compare", 1);
    useVersusStore.getState().reportScore(50);
    useVersusStore.getState().reportScore(200);
    expect(useVersusStore.getState().winner()).toBe("p2");

    reset();
    useVersusStore.getState().begin("compare", 1);
    useVersusStore.getState().reportScore(90);
    useVersusStore.getState().reportScore(90);
    expect(useVersusStore.getState().winner()).toBe("tie");
  });

  test("setScores fills both scores at once (panel9 path)", () => {
    useVersusStore.getState().setScores("panel9", 3080, 1160);
    const s = useVersusStore.getState();
    expect(s.mode).toBe("panel9");
    expect(s.p1Score).toBe(3080);
    expect(s.p2Score).toBe(1160);
    expect(s.winner()).toBe("p1");
  });

  test("reset clears the session", () => {
    useVersusStore.getState().begin("stairs", 7);
    useVersusStore.getState().reset();
    const s = useVersusStore.getState();
    expect(s.active).toBe(false);
    expect(s.mode).toBeNull();
    expect(s.seed).toBeNull();
    expect(s.p1Score).toBeNull();
    expect(s.p2Score).toBeNull();
  });
});
