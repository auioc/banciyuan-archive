import { loadDetail, loadIndex, loadReadme } from './fetch';
import { TYPES } from './main';
import { DetailData, IndexData, TYPE } from './types';
import { chunkArray, div, loadPage, progress, sleep, span } from './utils';

// ========================================================================== //

type ID<T extends TYPE> = IndexData[T]['id'];

type IndexCacheDict<T extends TYPE> = {
    [i in ID<T>]: IndexData[T];
};

type IndexCache<T extends TYPE> = {
    dict: IndexCacheDict<T>;
    chunked: IndexData[T][][];
};

const INDEX_CACHE: { [t in TYPE]?: IndexCache<t> } = {};

function setIndexCache<T extends TYPE>(type: T, data: IndexData[T][]) {
    const chunked = chunkArray(data, 100);
    const dict = {} as IndexCacheDict<T>;
    data.forEach((v) => (dict[v.id as ID<T>] = v));
    (INDEX_CACHE[type] as IndexCache<T>) = { dict: dict, chunked: chunked };
}

export async function createIndexCache() {
    const elements = [];
    const funcs = [];
    for (const type of TYPES) {
        const progressEl = span('feteching-index-' + type);
        elements.push(div([`Fetching ${type} index... `, progressEl]));
        funcs.push(
            loadIndex(
                type,
                (data) => {
                    setIndexCache(type, data);
                    progressEl.innerText = 'OK';
                },
                (r, l) => (progressEl.innerText = progress(r, l))
            )
        );
    }
    loadPage(div(elements));
    await Promise.all(funcs);
    await sleep(50);
}

export function getIndex<T extends TYPE>(type: T) {
    if (type in INDEX_CACHE) {
        return INDEX_CACHE[type];
    }
    throw new Error('Index cache not initialized');
}

// ========================================================================== //

const DETAIL_CACHE: { [t in TYPE]?: { [i in string]?: DetailData[t] } } = {};

function getDetailCached<T extends TYPE>(type: T, id: string) {
    if (type in DETAIL_CACHE) {
        const cache = DETAIL_CACHE[type];
        if (id in cache) {
            return cache[id];
        }
    }
    return null;
}

function setDetailCache<T extends TYPE>(
    type: T,
    id: string,
    data: DetailData[T]
) {
    if (!(type in DETAIL_CACHE)) {
        DETAIL_CACHE[type] = {};
    }
    (DETAIL_CACHE[type][id] as DetailData[T]) = data;
}

export async function getDetail<T extends TYPE>(type: T, id: string) {
    const cache = getDetailCached(type, id);
    if (cache) {
        return cache;
    }
    await loadDetail(type, id, (data) => setDetailCache(type, id, data));
    return getDetail(type, id);
}

// ========================================================================== //

let README_CACHE = '';

export async function getReadme(repo: string) {
    if (README_CACHE) {
        return README_CACHE;
    }
    await loadReadme(repo, (html) => (README_CACHE = html));
    return getReadme(repo);
}
