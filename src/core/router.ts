import busuanzi from 'utils/busuanzi';
import { getDetail, getIndex, getReadme } from './data/data';
import { EVENT_TARGET, LoadDetailEvent, LoadIndexEvent } from './event/events';
import { TYPE } from './types';
import { abortFetch, onFetchError } from './utils/fetch';
import { hashpath, loadPage } from './utils/utils';

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
    getDetail(type, id)
        .then((data) =>
            EVENT_TARGET.dispatchEvent(new LoadDetailEvent(type, id, data))
        )
        .catch(onFetchError);
}

export default function hashChange() {
    const path = hashpath();
    console.debug('hash change:', path);
    abortFetch();
    loadPage('Loading...');
    if (path === '/') {
        loadPage('Loading Readme...');
        busuanzi();
        getReadme().then(loadPage);
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
