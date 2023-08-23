const jsonp = '//busuanzi.ibruce.info/busuanzi?jsonpCallback=';
const prefix = 'busuanzi_value_';
const keys = ['site_pv', 'page_pv', 'site_uv'] as const;

type BusuanziData = {
    readonly [k in (typeof keys)[number]]: number;
} & { readonly version: number };

export function busuanzi() {
    if (window.location.hostname === '127.0.0.1') {
        return;
    }
    const callbackId = Math.floor(1099511627776 * Math.random());
    const callbackName = 'BusuanziCallback_' + callbackId;
    const script = document.createElement('script');
    script.id = callbackName;
    script.defer = true;
    script.src = jsonp + callbackName;
    script.referrerPolicy = 'no-referrer-when-downgrade';
    document.getElementsByTagName('head')[0].appendChild(script);
    // @ts-expect-error
    window[callbackName] = async (data: BusuanziData) => {
        callback(data);
        document.getElementById(callbackName).remove();
        // @ts-expect-error
        delete window[callbackName];
    };
}

async function callback(data: BusuanziData) {
    console.debug(data);
    for (const key of keys) {
        const element = document.getElementById(prefix + key);
        if (element) {
            element.innerHTML = '' + data[key];
        }
    }
}
