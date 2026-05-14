import { defineType, defineField } from 'sanity';
import { BookIcon } from '@sanity/icons';

export const buchPage = defineType({
  name: 'buchPage',
  title: 'Buch',
  type: 'document',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Titel des Buches',
      type: 'string',
      initialValue: 'Leuchtspuren',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'untertitel',
      title: 'Untertitel',
      type: 'string',
      initialValue: 'Eigenwege in die Zukunft',
    }),
    defineField({
      name: 'jahr',
      title: 'Erscheinungsjahr',
      type: 'number',
      initialValue: 2020,
    }),
    defineField({
      name: 'verlag',
      title: 'Verlag',
      type: 'string',
      initialValue: 'tredition',
    }),
    defineField({
      name: 'bestellLink',
      title: 'Bestell-Link',
      description: 'Die URL beim Verlag, wo Leser das Buch bestellen können.',
      type: 'url',
      initialValue: 'https://tredition.de/autoren/katharina-offenborn-31976/',
    }),
    defineField({
      name: 'lead',
      title: 'Kurze Einleitung',
      description: 'Ein bis zwei Sätze, die das Buch beschreiben (erscheinen in Kursiv oben).',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'beschreibung',
      title: 'Über das Buch',
      description: 'Die längere Beschreibung des Buches.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Absatz', value: 'normal' },
            { title: 'Zwischentitel', value: 'h2' },
          ],
          marks: {
            decorators: [
              { title: 'Kursiv', value: 'em' },
              { title: 'Fett', value: 'strong' },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'cover',
      title: 'Buchcover',
      description: 'Optional. Bild des Buchcovers.',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Bildbeschreibung',
          type: 'string',
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Buch — Leuchtspuren' }),
  },
});
