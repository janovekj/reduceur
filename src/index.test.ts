import { expect, test } from "vitest";
import { createReducer, State } from ".";

test("it works", () => {
  const reducer = createReducer((state: State<{ count: number }>) => ({
    incremented: () => state.count++,
    decremented: () => state.count--,
    changed: (payload: { newCount: number }) =>
      (state.count = payload.newCount),
  }));

  const a = reducer({ count: 0 }, { type: "incremented" });
  expect(a.count).toBe(1);

  const b = reducer({ count: 1 }, { type: "decremented" });
  expect(b.count).toBe(0);

  const c = reducer({ count: 10 }, { type: "changed", newCount: 11111 });
  expect(c.count).toBe(11111);
});

test("event creators", () => {
  const reducer = createReducer((state: State<{ count: number }>) => ({
    incremented: () => state.count++,
    decremented: () => state.count--,
    changed: (payload: { newCount: number }) =>
      (state.count = payload.newCount),
  }));

  const a = reducer({ count: 0 }, reducer.createIncremented());
  expect(a.count).toBe(1);

  const b = reducer({ count: 1 }, reducer.createDecremented());
  expect(b.count).toBe(0);

  const c = reducer({ count: 10 }, reducer.createChanged({ newCount: 11111 }));
  expect(c.count).toBe(11111);
});

test("connect", () => {
  const reducer = createReducer((state: State<{ count: number }>) => ({
    incremented: () => state.count++,
    decremented: () => state.count--,
    changed: (payload: { newCount: number }) =>
      (state.count = payload.newCount),
  }));

  let state = { count: 0 };
  const send = (event: any) => (state = reducer(state, event));

  const { sendIncremented, sendChanged } = reducer.connect(send);

  sendIncremented();
  expect(state.count).toBe(1);

  sendChanged({ newCount: 1000 });
  expect(state.count).toBe(1000);
});
