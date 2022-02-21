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

The reducer returned from `createReducer` also comes with built-in event creators:

```ts
const reducer = createReducer()(() => ({
  someEvent: (payload: { foo: string }) => {
    // ...
  },
}));

send(reducer.events.someEvent({ foo: "hello" }));
```

Note that these are event _creators_, which means that invoking them only _returns_ a compatible event object; it does not send any events to the reducer.

## Wildcard event handlers

To match the functionality of `switch` statements' `default`-block, `reduceur` supports adding a wildcard event handler, which will be used if no other event handlers are found for the event type.

```ts
const counterReducer = createReducer<{ count: number }>()((draft) => ({
  increment: () => draft.count++,
  "*": () => {
    // unhandled event — reset the count
    draft.count = 0;
  },
}));
```

## With React

`reduceur` is also trivial to use with React's `useReducer`:

```tsx
type State = {
  count: number;
};

const counterReducer = createReducer<State>()((draft) => ({
  incremented: () => draft.count++,
}));

const Counter = () => {
  const [state, send] = useReducer(counterReducer, { count: 0 });

  return (
    <button onClick={() => send({ type: "incremented" })}>Increment</button>
  );
};
```
