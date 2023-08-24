import { busuanzi } from './busuanzi';
import { createIndexCache, getDetail, getIndex, getReadme } from './data';
import { EVENT_TARGET, LoadDetailEvent, LoadIndexEvent } from './events';
import { abortFetch, getDataVersion } from './fetch';
import { initHandlers } from './handlers';
import { TYPE } from './types';
import { hashpath, loadPage } from './utils';

declare global {
    interface Window {
        readonly REPO: string;
        readonly DATA_URL: string;
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
    abortFetch();
    loadPage('Loading...');
    if (path === '/') {
        loadPage('Loading Readme...');
        busuanzi();
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
    busuanzi();
    if (REGEX_PAGE.test(param)) {
        loadIndex(type, parseInt(param.slice(6)));
    } else {
        loadDetail(type, param);
    }
}

export let DATA_VERSION = 0;

(async () => {
    if (!hashpath()) hashpath('/');
    loadPage('Initializing...');
    try {
        DATA_VERSION = await getDataVersion();
        await createIndexCache();
    } catch (error) {
        console.error(error);
        loadPage('Failed to initialize!<br/>' + error);
        return;
    }
    hashChange();
    window.addEventListener('hashchange', hashChange);
})();
