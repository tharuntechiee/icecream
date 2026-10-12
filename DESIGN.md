---
name: ChillCrate
description: Bulk ice cream, ice and event service, set as a letterpress Indian wedding invitation on indigo board with gold foil and vermilion.
colors:
  indigo-board: "#10173a"
  indigo-board-raise: "#161f4a"
  indigo-board-sunk: "#0b1130"
  gold-foil: "#d4b057"
  gold-foil-soft: "rgba(212, 176, 87, 0.42)"
  gold-foil-faint: "rgba(212, 176, 87, 0.16)"
  ivory-ink: "#f4efe4"
  lavender-ink-soft: "#cdc8f2"
  lavender-ink-mute: "#a49fe6"
  vermilion: "#d63b1f"
  vermilion-hover: "#b62e15"
  on-vermilion: "#ffffff"
  ok: "#8fcf9a"
  warn: "#f0b27a"
  err: "#ff9b85"
  whatsapp-green: "#25d366"
  light-ivory-board: "#f6f1e6"
  light-ivory-board-raise: "#fffdf7"
  light-ivory-board-sunk: "#ece5d4"
  light-antique-foil: "#8a6210"
  light-antique-foil-soft: "rgba(138, 98, 16, 0.45)"
  light-antique-foil-faint: "rgba(138, 98, 16, 0.14)"
  light-indigo-ink: "#10173a"
  light-indigo-ink-soft: "#2e3558"
  light-indigo-ink-mute: "#565c78"
  light-vermilion: "#c0331a"
  light-vermilion-hover: "#a82a13"
  light-ok: "#1f7a36"
  light-warn: "#9a4d00"
  light-err: "#a82a13"
typography:
  display:
    fontFamily: "'Yatra One', Hind, serif"
    fontSize: "clamp(2.4rem, 1.4rem + 4.4vw, 4.75rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "0"
  invitation-display:
    fontFamily: "'Yatra One', Hind, serif"
    fontSize: "clamp(2.2rem, 1.1rem + 3.4vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.08
  headline:
    fontFamily: "'Yatra One', Hind, serif"
    fontSize: "clamp(1.8rem, 1.2rem + 2.4vw, 2.9rem)"
    fontWeight: 400
    lineHeight: 1.08
  title:
    fontFamily: "'Yatra One', Hind, serif"
    fontSize: "1.45rem"
    fontWeight: 400
    lineHeight: 1.08
  figure:
    fontFamily: "'Yatra One', serif"
    fontSize: "clamp(2rem, 1.4rem + 2.6vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.05
    fontFeature: "'tnum' 1, 'lnum' 1"
  field-value:
    fontFamily: "'Yatra One', serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.25
  body:
    fontFamily: "Hind, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  lead:
    fontFamily: "Hind, system-ui, sans-serif"
    fontSize: "1.12rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Hind, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 600
    letterSpacing: "0.16em"
  button:
    fontFamily: "Hind, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.02em"
rounded:
  none: "0px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "22px"
  lg: "40px"
  gutter: "20px"
  band: "72px"
  band-wide: "104px"
components:
  button-primary:
    backgroundColor: "{colors.vermilion}"
    textColor: "{colors.on-vermilion}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "12px 28px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.vermilion-hover}"
  button-foil:
    backgroundColor: "transparent"
    textColor: "{colors.gold-foil}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "12px 28px"
    height: "52px"
  button-foil-hover:
    backgroundColor: "{colors.gold-foil}"
    textColor: "{colors.indigo-board}"
  button-small:
    padding: "8px 18px"
    height: "42px"
  input-field:
    backgroundColor: "{colors.indigo-board-raise}"
    textColor: "{colors.ivory-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "10px 12px"
    height: "48px"
  invitation-field:
    backgroundColor: "transparent"
    textColor: "{colors.ivory-ink}"
    typography: "{typography.field-value}"
    rounded: "{rounded.none}"
    padding: "14px 12px 12px"
    height: "44px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.lavender-ink-soft}"
    rounded: "{rounded.none}"
    padding: "6px 14px"
    height: "40px"
  chip-selected:
    backgroundColor: "{colors.gold-foil}"
    textColor: "{colors.indigo-board}"
  place-card:
    backgroundColor: "{colors.indigo-board-raise}"
    textColor: "{colors.ivory-ink}"
    rounded: "{rounded.none}"
    padding: "22px 20px 20px"
  frame-card:
    backgroundColor: "{colors.indigo-board-raise}"
    textColor: "{colors.ivory-ink}"
    rounded: "{rounded.none}"
    padding: "40px 22px 32px"
  seal:
    backgroundColor: "{colors.indigo-board}"
    textColor: "{colors.gold-foil}"
    rounded: "{rounded.none}"
    padding: "2px 10px"
  nav-link:
    textColor: "{colors.lavender-ink-soft}"
    padding: "6px 0"
  nav-link-active:
    textColor: "{colors.gold-foil}"
  quote-link:
    backgroundColor: "transparent"
    textColor: "{colors.gold-foil}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "44px"
  fab-quote:
    backgroundColor: "{colors.vermilion}"
    textColor: "{colors.on-vermilion}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "54px"
  fab-whatsapp:
    backgroundColor: "{colors.whatsapp-green}"
    rounded: "{rounded.none}"
    size: "54px"
---

# Design System: ChillCrate

## Overview

**Creative North Star: "The Shaadi Card"**

Every surface is a letterpress Indian wedding invitation. The page ground is indigo board; line work, labels and figures are stamped in gold foil; lettering is ivory; and one colour, vermilion, is reserved for the action that sends the card. In light mode the same card is printed on ivory stock with antique-gold foil and indigo ink. The quote form is the invitation itself (event, date, venue and guests are written into foil-ruled fields), and the answer comes back as the matching menu card: servings, lines and a double-ruled total.

Density follows the stationery. Public pages are centred and generous, organised by hairline foil rules, never by boxes with shadows. Catalogue, product, quote and admin pages are tighter and lean on ruled rows (programme, tariff, rates, menu lines, data tables), so the same world serves both persuasion and the working order. Depth comes from foil lines and three tones of board, never from drawn shadows; corners are always square; ornament is limited to a small set of drawn devices (the double frame, the diamond-centred rule, corner marks, seals and diamond bullets).

Motion is a single authored gesture: on the invitation, the four foil corners and the field rule draw themselves in once, and changing figures settle with a short blur-in. Everything else changes colour only. Reduced-motion users get no animation at all.

**Key Characteristics:**
- Indigo board by default, ivory card stock in light mode, switched by a theme toggle.
- Gold foil for every line, label and figure; vermilion only for the action.
- Yatra One for display lettering and figures; Hind for text, labels and controls.
- Square corners everywhere; no shadows; depth by foil rules and board tone.
- Double-ruled foil frames, diamond-centred rules, corner marks and seals as the ornament vocabulary.
- Product imagery is monoline line art filled with the theme's foil.
- Placeholder proof is labelled as illustrative in a dashed foil tag.

## Colors

A three-ink letterpress palette: indigo board, gold foil and vermilion, with ivory lettering and lavender-tinted secondary text. Each role is a CSS custom property with a dark value (default) and a light value under `[data-theme="light"]`.

### Primary
- **Gold Foil** (#d4b057 dark / Antique Foil #8a6210 light): the world's line work. Frames, rules, corner marks, field underlines, labels, prices, totals, selected chips, the brand wordmark, focus rings, chevrons and checkbox strokes. The light value is deepened so foil can carry text on ivory.
- **Foil Soft** (rgba 0.42 dark / 0.45 light): the outer ring of the double frame, card borders at rest, nav and section hairlines.
- **Foil Faint** (rgba 0.16 dark / 0.14 light): row dividers inside lists and tables, selected-option washes, stepper hover.

### Secondary
- **Vermilion** (#d63b1f dark / #c0331a light, hover #b62e15 / #a82a13): the single action colour. Primary buttons, the floating "Get bulk quote", the "new" status pill, the store marker on the delivery map, and the text caret. White lettering on it.

### Neutral
- **Indigo Board** (#10173a dark / Ivory Board #f6f1e6 light): page ground and header.
- **Board Raise** (#161f4a / #fffdf7): a card set on the board. Frames, place cards, inputs, toasts.
- **Board Sunk** (#0b1130 / #ece5d4): recessed bands, the admin ground, scrollbar track.
- **Ivory Ink** (#f4efe4 dark / Indigo Ink #10173a light): headings and primary text.
- **Ink Soft** (#cdc8f2 / #2e3558): body copy, ledes, nav links, table cells. Tinted toward the indigo ground rather than gray.
- **Ink Mute** (#a49fe6 / #565c78): meta text, placeholders, units, spec terms, illustrative tags.

### Status
- **Ok / Warn / Err** (dark #8fcf9a / #f0b27a / #ff9b85; light #1f7a36 / #9a4d00 / #a82a13): notices, form errors, low-stock inputs and admin status pills, each paired with a 7 to 10 percent tinted background.
- **WhatsApp Green** (#25d366): only the floating WhatsApp button, as the channel's own mark.

### Named Rules
**The One Vermilion Rule.** Vermilion marks the action that sends or starts a quote, and nothing decorative. If a screen has two vermilion buttons competing, one of them is a foil button.

**The Foil Carries Structure Rule.** Every line, rule, frame and label is foil at one of three strengths (full, soft, faint). Gray hairlines do not exist in this world.

**The Tinted Secondary Rule.** Secondary text is ink-soft or ink-mute, tinted toward the indigo; never a neutral gray.

## Typography

**Display Font:** Yatra One (with Hind, serif), self-hosted at 400
**Body Font:** Hind (with system-ui, sans-serif), self-hosted at 400, 500 and 600

**Character:** Yatra One is a Devanagari-rooted display face with the brushed, celebratory weight of invitation lettering; it carries headings, field values, prices and totals. Hind is a calm, legible Indian sans for everything read rather than admired.

### Hierarchy
- **Display** (400, clamp(2.4rem, 1.4rem + 4.4vw, 4.75rem), 1.08): page h1. The invitation card's h1 runs a step smaller (clamp(2.2rem, 1.1rem + 3.4vw, 4rem)) so it sits inside the frame; its second line is set in foil.
- **Headline** (400, clamp(1.8rem, 1.2rem + 2.4vw, 2.9rem), 1.08): section h2, centred over a diamond rule.
- **Title** (400, 1.45rem; 1.55 to 1.8rem on place cards, programme and tariff rows): h3 and card titles.
- **Figure** (Yatra One 400, clamp(2rem, 1.4rem + 2.6vw, 3rem), 1.05, foil): estimates, totals and servings. The menu-card servings figure scales to clamp(3.2rem, 2rem + 5vw, 5.5rem).
- **Field value** (Yatra One 400, 1.25rem, scaling to clamp(1.15rem, .5rem + 1.3vw, 1.85rem) from 640px): what the visitor writes into the invitation.
- **Body** (Hind 400, 17px, 1.55): running text; ledes at 1.12 to 1.25rem in ink-soft, held to about 34 to 38em.
- **Label** (Hind 600, 0.78rem, 0.16em tracking, uppercase, foil): field labels, table heads, footer column heads, programme times. Seals and status pills use the same voice at 0.72rem.
- **Button** (Hind 600, 1rem, 0.02em).

### Named Rules
**The Lettering Rule.** Yatra One is set at weight 400 with zero tracking, for headings, written field values and money only. Never for body text, labels or buttons.

**The Tabular Figures Rule.** Prices, totals, quantities and table cells use tabular, lining numerals so columns of rupees align.

**The No Kicker Rule.** Uppercase foil labels name a field, a column or a time; they never sit above a heading as an eyebrow. Headings open on their own, or on a diamond rule.

## Layout

A centred, single-column stationery layout inside a 1240px container with 20px gutters; narrow content (the invitation, programme, FAQ) holds to 760 to 880px. Sections are bands of 72px vertical padding, 104px from 960px; recessed bands switch to board-sunk between faint foil rules. Section heads are centred: headline, diamond rule, then an ink-soft paragraph.

Breakpoints are 640px and 960px, with a header-specific step at 1100px (the seven-link nav stays in a drawer below it). Below 640px everything stacks: invitation fields go two by two, actions stack full-width, data tables become labelled stacks. At 640px the invitation fields become one row of four (1fr 1.25fr 1.35fr .75fr), catalogue and figures go to two columns, forms to two. At 960px place cards go to three columns, product and calculator pages split into a framed card beside the order panel (the menu card sticks at 100px), and admin gains a 240px sticky sidebar.

Internal rhythm sits on a small set of steps (8, 12, 14, 18, 22, 28, 40px). Cards pad at 22px on phones and 36 to 72px on wide screens. The page bottom leaves 120px under the footer for the floating actions.

## Elevation & Depth

The world is flat. There are no drawn shadows. Depth is conveyed by three board tones (sunk, board, raise) and by foil line weight: a raised card is board-raise inside a foil border; a principal card adds the second, offset ring of the double frame. The only `box-shadow` in the system is a 1px inset of foil used to thicken a stroke to 2px for focus and selection, which reads as a heavier rule, not elevation.

### Named Rules
**The Letterpress Rule.** Paper does not float. Nothing casts a shadow, glows or blurs behind glass; importance is shown by a heavier or doubled foil line.

## Shapes

Square letterpress corners (0px) on every button, field, card, chip, pill, toast and table. Borders are foil hairlines: 1px for cards, chips and fields, 1.5px for the primary frame, corner marks, foil buttons and checkbox squares. The recurring geometry is the diamond: the 12px foil diamond centred in a rule, rotated-square bullets and the selected-rate marker, the diamond store key on the map, and the 45-degree seal mark on the thank-you page. Dashed foil borders mean "placeholder or empty" (illustrative tags, empty states, the quote-empty card).

### Named Rules
**The Square Corner Rule.** Radius is zero. No pills, no rounded cards, no circular buttons.

**The Double Frame Rule.** A principal card (the invitation, menu card, product label and order panel, calculator, form card, RSVP close) is a 1.5px foil border with a 1px soft-foil outline offset 7px. Repeated items (place cards, figures, KPIs) take a single soft-foil border instead. Corner marks belong to the invitation alone.

## Components

### Buttons
Stamped, square and confident.
- **Shape:** square corners (0px), 52px minimum height, 1.5px border.
- **Primary (vermilion):** vermilion fill, white Hind 600 lettering, 12px 28px padding. Hover deepens to vermilion-hover over 0.2s with an out-expo ease (cubic-bezier(.16,1,.3,1)).
- **Foil (secondary):** transparent with foil border and foil lettering; on hover it fills with foil and the lettering turns to board.
- **Small:** 42px high, 8px 18px padding.
- **Text link button:** foil, 600, underlined.
- **Focus:** 2px foil outline at 3px offset, shared by every focusable element. Disabled drops to 45 percent opacity.

### Chips
- **Style:** transparent, 1px soft-foil border, ink-soft text, 40px high, square.
- **State:** selected (pressed or checked) fills with foil and turns the text to board.

### Cards / Containers
- **Corner Style:** square (0px).
- **Background:** board-raise.
- **Shadow Strategy:** none; see Elevation & Depth.
- **Border:** place cards and plain cards use a 1px soft-foil border that strengthens to full foil on hover; principal cards (invitation, menu card, product label and order panel, calculator, form card, RSVP close) use the double frame.
- **Internal Padding:** 22px on phones, up to 40 to 72px on wide screens.
- **Seal:** a small square label on the card's top edge (board ground, foil border and lettering, 0.72rem uppercase), translated half out of the card.

### Inputs / Fields
- **Style:** board-raise fill, 1px soft-foil border, square, 48px minimum height, ink text, ink-mute placeholder. Selects replace the native arrow with a drawn foil chevron (re-coloured for light mode); checkboxes are a 20px foil-stroked square that fills with foil inside a 3px board inset when checked.
- **Focus:** border turns full foil with a 1px inset foil line.
- **Error:** an err-bordered, err-tinted block listing the problems; warn and ok notices follow the same form.
- **Written date:** the native date input sits invisibly over a written date face, so the chosen date reads as lettering (Yatra One inside the invitation, Hind with a foil calendar icon in forms) while the native picker still opens.

### Navigation
- **Header:** sticky, board ground, a single soft-foil hairline beneath; foil Yatra One wordmark at 1.7rem; 68px high, 76px from 960px.
- **Links:** ink-soft Hind; hover to ink; the current page is foil with a foil underline. Below 1100px the links move to a drawer under the header, divided by faint foil rules.
- **Tools:** 44px square icon buttons (theme toggle, menu) with a soft-foil border, and a foil-outlined quote link carrying a foil count badge.

### The Invitation Field Row (signature)
A foil-ruled grid of four fields set between full-foil top and bottom rules and divided by faint rules. Each field is a foil label over a borderless value written in Yatra One; hover shows a dashed soft-foil underline, focus a solid foil one. Below it, a live estimate line in figure type, then the actions.

### Ruled Rows (signature)
Lists read like stationery, not cards: a full-foil top rule, then rows separated by faint rules.
- **Programme:** a foil label column (the "when") beside a title and ink-soft line, like the order of functions on an invitation.
- **Tariff rows:** package title, a foil "from" price in Yatra One with an ink-mute unit, and diamond-marked inclusions.
- **Rates and data tables:** foil uppercase heads over a full-foil rule, faint row rules, right-aligned tabular numbers; the active tier is ink 600 with a foil diamond; totals close on a 3px double foil rule.
- **Menu card lines:** item and ink-mute detail on the left, amount on the right, optional lines at 62 percent until switched on, closing on the double-ruled total.

### Line Art
Product and facility illustrations are monoline drawings applied as a CSS mask over a foil fill, so they recolour with the theme. They sit at 4:3 inside cards, rows and the quote cart.

### Floating Actions
Fixed bottom right on every page: a 54px WhatsApp square in the channel's green and a 54px vermilion "Get bulk quote" bar, both square with a 2px board border so they separate from content without a shadow.

### Motion
One authored motion. On the invitation, the four corner marks scale in from 2.2x with a staggered 0.08s delay and the field rule unclips from the centre (0.9 to 1s, cubic-bezier(.16,1,.3,1)), once. Changing figures settle from 35 percent opacity and a 3px blur over 0.5s. Toasts rise 12px and fade in over 0.25s. Under `prefers-reduced-motion: reduce`, all animation and transition is removed.

## Do's and Don'ts

### Do:
- **Do** draw every line in foil at full, soft or faint strength, and use board tone for depth.
- **Do** keep vermilion for the one action that sends or starts a quote; secondary actions are foil buttons.
- **Do** set headings, written field values and money in Yatra One 400; everything else in Hind.
- **Do** use tabular, lining numerals for prices, quantities and table cells.
- **Do** set principal cards in the double foil frame (1.5px border, 1px soft outline at 7px offset) and repeated items in a single soft-foil border.
- **Do** open sections with a centred headline over the diamond-centred rule.
- **Do** draw icons as stroked SVG (1.75px, round caps) in currentColor or foil.
- **Do** show product imagery as foil-filled line art until real photography exists.
- **Do** label every placeholder testimonial, client, statistic or photo with the dashed illustrative tag.
- **Do** keep every touch target at 44px or larger and respect reduced motion.

### Don't:
- **Don't** round corners or use pills; radius is 0px.
- **Don't** draw shadows, glows, glass or backdrop blur.
- **Don't** put an uppercase eyebrow or kicker above a heading.
- **Don't** use gradient text or gradient fills.
- **Don't** use gray for secondary text; use ink-soft or ink-mute.
- **Don't** use vermilion for decoration, borders or emphasis in body copy.
- **Don't** use Unicode glyphs or emoji as icons.
- **Don't** add new motion; the invitation draw-in and the figure settle are the only authored animations.
- **Don't** present placeholder proof as real.
