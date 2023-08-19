import { hashpath, loadPage } from './utils';

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
    loadPage(`Fetching... ${((received / length) * 100).toFixed(2)}%`);
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
        const response = await fetch(url, {
            ...options,
            ...{ signal: ABORT_CONTROLLER.signal },
        });
        if (!response.ok) {
            throw new NotOkResponseError(response.status, response.statusText);
        }

        const reader = response.body.getReader();
        const length = +response.headers.get('Content-Length');

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

export function loadGitHubReadme(
    repo: string,
    callback: (html: string) => void
) {
    httpget(
        `https://api.github.com/repos/${repo}/readme`,
        { headers: { Accept: 'application/vnd.github.html' } },
        callback
    );
}
