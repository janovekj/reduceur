import produce, { Draft } from "immer";

const uncapitalizeFirstLetter = (str: string) =>
  str.charAt(0).toLowerCase() + str.slice(1);

export type EventHandler = (payload?: any) => void;

export type EventHandlerMapType = Record<string, EventHandler>;

export type EventObject<EventType> = {
  type: EventType;
};

export type GetPayload<TEventHandler extends EventHandler> =
  Parameters<TEventHandler>[0];

export type GetEvent<EventHandlerMap extends EventHandlerMapType> = {
  [EventType in keyof EventHandlerMap]: GetPayload<
    EventHandlerMap[EventType]
  > extends {}
    ? EventObject<EventType> & GetPayload<EventHandlerMap[EventType]>
    : EventObject<EventType>;
}[keyof EventHandlerMap];

export type EventCreators<EventHandlerMap extends EventHandlerMapType> = {
  [EventType in keyof EventHandlerMap as `create${Capitalize<
    string & EventType
  >}`]: GetPayload<EventHandlerMap[EventType]> extends {}
    ? (
        payload: GetPayload<EventHandlerMap[EventType]>
      ) => EventObject<EventType> & GetPayload<EventHandlerMap[EventType]>
    : () => EventObject<EventType>;
};

export type ConnectedEventCreators<
  EventHandlerMap extends EventHandlerMapType
> = {
  [EventType in keyof EventHandlerMap as `send${Capitalize<
    string & EventType
  >}`]: GetPayload<EventHandlerMap[EventType]> extends {}
    ? (payload: GetPayload<EventHandlerMap[EventType]>) => void
    : () => void;
};

type _Reduceur<State, EventHandlerMap extends EventHandlerMapType> = (
  state: State,
  event: GetEvent<EventHandlerMap>
) => State;

export type Sender = (event: EventObject<any>) => void;

type Connectable<EventHandlerMap extends EventHandlerMapType> = {
  connect: (send: Sender) => ConnectedEventCreators<EventHandlerMap>;
};

export type Reduceur<
  State,
  EventHandlerMap extends EventHandlerMapType
> = _Reduceur<State, EventHandlerMap> &
  Connectable<EventHandlerMap> &
  EventCreators<EventHandlerMap>;

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
 * const counterReducer = createReducer<State>()(
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
 * ```
 */
export const createReducer =
  <State>() =>
  <EventHandlerMap extends EventHandlerMapType>(
    createEventHandlerMap: (draft: Draft<State>) => EventHandlerMap
  ): Reduceur<State, EventHandlerMap> => {
    // @ts-ignore
    const reducer: Reduceur<State, EventHandlerMap> = (
      state: State,
      e: GetEvent<EventHandlerMap>
    ) =>
      produce(state, (draft) => {
        const handlerMap = createEventHandlerMap(draft);
        const { type, ...payload } = e;
        const handler = handlerMap[e.type];
        handler(payload);
      });

    reducer.connect = (send) =>
      new Proxy({} as ConnectedEventCreators<EventHandlerMap>, {
        get: (target, prop) => {
          if (typeof prop === "string" && prop.startsWith("send")) {
            return (payload: any) => {
              send({
                ...payload,
                type: uncapitalizeFirstLetter(prop.replace("send", "")),
              });
            };
          } else {
            // @ts-ignore
            return target[prop];
          }
        },
      });

    const proxied = new Proxy(reducer, {
      get: (target, prop) => {
        if (typeof prop === "string" && prop.startsWith("create")) {
          return (payload: any) => ({
            ...payload,
            type: uncapitalizeFirstLetter(prop.replace("create", "")),
          });
        } else {
          // @ts-ignore
          return target[prop];
        }
      },
    });

    return proxied;
  };
