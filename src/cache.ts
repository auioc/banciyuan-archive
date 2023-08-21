import { httpget } from './fetch';
import { INDEX_HANDLERS } from './handlers';
import { DetailData, IndexData, TYPE } from './types';
import { chunkArray, parseTsv } from './utils';

type ID<T extends TYPE> = IndexData[T]['id'];

type IndexCacheDict<T extends TYPE> = {
    [i in ID<T>]: IndexData[T];
};

type IndexCache<T extends TYPE> = {
    dict: IndexCacheDict<T>;
    chunked: IndexData[T][][];
};

const INDEX_CACHE: { [t in TYPE]?: IndexCache<t> } = {};

const DETAIL_CACHE: { [t in TYPE]?: { [i in string]?: DetailData[t] } } = {};

export function getIndexCache<T extends TYPE>(type: T) {
    return type in INDEX_CACHE ? INDEX_CACHE[type] : null;
}

function setIndexCache<T extends TYPE>(type: T, data: IndexData[T][]) {
    const chunked = chunkArray(data, 100);
    const dict = {} as IndexCacheDict<T>;
    data.forEach((v) => (dict[v.id as ID<T>] = v));
    (INDEX_CACHE[type] as IndexCache<T>) = { dict: dict, chunked: chunked };
}

async function loadIndex<T extends TYPE>(type: T) {
    await httpget(`${window.DATA_BASE_URL}/${type}s/index.tsv`, {}, (text) => {
        setIndexCache(type, parseTsv(text, INDEX_HANDLERS[type]));
    });
}

export async function loadIndexCache() {
    for (const type of ['item', 'itemtag', 'user', 'usertag'] as TYPE[]) {
        await loadIndex(type);
    }
}

export function getDetailCache<T extends TYPE>(type: T, id: string) {
    if (type in DETAIL_CACHE) {
        const cache = DETAIL_CACHE[type];
        if (id in cache) {
            return cache[id];
        }
    }
    return null;
}

export function setDetailCache<T extends TYPE>(
    type: T,
    id: string,
    data: DetailData[T]
) {
    if (!(type in DETAIL_CACHE)) {
        DETAIL_CACHE[type] = {};
    }
    (DETAIL_CACHE[type][id] as DetailData[T]) = data;
}
