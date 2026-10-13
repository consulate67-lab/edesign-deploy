/** .xlsx dosyasının ilk sayfasını satır/hücre dizisine çevirir; dış paket gerektirmez (ZIP + XML). */

interface ZipEntry { name: string; method: number; compressedSize: number; offset: number }

const u16 = (v: DataView, o: number) => v.getUint16(o, true);
const u32 = (v: DataView, o: number) => v.getUint32(o, true);

const readEntries = (buf: ArrayBuffer): ZipEntry[] => {
    const v = new DataView(buf);
    let eocd = -1;
    for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) {
        if (u32(v, i) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('Dosya geçerli bir Excel (.xlsx) dosyası değil.');
    const count = u16(v, eocd + 10);
    let p = u32(v, eocd + 16);
    const decoder = new TextDecoder();
    const entries: ZipEntry[] = [];
    for (let i = 0; i < count; i++) {
        if (u32(v, p) !== 0x02014b50) break;
        const nameLen = u16(v, p + 28);
        const extraLen = u16(v, p + 30);
        const commentLen = u16(v, p + 32);
        entries.push({
            name: decoder.decode(new Uint8Array(buf, p + 46, nameLen)),
            method: u16(v, p + 10),
            compressedSize: u32(v, p + 20),
            offset: u32(v, p + 42),
        });
        p += 46 + nameLen + extraLen + commentLen;
    }
    return entries;
};

const readEntry = async (buf: ArrayBuffer, e: ZipEntry): Promise<string> => {
    const v = new DataView(buf);
    const start = e.offset + 30 + u16(v, e.offset + 26) + u16(v, e.offset + 28);
    const data = new Uint8Array(buf, start, e.compressedSize);
    if (e.method === 0) return new TextDecoder().decode(data);
    if (e.method !== 8) throw new Error('Excel dosyası desteklenmeyen biçimde sıkıştırılmış.');
    const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Response(stream).text();
};

const colIndex = (ref: string) => {
    let n = 0;
    for (const ch of ref.replace(/\d+$/, '')) n = n * 26 + (ch.charCodeAt(0) - 64);
    return n - 1;
};

const textOf = (el: Element) => Array.from(el.getElementsByTagNameNS('*', 't')).map(t => t.textContent ?? '').join('');

export async function readXlsx(file: File): Promise<string[][]> {
    const buf = await file.arrayBuffer();
    const entries = readEntries(buf);
    const find = (name: string) => entries.find(e => e.name === name);
    const parser = new DOMParser();
    const xml = async (e: ZipEntry) => parser.parseFromString(await readEntry(buf, e), 'application/xml');

    const sheetEntry = find('xl/worksheets/sheet1.xml')
        ?? entries.filter(e => /^xl\/worksheets\/[^/]+\.xml$/.test(e.name)).sort((a, b) => a.name.localeCompare(b.name))[0];
    if (!sheetEntry) throw new Error('Excel dosyasında sayfa bulunamadı.');

    const sharedEntry = find('xl/sharedStrings.xml');
    const shared = sharedEntry ? Array.from((await xml(sharedEntry)).getElementsByTagNameNS('*', 'si')).map(textOf) : [];

    const rows: string[][] = [];
    for (const row of Array.from((await xml(sheetEntry)).getElementsByTagNameNS('*', 'row'))) {
        const cells: string[] = [];
        for (const c of Array.from(row.getElementsByTagNameNS('*', 'c'))) {
            const type = c.getAttribute('t');
            const raw = c.getElementsByTagNameNS('*', 'v')[0]?.textContent ?? '';
            const value = type === 's' ? shared[Number(raw)] ?? '' : type === 'inlineStr' ? textOf(c) : raw;
            const ref = c.getAttribute('r');
            cells[ref ? colIndex(ref) : cells.length] = value.trim();
        }
        if (cells.some(Boolean)) rows.push(Array.from(cells, x => x ?? ''));
    }
    return rows;
}
