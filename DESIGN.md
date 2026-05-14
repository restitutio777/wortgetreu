# Design

## Visual Theme

Eine ruhige, warme Druckwerkstatt im Netz. Off-White-Papier, dunkle Sepia-Tinte, keine Effekte. Die Seite fühlt sich an wie eine sorgfältig gesetzte Erstausgabe, die man in beiden Händen hält. Der Raum um den Text ist wichtiger als die Dekoration auf dem Text.

Bezug: literarisch-editorial (Paris Review, Aeon long reads, Granta), aber stiller und weniger urban. Nähe zu klassischer deutscher Buchsetzung der 1960er–80er Jahre (Insel-Bücherei, Suhrkamp BS).

## Color

**Strategie:** Restrained. Eine warm-getönte Off-White- und Sepia-Palette, plus ein einziger sehr zurückhaltender Akzent für Datierung und Auszeichnung. Niemals `#fff`, niemals `#000`. Alle Neutralen leicht zur warmen Achse getönt.

| Rolle | OKLCH | Notiz |
|---|---|---|
| `paper` (Hintergrund) | `oklch(97.5% 0.006 75)` | Warm-cremiges Papierweiß |
| `paper-sunk` (sanft tiefer) | `oklch(95% 0.008 75)` | Für Listen-Hintergründe wenn nötig |
| `ink` (Fließtext) | `oklch(24% 0.015 60)` | Dunkles Sepia statt schwarz |
| `ink-soft` (Sekundär) | `oklch(45% 0.012 60)` | Metadaten, Datum, Autorname |
| `ink-faint` (Tertiär) | `oklch(70% 0.008 60)` | Linien, Hintergrunds-Hairlines |
| `rule` (Trennlinien) | `oklch(85% 0.008 75)` | Sanfte Warm-Grau-Linien |
| `accent` (sparsam) | `oklch(48% 0.085 45)` | Gedämpfte Sienna, nur für Datum-Asterismen, Lese-Marker. Niemals als Block. |
| `focus` | `oklch(60% 0.12 55)` | Sichtbar aber warm, nicht knallig blau |

Kontrast: `ink` auf `paper` ergibt ≥ 11:1. `ink-soft` auf `paper` ≥ 7:1. `ink-faint` ist nur für nicht-essentielle Linien.

## Theme Decision

Lesende sitzen abends mit dem Smartphone im Bett oder mittags am Küchentisch mit aufgeschlagenem Laptop. Sie suchen Atem, nicht Aufmerksamkeit. Helles, papier-warmes Layout — kein Dark Mode als Default. Dark Mode kann später optional kommen, ist aber kein Designziel.

## Typography

**Strategie:** Eine klassische Renaissance-Antiqua trägt fast die ganze Seite. Sehr selten kommt eine humanistische Sans für Mikro-Meta (Datum, Filter-Labels). Hierarchie über Optical Sizing, Größe und Weight — nicht über Farbe.

| Familie | Verwendung | Bezug |
|---|---|---|
| **EB Garamond** (Body, Italic, Bold) | Lyrik-Body, Essay-Body, Artikel-Body, Geschichten-Body. Auch Headings im Display-Cut. | Open source, deutsche Buchsetzungstradition, sehr ausgereifte Kursive für Gedichtformatierung. Optical sizing über Variable Font. |
| **Inter Tight** | Nur Nav-Labels, Filter-Buttons, Metadaten („Veröffentlicht in", „17. März 2024"), Footer-Links. Klein, gesetzt mit `letter-spacing: 0.04em`. | Neutrale humanistische Sans, ergänzt die Garamond ohne sie zu konkurrieren. |

Beide Variable Fonts, selbst gehostet, mit `font-display: swap` und `preload`.

**Scale (modular, Faktor ~1.25):**

| Token | Größe (mobile) | Größe (desktop) | Verwendung |
|---|---|---|---|
| `text-xs` | 13px / 0.81rem | 13px | Meta, Datum, Footer |
| `text-sm` | 15px / 0.94rem | 15px | Filter, Tags, kleine Labels |
| `text-base` | 17px / 1.0625rem | 19px / 1.1875rem | Body (Essays, Artikel) |
| `text-poem` | 19px / 1.1875rem | 22px / 1.375rem | Gedicht-Body, etwas größer als Prosa |
| `text-lg` | 22px | 26px | Intro-Absätze, "Lead" |
| `text-xl` | 28px | 36px | H2 in Artikeln |
| `text-2xl` | 36px | 52px | H1 Texttitel |
| `text-display` | 48px | 72–88px | Startseite-Titel, sehr selten |

**Line-Height:**
- Body Prosa: 1.65
- Lyrik: 1.45 (enger gesetzt, Strophe ist Block)
- Headings: 1.15

**Zeilenlänge:** Body kappen auf ~62ch (Prosa), Lyrik freier (zentriert wenn Original es vorsieht, sonst linksbündig mit hanging indent für Umbruch).

**Italic für Gedichtformatierung:** Manche Gedichte haben emphasis durch GROSSBUCHSTABEN (`DU BIST`, `ICH BIN`). Das bleibt im Original, kein letter-tracking ändern.

## Layout

**Grid:** Kein 12-Spalten-Grid im klassischen Sinn. Stattdessen ein einziger Lese-Pfad in der Mitte mit ruhigen Marginalien.

- **Mobile (≤640px):** Eine Spalte, 24–32px Außenrand, Text ≤ 65ch.
- **Tablet (641–1024px):** Eine Spalte, größere Außenränder, Text ≤ 62ch.
- **Desktop (≥1025px):** Lesespalte mittig (max ~620px für Prosa, 540px für Lyrik). Sehr breite Marginalien links/rechts. Optional: Datum oder Kapitelmarkierung in der linken Marginalie.

**Rhythmus:** Vertikale Abstände nicht monoton. Section-Übergänge bekommen ~5rem, Absätze in Prosa 1.2em, Strophen-Zwischenräume 1.8em. Asterismus (`* * *`) als optisches Atemzeichen wo passend.

**Cards:** Werden in dieser Seite nicht verwendet. Werk-Liste ist eine vertikale Liste mit Hairline-Trennern, nicht eine Card-Grid.

**Header:** Sehr leise. Logo links als Wortmarke "wortgetreu" in Garamond Italic. Nav rechts als kleine Sans-Labels mit Tracking. Keine Hintergrundfläche, kein Schatten.

**Footer:** Eine schmale, ruhige Zeile mit Impressum, Datenschutz, ©. Optional ein einzelnes Zitat oder Asterismus.

## Components

**Werk-Liste (Archivansicht)**
- Titel in Garamond `text-xl`, links.
- Direkt darunter: Form-Label + Datum in Sans `text-xs`, ink-soft.
- Optional: Erste 1–2 Zeilen als Vorschau in Garamond `text-base`, ink-soft.
- Hairline `rule` zwischen Einträgen.
- Hover: leichter Hintergrund (`paper-sunk`), kein Untertstrich-Wechsel.

**Filter (Form + Klang)**
- Zwei Reihen kleiner Sans-Pills mit Tracking. Active = ink-Hintergrund + paper-Text. Inactive = paper-Hintergrund + ink-soft mit dünnem `rule`-Border.
- Keine Modal-Filter, keine Dropdown-Cascades.

**Gedicht-Seite**
- Titel zentriert oder Original-Position. `text-2xl` Garamond.
- Datum als kleine Sans-Zeile unterhalb des Titels, ink-soft.
- Lyrik-Body in `text-poem`, Originalformatierung (Zentrum/Links nach Vorlage).
- Unter dem Text: schlichte Navigation „Vorheriges Gedicht · Werk · Nächstes Gedicht" in Sans `text-sm`.

**Essay/Artikel-Seite**
- Titel `text-2xl` linksbündig.
- Untertitel/Subtitle als Garamond Italic `text-lg` in ink-soft (wenn vorhanden, z.B. die Goetheanum-Vorbemerkung in fett).
- Kapitel-H2: `text-xl` Garamond mit etwas mehr Top-Margin.
- Body: `text-base`, 1.65 line-height.
- "Erschienen in"-Notiz: Sans `text-xs`, ink-soft, am Ende des Textes.

**Startseite (Schwelle)**
- Sehr großzügig. Drei "Eingänge", jeder mit einem überlieferten Titel + eingeschobenem Sub-Text in Italic. Keine Hintergrund-Boxen, keine Bilder.
- Optionaler "Wandspruch" am oberen Rand — ein Zitat aus einem der Texte, in Garamond Italic `text-display` aber sehr leicht, ink-soft.

## Motion

Sehr reduziert. Keine eintretenden Animationen für Inhalte. Allenfalls:
- Hover auf Werk-Listeneintrag: 200ms `ease-out-quart` Hintergrundübergang.
- Filter-Wechsel: gar keine Animation, instant.
- Seitenwechsel: keine Page-Transitions im ersten Schritt.

`prefers-reduced-motion: reduce` → alle Übergänge auf 0ms.

## Tone / Voice in UI Copy

- Du-Form (Katharina spricht ihre Leser persönlich an, wie aus dem Originaltext "Schön, dass Du auf meine Seite gefunden hast").
- Niemals "Jetzt entdecken", "Mehr erfahren", "Hier klicken". Stattdessen: "Weiterlesen", "Zum Werk", "Übersicht", "Zurück".
- Datumsangaben deutsch: „17. März 2024" oder „2024", nicht „17/03/2024".
- Filter-Labels: konkrete Worte aus der Welt der Texte ("Gedichte", "Essays", "Schwelle & Wandlung"), keine Tech-Generics.
