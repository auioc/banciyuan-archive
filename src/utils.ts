import { LoadIndexEvent } from './events';
import { TYPE } from './types';

export function hashpath(path?: string) {
    if (path) {
        window.location.hash = path;
    }
    return window.location.hash.replace(/^#/, '');
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

export function formatSize(bytes: number, iec = true, dp = 1) {
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

export function pagedTitle<T extends TYPE>(
    title: string,
    event: LoadIndexEvent<T>
) {
    return `${title} (Page ${event.page})`;
}

export function linkIndexPage(
    type: TYPE,
    page = 1,
    text: string | number = page,
    enabled = true
) {
    return (
        '<a class="link-index-page" href="' +
        (enabled ? `#/${type}/?page=${page}` : 'javascript:void(0)') +
        `">${text}</a>`
    );
}

export function createIndexTable<T extends TYPE>(
    type: T,
    headers: string[],
    event: LoadIndexEvent<T>,
    handler: (data: any) => HTMLTableCellElement[]
) {
    const table = document.createElement('table');
    table.className = 'table index-table';
    const pageNav = () => {
        const page = event.page;
        const pages = event.pages;
        const text =
            linkIndexPage(type, 1, '&lt;&lt;', page > 1) +
            linkIndexPage(type, page - 1, '&lt;', page > 1) +
            `<span> ${page} / ${pages} </span>` +
            linkIndexPage(type, page + 1, '&gt;', page < pages) +
            linkIndexPage(type, pages, '&gt;&gt;', page < pages);
        const td = tdH(text, headers.length);
        td.className = 'page-nav';
        return trH(td);
    };
    table.append(pageNav());
    table.append(trH(...headers.map((s) => thH(s))));
    event.data
        .map((data) => trH(...handler(data)))
        .forEach((row) => table.append(row));
    table.append(pageNav());
    return table;
}

export function tableH(headers: string[], rows: HTMLTableRowElement[]) {
    const table = document.createElement('table');
    table.className = 'table';
    if (headers) {
        table.append(trH(...headers.map((s) => thH(s))));
    }
    if (rows) {
        rows.forEach((row) => table.append(row));
    }
    return table;
}
export function tableS(...rows: string[]) {
    return '<table class="table"><tbody>' + rows.join('') + '</tbody></table>';
}

export function trH(...cells: HTMLTableCellElement[]) {
    const tr = document.createElement('tr');
    tr.append(...cells);
    return tr;
}
export function tdH(html: any, colSpan = 0, rowSpan = 0) {
    const td = document.createElement('td');
    td.innerHTML = html;
    if (colSpan) td.colSpan = colSpan;
    if (rowSpan) td.rowSpan = rowSpan;
    return td;
}
export function thH(html: any, colSpan = 0, rowSpan = 0) {
    const th = document.createElement('th');
    th.innerHTML = html;
    if (colSpan) th.colSpan = colSpan;
    if (rowSpan) th.rowSpan = rowSpan;
    return th;
}

export function trS(...cells: string[]) {
    return '<tr>' + cells.join('') + '</tr>';
}
export function tdS(text: any) {
    return '<td>' + text + '</td>';
}
export function thS(text: any) {
    return '<th>' + text + '</th>';
}
