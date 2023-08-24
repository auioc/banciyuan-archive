import { LoadIndexEvent } from './events';
import { TYPE } from './types';

export function hashpath(path?: string) {
    if (path) {
        window.location.hash = path;
    }
    return window.location.hash.replace(/^#/, '');
}

export function rethrow(error: Error) {
    throw error;
}

export function chunkArray<T>(array: T[], size: number) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

export function percentage(a: number, b = 100, dp = 2) {
    return ((a / b) * 100).toFixed(dp);
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatTime(ts: number) {
    if (ts <= 0) {
        return '0';
    }
    let date = new Date(ts * 1000);
    let y = date.getFullYear().toString();
    let m = (date.getMonth() + 1).toString().padStart(2, '00');
    let d = date.getDate().toString().padStart(2, '00');
    let hh = date.getHours().toString().padStart(2, '00');
    let mm = date.getMinutes().toString().padStart(2, '00');
    let ss = date.getSeconds().toString().padStart(2, '00');
    return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss;
}

const _SIZE_PREFIX = ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
const SIZE_UNITS_IEC = _SIZE_PREFIX.map((s) => s + 'iB');
const SIZE_UNITS_SI = _SIZE_PREFIX.map((s) => s + 'B');

export function formatSize(bytes: number, iec = true, dp = 2) {
    const thresh = iec ? 1024 : 1000;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    const units = iec ? SIZE_UNITS_IEC : SIZE_UNITS_SI;
    const r = 10 ** dp;
    let u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (
        Math.round(Math.abs(bytes) * r) / r >= thresh &&
        u < units.length - 1
    );
    return bytes.toFixed(dp) + ' ' + units[u];
}

export function progress(received: number, length: number) {
    const s = formatSize(received) + (length ? ' / ' + formatSize(length) : '');
    const p = length ? '@ ' + percentage(received, length) + '%' : '';
    return `${s} ${p}`;
}

export function parseTsv<T>(
    tsv: string,
    handler: (headers: string[], cells: string[]) => T
) {
    const lines = tsv.trim().split(/\r\n|\n/);
    const headers = lines[0].split('\t');
    const rows = lines.slice(1);
    const result = [];
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].trim().split('\t');
        result.push(handler(headers, cells));
    }
    return result;
}

const DEFAULT_TITLE = document.title;

export function loadPage(content: string | HTMLElement, title?: string) {
    const contentEl = document.getElementById('content');
    contentEl.innerHTML = '';
    if (content instanceof HTMLElement) {
        contentEl.append(content);
    } else if (content) {
        contentEl.innerHTML = content;
    }
    const titleEl = document.getElementById('page-title');
    titleEl.innerHTML = '&nbsp;';
    if (title) {
        document.title = title + ' - ' + DEFAULT_TITLE;
        titleEl.innerHTML = title;
    } else {
        document.title = DEFAULT_TITLE;
    }
}

export function linkIndex(
    type: TYPE,
    page = 1,
    text: string | number = page,
    enabled = true
) {
    return (
        '<a class="link-index" href="' +
        (enabled ? `#/${type}/?page=${page}` : 'javascript:void(0)') +
        `">${text}</a>`
    );
}

export function createIndexTable<T extends TYPE>(
    type: T,
    headers: string[],
    event: LoadIndexEvent<T>,
    handler: (data: any) => any[]
) {
    const table = document.createElement('table');
    table.className = 'table index-table';
    const pageNav = () => {
        const page = event.page;
        const pages = event.pages;
        const text =
            linkIndex(type, 1, '&lt;&lt;', page > 1) +
            linkIndex(type, page - 1, '&lt;', page > 1) +
            `<span> ${page} / ${pages} </span>` +
            linkIndex(type, page + 1, '&gt;', page < pages) +
            linkIndex(type, pages, '&gt;&gt;', page < pages);
        const td = tdH(text, headers.length);
        td.className = 'page-nav';
        return trH(td);
    };
    table.append(pageNav());
    table.append(trH(...headers.map((s) => thH(s))));
    event.data
        .map((data) => trH(...handler(data).map((html) => tdH(html))))
        .forEach((row) => table.append(row));
    table.append(pageNav());
    return table;
}

export function span(id?: string) {
    const span = document.createElement('span');
    if (id) {
        span.id = id;
    }
    return span;
}

export function div(children?: (string | Node)[]) {
    const div = document.createElement('div');
    if (children) {
        div.append(...children);
    }
    return div;
}

export function tableS(...rows: string[][]) {
    return (
        '<table class="table"><tbody>' +
        rows.map(trS).join('') +
        '</tbody></table>'
    );
}

function trH(...cells: HTMLTableCellElement[]) {
    const tr = document.createElement('tr');
    tr.append(...cells);
    return tr;
}
function tCellH(html: any, header: boolean, colSpan = 0, rowSpan = 0) {
    const cell = document.createElement(header ? 'th' : 'td');
    cell.innerHTML = html;
    if (colSpan) cell.colSpan = colSpan;
    if (rowSpan) cell.rowSpan = rowSpan;
    return cell;
}
function tdH(html: any, colSpan = 0) {
    return tCellH(html, false, colSpan);
}
function thH(html: any) {
    return tCellH(html, true);
}

function trS(cells: string[]) {
    return '<tr>' + cells.join('') + '</tr>';
}
function tCellHS(text: any, header: boolean, colSpan = 0, rowSpan = 0) {
    const tag = header ? 'th' : 'td';
    return (
        `<${tag}` +
        (colSpan ? ` colspan="${colSpan}"` : '') +
        (rowSpan ? ` rowspan="${rowSpan}"` : '') +
        `>${text}</${tag}>`
    );
}
export function tdS(text: any, colSpan = 0) {
    return tCellHS(text, false, colSpan);
}
export function thS(text: any, colSpan = 0) {
    return tCellHS(text, true, colSpan);
}
export function tcRS(header: boolean, ...text: any[]) {
    return text.map((t) => (header ? thS : tdS)(t));
}
