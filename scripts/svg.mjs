import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ink = '#eff5ff';
export const muted = '#a5b8d2';
export const cyan = '#70f5e4';
export const violet = '#bd9bff';
export const blue = '#72a1ff';
export const sans = 'Inter, Segoe UI, Arial, sans-serif';
export const mono = 'IBM Plex Mono, Consolas, monospace';
export const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export function label(x, y, content, size = 15, color = ink, attrs = '') {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${attrs}>${escape(content)}</text>`;
}

export function caption(x, y, content, color = muted, size = 12) {
  return label(x, y, content, size, color, `font-family="${mono}" letter-spacing="1.5"`);
}

export function path(d, color, width = 1, attrs = '') {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${attrs}/>`;
}

export function dot(x, y, r, color, attrs = '') {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" ${attrs}/>`;
}

export function series(n, draw) {
  return Array.from({ length: n }, (_, i) => draw(i)).join('\n');
}

export function panel(width, height) {
  return `<rect x="1" y="1" width="${width-2}" height="${height-2}" rx="16" fill="url(#surface)" stroke="#364965"/>`;
}

export function save(file, width, height, title, description, body, styles = '', defs = '') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc" font-family="${sans}">
<title id="title">${escape(title)}</title><desc id="desc">${escape(description)}</desc>
<defs>
  <linearGradient id="surface" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#14273d"/><stop offset=".48" stop-color="#0b182a"/><stop offset="1" stop-color="#17172e"/></linearGradient>
  <linearGradient id="spectrum"><stop stop-color="${cyan}"/><stop offset=".55" stop-color="${blue}"/><stop offset="1" stop-color="${violet}"/></linearGradient>
  ${defs}
</defs>
<style>
  @keyframes pulse {50% {opacity:.38}}
  @keyframes flow {to {stroke-dashoffset:-80}}
  @keyframes float {50% {transform:translateY(-4px)}}
  @media (prefers-reduced-motion:no-preference) {
    .pulse {animation:pulse 4s ease-in-out infinite}
    .flow {animation:flow 12s linear infinite}
    .float {animation:float 6s ease-in-out infinite}
  }
  ${styles}
  @media (prefers-reduced-motion:reduce) {* {animation:none!important}}
</style>
${body}
</svg>\n`;
  const destination = fileURLToPath(new URL('../assets/' + file, import.meta.url));
  mkdirSync(dirname(destination), {recursive:true});
  writeFileSync(destination, svg);
}
