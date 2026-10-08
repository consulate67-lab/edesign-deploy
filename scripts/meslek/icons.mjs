// Meslek logolarındaki simgeler lucide-react paketindeki (ISC lisanslı) ikon geometrisinden okunur.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const dir = require.resolve('lucide-react').replace(/dist[\\/].*$/, 'dist/esm/icons/');
const cache = new Map();

const attrs = (o) => Object.entries(o).filter(([k]) => k !== 'key').map(([k, v]) => `${k}="${v}"`).join(' ');

/** Lucide ikonunun 24×24 iç SVG işaretlemesi (stroke ile çizilir). */
export async function iconMarkup(name) {
    if (!cache.has(name)) {
        const file = `${dir}${name}.js`;
        const mod = await import(pathToFileURL(file).href);
        if (!mod.__iconNode) {
            const target = readFileSync(file, 'utf8').match(/from '\.\/([\w-]+)\.js'/)?.[1];
            if (!target) throw new Error(`Lucide ikonu okunamadı: ${name}`);
            cache.set(name, await iconMarkup(target));
        } else {
            cache.set(name, mod.__iconNode.map(([tag, a]) => `<${tag} ${attrs(a)}/>`).join(''));
        }
    }
    return cache.get(name);
}

const g = (inner, color, x, y, s, w = 2) =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;

/** Logo biçimleri: simge + vurgu rengi; 64×64 görünüm kutusu. */
export const LOGO_SHAPES = {
    kare: (i, a, b) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${a}"/>${g(i, '#ffffff', 14, 14, 1.5)}</svg>`,
    daire: (i, a, b) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="${a}"/><circle cx="32" cy="32" r="26" fill="none" stroke="${b}" stroke-width="1.5"/>${g(i, '#ffffff', 16, 16, 1.333)}</svg>`,
    halka: (i, a, b) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#ffffff" stroke="${a}" stroke-width="3"/>${g(i, a, 16, 16, 1.333)}</svg>`,
    altigen: (i, a, b) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,2 58,17 58,47 32,62 6,47 6,17" fill="${a}"/><polygon points="32,8 53,20 53,44 32,56 11,44 11,20" fill="none" stroke="${b}" stroke-width="1.2"/>${g(i, '#ffffff', 17, 17, 1.25)}</svg>`,
    rozet: (i, a, b) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="4" y="4" width="56" height="56" rx="6" fill="${b}" transform="rotate(45 32 32)"/><rect x="10" y="10" width="44" height="44" rx="5" fill="${a}" transform="rotate(45 32 32)"/>${g(i, '#ffffff', 18, 18, 1.167)}</svg>`,
    damga: (i, a, b) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="none" stroke="${a}" stroke-width="2"/><circle cx="32" cy="32" r="25" fill="none" stroke="${a}" stroke-width="1" stroke-dasharray="2 2.5"/>${g(i, a, 18, 18, 1.167, 1.8)}</svg>`,
    yaprak: (i, a, b) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 2 C52 2 62 12 62 32 C62 52 52 62 32 62 C12 62 2 52 2 32 C2 12 12 2 32 2 Z" fill="${a}"/><circle cx="50" cy="14" r="7" fill="${b}"/>${g(i, '#ffffff', 16, 16, 1.333)}</svg>`,
    serit: (i, a, b) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${a}"/><rect y="50" width="64" height="14" fill="${b}"/>${g(i, '#ffffff', 16, 10, 1.333)}</svg>`,
};
