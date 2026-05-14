import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

export type Text = CollectionEntry<'texte'>;

export async function getAllTexte(): Promise<Text[]> {
  const all = await getCollection('texte');
  return all.sort(byDateDesc);
}

export function byDateDesc(a: Text, b: Text): number {
  const aKey = a.data.sortKey ?? a.data.datum ?? String(a.data.jahr ?? '');
  const bKey = b.data.sortKey ?? b.data.datum ?? String(b.data.jahr ?? '');
  return bKey.localeCompare(aKey);
}

export function getJahr(t: Text): number | undefined {
  if (t.data.jahr) return t.data.jahr;
  if (t.data.datum) {
    const m = t.data.datum.match(/(\d{4})/);
    if (m) return parseInt(m[1], 10);
  }
  return undefined;
}

export function formatDatum(t: Text): string | undefined {
  if (t.data.datum) return t.data.datum;
  if (t.data.jahr) return String(t.data.jahr);
  return undefined;
}
