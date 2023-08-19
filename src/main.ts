import { EVENT_TARGET, LoadDetailEvent, LoadIndexEvent } from './events';
import { ABORT_CONTROLLER, httpget, loadGitHubReadme } from './fetch';
import { INDEX_HANDLERS, initHandlers } from './handlers';
import { DetailData, IndexData, TYPE } from './types';
import { chunkArray, hashpath, loadPage, parseTsv } from './utils';

declare global {
    interface Window {
        REPO: string;
        DATA_BASE_URL: string;
    }
}

initHandlers();

const REGEX_PATH = /^\/(item|user|itemtag|usertag)\/(\?page=)?(\d*)$/;
const REGEX_PAGE = /^\?page=(\d*)$/;

const INDEX_CACHE: { [t in TYPE]?: IndexData[t][][] } = {};
const DETAIL_CACHE: { [t in TYPE]?: { [i in string]?: DetailData[t] } } = {};

function loadIndex<T extends TYPE>(type: T, page = 1) {
    if (type in INDEX_CACHE) {
        const _page = page - 1;
        const data = INDEX_CACHE[type];
        if (_page >= 0 && _page < data.length) {
            EVENT_TARGET.dispatchEvent(
                new LoadIndexEvent(type, data[_page], page, data.length)
            );
        } else {
            alert('Invalid page: ' + page);
            hashpath('/' + type + '/?page=1');
        }
    } else {
        httpget(`${window.DATA_BASE_URL}/${type}s/index.tsv`, {}, (text) => {
            const data = chunkArray(parseTsv(text, INDEX_HANDLERS[type]), 100);
            (INDEX_CACHE[type] as IndexData[T][][]) = data;
            loadIndex(type, page);
        });
    }
}

function loadDetail(type: TYPE, id: string) {
    if (type in DETAIL_CACHE) {
        const cache = DETAIL_CACHE[type];
        if (id in cache) {
            EVENT_TARGET.dispatchEvent(
                new LoadDetailEvent(type, id, cache[id])
            );
            return;
        }
    } else {
        DETAIL_CACHE[type] = {};
    }
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
