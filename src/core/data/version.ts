let DATA_VERSION = 0;

export function getDataVersion() {
    return DATA_VERSION;
}

export function setDataVersion(version: number) {
    console.debug('data version', DATA_VERSION);
    DATA_VERSION = version;
}
