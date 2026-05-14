#!/usr/bin/env node
/**
 * Migriert die 49 Markdown-Texte + Bilder + die Über-Seite nach Sanity.
 *
 * Voraussetzungen:
 *  - SANITY_AUTH_TOKEN env (sk... — Schreibrechte)
 *
 * Aufruf:
 *  SANITY_AUTH_TOKEN=sk... node scripts/sanity-migrate.mjs
 */
import { createClient } from '@sanity/client';
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReadStream } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TEXTE_DIR = join(ROOT, 'src', 'content', 'texte');
const IMG_DIR = join(ROOT, 'public', 'gedicht-bilder');

const client = createClient({
  projectId: 'vgln64hw',
  dataset: 'production',
  apiVersion: '2025-02-01',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

if (!process.env.SANITY_AUTH_TOKEN) {
  console.error('Fehler: SANITY_AUTH_TOKEN nicht gesetzt.');
  process.exit(1);
}

/* ── Frontmatter-Parser ───────────────────────────────────────────────── */

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('Kein Frontmatter');
  const [, fmRaw, body] = m;
  const fm = {};
  const lines = fmRaw.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) { i++; continue; }
    const [, key, valRaw] = kv;
    let val = valRaw.trim();
    // Array (next lines starting with "  - ")
    if (val === '' && i + 1 < lines.length && lines[i + 1].match(/^\s*-\s/)) {
      const arr = [];
      i++;
      while (i < lines.length && lines[i].match(/^\s*-\s/)) {
        arr.push(lines[i].replace(/^\s*-\s*/, '').trim());
        i++;
      }
      fm[key] = arr;
      continue;
    }
    // Quoted strings
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1).replace(/\\"/g, '"');
    }
    // Numbers
    if (/^-?\d+$/.test(val)) {
      fm[key] = parseInt(val, 10);
    } else {
      fm[key] = val;
    }
    i++;
  }
  return { frontmatter: fm, body: body.trim() };
}

/* ── Prosa-Body in Portable Text ─────────────────────────────────────── */

function markdownToBlocks(md) {
  // Sehr einfacher Parser: Absätze + ## Zwischentitel + leere Zeilen.
  // Inline-Italic _x_ und **fett**, Links [text](url).
  const blocks = [];
  // Split by blank lines into paragraphs
  const paragraphs = md.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  let keyCounter = 0;
  const k = () => `bm${(keyCounter++).toString(36)}`;

  for (const p of paragraphs) {
    if (p.startsWith('## ')) {
      blocks.push({
        _type: 'block',
        _key: k(),
        style: 'h2',
        markDefs: [],
        children: [{ _type: 'span', _key: k(), text: p.slice(3).trim(), marks: [] }],
      });
      continue;
    }
    if (p.startsWith('### ')) {
      blocks.push({
        _type: 'block',
        _key: k(),
        style: 'h3',
        markDefs: [],
        children: [{ _type: 'span', _key: k(), text: p.slice(4).trim(), marks: [] }],
      });
      continue;
    }
    // Parse inline marks
    const { children, markDefs } = parseInline(p.replace(/\n/g, ' '), k);
    blocks.push({
      _type: 'block',
      _key: k(),
      style: 'normal',
      markDefs,
      children,
    });
  }
  return blocks;
}

function parseInline(text, keyFn) {
  // Returns { children: span[], markDefs: linkDefs[] }
  const children = [];
  const markDefs = [];

  // Tokenize: **bold**, _italic_, [text](url)
  // Simple recursive approach.
  let i = 0;
  let buf = '';
  let activeMarks = [];

  const flush = () => {
    if (buf) {
      children.push({ _type: 'span', _key: keyFn(), text: buf, marks: [...activeMarks] });
      buf = '';
    }
  };

  while (i < text.length) {
    // Bold **...**
    if (text[i] === '*' && text[i + 1] === '*') {
      flush();
      const end = text.indexOf('**', i + 2);
      if (end > i + 2) {
        const inner = text.slice(i + 2, end);
        children.push({
          _type: 'span',
          _key: keyFn(),
          text: inner,
          marks: [...activeMarks, 'strong'],
        });
        i = end + 2;
        continue;
      }
    }
    // Italic _..._
    if (text[i] === '_') {
      const end = text.indexOf('_', i + 1);
      if (end > i + 1) {
        flush();
        const inner = text.slice(i + 1, end);
        children.push({
          _type: 'span',
          _key: keyFn(),
          text: inner,
          marks: [...activeMarks, 'em'],
        });
        i = end + 1;
        continue;
      }
    }
    // Link [text](url)
    if (text[i] === '[') {
      const close = text.indexOf(']', i);
      if (close > i && text[close + 1] === '(') {
        const urlEnd = text.indexOf(')', close + 2);
        if (urlEnd > close + 2) {
          flush();
          const linkText = text.slice(i + 1, close);
          const url = text.slice(close + 2, urlEnd);
          const linkKey = `lk${markDefs.length}`;
          markDefs.push({ _key: linkKey, _type: 'link', href: url });
          children.push({
            _type: 'span',
            _key: keyFn(),
            text: linkText,
            marks: [...activeMarks, linkKey],
          });
          i = urlEnd + 1;
          continue;
        }
      }
    }
    buf += text[i];
    i++;
  }
  flush();
  if (children.length === 0) {
    children.push({ _type: 'span', _key: keyFn(), text: '', marks: [] });
  }
  return { children, markDefs };
}

/* ── Bild-Upload ─────────────────────────────────────────────────────── */

const uploadedImages = new Map();

async function uploadImage(slug, ext) {
  if (uploadedImages.has(slug)) return uploadedImages.get(slug);
  const filename = `${slug}.${ext}`;
  const filepath = join(IMG_DIR, filename);
  try {
    const stream = createReadStream(filepath);
    const asset = await client.assets.upload('image', stream, {
      filename,
    });
    uploadedImages.set(slug, asset);
    return asset;
  } catch (err) {
    console.warn(`  ! Bild ${filename} konnte nicht hochgeladen werden: ${err.message}`);
    return null;
  }
}

/* ── Haupt-Migration ─────────────────────────────────────────────────── */

async function migrateTexte() {
  const files = (await readdir(TEXTE_DIR)).filter((f) => f.endsWith('.md'));
  console.log(`Migriere ${files.length} Texte...\n`);

  const documents = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const content = await readFile(join(TEXTE_DIR, file), 'utf8');
    const { frontmatter, body } = parseFrontmatter(content);

    const doc = {
      _id: slug,
      _type: 'werktext',
      title: frontmatter.title,
      slug: { _type: 'slug', current: slug },
      form: frontmatter.form,
      themen: frontmatter.themen || [],
    };

    // Body: Lyrik vs Prosa
    if (frontmatter.form === 'gedicht') {
      doc.gedichtBody = body;
    } else {
      doc.prosaBody = markdownToBlocks(body);
    }

    if (frontmatter.datum) doc.datum = String(frontmatter.datum);
    if (frontmatter.jahr) doc.jahr = frontmatter.jahr;
    if (frontmatter.sortKey) doc.sortKey = frontmatter.sortKey;
    if (frontmatter.veroeffentlichtIn) doc.veroeffentlichtIn = frontmatter.veroeffentlichtIn;
    if (frontmatter.veroeffentlichtAm) doc.veroeffentlichtAm = frontmatter.veroeffentlichtAm;

    // Bild
    if (frontmatter.bild) {
      const ext = frontmatter.bild.split('.').pop();
      const asset = await uploadImage(slug, ext);
      if (asset) {
        doc.bild = {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
          alt: frontmatter.bildAlt || '',
        };
      }
    }

    documents.push(doc);
    process.stdout.write(`  ✓ ${slug}\n`);
  }

  // Per-doc write (statt Transaktion, damit Fehler einzeln sichtbar werden)
  console.log(`\nSchreibe ${documents.length} Dokumente nach Sanity...`);
  let ok = 0;
  for (const doc of documents) {
    try {
      await client.createOrReplace(doc);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${doc._id}: ${err.message}`);
    }
  }
  console.log(`✓ ${ok}/${documents.length} Texte geschrieben.`);
}

async function migrateUeber() {
  console.log('\nMigriere Über-Seite...');
  await client.createOrReplace({
    _id: 'ueberPage',
    _type: 'ueberPage',
    name: 'Katharina Offenborn',
    byline: 'Wien, 1959 · Schriftstellerin, Lektorin, Übersetzerin',
    kontaktEmail: 'kontakt@wortgetreu.com',
    lead: 'Geboren 1959 in Wien, in eine Familie, in der man dem Wort eine hohe Bedeutung beimaß. Schon als Kind ahnte sie beim Zuhören, wie wichtig es ist, genau ausdrücken zu können, was man sagen möchte.',
    biografie: [
      'Als Teenager schrieb sie Briefe in alle Welt, in drei Sprachen, und lotete die unterschiedlichen Sprachräume nach ihren Besonderheiten aus. Anfang Zwanzig begann sie täglich Tagebuch zu schreiben, eine seelenhygienische Gewohnheit, die sie über ein Jahrzehnt beibehielt.',
      'Zeitgleich entdeckte sie das Gedicht als Möglichkeit, mit den Ebenen zwischen Wort und Wirklichkeit zu spielen und so auch das üblicherweise Unsagbare auszudrücken. Dieses Genre begleitet sie bis heute.',
      'Anfang Vierzig folgten Essays, die ihrer damals aktuellen Lebenssituation entsprangen, bis sie die Kurzgeschichte in ihren Bann zog. Als Mitglied der Autorengruppe Espressivo veröffentlichte sie 2008 Kurzgeschichten in drei Anthologien; im selben Jahr erschienen drei Artikel in der Wochenschrift Das Goetheanum: die Reihe Schwellenphänomene.',
      'Jahrelang übersetzte, kommentierte und redigierte sie Werke anderer. 2007 machte sie ihre Leidenschaft zum Hauptberuf und ist bis heute selbständig als Lektorin und Übersetzerin tätig. 2010 erstellte sie die Webseite anthroposophie-lebensnah.de für Werke von Dr. Michaela Glöckler, in enger Zusammenarbeit mit ihr.',
      '2020 erschien ihr Buch Leuchtspuren. Eigenwege in die Zukunft.',
      'Zur Zeit lebt sie als Reisende in mehreren Ländern und übersetzt ihre Gedichte gemeinsam mit Muttersprachlern ins Englische, Französische und Griechische, um sie auch ihren Freunden in deren eigenen Sprachen zugänglich zu machen.',
    ].map((p, idx) => ({
      _type: 'block',
      _key: `b${idx}`,
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: `s${idx}`, text: p, marks: [] }],
    })),
  });
  console.log('✓ Über-Seite migriert.');
}

async function migrateBuch() {
  console.log('\nMigriere Buch-Seite...');
  await client.createOrReplace({
    _id: 'buchPage',
    _type: 'buchPage',
    title: 'Leuchtspuren',
    untertitel: 'Eigenwege in die Zukunft',
    jahr: 2020,
    verlag: 'tredition',
    bestellLink: 'https://tredition.de/autoren/katharina-offenborn-31976/',
    lead: 'Eine Sammlung von Texten, die zur Suche nach eigenen Wegen ermutigen. Gerade dort, wo das Gewohnte nicht mehr trägt.',
    beschreibung: [
      'Erschienen 2020 im tredition-Verlag. Im Buchhandel und beim Verlag erhältlich.',
      'Leuchtspuren versammelt Reflexionen, Geschichten und Anstöße aus zwei Jahrzehnten. Texte, die nicht beantworten, sondern offenhalten. Sie suchen nach dem, was unter dem Sichtbaren wirkt: am Schwellenmoment, am Übergang, in der stillen Geste.',
      'Die Autorin schreibt aus einer anthroposophisch grundierten Aufmerksamkeit, ohne je belehrend zu werden. Statt Antworten gibt es Spuren, auf denen jede:r Leser:in eigene Schritte gehen kann.',
    ].map((p, idx) => ({
      _type: 'block',
      _key: `b${idx}`,
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: `s${idx}`, text: p, marks: [] }],
    })),
  });
  console.log('✓ Buch-Seite migriert.');
}

async function migrateSettings() {
  console.log('\nMigriere Einstellungen + Drei Eingänge...');
  await client.createOrReplace({
    _id: 'settings',
    _type: 'settings',
    heroBegruessung: 'Schön, dass du hierher gefunden hast.',
    heroTitelEinleitung: 'Lass dich',
    heroVerben: ['berühren', 'ermutigen', 'inspirieren'],
    heroUntertitel: 'Lyrik, Essays, Artikel und Geschichten von Katharina Offenborn.',
    eingangIntro: 'Wo möchtest du beginnen?',
    eingangStille: {
      lead: 'Drei kurze Gedichte, die nicht eilen. Setz dich, atme einmal aus, lies in der Reihenfolge, oder springe.',
      texte: [
        { _type: 'reference', _key: 'r1', _ref: 'das-unsagbare' },
        { _type: 'reference', _key: 'r2', _ref: 'schutzengel' },
        { _type: 'reference', _key: 'r3', _ref: 'mitleid' },
      ],
    },
    eingangSchwellen: {
      lead: 'Drei Artikel, 2008 für die Wochenschrift Das Goetheanum geschrieben. Über Orte, an denen sich der Mensch begegnet.',
      texte: [
        { _type: 'reference', _key: 'r1', _ref: 'krankenhaus' },
        { _type: 'reference', _key: 'r2', _ref: 'schule' },
        { _type: 'reference', _key: 'r3', _ref: 'kathedrale' },
      ],
    },
    eingangFrisch: {
      lead: 'Die jüngsten Texte. Was zuletzt geschrieben wurde.',
      texte: [],
    },
    leistungen: ['Lektorat', 'Übersetzung', 'Bucherstellung', 'Biografien', 'Chroniken', 'Transkription'],
  });
  console.log('✓ Einstellungen migriert.');
}

async function main() {
  try {
    await migrateTexte();
    await migrateUeber();
    await migrateBuch();
    await migrateSettings();
    console.log('\n✓✓✓ Alles fertig.');
  } catch (err) {
    console.error('\n✗ Migration fehlgeschlagen:', err);
    process.exit(1);
  }
}

main();
