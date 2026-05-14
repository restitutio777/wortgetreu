import { sanityClient } from 'sanity:client';
import imageUrlBuilder from '@sanity/image-url';
import type { Image as SanityImage } from '@sanity/types';

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImage) {
  return builder.image(source);
}

/* ── Werk-Texte ──────────────────────────────────────────────────────── */

export interface Werktext {
  _id: string;
  title: string;
  slug: string;
  form: 'gedicht' | 'essay' | 'artikel' | 'geschichte';
  themen: string[];
  datum?: string;
  jahr?: number;
  sortKey?: string;
  veroeffentlichtIn?: string;
  veroeffentlichtAm?: string;
  intro?: string;
  gedichtBody?: string;
  prosaBody?: any[];
  bild?: SanityImage & { alt?: string };
  erstzeile?: string;
}

const WERKTEXT_PROJECTION = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  form,
  themen,
  datum,
  jahr,
  sortKey,
  veroeffentlichtIn,
  veroeffentlichtAm,
  intro,
  gedichtBody,
  prosaBody,
  bild { ..., asset->{ _id, url, metadata { lqip, dimensions } } }
}`;

export async function getAlleTexte(): Promise<Werktext[]> {
  const query = /* groq */ `
    *[_type == "werktext"] | order(sortKey desc) ${WERKTEXT_PROJECTION}
  `;
  const texte = await sanityClient.fetch<Werktext[]>(query);
  return texte.map(addErstzeile);
}

export async function getTextBySlug(slug: string): Promise<Werktext | null> {
  const query = /* groq */ `
    *[_type == "werktext" && slug.current == $slug][0] ${WERKTEXT_PROJECTION}
  `;
  const t = await sanityClient.fetch<Werktext | null>(query, { slug });
  return t ? addErstzeile(t) : null;
}

function addErstzeile(t: Werktext): Werktext {
  let erstzeile = '';
  if (t.gedichtBody) {
    erstzeile = t.gedichtBody.split('\n').find((l) => l.trim())?.trim() ?? '';
  } else if (t.prosaBody?.length) {
    const firstBlock = t.prosaBody.find((b) => b._type === 'block');
    if (firstBlock?.children?.[0]?.text) {
      erstzeile = firstBlock.children[0].text;
    }
  }
  return { ...t, erstzeile: erstzeile.slice(0, 120) };
}

/* ── Sortierung / Filter ─────────────────────────────────────────────── */

export function getJahr(t: Werktext): number | undefined {
  if (t.jahr) return t.jahr;
  if (t.datum) {
    const m = t.datum.match(/(\d{4})/);
    if (m) return parseInt(m[1], 10);
  }
  return undefined;
}

export function formatDatum(t: Werktext): string | undefined {
  if (t.datum) return t.datum;
  if (t.jahr) return String(t.jahr);
  return undefined;
}

/* ── Singletons ──────────────────────────────────────────────────────── */

export interface SettingsDoc {
  heroBegruessung?: string;
  heroTitelEinleitung?: string;
  heroVerben?: string[];
  heroUntertitel?: string;
  eingangIntro?: string;
  eingangStille?: { lead?: string; texte?: Werktext[] };
  eingangSchwellen?: { lead?: string; texte?: Werktext[] };
  eingangFrisch?: { lead?: string; texte?: Werktext[] };
  leistungen?: string[];
}

export async function getSettings(): Promise<SettingsDoc> {
  const query = /* groq */ `
    *[_id == "settings"][0] {
      heroBegruessung, heroTitelEinleitung, heroVerben, heroUntertitel,
      eingangIntro, leistungen,
      eingangStille { lead, "texte": texte[]->${WERKTEXT_PROJECTION} },
      eingangSchwellen { lead, "texte": texte[]->${WERKTEXT_PROJECTION} },
      eingangFrisch { lead, "texte": texte[]->${WERKTEXT_PROJECTION} }
    }
  `;
  const s = await sanityClient.fetch<SettingsDoc>(query);
  return s ?? {};
}

export interface BuchDoc {
  title?: string;
  untertitel?: string;
  jahr?: number;
  verlag?: string;
  bestellLink?: string;
  lead?: string;
  beschreibung?: any[];
  cover?: SanityImage & { alt?: string };
}

export async function getBuch(): Promise<BuchDoc> {
  return (await sanityClient.fetch<BuchDoc>(/* groq */ `*[_id == "buchPage"][0]`)) ?? {};
}

export interface UeberDoc {
  name?: string;
  byline?: string;
  lead?: string;
  biografie?: any[];
  kontaktEmail?: string;
  portrait?: SanityImage & { alt?: string };
}

export async function getUeber(): Promise<UeberDoc> {
  return (await sanityClient.fetch<UeberDoc>(/* groq */ `*[_id == "ueberPage"][0]`)) ?? {};
}

/* ── Static Labels (matchen das Schema) ─────────────────────────────── */

export const themaInfo: Record<string, { label: string; untertitel: string }> = {
  'schwelle-wandlung': {
    label: 'Schwelle & Wandlung',
    untertitel: 'Übergänge, Krankheit, Tod, Geburt, Transformation.',
  },
  'licht-stille': {
    label: 'Licht & Stille',
    untertitel: 'Schweigen, Lichtmess, das Unsagbare zwischen den Zeilen.',
  },
  'natur-erde': {
    label: 'Natur & Erde',
    untertitel: 'Bäume, Wasser, Stein. Die Welt, die uns trägt.',
  },
  'liebe-verbundenheit': {
    label: 'Liebe & Verbundenheit',
    untertitel: 'Freundschaft, Begegnung, das Tragende zwischen Menschen.',
  },
  'geist-freiheit': {
    label: 'Geist & Freiheit',
    untertitel: 'Denken, Glaube, Wort, das Schöpferische im Menschen.',
  },
  'alltag-bewusstsein': {
    label: 'Alltag & Bewusstsein',
    untertitel: 'Wachsein im Gewöhnlichen. Erinnerungen, Reflexion, Geistesgegenwart.',
  },
};

export const formInfo: Record<string, { label: string; pluralLabel: string }> = {
  gedicht: { label: 'Gedicht', pluralLabel: 'Gedichte' },
  essay: { label: 'Essay', pluralLabel: 'Essays' },
  artikel: { label: 'Artikel', pluralLabel: 'Artikel' },
  geschichte: { label: 'Geschichte', pluralLabel: 'Geschichten' },
};
