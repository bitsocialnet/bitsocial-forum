# Roadmap and progress

Update this file in the same change that completes or reshapes an item. Decisions behind the items are in [architecture.md](architecture.md).

## M0: Scaffold (done, 2026-10-29)

- [x] Local repository with 5chan's stack: React 19, Vite, Zustand, React Router, bitsocial-react-hooks, i18next, oxlint, oxfmt, Vitest, Agentation, React Doctor, Knip
- [x] AI workflow ported from 5chan: shared skills and roles, generated harness files, `agent:verify`, Playwright session lock, module boundary check
- [x] Discourse structure themed with bitsocial-web elements: frosted header, sections sidebar and drawer, categories tables, topic lists with Latest/New/Top, flat topic pages in glass panels, light and dark themes
- [x] Draft section taxonomy with colors and suggested flairs ([sections.md](sections.md))
- [x] Read any community by address, live over P2P in the browser
- [x] Docs: README, architecture, sections, roadmap, PRODUCT, DESIGN

## M1: Readable forum

- [ ] Create a community for each section, configured as in [sections.md](sections.md), and list it as the section's candidate
- [ ] Decide who moderates each section and add them as community roles
- [ ] A Latest view across all sections (a CommunityList of section winners, or the winners from the section data)
- [ ] Render markdown in posts, with quotes (`quotedCids`) shown as Discourse-style quote blocks
- [ ] Author pages from the `previousCommentCid` chain (`/u/:address/c/:cid`), as in Seedit
- [ ] Port 5chan's and Seedit's browser P2P settings (`p2p-browser-config`) instead of the hooks' defaults
- [ ] PWA and version metadata, as in 5chan

## M2: Posting

- [ ] Account creation and import using the shared Bitsocial account format
- [ ] New topic with a flair picker that follows the community's `requirePostFlairs`
- [ ] Reply and quote-reply, edit and delete
- [ ] Challenge UI for each section's anti-spam challenges
- [ ] Moderator tools: pin, lock, remove, flair edits

## M3: Directories

- [ ] Move candidates to `bitsocialnet/lists` as `forum-directories/`, with revisions, and read them in the client (needs the lists change to be public, so at launch at the earliest)
- [ ] Section voting with `@bitsocial/pubsub-voting` once the voter credential is decided

## M4: Profiles

- [ ] Desktop build (Electron, as in 5chan) whose built-in node hosts the user's profile community
- [ ] Forge RPC hosted profiles, created on a user's first post, with export to a self-hosted node
- [ ] `/u/:name` profile pages from author communities, with crossposted history

## M5: Launch

- [ ] Create the private GitHub repository once local testing is done (CI is already in `.github/workflows/ci.yml`)
- [ ] `forum.bitsocial.net`: Cloudflare DNS and a Vercel project that deploys only from releases
- [ ] PR review bots for the repository (Claude, Codex, CodeRabbit)
- [ ] Make the repository public and announce on Telegram and Twitter
- [ ] Add Bitsocial Forum to the apps directory on bitsocial.net

## Open questions

- **Voter credential for section voting.** Reuse the 5chan Pass, or a separate non-transferable forum pass? pubsub-voting does not support token-weighted (BSO) voting yet.
- **Section moderators.** Who runs each section's community at launch, and how a project's maintainers get roles.
- **Announcements policy.** Owner-only topics with open replies, or fully owner-only?
- **Starting snapshot.** Ship the section list as a signed CommunityList CID as well as source data?
- **Translations.** English only for now; when to add locales.
