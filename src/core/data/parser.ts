import { ID, IndexData, TYPE } from '../types';
import { parseTsv } from '../utils/utils';

const INDEX_HANDLERS: {
    [t in TYPE]: (h: string[], c: string[]) => IndexData[t];
} = {
    item: (_, c) => ({
        id: c[0],
        type: parseInt(c[1]),
        user: parseInt(c[2]),
        time: parseInt(c[3]),
    }),
    itemtag: (_, c) => ({
        id: parseInt(c[0]),
        name: c[1],
        type: parseInt(c[2]),
        count: parseInt(c[3]),
    }),
    user: (_, c) => ({
        id: parseInt(c[0]),
        name: c[1],
        sex: parseInt(c[2]),
        count: parseInt(c[3]),
    }),
    usertag: (_, c) => ({
        id: parseInt(c[0]),
        name: c[1],
        count: parseInt(c[2]),
    }),
};

export function parseIndex<T extends TYPE>(type: T, tsv: string) {
    return parseTsv(tsv, INDEX_HANDLERS[type]);
}

export function parseId<T extends TYPE>(type: T, id: string): ID<T> {
    if (type === 'item') {
        return id;
    }
    return parseInt(id);
}
