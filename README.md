# reduceur 🥖

> _Sophisticated reducers_

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
const nextState = counterReducer(initialState, { type: "changed", count: 999 });
```

## Event Creators

The reducer returned from `createReducer` comes with built-in event creators:

```ts
const counterReducer = createReducer<{ count: number }>()(() => ({
  /* ... */
  changed: (payload: { newCount: number }) => (draft.count = payload.newCount),
}));

const initialState = { count: 0 };

const nextState = counterReducer(
  initialState,
  // event names are prefixed with `create`
  reducer.createChanged({ newCount: 1000 })
);
```

Note that these are event _creators_, which means that invoking them only _returns_ a compatible event object; it does not send any events to the reducer.

## `connect`

A `connect` method is available on the returned reducer, which, by providing a function with which events can be sent to your store, allows you to create an object with event _senders_.

A contrived example with React's `useReducer`:

```tsx
type State = {
  count: number;
};

const counterReducer = createReducer<State>()((draft) => ({
  incremented: () => draft.count++,
  changed: (payload: { newCount: number }) => (draft.count = payload.newCount),
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
