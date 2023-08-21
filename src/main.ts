import {
    getDetailCache,
    getIndexCache,
    loadIndexCache,
    setDetailCache,
} from './cache';
import { EVENT_TARGET, LoadDetailEvent, LoadIndexEvent } from './events';
import { ABORT_CONTROLLER, httpget, loadGitHubReadme } from './fetch';
import { initHandlers } from './handlers';
import { TYPE } from './types';
import { hashpath, loadPage } from './utils';

declare global {
    interface Window {
        REPO: string;
        DATA_BASE_URL: string;
    }
}

initHandlers();

const REGEX_PATH = /^\/(item|user|itemtag|usertag)\/(\?page=)?(\d*)$/;
const REGEX_PAGE = /^\?page=(\d*)$/;

function loadIndex<T extends TYPE>(type: T, page = 1) {
    const cache = getIndexCache(type);
    if (cache) {
        const _page = page - 1;
        const chunked = cache.chunked;
        if (_page >= 0 && _page < chunked.length) {
            EVENT_TARGET.dispatchEvent(
                new LoadIndexEvent(type, chunked[_page], page, chunked.length)
            );
        } else {
            alert('Invalid page: ' + page);
            hashpath('/' + type + '/?page=1');
        }
    } else {
        alert('ERROR');
    }
}

function loadDetail(type: TYPE, id: string) {
    const cache = getDetailCache(type, id);
    if (cache) {
        EVENT_TARGET.dispatchEvent(new LoadDetailEvent(type, id, cache));
    } else {
        httpget(`${window.DATA_BASE_URL}/${type}s/${id}.json`, {}, (text) => {
            setDetailCache(type, id, JSON.parse(text));
            loadDetail(type, id);
        });
    }
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

(async () => {
    if (!hashpath()) hashpath('/');
    loadPage('Initializing...');
    await loadIndexCache();
    hashChange();
    window.addEventListener('hashchange', hashChange);
})();
