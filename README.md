# wortgetreu.com — Redesign

Editoriales, kontemplatives Redesign der Werk-Website von Katharina Offenborn.
Phase 1: hardcoded statische Version in Astro mit migrierten Inhalten.
Phase 2: Anbindung an Sanity-CMS mit Mehrsprachigkeit.

## Stand

- **49 Texte** migriert (40 Gedichte, 3 Essays, 3 Artikel, 2 Geschichten, 1 Über-Seite)
- **6 thematische Cluster** zugewiesen: Schwelle & Wandlung, Licht & Stille, Natur & Erde, Liebe & Verbundenheit, Geist & Freiheit, Alltag & Bewusstsein
- **Vier Top-Level-Seiten**: Schwelle (Home), Werk, Buch, Über
- **Beidseitiger Filter** im Werk: Form + Thema, client-seitig ohne Page-Reload
- **Responsive**: Mobile-First, Desktop bis 1280px+
- **WCAG AA**: Kontraste ≥ 7:1 für Body, semantisches HTML, Reduced-Motion-respektiert

## Stack

- [Astro 5](https://astro.build) — statisches Site-Generation mit Content Collections
- EB Garamond + Inter Tight via Google Fonts (vor Live-Gang auf selbst gehostet umstellen)
- TypeScript für Schema-Validierung
- Kein Tailwind, kein React, kein Build-JS außer dem Filter-Script
- Vanilla CSS mit OKLCH-Farben und Custom Properties

## Entwicklung

```bash
pnpm install
pnpm dev      # http://localhost:4321
pnpm build    # → dist/
pnpm preview  # Build lokal anschauen
```

## Inhalte neu migrieren

Falls auf wortgetreu.com etwas geändert wurde:

```bash
node scripts/migrate.mjs
```

Das Skript lädt jeden in `scripts/migrate.mjs` aufgelisteten Pfad,
extrahiert den Bodytext und schreibt Markdown nach `src/content/texte/`.
Thematische Klassifikation steckt im Skript-Inventar (manuell zugewiesen).

## Struktur

```
src/
├── content/
│   ├── texte/              # 49 Markdown-Dateien — eine pro Text
│   └── ...
├── content.config.ts       # Schema + Themen-/Form-Definitionen
├── layouts/Base.astro      # HTML-Shell, Fonts, Header/Footer
├── components/
│   ├── SiteHeader.astro
│   ├── SiteFooter.astro
│   ├── TextHeader.astro    # Eyebrow + Titel + Datum/Erschienen
│   └── TextBody.astro      # Form-spezifisches Body-Rendering
├── pages/
│   ├── index.astro         # Schwelle (Startseite)
│   ├── werk/
│   │   ├── index.astro     # Werk-Übersicht mit Filtern
│   │   └── [...slug].astro # Einzeltext
│   ├── ueber.astro
│   ├── buch.astro
│   ├── impressum.astro
│   └── datenschutz.astro
├── styles/
│   ├── tokens.css          # OKLCH-Farben, Typo-Scale, Spacing
│   └── base.css            # Reset + Globals
└── lib/content.ts          # Sort-/Filter-Helfer
```

## Design-System

Siehe [`DESIGN.md`](./DESIGN.md). Kurzfassung:

- **Hintergrund**: warmes Papier `oklch(97.5% 0.006 75)`
- **Fließtext**: dunkles Sepia `oklch(24% 0.015 60)` — kein Schwarz
- **Akzent**: gedämpfte Sienna `oklch(48% 0.085 45)` — nur für Italic-Auszeichnung und Hover
- **Schrift**: EB Garamond (Renaissance-Antiqua) für 95 % des Inhalts, Inter Tight für Mikro-Meta
- **Spalte**: max ~38rem für Prosa, ~32rem für Lyrik
- **Lyrik zentriert**, Prosa linksbündig, mit Optical Sizing

## Strategie

Siehe [`PRODUCT.md`](./PRODUCT.md). Drei Kernprinzipien:

1. **Das Wort bekommt Raum.** Großzügige Margins, keine Cards, keine Sidebars.
2. **Form folgt Form.** Gedicht wird wie Gedicht gesetzt, Artikel wie Artikel.
3. **Erkennbar literarisch, nicht erkennbar spirituell.** Die Spiritualität liegt in den Texten, nicht im Design.

## Phase 2: Sanity-Anbindung

Geplante Schritte:

1. **Sanity-Studio aufsetzen** mit den selben Feldern wie das Astro-Schema (`title`, `form`, `themen[]`, `datum`, `jahr`, `veroeffentlichtIn`, `veroeffentlichtAm`, `intro`, `body`).
2. **Mehrsprachigkeit aktivieren** via Sanity's Document Internationalization Plugin — `body` als Object mit Sprachen-Keys (`de`, `en`, `fr`, `gr`).
3. **Migrations-Script umkehren**: aus den Markdown-Dateien in `src/content/texte/` werden Sanity-Dokumente. Datums-Sortierung, Themen-Tags und veröffentlichten-Felder bleiben erhalten.
4. **Astro-Inhaltsquelle umstellen**: `glob`-Loader durch Sanity-Client-Loader ersetzen. Schema bleibt identisch, Pages müssen nicht geändert werden.
5. **`hreflang`-Tags** im Base-Layout aktivieren, Sprachwechsel im Footer einbauen.
6. **Self-Hosting der Fonts**: EB Garamond + Inter Tight als WOFF2 in `public/fonts/` ablegen, `@font-face` in `tokens.css`, Google Fonts-Link entfernen.

Geschätzter Aufwand: ein bis zwei Arbeitstage, je nach Sanity-Setup.

## Beobachtungen aus der Migration

- Die Original-HTML-Struktur (TYPO3) speichert jede Gedichtzeile als eigenes `<p>` — ohne Strophen-Markierung. Nur in einigen Gedichten (z.B. *Transformation*) sind `*`-Asterismen als Strophenbruch verwendet. Diese werden vom Migrations-Skript erkannt und in echte Leerzeilen umgewandelt.
- Die meisten Gedichte erscheinen so als ein einziger Block ohne Strophen. Im Sanity-Studio später kann die Autorin Strophen explizit setzen.
- Daten in der Form „24. Oktober 2024" oder „April 2024" oder „1999" werden automatisch geparst und als ISO-`sortKey` gespeichert.
- Drei Artikel (*Kathedrale*, *Krankenhaus*, *Schule*) erschienen 2008 in der anthroposophischen Wochenschrift *Das Goetheanum*; die Reihe heißt *Schwellenphänomene* und ist auf der Startseite als „Lesepfad" verlinkt.

## Was noch fehlt vor Live-Gang

- [ ] Selbst gehostete Fonts statt Google Fonts
- [ ] Rechtssicherer Impressum + Datenschutz-Text
- [ ] Echte Kontakt-E-Mail im Über-Bereich
- [ ] Strophen-Brüche in den Gedichten manuell (durch die Autorin) setzen
- [ ] Open-Graph-Bilder pro Texttyp (optional)
- [ ] sitemap.xml + robots.txt
