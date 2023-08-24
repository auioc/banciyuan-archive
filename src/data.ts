import { httpget, loadReadme } from './fetch';
import { parseId, parseIndex } from './handlers';
import { DATA_VERSION, TYPES } from './main';
import { DetailData, ID, IndexData, TYPE } from './types';
import { chunkArray, div, loadPage, progress, sleep } from './utils';

// ========================================================================== //

const DB_NAME = 'banciyuan-archive';
const DB_INDEX_CACHE = 'index';

async function database() {
    return new Promise((reslove: (db: IDBDatabase) => void, reject) => {
        const req = window.indexedDB.open(DB_NAME, DATA_VERSION);
        req.onerror = reject;
        req.onupgradeneeded = (ev) => {
            console.debug('db upgrade', ev);
            const db = req.result;
            for (const name of db.objectStoreNames) {
                db.deleteObjectStore(name);
            }
            db.createObjectStore(DB_INDEX_CACHE);
            for (const type of TYPES) {
                db.createObjectStore(type, { keyPath: 'id' });
            }
        };
        req.onsuccess = (_) => reslove(req.result);
    });
}

async function objectStore(name: string, mode?: IDBTransactionMode) {
    return database() //
        .then(
            (db) =>
                new Promise(
                    (
                        reslove: (db: IDBObjectStore) => void,
                        reject //
                    ) => {
                        const tr = db.transaction(name, mode);
                        reslove(tr.objectStore(name));
                        tr.onerror = reject;
                    }
                )
        );
}

async function dbGet(store: IDBObjectStore, key: IDBValidKey | IDBKeyRange) {
    return new Promise((reslove: (db: any) => void, reject) => {
        const res = store.get(key);
        res.onerror = reject;
        res.onsuccess = (_) => reslove(res.result);
    });
}

async function dbPut(store: IDBObjectStore, value: any, key?: IDBValidKey) {
    return new Promise((reslove: (db: IDBValidKey) => void, reject) => {
        const res = store.put(value, key);
        res.onerror = reject;
        res.onsuccess = (_) => reslove(res.result);
    });
}

async function dbCacheOrFetch<T>(
    storeName: string,
    key: IDBValidKey,
    inline: boolean,
    getter: (key: IDBValidKey) => T,
    oncached = () => {},
    onupdate = () => {}
) {
    const cached: T = await objectStore(storeName).then((store) =>
        dbGet(store, key)
    );
    if (cached) {
        oncached();
        return cached;
    }
    const data = await getter(key);
    await objectStore(storeName, 'readwrite').then((store) =>
        dbPut(store, data, inline ? undefined : key)
    );
    onupdate();
    return data;
}

// ========================================================================== //

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

export function getIndex<T extends TYPE>(type: T) {
    if (type in INDEX_CACHE) {
        return INDEX_CACHE[type];
    }
    throw new Error('Index cache not initialized');
}

// ========================================================================== //

export async function getDetail<T extends TYPE>(type: T, id: string) {
    const s: DetailData[T] = await dbCacheOrFetch(
        type,
        parseId(type, id),
        true,
        async (_) => {
            console.debug('miss db cache: detail', type, id);
            const d: DetailData[T] = JSON.parse(
                await httpget(`${window.DATA_URL}/${type}s/${id}.json`)
            );
            return d;
        },
        () => {
            console.debug('hit db cache: detail', type, id);
        },
        () => {
            console.debug('update db cache: detail', type, id);
        }
    );
    return s;
}

// ========================================================================== //

let README_CACHE = '';

export async function getReadme(repo: string) {
    if (README_CACHE) {
        return README_CACHE;
    }
    README_CACHE = await loadReadme(repo);
    return README_CACHE;
}
