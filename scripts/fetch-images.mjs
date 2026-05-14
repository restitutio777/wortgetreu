#!/usr/bin/env node
/**
 * Lädt für jedes Gedicht das thematische Bild von wortgetreu.com herunter
 * (TYPO3 _processed_-Variante, ~30-60 KB) und ergänzt das Frontmatter
 * der zugehörigen Markdown-Datei um die Felder `bild` und `bildAlt`.
 */
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TEXTE_DIR = join(ROOT, 'src', 'content', 'texte');
const PUBLIC_IMG_DIR = join(ROOT, 'public', 'gedicht-bilder');
const BASE = 'https://www.wortgetreu.com';

const SLUG_TO_PATH = {
  'magie-der-poesie': '/gedichte/magie-der-poesie',
  'sehnsucht': '/gedichte/sehnsucht',
  'entfaltung': '/gedichte/entfaltung',
  'das-samenkorn': '/gedichte/das-samenkorn',
  'inspiration': '/gedichte/inspiration',
  'machtworte': '/gedichte/machtworte',
  'goettlicher-funke': '/gedichte/goettlicher-funke',
  'mein-gott': '/gedichte/mein-gott',
  'frage-an-dich': '/gedichte/frage-an-dich',
  'kosmischer-tanz': '/gedichte/kosmischer-tanz',
  'unterwegs': '/gedichte/unterwegs',
  'stein': '/gedichte/stein',
  'der-bach': '/gedichte/der-bach',
  'erinnerung-an-schoenheit': '/gedichte/blumen',
  'fruehsommer': '/gedichte/fruehsommer',
  'baeume': '/gedichte/baeume',
  'herbststaub': '/gedichte/herbststaub',
  'das-unsagbare': '/gedichte/das-unsagbare',
  'freunde': '/gedichte/freunde',
  'liebeslogik': '/gedichte/liebeslogik',
  'traenen': '/gedichte/fenster',
  'freiheit': '/gedichte/freiheitsgedanken',
  'fuereinander': '/gedichte/fuereinander',
  'neuland': '/gedichte/neuland',
  'einsicht': '/gedichte/einsicht',
  'die-antwort-ist-frieden': '/gedichte/die-antwort-ist-frieden',
  'erloesung': '/gedichte/erloesung',
  'mitleid': '/gedichte/mitleid',
  'schutzengel': '/gedichte/schutzengel',
  'versoehnlichkeit': '/gedichte/ruf-der-versoehnlichkeit',
  'heilung': '/gedichte/heilung',
  'selbstheilung': '/gedichte/selbstheilung',
  'lichtmess-1': '/gedichte/lichtmess-1',
  'lichtmess-2': '/gedichte/lichtmess-2',
  'glueck': '/gedichte/glueck',
  'jenseits': '/gedichte/jenseits',
  'sterben': '/gedichte/sterben',
  'transformation': '/gedichte/transformation',
  'beweggruende': '/gedichte/beweggruende',
  'was-wirklich-zaehlt': '/gedichte/was-wirklich-zaehlt',
  'happy-end': '/gedichte/happy-end',
};

function imageNameFromUrl(url) {
  // /fileadmin/_processed_/5/9/csm_Mandelbluete_und_weisse_Berge_c9d8170378.jpg
  // → "Mandelbluete und weisse Berge"
  const file = basename(url);
  let name = file
    .replace(/^csm_/, '')
    .replace(/_[a-f0-9]{10}\.(jpg|jpeg|png|gif|webp)$/i, '')
    .replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
    .replace(/_/g, ' ');
  return name;
}

async function fetchImageFor(slug, path) {
  const res = await fetch(BASE + path);
  const html = await res.text();
  const m = html.match(/src="(\/fileadmin\/_processed_\/[^"]+\.(jpg|jpeg|png|gif|webp))"/);
  if (!m) return null;
  const imgUrl = BASE + m[1];

  const imgRes = await fetch(imgUrl);
  if (!imgRes.ok) throw new Error(`${imgRes.status} for ${imgUrl}`);
  const buf = Buffer.from(await imgRes.arrayBuffer());

  const ext = imgUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[1].toLowerCase() ?? 'jpg';
  const outName = `${slug}.${ext}`;
  await mkdir(PUBLIC_IMG_DIR, { recursive: true });
  await writeFile(join(PUBLIC_IMG_DIR, outName), buf);
  return {
    publicPath: `/gedicht-bilder/${outName}`,
    altSeed: imageNameFromUrl(imgUrl),
    bytes: buf.length,
  };
}

async function updateFrontmatter(slug, imgInfo) {
  const mdPath = join(TEXTE_DIR, `${slug}.md`);
  const content = await readFile(mdPath, 'utf8');
  const m = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`Kein Frontmatter in ${slug}`);
  let [, fm, body] = m;

  // Entferne bestehende bild-/bildAlt-Zeilen
  fm = fm.replace(/^bild:.*$\n?/gm, '').replace(/^bildAlt:.*$\n?/gm, '');

  // Füge neue ein
  fm = fm.trimEnd() + `\nbild: ${imgInfo.publicPath}\nbildAlt: "${imgInfo.altSeed}"`;

  const newContent = `---\n${fm}\n---\n${body}`;
  await writeFile(mdPath, newContent, 'utf8');
}

async function main() {
  let ok = 0, miss = 0;
  for (const [slug, path] of Object.entries(SLUG_TO_PATH)) {
    try {
      const info = await fetchImageFor(slug, path);
      if (!info) {
        console.warn(`— ${slug} (kein Bild)`);
        miss++;
        continue;
      }
      await updateFrontmatter(slug, info);
      console.log(`✓ ${slug} ← ${info.altSeed} (${Math.round(info.bytes / 1024)}KB)`);
      ok++;
    } catch (err) {
      console.error(`✗ ${slug}: ${err.message}`);
      miss++;
    }
  }
  console.log(`\n${ok} Bilder geladen, ${miss} ohne.`);
}

main();
