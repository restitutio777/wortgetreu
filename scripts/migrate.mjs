#!/usr/bin/env node
/**
 * Einmaliges Migrations-Skript:
 * Lädt alle Texte von www.wortgetreu.com und schreibt sie als Markdown
 * in src/content/texte/. Thematische Klassifikation per Hand-Map unten.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'src', 'content', 'texte');
const BASE = 'https://www.wortgetreu.com';

/* ────────────────────────────────────────────────────────────────────────
 * Inhalts-Inventar mit Klassifikation
 * Themen-Cluster:
 *   schwelle-wandlung, licht-stille, natur-erde,
 *   liebe-verbundenheit, geist-freiheit, alltag-bewusstsein
 * ──────────────────────────────────────────────────────────────────────── */

const TEXTE = [
  // Gedichte
  { slug: 'magie-der-poesie', path: '/gedichte/magie-der-poesie', form: 'gedicht', themen: ['geist-freiheit', 'licht-stille'] },
  { slug: 'sehnsucht', path: '/gedichte/sehnsucht', form: 'gedicht', themen: ['liebe-verbundenheit'] },
  { slug: 'entfaltung', path: '/gedichte/entfaltung', form: 'gedicht', themen: ['schwelle-wandlung'] },
  { slug: 'das-samenkorn', path: '/gedichte/das-samenkorn', form: 'gedicht', themen: ['natur-erde', 'schwelle-wandlung'] },
  { slug: 'inspiration', path: '/gedichte/inspiration', form: 'gedicht', themen: ['geist-freiheit'] },
  { slug: 'machtworte', path: '/gedichte/machtworte', form: 'gedicht', themen: ['geist-freiheit'] },
  { slug: 'goettlicher-funke', path: '/gedichte/goettlicher-funke', form: 'gedicht', themen: ['geist-freiheit', 'licht-stille'] },
  { slug: 'mein-gott', path: '/gedichte/mein-gott', form: 'gedicht', themen: ['geist-freiheit'] },
  { slug: 'frage-an-dich', path: '/gedichte/frage-an-dich', form: 'gedicht', themen: ['liebe-verbundenheit'] },
  { slug: 'kosmischer-tanz', path: '/gedichte/kosmischer-tanz', form: 'gedicht', themen: ['geist-freiheit', 'schwelle-wandlung'] },
  { slug: 'unterwegs', path: '/gedichte/unterwegs', form: 'gedicht', themen: ['alltag-bewusstsein'] },
  { slug: 'stein', path: '/gedichte/stein', form: 'gedicht', themen: ['natur-erde'] },
  { slug: 'der-bach', path: '/gedichte/der-bach', form: 'gedicht', themen: ['natur-erde'] },
  { slug: 'erinnerung-an-schoenheit', path: '/gedichte/blumen', form: 'gedicht', themen: ['natur-erde', 'alltag-bewusstsein'] },
  { slug: 'fruehsommer', path: '/gedichte/fruehsommer', form: 'gedicht', themen: ['natur-erde'] },
  { slug: 'baeume', path: '/gedichte/baeume', form: 'gedicht', themen: ['natur-erde'] },
  { slug: 'herbststaub', path: '/gedichte/herbststaub', form: 'gedicht', themen: ['natur-erde', 'schwelle-wandlung'] },
  { slug: 'das-unsagbare', path: '/gedichte/das-unsagbare', form: 'gedicht', themen: ['licht-stille', 'liebe-verbundenheit'] },
  { slug: 'freunde', path: '/gedichte/freunde', form: 'gedicht', themen: ['liebe-verbundenheit'] },
  { slug: 'liebeslogik', path: '/gedichte/liebeslogik', form: 'gedicht', themen: ['liebe-verbundenheit'] },
  { slug: 'traenen', path: '/gedichte/fenster', form: 'gedicht', themen: ['licht-stille', 'liebe-verbundenheit'] },
  { slug: 'freiheit', path: '/gedichte/freiheitsgedanken', form: 'gedicht', themen: ['geist-freiheit'] },
  { slug: 'fuereinander', path: '/gedichte/fuereinander', form: 'gedicht', themen: ['liebe-verbundenheit'] },
  { slug: 'neuland', path: '/gedichte/neuland', form: 'gedicht', themen: ['schwelle-wandlung'] },
  { slug: 'einsicht', path: '/gedichte/einsicht', form: 'gedicht', themen: ['alltag-bewusstsein', 'geist-freiheit'] },
  { slug: 'die-antwort-ist-frieden', path: '/gedichte/die-antwort-ist-frieden', form: 'gedicht', themen: ['geist-freiheit'] },
  { slug: 'erloesung', path: '/gedichte/erloesung', form: 'gedicht', themen: ['schwelle-wandlung', 'geist-freiheit'] },
  { slug: 'mitleid', path: '/gedichte/mitleid', form: 'gedicht', themen: ['liebe-verbundenheit', 'licht-stille'] },
  { slug: 'schutzengel', path: '/gedichte/schutzengel', form: 'gedicht', themen: ['liebe-verbundenheit', 'licht-stille'] },
  { slug: 'versoehnlichkeit', path: '/gedichte/ruf-der-versoehnlichkeit', form: 'gedicht', themen: ['liebe-verbundenheit'] },
  { slug: 'heilung', path: '/gedichte/heilung', form: 'gedicht', themen: ['schwelle-wandlung', 'geist-freiheit'] },
  { slug: 'selbstheilung', path: '/gedichte/selbstheilung', form: 'gedicht', themen: ['schwelle-wandlung'] },
  { slug: 'lichtmess-1', path: '/gedichte/lichtmess-1', form: 'gedicht', themen: ['licht-stille'] },
  { slug: 'lichtmess-2', path: '/gedichte/lichtmess-2', form: 'gedicht', themen: ['licht-stille'] },
  { slug: 'glueck', path: '/gedichte/glueck', form: 'gedicht', themen: ['alltag-bewusstsein'] },
  { slug: 'jenseits', path: '/gedichte/jenseits', form: 'gedicht', themen: ['schwelle-wandlung'] },
  { slug: 'sterben', path: '/gedichte/sterben', form: 'gedicht', themen: ['schwelle-wandlung'] },
  { slug: 'transformation', path: '/gedichte/transformation', form: 'gedicht', themen: ['schwelle-wandlung'] },
  { slug: 'beweggruende', path: '/gedichte/beweggruende', form: 'gedicht', themen: ['alltag-bewusstsein'] },
  { slug: 'was-wirklich-zaehlt', path: '/gedichte/was-wirklich-zaehlt', form: 'gedicht', themen: ['alltag-bewusstsein'] },
  { slug: 'happy-end', path: '/gedichte/happy-end', form: 'gedicht', themen: ['schwelle-wandlung', 'alltag-bewusstsein'] },

  // Geschichten
  { slug: 'mein-lebenslauf', path: '/geschichten/mein-lebenslauf', form: 'geschichte', themen: ['alltag-bewusstsein', 'schwelle-wandlung'] },
  { slug: 'mit-links', path: '/geschichten/mit-links', form: 'geschichte', themen: ['alltag-bewusstsein'] },

  // Essays
  { slug: 'der-ganz-normale-wahnsinn', path: '/essays/der-ganz-normale-wahnsinn', form: 'essay', themen: ['alltag-bewusstsein'], jahr: 2001 },
  { slug: 'jetzt-oder-nie', path: '/essays/jetzt-oder-nie', form: 'essay', themen: ['alltag-bewusstsein', 'schwelle-wandlung'], jahr: 2001 },
  { slug: 'noetiger-ueberblick', path: '/essays/noetiger-ueberblick', form: 'essay', themen: ['alltag-bewusstsein', 'geist-freiheit'] },

  // Artikel (Goetheanum)
  { slug: 'kathedrale', path: '/artikel/kathedrale', form: 'artikel', themen: ['schwelle-wandlung', 'geist-freiheit'], jahr: 2008, veroeffentlichtIn: 'Das Goetheanum', veroeffentlichtAm: '14. März 2008' },
  { slug: 'krankenhaus', path: '/artikel/krankenhaus', form: 'artikel', themen: ['schwelle-wandlung'], jahr: 2008, veroeffentlichtIn: 'Das Goetheanum', veroeffentlichtAm: '15. Februar 2008' },
  { slug: 'schule', path: '/artikel/schule', form: 'artikel', themen: ['schwelle-wandlung', 'alltag-bewusstsein'], jahr: 2008, veroeffentlichtIn: 'Das Goetheanum', veroeffentlichtAm: '29. Februar 2008' },
];

/* ────────────────────────────────────────────────────────────────────────
 * Hilfen
 * ──────────────────────────────────────────────────────────────────────── */

async function fetchHtml(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`${res.status} for ${path}`);
  return await res.text();
}

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&shy;/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&hellip;/g, '…')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&bdquo;/g, '„')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rsquo;/g, '’')
    .replace(/&quot;/g, '"')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#160;/g, ' ')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8222;/g, '„');
}

function extractBodytext(html) {
  // Wir holen alle <p>/<h2>/<h3>-Blöcke aus <main> und markieren zusätzlich,
  // ob VOR diesem Block ein leeres <div></div> stand — das nutzt TYPO3 als
  // Strophen-/Abschnittsmarkierung.
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (!mainMatch) return null;
  const main = mainMatch[1];

  const positions = [];
  const blockRe = /<(p|h2|h3)[^>]*>([\s\S]*?)<\/\1>/g;
  let m;
  while ((m = blockRe.exec(main))) {
    positions.push({ start: m.index, end: blockRe.lastIndex, tag: m[1], inner: m[2] });
  }

  const parts = [];
  for (let i = 0; i < positions.length; i++) {
    const cur = positions[i];
    const gapStart = i === 0 ? 0 : positions[i - 1].end;
    const gap = main.slice(gapStart, cur.start);
    // Mehrere leere <div></div> zwischen Blöcken zählen wir
    const emptyDivCount = (gap.match(/<div[^>]*>\s*<\/div>/g) || []).length;

    let inner = cur.inner;
    inner = inner.replace(/<br\s*\/?>/g, '\n');
    inner = inner.replace(/<(em|i)>/g, '_').replace(/<\/(em|i)>/g, '_');
    inner = inner.replace(/<(strong|b)>/g, '**').replace(/<\/(strong|b)>/g, '**');
    inner = inner.replace(/<[^>]+>/g, '');
    inner = decodeEntities(inner).trim();
    if (!inner) continue;

    parts.push({
      kind: cur.tag,
      text: inner,
      breakBefore: emptyDivCount, // 0 = direkt anschließend, ≥1 = Abschnitts-/Strophenbruch
    });
  }
  return parts;
}

function detectTitleAndDate(parts) {
  // Bei Gedichten ist die erste <p>-Zeile häufig der Titel in Caps,
  // und die letzte Zeile ist häufig ein Datum.
  // Wir liefern nur die Heuristik zurück; das eigentliche Parsing
  // erfolgt im Aufrufer.
  if (!parts || !parts.length) return { dateGuess: null };
  const last = parts[parts.length - 1].text.trim();
  const dateRe = /^(?:\d{1,2}\.\s*(?:\d{1,2}\.|[A-Za-zäöü]+)\s*\d{4}|[A-Za-zäöü]+\s+\d{4}|\d{1,2}\.\d{1,2}\.\d{4}|\d{4})$/;
  if (dateRe.test(last)) {
    return { dateGuess: last };
  }
  return { dateGuess: null };
}

function escapeYaml(s) {
  if (s == null) return '';
  // einfache, sichere Quotierung
  if (/[:\-\#\?\!\&\*\|\>\'\"\%\@\`]|^\s|\s$/.test(s)) {
    return `"${s.replace(/"/g, '\\"')}"`;
  }
  return s;
}

function ofTitle(slug, parts) {
  // Häufig steht der Titel als ALLCAPS-erste Zeile im Body (Gedichte).
  // Fallback: aus Slug ableiten.
  if (parts && parts.length) {
    const first = parts[0].text.trim();
    if (first && first.length <= 60 && !/[.,;]/.test(first) && /^[\p{Lu}\sÄÖÜ\-–'’]+$/u.test(first)) {
      return { title: titleCase(first), parts: parts.slice(1) };
    }
    if (first && first.length <= 60 && !first.includes('\n')) {
      // Auch normale Titelzeilen (Mixed Case kurz) akzeptieren
      if (parts.length >= 2 && parts[0].kind === 'p' && parts[1].kind === 'p') {
        return { title: titleCase(first), parts: parts.slice(1) };
      }
    }
  }
  return { title: titleFromSlug(slug), parts };
}

function titleCase(s) {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) =>
      // Kleinschreibung typischer Funktionswörter, außer am Anfang
      i > 0 && /^(der|die|das|den|dem|des|ein|eine|einer|eines|einem|und|oder|aber|in|im|am|an|auf|aus|bei|mit|zu|zur|zum|von|vom|für|über|unter|wie|als|ob|wenn|wo)$/i.test(w)
        ? w
        : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(' ');
}

function titleFromSlug(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const dateMonthMap = {
  januar: '01', februar: '02', märz: '03', maerz: '03', april: '04', mai: '05', juni: '06',
  juli: '07', august: '08', september: '09', oktober: '10', november: '11', dezember: '12',
  jan: '01', feb: '02', mar: '03', apr: '04', jun: '06', jul: '07', aug: '08',
  sep: '09', okt: '10', nov: '11', dez: '12',
};

function parseDate(s) {
  if (!s) return null;
  // strip leading/trailing markdown emphasis und Klammern
  const t = s.trim().replace(/^[_*\(\[\s]+/, '').replace(/[_*\)\]\s]+$/, '').trim();
  // 24. Oktober 2024 / 4. Nov. 2024 / 9. Feb. 2025 / April 2024 / 24.04.2025 / 04. 02. 2024 / 1999
  let m;
  if ((m = t.match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/))) {
    return { iso: `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`, human: t, jahr: +m[3] };
  }
  if ((m = t.match(/^(\d{1,2})\.\s*([A-Za-zäöü]+)\.?\s+(\d{4})$/))) {
    const mon = dateMonthMap[m[2].toLowerCase().replace(/\./g, '')];
    if (mon) return { iso: `${m[3]}-${mon}-${m[1].padStart(2, '0')}`, human: t, jahr: +m[3] };
  }
  if ((m = t.match(/^([A-Za-zäöü]+)\s+(\d{4})$/))) {
    const mon = dateMonthMap[m[1].toLowerCase()];
    if (mon) return { iso: `${m[2]}-${mon}-00`, human: t, jahr: +m[2] };
  }
  if ((m = t.match(/^(\d{4})$/))) {
    return { iso: `${m[1]}-00-00`, human: t, jahr: +m[1] };
  }
  return null;
}

function partsToMarkdown(parts, form) {
  if (form === 'gedicht') {
    // Gedichte: jede <p> = eine Zeile (mit remark-breaks → <br>);
    // Strophen sind durch leere <div></div> im Quelltext markiert (breakBefore ≥ 1).
    let out = '';
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (i === 0) {
        out += p.text;
        continue;
      }
      const sep = p.breakBefore >= 1 ? '\n\n' : '\n';
      out += sep + p.text;
    }
    return out;
  }
  // Prosa: <h2> → "## …", <h3> → "### …", <p> → eigener Absatz.
  return parts
    .map((p) => {
      if (p.kind === 'h2') return `## ${p.text}`;
      if (p.kind === 'h3') return `### ${p.text}`;
      return p.text;
    })
    .join('\n\n');
}

/* ────────────────────────────────────────────────────────────────────────
 * Verarbeitung
 * ──────────────────────────────────────────────────────────────────────── */

async function processOne(entry) {
  const html = await fetchHtml(entry.path);
  const parts = extractBodytext(html);
  if (!parts || !parts.length) {
    console.warn(`[skip] no body for ${entry.path}`);
    return;
  }

  // Titel aus dem <title>-Tag holen (zuverlässiger)
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  let title = titleMatch ? titleMatch[1].replace(/\s*-\s*wortgetreu\.com\s*$/, '').trim() : titleFromSlug(entry.slug);

  // Bei Gedichten: häufig steht der Titel nochmal in Caps oder Fett als erste Zeile.
  // Wir vergleichen titel-normalisiert (klein, ohne **/_) gegen den Buchtitel.
  let bodyParts = parts;
  const normalize = (s) => s.replace(/\*\*|__|_|\*/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  if (entry.form === 'gedicht' && bodyParts.length) {
    const first = bodyParts[0].text.trim();
    const firstNorm = normalize(first);
    const titleNorm = normalize(title);
    if (
      first.length <= 50 &&
      !first.includes('\n') &&
      (firstNorm === titleNorm ||
        first === first.toUpperCase().replace(/[^A-ZÄÖÜ\s\-–'’]/g, first[0]))
    ) {
      bodyParts = bodyParts.slice(1);
    }
  }

  // Asterisken-Strophen: einzelne `*`-Zeilen ([*],[* * *]) → echte Strophen-Brüche.
  // Wir lassen die Zeile als Asterismus-Marker drinnen, wenn das Gedicht
  // bewusst Asterismen setzt (z.B. Transformation). Markdown erlaubt das nicht
  // sauber, daher ersetzen wir mit einer Strophen-Leerzeile.
  if (entry.form === 'gedicht') {
    const cleaned = [];
    for (const p of bodyParts) {
      const t = p.text.trim();
      if (/^[*•✻\s]+$/.test(t) && t.length <= 12) {
        // Strophen-Bruch erzwingen am nächsten Element
        if (cleaned.length > 0) cleaned[cleaned.length - 1].nextBreak = true;
        continue;
      }
      cleaned.push(p);
    }
    // breakBefore aus nextBreak des Vorgängers übernehmen
    for (let i = 1; i < cleaned.length; i++) {
      if (cleaned[i - 1].nextBreak) cleaned[i].breakBefore = Math.max(cleaned[i].breakBefore ?? 0, 1);
    }
    bodyParts = cleaned;
  }

  // Datum aus letzter Zeile heraussuchen (nur bei Gedichten)
  let dateInfo = null;
  if (entry.form === 'gedicht' && bodyParts.length) {
    const last = bodyParts[bodyParts.length - 1].text.trim();
    const parsed = parseDate(last);
    if (parsed) {
      dateInfo = parsed;
      bodyParts = bodyParts.slice(0, -1);
    }
  }

  const markdownBody = partsToMarkdown(bodyParts, entry.form);

  // Frontmatter zusammenbauen
  const fm = [];
  fm.push(`title: ${escapeYaml(title)}`);
  fm.push(`form: ${entry.form}`);
  if (entry.themen?.length) {
    fm.push(`themen:`);
    for (const t of entry.themen) fm.push(`  - ${t}`);
  }
  if (dateInfo) {
    fm.push(`datum: ${escapeYaml(dateInfo.human)}`);
    fm.push(`jahr: ${dateInfo.jahr}`);
    fm.push(`sortKey: ${escapeYaml(dateInfo.iso)}`);
  } else if (entry.jahr) {
    fm.push(`jahr: ${entry.jahr}`);
    fm.push(`sortKey: ${escapeYaml(`${entry.jahr}-00-00`)}`);
  }
  if (entry.veroeffentlichtIn) fm.push(`veroeffentlichtIn: ${escapeYaml(entry.veroeffentlichtIn)}`);
  if (entry.veroeffentlichtAm) fm.push(`veroeffentlichtAm: ${escapeYaml(entry.veroeffentlichtAm)}`);

  // "Erschienen in" am Ende eines Artikels finden und in Frontmatter packen
  if (entry.form === 'artikel' && !entry.veroeffentlichtIn) {
    const last = bodyParts[bodyParts.length - 1]?.text ?? '';
    const m = last.match(/Erschienen in der Wochenschrift\s+"([^"]+)"\s+in\s+Heft\s+(\d+\/\d+)\s+am\s+(.+)$/);
    if (m) fm.push(`veroeffentlichtIn: ${escapeYaml(m[1])}`);
  }

  // Erstzeile als Vorschau (für Werk-Listen-Anzeige)
  const erstzeile = bodyParts[0]?.text.split('\n')[0].trim().slice(0, 120);
  if (erstzeile) fm.push(`erstzeile: ${escapeYaml(erstzeile)}`);

  const content = `---\n${fm.join('\n')}\n---\n\n${markdownBody}\n`;
  const out = join(OUT_DIR, `${entry.slug}.md`);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, content, 'utf8');
  console.log(`✓ ${entry.slug}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const e of TEXTE) {
    try {
      await processOne(e);
    } catch (err) {
      console.error(`✗ ${e.slug}: ${err.message}`);
    }
  }
}

main();
