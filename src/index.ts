import produce, { Draft } from "immer";

type EventHandler = (payload?: any) => void;

type EventHandlerMapType = Record<string, EventHandler>;

type EventObject<T> = {
  type: T;
};

type GetEvent<EventHandlerMap extends EventHandlerMapType> = {
  [E in keyof EventHandlerMap]: Parameters<EventHandlerMap[E]>[0] extends {}
    ? EventObject<E> & Parameters<EventHandlerMap[E]>[0]
    : EventObject<E>;
}[keyof EventHandlerMap];

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
 * // Note the double function call. This is a workaround to allow for [partial inference](More details: https://github.com/microsoft/TypeScript/issues/26242) with TypeScript.
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
 * ```
 */
export const createReducer =
  <State>() =>
  <EventHandlerMap extends EventHandlerMapType>(
    createEventHandlerMap: (draft: Draft<State>) => EventHandlerMap
  ) =>
  (state: State, event: GetEvent<EventHandlerMap>) =>
    produce(state, (draft) => {
      const handlerMap = createEventHandlerMap(draft);
      const { type, ...payload } = event;
      const handler = handlerMap[event.type];
      handler(payload);
    });
