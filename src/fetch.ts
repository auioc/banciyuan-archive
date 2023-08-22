import { INDEX_HANDLERS } from './handlers';
import { DetailData, IndexData, TYPE } from './types';
import { formatSize, hashpath, loadPage, parseTsv, percentage } from './utils';

export class NotOkResponseError extends Error {
    status;
    statusText;
    constructor(status: number, statusText: string) {
        super('Not 2xx Response');
        this.status = status;
        this.statusText = statusText;
    }
}

export let ABORT_CONTROLLER = new AbortController();

let _acceptCompressed = true;

export function acceptCompressed(accept: boolean) {
    _acceptCompressed = accept;
}

export function onFetchError(error: Error) {
    console.error(error, { error });
    if (error instanceof NotOkResponseError) {
        const m = error.status + ' ' + error.statusText + ' ' + hashpath();
        loadPage(m, m);
    } else if (error.name === 'AbortError') {
    } else {
        loadPage(error.message, 'ERROR');
    }
}

export function onFetchProgress(received: number, length: number) {
    const s = formatSize(received) + (length ? ' / ' + formatSize(length) : '');
    const p = length ? '@ ' + percentage(received, length) + '%' : '';
    loadPage(`Fetching... ${s} ${p}`);
}

export async function httpget(
    url: string,
    options: RequestInit,
    callback: (text: string) => void,
    onerror = onFetchError,
    onprogress = onFetchProgress
) {
    ABORT_CONTROLLER = new AbortController();
    try {
        const inti = {
            ...{ signal: ABORT_CONTROLLER.signal },
            ...options,
        };
        if (!_acceptCompressed) {
            inti['headers'] = { ...inti['headers'], ...{ Range: 'bytes=0-' } };
        }
        const response = await fetch(url, inti);
        if (!response.ok) {
            throw new NotOkResponseError(response.status, response.statusText);
        }

        const reader = response.body.getReader();
        const length = response.headers.get('Content-Encoding')
            ? 0
            : +response.headers.get('Content-Length');

        let received = 0;
        let chunks = [];
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            received += value.length;
            onprogress(received, length);
        }

        let chunksAll = new Uint8Array(received);
        let position = 0;
        for (let chunk of chunks) {
            chunksAll.set(chunk, position);
            position += chunk.length;
        }

        const text = new TextDecoder('utf-8').decode(chunksAll);
        callback(text);
    } catch (error) {
        onerror(error);
    }
}

export async function loadReadme(
    repo: string,
    callback: (html: string) => void
) {
    await httpget(
        `https://api.github.com/repos/${repo}/readme`,
        { headers: { Accept: 'application/vnd.github.html' } },
        callback
    );
}

export async function loadIndex<T extends TYPE>(
    type: T,
    callback: (data: IndexData[T][]) => void
) {
    await httpget(`${window.DATA_URL}/${type}s/index.tsv`, {}, (text) => {
        callback(parseTsv(text, INDEX_HANDLERS[type]));
    });
}

export async function loadDetail<T extends TYPE>(
    type: T,
    id: string,
    callback: (data: DetailData[T]) => void
) {
    await httpget(`${window.DATA_URL}/${type}s/${id}.json`, {}, (text) => {
        callback(JSON.parse(text));
    });
}
