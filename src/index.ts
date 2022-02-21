import produce, { Draft } from "immer";

type EventHandler = (payload?: any) => void;

type EventHandlerMapType = Record<string, EventHandler>;

type EventObject<T> = {
  type: T;
};

type GetPayload<TEventHandler extends EventHandler> =
  Parameters<TEventHandler>[0];

type GetEvent<EventHandlerMap extends EventHandlerMapType> = {
  [E in keyof EventHandlerMap]: GetPayload<EventHandlerMap[E]> extends {}
    ? EventObject<E> & GetPayload<EventHandlerMap[E]>
    : EventObject<E>;
}[keyof EventHandlerMap];

type EventCreators<EventHandlerMap extends EventHandlerMapType> = {
  [E in keyof EventHandlerMap]: GetPayload<EventHandlerMap[E]> extends {}
    ? (
        payload: GetPayload<EventHandlerMap[E]>
      ) => EventObject<E> & GetPayload<EventHandlerMap[E]>
    : () => EventObject<E>;
};

interface Reduceur<State, EventHandlerMap extends EventHandlerMapType> {
  (state: State, event: GetEvent<EventHandlerMap>): State;
  events: EventCreators<EventHandlerMap>;
}

/**
 * Allows you to easily define fully typed reducers without resorting to large and unwieldy `switch` blocks.
 *
 * Each event handler function is provided with an [Immer](https://immerjs.github.io/immer/) Draft object which allows you to perform mutations in a safe manner
 *
 * **Usage:**
 * ```ts
 * type State = {
 *  count: number
 * };
 *
 * // Note the double function call. This is a workaround to allow for "partial inference" with TypeScript.
 * createReducer<State>()(
 *   (draft) => ({
 *     incremented: () => {
 *       draft.count++
 *     },
 *     decremented: () => {
 *       draft.count--;
 *     },
 *     changed: (payload: { count: number }) => {
 *       draft.count = payload.count
 *     }
 *   })
 * )
 *
 * const initialState = { count: 0 };
 * const nextState = counterReducer(
 *   initialState,
 *   // the event object is fully type-safe
 *   { type: "changed", count: 999 }
 * );
 *
 * // With React
 * const [state, send] = useReducer(counterReducer, { count: 0 });
 *
 * // also fully type-safe!
 * send({ type: "changed", count: 22 });
 * ```
 *
 * The returned reducer also comes with built-in event creators:
 * ```ts
 * const reducer = createReducer()(
 *  () => ({
 *    someEvent: (payload: { foo: string }) => {
 *      // ...
 *    }
 *  })
 * );
 *
 * send(reducer.events.someEvent({ foo: "hello" }));
 * ```
 *
 * Note that these are event _creators_, which means that invoking them only _returns_ a compatible event object; it does not send any events to the reducer.
 */
export const createReducer =
  <State>() =>
  <EventHandlerMap extends EventHandlerMapType>(
    createEventHandlerMap: (draft: Draft<State>) => EventHandlerMap
  ): Reduceur<State, EventHandlerMap> => {
    const reducer = (state: State, event: GetEvent<EventHandlerMap>) =>
      produce(state, (draft) => {
        const handlerMap = createEventHandlerMap(draft);
        const { type, ...payload } = event;
        const handler = handlerMap[event.type];
        handler(payload);
      });

    reducer.events = new Proxy({} as EventCreators<EventHandlerMap>, {
      get: (_, prop) => {
        return (payload: any) => ({ type: prop, ...payload });
      },
    });

    return reducer as Reduceur<State, EventHandlerMap>;
  };
