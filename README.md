# reduceur 🥖

> _Sophisticated reducers_

---

[![npm version](http://img.shields.io/npm/v/reduceur.svg?style=flat)](https://npmjs.org/package/reduceur "View this project on npm") [![Size](https://badgen.net/bundlephobia/minzip/reduceur)](https://bundlephobia.com/package/reduceur "View this project on Bundlephobia") [![GitHub license](https://img.shields.io/github/license/janovekj/reduceur)](https://github.com/janovekj/reduceur/blob/master/LICENSE "MIT license")

`reduceur` makes it hassle-free to create type-safe state reducers. No unweildy `switch`-statements and TypeScript boilerplate. Just define your event handlers and you're ready!

Additionally, `reduceur` comes with [Immer's `produce` API](https://immerjs.github.io/immer/) baked in, allowing you to write even more compact event handlers.

- 🥖 Simple
- 🥖 Great TS support
- 🥖 Uses [Immer](https://immerjs.github.io/immer/)
- 🥖 Framework agnostic
- 🥖 Inspired by [XState](https://xstate.js.org)'s `createModel` and [Redux Toolkit](https://redux-toolkit.js.org)'s `createSlice` APIs

## Quick Start

```shell
npm i reduceur immer
```

```ts
import { createReducer, State } from "reduceur";

type CounterState = {
  count: number;
};

const counterReducer = createReducer((state: State<CounterState>) => ({
  incremented: () => {
    state.count++;
  },
  decremented: () => {
    state.count--;
  },
  changed: (payload: { count: number }) => {
    state.count = payload.count;
  },
}));

const initialState = { count: 0 };
const nextState = counterReducer(initialState, { type: "changed", count: 999 });
```

## Event Creators

The reducer returned from `createReducer` comes with built-in event creators:

```ts
import { createReducer, State } from "reduceur";

type CounterState = {
  count: number;
};

const counterReducer = createReducer((state: State<CounterState>) => ({
  changed: (payload: { newCount: number }) => (state.count = payload.newCount),
}));

const initialState = { count: 0 };

const nextState = counterReducer(
  initialState,
  // event names are prefixed with `create`
  counterReducer.createChanged({ newCount: 1000 })
);
```

Note that these are event _creators_, which means that invoking them only _returns_ a compatible event object; it does not send any events to the reducer.

## `connect`

A `connect` method is available on the returned reducer, which, by providing a function with which events can be sent to your store, allows you to create an object with event _senders_.

A contrived example with React's `useReducer`:

```tsx
import { createReducer, State } from "reduceur";

const counterReducer = createReducer((state: State<CounterState>) => ({
  incremented: () => state.count++,
  changed: (payload: { newCount: number }) => (state.count = payload.newCount),
}));

const Counter = () => {
  const [state, send] = useReducer(counterReducer, { count: 0 });

  // event names are prefixed with `send`
  const { sendIncremented, sendChanged } = counterReducer.connect(send);

  return (
    <>
      <button onClick={sendIncremented}>Increment</button>
      <button onClick={() => sendChanged({ newCount: 100 })}>Set to 100</button>
    </>
  );
};
```
