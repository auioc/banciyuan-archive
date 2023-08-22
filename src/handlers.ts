import { getIndex } from './data';
import { onLoadDetailPage, onLoadIndexPage } from './events';
import { IndexData, TYPE } from './types';
import { formatSize, formatTime, tableS, tdH, tdS, thS, trS } from './utils';

export function initHandlers() {}

const ITEM_TYPES = ['', 'note', 'article', 'video', 'ganswer'];
const USER_SEX = ['', 'male', 'female'];
const ITEM_TAG_TYPES = ['', 'tag', 'work', 'event'];
const IMAGE_FORMATS = ['', 'jpeg', 'png', 'gif', 'bmp', 'heic', 'tiff', 'webp'];

const _pKv = (array: string[], i: number) =>
    array[i > 0 && i < array.length ? i : 0];
const getItemType = (i: number) => _pKv(ITEM_TYPES, i);
const getSex = (i: number) => _pKv(USER_SEX, i);
const getTagType = (i: number) => _pKv(ITEM_TAG_TYPES, i);
const getImageFormat = (i: number) => _pKv(IMAGE_FORMATS, i);

export const INDEX_HANDLERS: {
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

onLoadIndexPage(
    'item',
    'Item Index',
    ['ID', 'TYPE', 'USER', 'TIME'],
    (item) => [
        tdH(linkItem(item.id)),
        tdH(getItemType(item.type)),
        tdH(linkUser(item.user)),
        tdH(formatTime(item.time)),
    ]
);
onLoadDetailPage('item', 'Item Detail', (data) => {
    const table1 = tableS(
        trS(thS('ID'), tdS(data.id), thS('TYPE'), tdS(getItemType(data.type))),
        trS(
            thS('TIME'),
            tdS(formatTime(data.time)),
            thS('USER'),
            tdS(linkUser(data.user))
        ),
        trS(
            thS('TAGS'),
            `<td colspan="3">${[...data.tags]
                .map((id) =>
                    hashlink('itemtag', id, getIndex('itemtag').dict[id].name)
                )
                .join(',&nbsp;')}</td>`
        ),
        trS(thS('CONTENT'), `<td colspan="3">${data.content}</td>`)
    );
    const table2 = tableS(
        trS(`<th colspan="6">IMAGES (${data.images.length})</th>`),
        trS(
            thS('ID'),
            thS('NAME'),
            thS('FORMAT'),
            thS('WIDTH'),
            thS('HEIGHT'),
            thS('SIZE')
        ),
        (() =>
            [...data.images]
                .map((image) =>
                    trS(
                        tdS(image.id < 0 ? '' : image.id),
                        tdS(image.name),
                        tdS(getImageFormat(image.format)),
                        tdS(image.w > 0 ? image.w : ''),
                        tdS(image.h > 0 ? image.h : ''),
                        tdS(image.size > 0 ? formatSize(image.size) : '')
                    )
                )
                .join(''))()
    );
    return table1 + table2;
});

onLoadIndexPage(
    'user',
    'User Index',
    ['ID', 'NAME', 'SEX', 'COUNT'],
    (user) => [
        tdH(hashlink('user', user.id)),
        tdH(user.name),
        tdH(getSex(user.sex)),
        tdH(user.count),
    ]
);
onLoadDetailPage('user', 'User Detail', (data) => {
    const table1 = tableS(
        trS(thS('ID'), tdS(data.id)),
        trS(thS('NAMES'), tdS(data.names.join(',&nbsp;'))),
        trS(thS('SEX'), tdS(getSex(data.sex))),
        trS(
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
            )
        )
    );
    const table2 = tableS(
        trS(thS(`ITEMS (${data.items.length})`)),
        trS(tdS([...data.items].map(linkItem).join(', ')))
    );
    return table1 + table2;
});

onLoadIndexPage(
    'itemtag',
    'Item Tag Index',
    ['ID', 'NAME', 'TYPE', 'COUNT'],
    (tag) => [
        tdH(hashlink('itemtag', tag.id)),
        tdH(tag.name),
        tdH(getTagType(tag.type)),
        tdH(tag.count),
    ]
);
onLoadDetailPage('itemtag', 'Item Tag Detail', (data) => {
    const table1 = tableS(
        trS(thS('ID'), tdS(data.id)),
        trS(thS('TYPE'), tdS(getTagType(data.type))),
        trS(thS('NAME'), tdS(data.name))
    );
    const table2 = tableS(
        trS(thS(`ITEMS (${data.items.length})`)),
        trS(tdS([...data.items].map(linkItem).join(', ')))
    );
    return table1 + table2;
});

onLoadIndexPage('usertag', 'User Tag Index', ['ID', 'NAME', 'COUNT'], (tag) => [
    tdH(hashlink('usertag', tag.id)),
    tdH(tag.name),
    tdH(tag.count),
]);
onLoadDetailPage('usertag', 'User Tag Detail', (data) => {
    const table1 = tableS(
        trS(thS('ID'), tdS(data.id)),
        trS(thS('NAME'), tdS(data.name))
    );
    const table2 = tableS(
        trS(thS(`USERS (${data.users.length})`)),
        trS(tdS([...data.users].map(linkUser).join(', ')))
    );
    return table1 + table2;
});

function hashlink(type: TYPE, id: string): string;
function hashlink(type: TYPE, id: number, text?: string): string;
function hashlink(type: TYPE, id: any, text = id) {
    if (parseInt(id) < 0) {
        return `<a>${text}</a>`;
    }
    return `<a href="#/${type}/${id}">${text}</a>`;
}
function linkItem(id: string) {
    return hashlink('item', id);
}
function linkUser(id: number) {
    return hashlink('user', id, getIndex('user').dict[id].name);
}
