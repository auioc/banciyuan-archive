import { createIndexCache } from './data/cache';
import { setDataVersion } from './data/version';
import { initHandlers } from './event/handlers';
import hashChange from './router';
import { fetchDataVersion } from './utils/fetch';
import { hashpath, loadPage } from './utils/utils';

declare global {
    interface Window {
        readonly REPO: string;
        readonly DATA_URL: string;
    }
}

initHandlers();

(async () => {
    if (!hashpath()) hashpath('/');
    loadPage('Initializing...');
    try {
        setDataVersion(await fetchDataVersion());
        await createIndexCache();
    } catch (error) {
        console.error(error);
        loadPage('Failed to initialize!<br/>' + error);
    }
    hashChange();
    window.addEventListener('hashchange', hashChange);
})();
