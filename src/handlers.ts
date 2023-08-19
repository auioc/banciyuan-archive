import { onLoadDetailPage, onLoadIndexPage } from './events';
import {
    formatTime,
    linkItem,
    linkItemTag,
    linkUser,
    linkUserTag,
    tableS,
    tdH,
    tdS,
    thS,
    trS,
} from './utils';

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
                .map(linkItemTag)
                .join(',&nbsp;')}</td>`
        ),
        trS(thS('CONTENT'), `<td colspan="3">${data.content}</td>`)
    );
    const table2 = tableS(
        trS(`<th colspan="5">IMAGES (${data.images.length})</th>`),
        trS(thS('ID'), thS('NAME'), thS('FORMAT'), thS('WIDTH'), thS('HEIGHT')),
        (() =>
            [...data.images]
                .map((image) =>
                    trS(
                        tdS(image.id < 0 ? '' : image.id),
                        tdS(image.name),
                        tdS(getImageFormat(image.format)),
                        tdS(image.w > 0 ? image.w : ''),
                        tdS(image.h > 0 ? image.h : '')
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
        tdH(linkUser(user.id)),
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
        trS(thS('TAGS'), tdS([...data.tags].map(linkUserTag).join(',&nbsp;')))
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
        tdH(linkItemTag(tag.id)),
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
    tdH(linkUserTag(tag.id)),
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
