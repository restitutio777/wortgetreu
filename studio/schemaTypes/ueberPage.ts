import { defineType, defineField } from 'sanity';
import { UserIcon } from '@sanity/icons';

export const ueberPage = defineType({
  name: 'ueberPage',
  title: 'Über',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      initialValue: 'Katharina Offenborn',
    }),
    defineField({
      name: 'byline',
      title: 'Untertitel',
      description: 'Z.B. "Wien, 1959 · Schriftstellerin, Lektorin, Übersetzerin"',
      type: 'string',
    }),
    defineField({
      name: 'lead',
      title: 'Erster Absatz (Lead)',
      description: 'Der erste Absatz erscheint größer und in Kursiv.',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'biografie',
      title: 'Biografie',
      description: 'Der Haupttext über dich.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Absatz', value: 'normal' }],
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
                  }),
                ],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'kontaktEmail',
      title: 'Kontakt-E-Mail',
      type: 'string',
    }),
    defineField({
      name: 'portrait',
      title: 'Porträtbild',
      description: 'Optional. Ein Foto von dir.',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Bildbeschreibung', type: 'string' }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Über mich' }),
  },
});
