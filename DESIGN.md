---
name: Bitsocial Forum
description: Discourse's forum structure, themed with bitsocial-web's design elements.
colors:
  protocol-blue: "#1a4fd0"
  electric-blue: "#2563eb"
  silver-bright: "#e5e7eb"
  dark-background: "hsl(0 0% 0%)"
  dark-foreground: "hsl(0 0% 93%)"
  dark-muted-foreground: "hsl(0 0% 68%)"
  dark-border: "hsl(0 0% 27%)"
  light-background: "hsl(0 0% 100%)"
  light-foreground: "hsl(0 0% 10%)"
  light-border: "hsl(0 0% 89.8%)"
typography:
  display: "Exo 600, muted-foreground grey: page headings, labels, controls"
  body: "Manrope 400 to 600: topic titles, posts, descriptions"
  label: "Exo 600, uppercase, 0.18em tracking: category groups and eyebrows"
rounded:
  pill: "999px (buttons, nav pills, sidebar items, tags)"
  panel: "1.5rem (glass panels)"
  footer: "2rem top corners"
  square: "2px (category color squares)"
layout:
  header-height: "4rem"
  sidebar-width: "16rem"
  max-width: "80rem (screen-xl)"
---

# Design

**Discourse's structure, bitsocial.net's look.** People should recognise a forum at a glance: a header, a sidebar of categories, a categories table, topic tables with Latest/New/Top, and flat threads with avatars. Everything those parts are made of comes from bitsocial-web, so the forum also reads as part of bitsocial.net: frosted surfaces, glass panels, pill controls, Exo headings in muted grey, and blue for selection.

Tokens and surfaces are in `src/index.css`, copied from bitsocial-web's chain site (`chain/src/index.css`). Tailwind maps the tokens in `tailwind.config.ts`. When bitsocial-web's tokens change, update them here too.

## Structure (from Discourse)

- **Header:** full width, sticky, 4rem. Logo and "Bitsocial Forum" on the left (the name hides below `sm`), the search bar in the middle, and on the right the theme toggle, then the account items together: the inbox and the profile button (avatar and name, linking to `/profile`). Site links live in the sidebar and footer, not the header. Below `lg` a menu button opens the sidebar.
- **Sidebar:** 16rem, sticky from `lg`, a drawer below it. Order: Categories page, each category group with its sections (color square plus name), then Resources (the in-forum "How sections work" page first, then external docs).
- **Banners:** wide, short images at the top of the home page (with "Welcome to Bitsocial Forum") and of every section page (with the section name); see below.
- **Search:** a pill search bar in the header. Queries are free text plus `tag:`, `section:` and `community:` tokens; the search page shows each part as a removable blue chip, and with an empty query it offers every section's tags to browse.
- **Categories page:** one table per category group, columns Category and Latest. Each section row has a 4px left edge in the section color, its name, description and flairs. Latest hides below `md`.
- **Topic lists:** Latest / New / Top pills above a table with Topic, Replies and Activity. Replies hides below `sm`. Activity uses compact ages (`5m`, `3h`, `2d`, then a date) with the full date in a tooltip.
- **Topics:** oldest first, no nesting. Each post has a 44px avatar column, then name, short address and age, then the body. Posting controls sit under the thread.
- **Avatars:** a letter avatar in a color derived from the address when the author has a display name; otherwise the default person icon on a grey circle, with a hairline ring in light mode so it does not blend into white surfaces.
- **Footer:** one row of links with the Bitsocial Forge logo and "by Bitsocial Forge Inc." at bottom right.

## Theme (from bitsocial-web)

- **Frosted header:** the topbar material (`frosted-header`): backdrop blur, the frosted gradient fill, a frosted border. Full width rather than bitsocial.net's floating pill, because a forum header is always present.
- **Glass panels:** topic tables, category tables, threads and empty states sit in `glass-panel` (bitsocial.net's glass card: 1.5rem radius, subtle border, glass gradient, blur). Rows inside are divided by hairlines at half border opacity.
- **Glass footer:** `footer-glass` with 2rem top corners, compact.
- **Drawer:** the mobile sidebar uses `sheet-glass`, like bitsocial.net's slide-over sheets.
- **Headings and labels:** Exo 600 in `muted-foreground` grey with near-zero tracking for page headings; uppercase Exo labels with 0.18em tracking for category groups and eyebrows. Topic titles and posts stay in Manrope for reading.
- **Controls:** pills. The primary button is Protocol Blue with Silver Bright text, brightening to Electric Blue on hover. Outline buttons and nav pills have a 1px border that turns Electric Blue on hover.
- **Selection:** `blue-selected` (blue-tinted border and fill with the selected-filter glow) marks the active nav pill, sidebar item, tag and profile button.
- **Hover:** `blue-hover` gives sidebar items, icon buttons, pills and tags an eased (100ms) blue tint and border. No grey hover fills.
- **Tags:** pkc flairs as small 1px-border chips. Each opens a search for that tag, scoped to the section or community it came from, so the tag appears in the search bar. A community's flair colors win when set.
- **Banners:** every banner has a dark and a light image, picked by the theme. `scripts/generate-section-banners.mjs` draws each section's pair from the same seeded low-poly mesh in the section color, with a glow and a large lucide line icon on the right: on bitsocial.net's dark stage, or on its light surface with stronger lines and a softer glow. The home banners are `banner-mesh-wide-dark` and `-light` from the bitsocialnet/assets repository. Overlay text is solid, never a gradient: Silver Bright over a black gradient in dark mode, foreground ink over a white gradient in light mode. Run `yarn banners:generate` after adding a section or changing its color or icon.
- **Icon buttons:** the inbox, theme toggle and menu buttons have no circle at rest in either theme; the blue hover tint shows their shape. The default person avatar sits on an opaque grey circle (Silver Bright in light mode) so it stays visible on white surfaces and over banners.
- **Links:** foreground or muted text that turns Electric Blue on hover. Keyboard focus uses the shared blue ring.

## Do

- Keep Discourse's information density: compact tables, 14px list text, 15px post bodies.
- Use blue only for selection, primary actions, links on hover and focus. Use section colors only for section identity.
- Check every change in dark and light themes, and at phone width with the drawer open.

## Don't

- No marketing hero sections, polygon visuals or large display type inside the app.
- No ambient glows on static content; glow comes only from selection.
- No row hover fills inside tables; the title link carries the hover state.
- Don't invent per-page surfaces. Use `glass-panel`, `frosted-header`, `footer-glass` and `sheet-glass`.
