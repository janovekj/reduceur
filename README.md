# reduceur 🥖

> _Sophisticated reducers_

- 🥖 Simple
- 🥖 Great TS support
- 🥖 Uses [Immer](https://immerjs.github.io/immer/)
- 🥖 Framework agnostic

## Installing

```shell
npm i reduceur immer
```

## Quick Start

```ts
import { createReducer } from "reduceur";

type State = {
  count: number;
};

// Note the double function call. This is a workaround to allow for ["partial inference"](https://github.com/microsoft/TypeScript/issues/26242) with TypeScript.
const counterReducer = createReducer<State>()((draft) => ({
  incremented: () => {
    draft.count++;
  },
  decremented: () => {
    draft.count--;
  },
  changed: (payload: { count: number }) => {
    draft.count = payload.count;
  },
}));

const initialState = { count: 0 };
const nextState = counterReducer(
  initialState,
  // the event object is fully type-safe
  { type: "changed", count: 999 }
);

// With React
const [state, send] = useReducer(counterReducer, { count: 0 });

// also fully type-safe!
send({ type: "changed", count: 22 });
```

The returned reducer also comes with built-in event creators:

```ts
const reducer = createReducer()(() => ({
  someEvent: (payload: { foo: string }) => {
    // ...
  },
}));

send(reducer.events.someEvent({ foo: "hello" }));
```

Note that these are event _creators_, which means that invoking them only _returns_ a compatible event object; it does not send any events to the reducer.
