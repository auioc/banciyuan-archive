import { DetailData, IndexData, TYPE } from './types';
import { createIndexTable, loadPage } from './utils';

type EventType<T extends TYPE> = {
    loadindex: LoadIndexEvent<T>;
    loaddetail: LoadDetailEvent<T>;
};

export class LoadIndexEvent<T extends TYPE> extends Event {
    readonly data;
    readonly page;
    readonly pages;
    constructor(type: T, data: IndexData[T][], page: number, pages: number) {
        super(`loadindex${type}`);
        this.data = data;
        this.page = page;
        this.pages = pages;
    }
}

export class LoadDetailEvent<T extends TYPE> extends Event {
    readonly id;
    readonly data;
    constructor(type: T, id: string, data: DetailData[T]) {
        super(`loaddetail${type}`);
        this.id = id;
        this.data = data;
    }
}

export class EventTargetElement extends HTMLElement {
    public listen<T extends TYPE, E extends keyof EventType<T>>(
        eventType: E,
        dataType: T,
        listener: (this: EventTargetElement, event: EventType<T>[E]) => any,
        options?: boolean | AddEventListenerOptions
    ) {
        //@ts-expect-error
        super.addEventListener(eventType + dataType, listener, options);
    }
}
window.customElements.define('event-target', EventTargetElement);

export const EVENT_TARGET = document.createElement(
    'event-target'
) as EventTargetElement;

export function onLoadIndexPage<T extends TYPE>(
    type: T,
    name: string,
    headers: string[],
    handler: (data: IndexData[T]) => HTMLTableCellElement[]
) {
    EVENT_TARGET.listen('loadindex', type, (event) => {
        loadPage(
            createIndexTable(type, headers, event, handler),
            `${name} (Page ${event.page})`
        );
    });
}

export function onLoadDetailPage<T extends TYPE>(
    type: T,
    name: string,
    handler: (data: DetailData[T]) => string
) {
    EVENT_TARGET.listen('loaddetail', type, (event) => {
        loadPage(handler(event.data), name + ' ' + event.id);
    });
}
