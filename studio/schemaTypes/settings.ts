import { defineType, defineField } from 'sanity';
import { CogIcon } from '@sanity/icons';

export const settings = defineType({
  name: 'settings',
  title: 'Einstellungen',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'hero', title: 'Startseite – Hero', default: true },
    { name: 'eingange', title: 'Startseite – Drei Eingänge' },
    { name: 'leistungen', title: 'Leistungen' },
    { name: 'rechtliches', title: 'Rechtliches' },
  ],
  fields: [
    /* Hero */
    defineField({
      name: 'heroBegruessung',
      title: 'Begrüßung',
      description: 'Die kurze Begrüßungszeile oben.',
      type: 'string',
      group: 'hero',
      initialValue: 'Schön, dass du hierher gefunden hast.',
    }),
    defineField({
      name: 'heroTitelEinleitung',
      title: 'Titel-Einleitung',
      type: 'string',
      group: 'hero',
      initialValue: 'Lass dich',
    }),
    defineField({
      name: 'heroVerben',
      title: 'Die drei Verben',
      description: 'Drei Verben, die das Versprechen der Seite tragen.',
      type: 'array',
      group: 'hero',
      of: [{ type: 'string' }],
      initialValue: ['berühren', 'ermutigen', 'inspirieren'],
      validation: (r) => r.length(3),
    }),
    defineField({
      name: 'heroUntertitel',
      title: 'Untertitel',
      type: 'string',
      group: 'hero',
      initialValue: 'Lyrik, Essays, Artikel und Geschichten von Katharina Offenborn.',
    }),

    /* Drei Eingänge */
    defineField({
      name: 'eingangIntro',
      title: 'Einleitung zu den Eingängen',
      type: 'string',
      group: 'eingange',
      initialValue: 'Wo möchtest du beginnen?',
    }),
    defineField({
      name: 'eingangStille',
      title: 'Eingang I — Stille',
      type: 'object',
      group: 'eingange',
      fields: [
        defineField({ name: 'lead', title: 'Beschreibung', type: 'text', rows: 3 }),
        defineField({
          name: 'texte',
          title: 'Drei ausgewählte Texte',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'werktext' }] }],
          validation: (r) => r.length(3),
        }),
      ],
    }),
    defineField({
      name: 'eingangSchwellen',
      title: 'Eingang II — Schwellen',
      type: 'object',
      group: 'eingange',
      fields: [
        defineField({ name: 'lead', title: 'Beschreibung', type: 'text', rows: 3 }),
        defineField({
          name: 'texte',
          title: 'Drei ausgewählte Texte',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'werktext' }] }],
          validation: (r) => r.length(3),
        }),
      ],
    }),
    defineField({
      name: 'eingangFrisch',
      title: 'Eingang III — Frisch',
      description:
        'Hier kannst du Texte auswählen, oder die Liste leer lassen — dann zeigt die Seite automatisch die drei jüngsten Texte.',
      type: 'object',
      group: 'eingange',
      fields: [
        defineField({ name: 'lead', title: 'Beschreibung', type: 'text', rows: 3 }),
        defineField({
          name: 'texte',
          title: 'Drei ausgewählte Texte (optional)',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'werktext' }] }],
          validation: (r) => r.max(3),
        }),
      ],
    }),

    /* Services */
    defineField({
      name: 'leistungen',
      title: 'Angebot „Auch im Auftrag"',
      description:
        'Die Liste der Leistungen, die unten auf der Startseite erscheint (Lektorat, Übersetzung, etc.).',
      type: 'array',
      group: 'leistungen',
      of: [{ type: 'string' }],
      initialValue: [
        'Lektorat',
        'Übersetzung',
        'Bucherstellung',
        'Biografien',
        'Chroniken',
        'Transkription',
      ],
    }),

    /* Rechtliches */
    defineField({
      name: 'impressum',
      title: 'Impressum',
      type: 'array',
      group: 'rechtliches',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Absatz', value: 'normal' },
            { title: 'Zwischentitel', value: 'h2' },
          ],
        },
      ],
    }),
    defineField({
      name: 'datenschutz',
      title: 'Datenschutzerklärung',
      type: 'array',
      group: 'rechtliches',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Absatz', value: 'normal' },
            { title: 'Zwischentitel', value: 'h2' },
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Website-Einstellungen' }),
  },
});
