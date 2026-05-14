import { defineType, defineField } from 'sanity';
import { DocumentTextIcon } from '@sanity/icons';

export const FORM_OPTIONS = [
  { title: 'Gedicht', value: 'gedicht' },
  { title: 'Essay', value: 'essay' },
  { title: 'Artikel', value: 'artikel' },
  { title: 'Geschichte', value: 'geschichte' },
] as const;

export const THEMA_OPTIONS = [
  { title: 'Schwelle & Wandlung', value: 'schwelle-wandlung' },
  { title: 'Licht & Stille', value: 'licht-stille' },
  { title: 'Natur & Erde', value: 'natur-erde' },
  { title: 'Liebe & Verbundenheit', value: 'liebe-verbundenheit' },
  { title: 'Geist & Freiheit', value: 'geist-freiheit' },
  { title: 'Alltag & Bewusstsein', value: 'alltag-bewusstsein' },
] as const;

export const werktext = defineType({
  name: 'werktext',
  title: 'Text',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    { name: 'inhalt', title: 'Inhalt', default: true },
    { name: 'bild', title: 'Bild' },
    { name: 'veroeffentlichung', title: 'Veröffentlichung' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      group: 'inhalt',
      validation: (r) => r.required().max(120),
    }),

    defineField({
      name: 'slug',
      title: 'URL-Pfad',
      description: 'Wird automatisch aus dem Titel gebildet. Du kannst ihn anpassen, wenn nötig.',
      type: 'slug',
      group: 'inhalt',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .replace(/ä/g, 'ae')
            .replace(/ö/g, 'oe')
            .replace(/ü/g, 'ue')
            .replace(/ß/g, 'ss')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            .slice(0, 96),
      },
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'form',
      title: 'Form',
      description: 'Welche Art von Text ist das?',
      type: 'string',
      group: 'inhalt',
      options: {
        list: [...FORM_OPTIONS],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (r) => r.required(),
      initialValue: 'gedicht',
    }),

    defineField({
      name: 'themen',
      title: 'Themen',
      description: 'Wähle ein oder mehrere passende Themen aus.',
      type: 'array',
      group: 'inhalt',
      of: [{ type: 'string' }],
      options: {
        list: [...THEMA_OPTIONS],
      },
      validation: (r) => r.min(0).max(4),
    }),

    /* Lyrik-Body: Text mit Zeilenumbrüchen */
    defineField({
      name: 'gedichtBody',
      title: 'Lyrik',
      description:
        'Jede Zeile in einer eigenen Zeile. Leere Zeilen markieren Strophen-Pausen.',
      type: 'text',
      rows: 14,
      group: 'inhalt',
      hidden: ({ document }) => document?.form !== 'gedicht',
    }),

    /* Prosa-Body: Portable Text mit Absätzen, H2, H3, Italic, Bold */
    defineField({
      name: 'prosaBody',
      title: 'Prosa',
      description:
        'Schreibe deinen Text mit Absätzen. Du kannst Zwischenüberschriften und Hervorhebungen setzen.',
      type: 'array',
      group: 'inhalt',
      hidden: ({ document }) => document?.form === 'gedicht',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Absatz', value: 'normal' },
            { title: 'Zwischentitel', value: 'h2' },
            { title: 'Unter-Zwischentitel', value: 'h3' },
            { title: 'Zitat', value: 'blockquote' },
          ],
          lists: [{ title: 'Liste', value: 'bullet' }],
          marks: {
            decorators: [
              { title: 'Kursiv', value: 'em' },
              { title: 'Fett', value: 'strong' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Verlinkung',
                fields: [
                  defineField({
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (r) => r.required(),
                  }),
                ],
              },
            ],
          },
        },
      ],
    }),

    defineField({
      name: 'intro',
      title: 'Einleitung / Vorbemerkung',
      description:
        'Optional. Bei Goetheanum-Artikeln steht hier die redaktionelle Vorbemerkung in Fett-Kursiv.',
      type: 'text',
      rows: 4,
      group: 'inhalt',
      hidden: ({ document }) => document?.form !== 'artikel',
    }),

    /* Bild */
    defineField({
      name: 'bild',
      title: 'Bild',
      description: 'Thematisches Bild, das den Text begleitet. Optional.',
      type: 'image',
      group: 'bild',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Bildbeschreibung',
          description: 'Kurze Beschreibung des Bildes (für Vorleseprogramme).',
          type: 'string',
        }),
      ],
    }),

    /* Veröffentlichung */
    defineField({
      name: 'datum',
      title: 'Datum',
      description:
        'Wann ist der Text entstanden? Z.B. "24. Oktober 2024" oder "2002". Optional.',
      type: 'string',
      group: 'veroeffentlichung',
    }),

    defineField({
      name: 'jahr',
      title: 'Jahr',
      description: 'Für Sortierung. Wird automatisch aus dem Datum übernommen, kann aber manuell gesetzt werden.',
      type: 'number',
      group: 'veroeffentlichung',
      validation: (r) => r.min(1900).max(2100).integer(),
    }),

    defineField({
      name: 'sortKey',
      title: 'Sortier-Schlüssel',
      description: 'Intern. ISO-Datum für die zeitliche Sortierung.',
      type: 'string',
      group: 'veroeffentlichung',
      readOnly: true,
      hidden: true,
    }),

    defineField({
      name: 'veroeffentlichtIn',
      title: 'Erschienen in',
      description:
        'Falls dieser Text in einer Zeitschrift erschienen ist (z.B. "Das Goetheanum").',
      type: 'string',
      group: 'veroeffentlichung',
    }),

    defineField({
      name: 'veroeffentlichtAm',
      title: 'Erschienen am',
      description: 'Datum der Veröffentlichung, z.B. "14. März 2008".',
      type: 'string',
      group: 'veroeffentlichung',
    }),
  ],

  orderings: [
    {
      title: 'Datum (neueste zuerst)',
      name: 'datumDesc',
      by: [{ field: 'sortKey', direction: 'desc' }],
    },
    {
      title: 'Datum (älteste zuerst)',
      name: 'datumAsc',
      by: [{ field: 'sortKey', direction: 'asc' }],
    },
    {
      title: 'Titel A→Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],

  preview: {
    select: {
      title: 'title',
      form: 'form',
      datum: 'datum',
      jahr: 'jahr',
      bild: 'bild',
    },
    prepare({ title, form, datum, jahr, bild }) {
      const formLabel = FORM_OPTIONS.find((f) => f.value === form)?.title ?? form;
      const datumAnzeige = datum || (jahr ? String(jahr) : '—');
      return {
        title,
        subtitle: `${formLabel} · ${datumAnzeige}`,
        media: bild,
      };
    },
  },
});
