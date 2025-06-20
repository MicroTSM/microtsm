import { LoaderLog } from '../module-loader';

export type EventType = string | symbol;
export type Handler<T = unknown> = (event: T) => void;
export type WildcardHandler<T = Record<string, unknown>> = (type: keyof T, event: T[keyof T]) => void;

export type EventHandlerList<T = unknown> = Array<Handler<T>>;
export type WildCardEventHandlerList<T = Record<string, unknown>> = Array<WildcardHandler<T>>;

export type EventHandlerMap<Events extends Record<EventType, unknown>> = Map<
    keyof Events | '*',
    EventHandlerList<Events[keyof Events]> | WildCardEventHandlerList<Events>
>;

export interface Emitter<Events extends Record<EventType, unknown>> {
    all: EventHandlerMap<Events>;

    on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void;

    on(type: '*', handler: WildcardHandler<Events>): void;

    off<Key extends keyof Events>(type: Key, handler?: Handler<Events[Key]>): void;

    off(type: '*', handler: WildcardHandler<Events>): void;

    emit<Key extends keyof Events>(type: Key, event: Events[Key]): void;

    emit<Key extends keyof Events>(type: undefined extends Events[Key] ? Key : never): void;
}

function createEventBus<Events extends Record<EventType, unknown>>(): Emitter<Events> {
    type GenericEventHandler = Handler<Events[keyof Events]> | WildcardHandler<Events>;
    const all: EventHandlerMap<Events> = new Map();

    return {
        all,

        on<Key extends keyof Events>(type: Key, handler: GenericEventHandler) {
            const handlers = all.get(type) as Array<GenericEventHandler> | undefined;
            if (handlers) {
                handlers.push(handler);
            } else {
                all.set(type, [handler] as EventHandlerList<Events[keyof Events]>);
            }
        },

        off<Key extends keyof Events>(type: Key, handler?: GenericEventHandler) {
            const handlers = all.get(type) as Array<GenericEventHandler> | undefined;
            if (handlers) {
                if (handler) {
                    handlers.splice(handlers.indexOf(handler) >>> 0, 1);
                } else {
                    all.set(type, []);
                }
            }
        },

        emit<Key extends keyof Events>(type: Key, evt?: Events[Key]) {
            let handlers = all.get(type);
            if (handlers) {
                (handlers as EventHandlerList<Events[keyof Events]>).slice().map((handler) => {
                    handler(evt!);
                });
            }

            handlers = all.get('*');
            if (handlers) {
                (handlers as WildCardEventHandlerList<Events>).slice().map((handler) => {
                    handler(type, evt!);
                });
            }
        },
    };
}

export type MicroTSMEventMap = {
    'devtools:confirm-action': {
        id: string;
        title: string;
        message: string;
        onConfirm: () => void;
        icon?: string;
        showCheckbox?: boolean;
    };
    'module-loader:load-requested': {
        module: string;
        url: string;
    };
    'module-loader:module-loaded': { module: string; loadTime: number };
    'module-loader:load-error': { module: string; error: unknown };
    'module-loader:new-log': LoaderLog;
    'devtools:activated': void;
    'devtools:deactivated': void;
};

/** Ensure global availability */
const globalKey = '__GLOBAL_EVENT_BUS__';

if (!(globalThis as any)[globalKey]) {
    (globalThis as any)[globalKey] = createEventBus<MicroTSMEventMap>();
}

const eventBus = (globalThis as any)[globalKey] as Emitter<MicroTSMEventMap>;
export default eventBus;
