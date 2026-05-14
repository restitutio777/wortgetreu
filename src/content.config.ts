import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const themen = [
  'schwelle-wandlung',
  'licht-stille',
  'natur-erde',
  'liebe-verbundenheit',
  'geist-freiheit',
  'alltag-bewusstsein',
] as const;

const formen = ['gedicht', 'essay', 'artikel', 'geschichte'] as const;

export const themaInfo: Record<(typeof themen)[number], { label: string; untertitel: string }> = {
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

export const formInfo: Record<(typeof formen)[number], { label: string; pluralLabel: string }> = {
  gedicht: { label: 'Gedicht', pluralLabel: 'Gedichte' },
  essay: { label: 'Essay', pluralLabel: 'Essays' },
  artikel: { label: 'Artikel', pluralLabel: 'Artikel' },
  geschichte: { label: 'Geschichte', pluralLabel: 'Geschichten' },
};

const texte = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/texte' }),
  schema: z.object({
    title: z.string(),
    form: z.enum(formen),
    themen: z.array(z.enum(themen)).default([]),
    datum: z
      .union([z.string(), z.number()])
      .transform((v) => (typeof v === 'number' ? String(v) : v))
      .optional(),
    jahr: z.number().optional(),
    veroeffentlichtIn: z.string().optional(),
    veroeffentlichtAm: z.string().optional(),
    intro: z.string().optional(),
    erstzeile: z.string().optional(),
    sortKey: z.string().optional(),
  }),
});

export const collections = { texte };
