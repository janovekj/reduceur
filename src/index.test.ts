import { expect, test } from "vitest";
import { createReducer } from ".";

test("it works", () => {
  const reducer = createReducer<{ count: number }>()((draft) => ({
    incremented: () => draft.count++,
    decremented: () => draft.count--,
    changed: (payload: { newCount: number }) =>
      (draft.count = payload.newCount),
  }));

  const a = reducer({ count: 0 }, { type: "incremented" });
  expect(a.count).toBe(1);

  const b = reducer({ count: 1 }, { type: "decremented" });
  expect(b.count).toBe(0);

  const c = reducer({ count: 10 }, { type: "changed", newCount: 11111 });
  expect(c.count).toBe(11111);
});

// TODO type tests
