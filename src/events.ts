import { TYPE } from './main';
import { createIndexTable, loadPage, pagedTitle } from './utils';

type LoadIndexEventType = `loadindex${TYPE}`;
type LoadDetailEventType = `loaddetail${TYPE}`;

type EventMap = {
    [k in LoadIndexEventType]: LoadIndexEvent;
} & { [k in LoadDetailEventType]: LoadDetailEvent };

export class LoadIndexEvent extends Event {
    data;
    page;
    pages;
    constructor(
        type: LoadIndexEventType,
        data: any[],
        page: number,
        pages: number
    ) {
        super(type);
        this.data = data;
        this.page = page;
        this.pages = pages;
    }
}

export class LoadDetailEvent extends Event {
    id;
    data;
    constructor(type: LoadDetailEventType, id: string, data: any) {
        super(type);
        this.id = id;
        this.data = data;
    }
}

export class EventTargetElement extends HTMLElement {
    public addEventListener<T extends keyof EventMap>(
        type: T,
        listener: (this: EventTargetElement, event: EventMap[T]) => any,
        options?: boolean | AddEventListenerOptions
    ): void;
    public addEventListener(
        type: string,
        listener: (this: EventTargetElement, event: Event) => any,
        options?: boolean | AddEventListenerOptions
    ): void {
        super.addEventListener(type, listener, options);
    }
}
window.customElements.define('event-target', EventTargetElement);

export const EVENT_TARGET: EventTargetElement =
    document.createElement('event-target');

export function onLoadIndexPage(
    type: TYPE,
    name: string,
    headers: string[],
    handler: (item: any) => HTMLTableCellElement[]
) {
    EVENT_TARGET.addEventListener(`loadindex${type}`, (event) => {
        loadPage(
            createIndexTable(type, headers, event, handler),
            pagedTitle(name, event)
        );
    });
}

export function onLoadDetailPage(
    type: TYPE,
    name: string,
    handler: (data: any) => string
) {
    EVENT_TARGET.addEventListener(`loaddetail${type}`, (event) => {
        loadPage(handler(event.data), name + ' ' + event.id);
    });
}
