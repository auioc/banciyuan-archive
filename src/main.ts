import { EVENT_TARGET, LoadDetailEvent, LoadIndexEvent } from './events';
import { ABORT_CONTROLLER, httpget, loadGitHubReadme } from './fetch';
import { initHandlers } from './handlers';
import { chunkArray, hashpath, loadPage, parseTsv } from './utils';

declare global {
    interface Window {
        REPO: string;
        DATA_BASE_URL: string;
    }
}

const DATA_TYPES = ['item', 'user', 'itemtag', 'usertag'] as const;
export type TYPE = (typeof DATA_TYPES)[number];

initHandlers();

const REGEX_PATH = /^\/(item|user|itemtag|usertag)\/(\?page=)?(\d*)$/;
const REGEX_PAGE = /^\?page=(\d*)$/;

const INDEX_CACHE: { [x in TYPE]?: any[] } = {};
const DETAIL_CACHE: { [x in TYPE]?: { [x in string]?: any } } = {};

function loadIndex(type: TYPE, page = 1) {
    if (type in INDEX_CACHE) {
        const _page = page - 1;
        const data = INDEX_CACHE[type];
        if (_page >= 0 && _page < data.length) {
            EVENT_TARGET.dispatchEvent(
                new LoadIndexEvent(
                    `loadindex${type}`,
                    data[_page],
                    page,
                    data.length
                )
            );
        } else {
            alert('Invalid page: ' + page);
            hashpath('/' + type + '/?page=1');
        }
    } else {
        httpget(`${window.DATA_BASE_URL}/${type}s/index.tsv`, {}, (text) => {
            const data = chunkArray(parseTsv(text), 100);
            INDEX_CACHE[type] = data;
            loadIndex(type, page);
        });
    }
}

function loadDetail(type: TYPE, id: string) {
    if (type in DETAIL_CACHE) {
        const cache = DETAIL_CACHE[type];
        if (id in cache) {
            console.debug('cached', type, id, cache[id]);
            EVENT_TARGET.dispatchEvent(
                new LoadDetailEvent(`loaddetail${type}`, id, cache[id])
            );
            return;
        }
    } else {
        DETAIL_CACHE[type] = {};
    }
    console.debug('nocache', type, id);
    httpget(`${window.DATA_BASE_URL}/${type}s/${id}.json`, {}, (text) => {
        DETAIL_CACHE[type][id] = JSON.parse(text);
        loadDetail(type, id);
    });
}

function hashChange() {
    ABORT_CONTROLLER.abort();
    loadPage('Loading...');
    const path = hashpath();
    if (path === '/') {
        loadPage('Loading Readme...');
        loadGitHubReadme(window.REPO, loadPage);
        return;
    }
    if (!REGEX_PATH.test(path)) {
        if (path) {
            alert('Invalid path: ' + path);
        }
        hashpath('/');
        return;
    }
    const _sp = path.split('/').splice(1);
    const type = _sp[0] as TYPE;
    const param = _sp[1];
    if (!param) {
        hashpath(path + '?page=1');
        return;
    }
    if (REGEX_PAGE.test(param)) {
        loadIndex(type, parseInt(param.slice(6)));
    } else {
        loadDetail(type, param);
    }
}

hashChange();
window.addEventListener('hashchange', hashChange);
