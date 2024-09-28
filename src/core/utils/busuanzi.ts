const busuanzi_url = 'https://events.vercount.one/log';

const prefix = 'busuanzi_value_';
const keys = ['site_pv', 'page_pv', 'site_uv'] as const;

type Data = {
    readonly [k in (typeof keys)[number]]: number;
};

function forEachKey(f: (key: (typeof keys)[number]) => string) {
    for (const key of keys) {
        const element = document.getElementById(prefix + key);
        if (element) {
            element.innerHTML = f(key);
        }
    }
}

export default async function busuanzi() {
    forEachKey((_) => '?');

    const page = window.location.href.replace('#', 'H').replace('?', '/');
    const data: Data = await fetch(busuanzi_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: page }),
    }).then((res) => res.json());
    console.debug('busuanzi', window.location.hash, data);
    forEachKey((key) => '' + data[key]);
}
