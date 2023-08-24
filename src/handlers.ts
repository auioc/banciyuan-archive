import { getIndex } from './data';
import { onLoadDetailPage, onLoadIndexPage } from './events';
import { ID, IndexData, TYPE } from './types';
import {
    formatSize,
    formatTime,
    parseTsv,
    tableS,
    tcRS,
    tdS,
    thS,
} from './utils';

export function initHandlers() {}

const ITEM_TYPES = ['', 'note', 'article', 'video', 'ganswer'];
const USER_SEX = ['', 'male', 'female'];
const ITEM_TAG_TYPES = ['', 'tag', 'work', 'event'];
const IMAGE_FORMATS = ['', 'jpeg', 'png', 'gif', 'bmp', 'heic', 'tiff', 'webp'];

const _kv = (a: string[], i: number) => a[i > 0 && i < a.length ? i : 0];
const itemType = (i: number) => _kv(ITEM_TYPES, i);
const sex = (i: number) => _kv(USER_SEX, i);
const tagType = (i: number) => _kv(ITEM_TAG_TYPES, i);
const imageFormat = (i: number) => _kv(IMAGE_FORMATS, i);

export function parseId<T extends TYPE>(type: T, id: string): ID<T> {
    if (type === 'item') {
        return id;
    }
    return parseInt(id);
}

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

onLoadIndexPage(
    'item',
    'Item Index',
    ['ID', 'TYPE', 'USER', 'TIME'],
    (item) => [
        linkItem(item.id),
        itemType(item.type),
        linkUser(item.user),
        formatTime(item.time),
    ]
);
onLoadDetailPage('item', 'Item Detail', (data) => {
    const table1 = tableS(
        [thS('ID'), tdS(data.id), thS('TYPE'), tdS(itemType(data.type))],
        [
            thS('TIME'),
            tdS(formatTime(data.time)),
            thS('USER'),
            tdS(linkUser(data.user)),
        ],
        [
            thS('TAGS'),
            tdS(
                [...data.tags]
                    .map((id) =>
                        hashlink(
                            'itemtag',
                            id,
                            getIndex('itemtag').dict[id].name
                        )
                    )
                    .join(',&nbsp;'),
                3
            ),
        ],
        [thS('CONTENT'), tdS(data.content, 3)]
    );
    const table2 = tableS(
        [thS(`IMAGES (${data.images.length})`, 6)],
        tcRS(true, 'ID', 'NAME', 'FORMAT', 'WIDTH', 'HEIGHT', 'SIZE'),
        ...(() =>
            [...data.images].map((image) =>
                tcRS(
                    false,
                    image.id < 0 ? '' : image.id,
                    image.name,
                    imageFormat(image.format),
                    image.w > 0 ? image.w : '',
                    image.h > 0 ? image.h : '',
                    image.size > 0 ? formatSize(image.size) : ''
                )
            ))()
    );
    return table1 + table2;
});

onLoadIndexPage(
    'user',
    'User Index',
    ['ID', 'NAME', 'SEX', 'COUNT'],
    (user) => [hashlink('user', user.id), user.name, sex(user.sex), user.count]
);
onLoadDetailPage('user', 'User Detail', (data) => {
    const table1 = tableS(
        [thS('ID'), tdS(data.id)],
        [thS('NAMES'), tdS(data.names.join(',&nbsp;'))],
        [thS('SEX'), tdS(sex(data.sex))],
        [
            thS('TAGS'),
            tdS(
                [...data.tags]
                    .map((id) =>
                        hashlink(
                            'usertag',
                            id,
                            getIndex('usertag').dict[id].name
                        )
                    )
                    .join(',&nbsp;')
            ),
        ]
    );
    const table2 = tableS(
        [thS(`ITEMS (${data.items.length})`)],
        [tdS([...data.items].map(linkItem).join(', '))]
    );
    return table1 + table2;
});

onLoadIndexPage(
    'itemtag',
    'Item Tag Index',
    ['ID', 'NAME', 'TYPE', 'COUNT'],
    (tag) => [
        hashlink('itemtag', tag.id),
        tag.name,
        tagType(tag.type),
        tag.count,
    ]
);
onLoadDetailPage('itemtag', 'Item Tag Detail', (data) => {
    const table1 = tableS(
        [thS('ID'), tdS(data.id)],
        [thS('TYPE'), tdS(tagType(data.type))],
        [thS('NAME'), tdS(data.name)]
    );
    const table2 = tableS(
        [thS(`ITEMS (${data.items.length})`)],
        [tdS([...data.items].map(linkItem).join(', '))]
    );
    return table1 + table2;
});

onLoadIndexPage('usertag', 'User Tag Index', ['ID', 'NAME', 'COUNT'], (tag) => [
    hashlink('usertag', tag.id),
    tag.name,
    tag.count,
]);
onLoadDetailPage('usertag', 'User Tag Detail', (data) => {
    const table1 = tableS(
        [thS('ID'), tdS(data.id)],
        [thS('NAME'), tdS(data.name)]
    );
    const table2 = tableS(
        [thS(`USERS (${data.users.length})`)],
        [tdS([...data.users].map(linkUser).join(', '))]
    );
    return table1 + table2;
});

function hashlink(type: TYPE, id: string): string;
function hashlink(type: TYPE, id: number, text?: string): string;
function hashlink(type: TYPE, id: any, text = id) {
    return `<a ${parseInt(id) < 0 ? '' : `href="#/${type}/${id}"`}>${text}</a>`;
}
function linkItem(id: string) {
    return hashlink('item', id);
}
function linkUser(id: number) {
    return hashlink('user', id, getIndex('user').dict[id].name);
}
