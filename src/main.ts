import { createIndexCache, getDetail, getIndex, getReadme } from './data';
import { EVENT_TARGET, LoadDetailEvent, LoadIndexEvent } from './events';
import { ABORT_CONTROLLER } from './fetch';
import { initHandlers } from './handlers';
import { TYPE } from './types';
import { hashpath, loadPage } from './utils';

declare global {
    interface Window {
        REPO: string;
        DATA_BASE_URL: string;
    }
}

export const TYPES: TYPE[] = ['item', 'itemtag', 'user', 'usertag'];

initHandlers();

const REGEX_PATH = /^\/(item|user|itemtag|usertag)\/(\?page=)?(\d*)$/;
const REGEX_PAGE = /^\?page=(\d*)$/;

function loadIndex<T extends TYPE>(type: T, page = 1) {
    const data = getIndex(type);
    const _page = page - 1;
    const chunked = data.chunked;
    if (_page >= 0 && _page < chunked.length) {
        EVENT_TARGET.dispatchEvent(
            new LoadIndexEvent(type, chunked[_page], page, chunked.length)
        );
    } else {
        alert('Invalid page: ' + page);
        hashpath('/' + type + '/?page=1');
    }
}

function loadDetail(type: TYPE, id: string) {
    getDetail(type, id).then((data) =>
        EVENT_TARGET.dispatchEvent(new LoadDetailEvent(type, id, data))
    );
}

function hashChange() {
    const path = hashpath();
    console.debug('hash change:', path);
    ABORT_CONTROLLER.abort();
    loadPage('Loading...');
    if (path === '/') {
        loadPage('Loading Readme...');
        getReadme(window.REPO).then(loadPage);
        return;
    }
    if (!REGEX_PATH.test(path)) {
        console.debug('invalid path', path);
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
    await createIndexCache();
    hashChange();
    window.addEventListener('hashchange', hashChange);
})();
