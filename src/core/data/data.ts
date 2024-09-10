import { DetailData, TYPE } from '../types';
import { httpget, loadReadme } from '../utils/fetch';
import { getCachedReadme, INDEX_CACHE, setReadmeCache } from './cache';
import { dbCacheOrFetch } from './database';
import { parseId } from './parser';

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

export async function getReadme() {
    const cached = getCachedReadme();
    if (cached) {
        return cached;
    }
    const readme = await loadReadme(window.REPO);
    setReadmeCache(readme);
    return readme;
}
