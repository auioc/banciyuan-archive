import { TYPE } from 'types';
import { getDataVersion } from './version';

const DB_NAME = 'banciyuan-archive';
export const DB_INDEX_CACHE = 'index';

export const TYPES: TYPE[] = ['item', 'itemtag', 'user', 'usertag'];

async function database() {
    return new Promise((resolve: (db: IDBDatabase) => void, reject) => {
        const req = window.indexedDB.open(DB_NAME, getDataVersion());
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
        req.onsuccess = (_) => resolve(req.result);
    });
}

async function objectStore(name: string, mode?: IDBTransactionMode) {
    return database() //
        .then(
            (db) =>
                new Promise(
                    (
                        resolve: (db: IDBObjectStore) => void,
                        reject //
                    ) => {
                        const tr = db.transaction(name, mode);
                        resolve(tr.objectStore(name));
                        tr.onerror = reject;
                    }
                )
        );
}

async function dbGet(store: IDBObjectStore, key: IDBValidKey | IDBKeyRange) {
    return new Promise((resolve: (db: any) => void, reject) => {
        const res = store.get(key);
        res.onerror = reject;
        res.onsuccess = (_) => resolve(res.result);
    });
}

async function dbPut(store: IDBObjectStore, value: any, key?: IDBValidKey) {
    return new Promise((resolve: (db: IDBValidKey) => void, reject) => {
        const res = store.put(value, key);
        res.onerror = reject;
        res.onsuccess = (_) => resolve(res.result);
    });
}

export async function dbCacheOrFetch<T>(
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
