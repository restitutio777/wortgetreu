import type { StructureResolver } from 'sanity/structure';
import {
  DocumentTextIcon,
  BookIcon,
  UserIcon,
  CogIcon,
} from '@sanity/icons';

const SINGLETONS = ['settings', 'buchPage', 'ueberPage'];

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Inhalte')
    .items([
      // Singletons oben
      S.listItem()
        .title('Startseite & Einstellungen')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('settings')
            .documentId('settings')
            .title('Startseite & Einstellungen'),
        ),

      S.listItem()
        .title('Über mich')
        .icon(UserIcon)
        .child(
          S.document()
            .schemaType('ueberPage')
            .documentId('ueberPage')
            .title('Über mich'),
        ),

      S.listItem()
        .title('Buch — Leuchtspuren')
        .icon(BookIcon)
        .child(
          S.document()
            .schemaType('buchPage')
            .documentId('buchPage')
            .title('Buch — Leuchtspuren'),
        ),

      S.divider(),

      // Texte gruppiert nach Form
      S.listItem()
        .title('Alle Texte')
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title('Texte nach Form')
            .items([
              S.listItem()
                .title('Gedichte')
                .child(
                  S.documentList()
                    .title('Gedichte')
                    .filter('_type == "werktext" && form == "gedicht"')
                    .defaultOrdering([{ field: 'sortKey', direction: 'desc' }]),
                ),
              S.listItem()
                .title('Essays')
                .child(
                  S.documentList()
                    .title('Essays')
                    .filter('_type == "werktext" && form == "essay"')
                    .defaultOrdering([{ field: 'sortKey', direction: 'desc' }]),
                ),
              S.listItem()
                .title('Artikel')
                .child(
                  S.documentList()
                    .title('Artikel')
                    .filter('_type == "werktext" && form == "artikel"')
                    .defaultOrdering([{ field: 'sortKey', direction: 'desc' }]),
                ),
              S.listItem()
                .title('Geschichten')
                .child(
                  S.documentList()
                    .title('Geschichten')
                    .filter('_type == "werktext" && form == "geschichte"')
                    .defaultOrdering([{ field: 'sortKey', direction: 'desc' }]),
                ),
              S.divider(),
              S.listItem()
                .title('Alle Texte (chronologisch)')
                .child(
                  S.documentList()
                    .title('Alle Texte')
                    .filter('_type == "werktext"')
                    .defaultOrdering([{ field: 'sortKey', direction: 'desc' }]),
                ),
            ]),
        ),

      S.divider(),

      // Fallback for any documents not handled above
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId();
        return id !== 'text' && !SINGLETONS.includes(id ?? '');
      }),
    ]);
