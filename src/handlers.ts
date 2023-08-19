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

const ITEM_TYPES = ['unknown', 'note', 'article', 'video', 'ganswer'];
const USER_SEX = ['unknown', 'male', 'female'];
const ITEM_TAG_TYPES = ['unknown', 'tag', 'work', 'event'];

const _pKv = (array: string[], i: number) =>
    array[i > 0 && i < array.length ? i : 0];
const getItemType = (i: number) => _pKv(ITEM_TYPES, i);
const getSex = (i: number) => _pKv(USER_SEX, i);
const getTagType = (i: number) => _pKv(ITEM_TAG_TYPES, i);

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
        trS(`<th colspan="4">IMAGES (${data.images.length})</th>`),
        trS(thS('ID'), thS('NAME'), thS('WIDTH'), thS('HEIGHT')),
        (() =>
            [...data.images]
                .map((image) =>
                    trS(
                        tdS(image.id),
                        tdS(image.name),
                        tdS(image.w),
                        tdS(image.h)
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
        trS(thS(`ITEMS (${data.items.length})`)),
        trS(tdS([...data.items].map(linkItem).join(', ')))
    );
    return table1 + table2;
});
