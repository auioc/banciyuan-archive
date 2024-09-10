import { ID, IndexData, TYPE } from '../types';
import { httpget } from '../utils/fetch';
import { chunkArray, div, loadPage, progress, sleep } from '../utils/utils';
import { DB_INDEX_CACHE, dbCacheOrFetch, TYPES } from './database';
import { parseIndex } from './parser';

type IndexCacheDict<T extends TYPE> = {
    [i in ID<T>]: IndexData[T];
};

type IndexCache<T extends TYPE> = {
    dict: IndexCacheDict<T>;
    chunked: IndexData[T][][];
};

export const INDEX_CACHE: { [t in TYPE]?: IndexCache<t> } = {};

function setIndexCache<T extends TYPE>(type: T, data: IndexData[T][]) {
    const chunked = chunkArray(data, 100);
    const dict = {} as IndexCacheDict<T>;
    data.forEach((v) => (dict[v.id as ID<T>] = v));
    (INDEX_CACHE[type] as IndexCache<T>) = { dict: dict, chunked: chunked };
}

async function loadIndex<T extends TYPE>(
    type: T,
    updateProgress: (progress: string) => void
) {
    const tsv = await dbCacheOrFetch(
        DB_INDEX_CACHE,
        type,
        false,
        async (_) => {
            console.debug('miss db cache: index', type);
            const tsv = await httpget(
                `${window.DATA_URL}/${type}s/index.tsv`,
                {},
                (r, l) => updateProgress(progress(r, l))
            );
            updateProgress('OK');
            return tsv;
        },
        () => {
            console.debug('hit db cache: index', type);
            updateProgress('Cached');
        },
        () => {
            console.debug('update db cache: index', type);
        }
    );
    const data = parseIndex(type, tsv);
    setIndexCache(type, data);
}

export async function createIndexCache() {
    const elements = [];
    const funcs = [];
    for (const type of TYPES) {
        const progressEl = document.createElement('span');
        elements.push(div([`Loading ${type} index... `, progressEl]));
        funcs.push(
            loadIndex(type, (progress) => (progressEl.innerText = progress))
        );
    }
    loadPage(div(elements));
    await Promise.all(funcs);
    await sleep(50);
}

// ========================================================================== //

let README_CACHE = '';

export function setReadmeCache(text: string) {
    README_CACHE = text;
}

export function getCachedReadme() {
    return README_CACHE;
}
