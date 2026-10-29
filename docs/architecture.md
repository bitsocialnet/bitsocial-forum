# Architecture and decisions

This records what the forum is built on and why. Change it when a decision changes, in the same change.

## Sections are directories, not one community

**Decision.** Each forum section is a [directory](https://docs.bitsocial.net/directories): a code such as `bso` or `pkc` that communities compete for. `/s/:code` opens the highest-ranked candidate community. The forum is never a single community such as `forum.bitsocial.bso`.

**Why.**

- A single community would give the app global admins, which is what Bitsocial is built to avoid. Whoever held that community's key would control the whole forum.
- pkc-js roles, challenges and rules apply to a whole community. One community could not let the pkc-js maintainers moderate only the protocol section, or give Announcements owner-only posting while General stays open. Separate communities per section map moderation to the people who own each project.
- If a section's community goes offline or is badly run, another candidate takes over the code. Losing deletes nothing: the old community keeps its address, topics and subscribers.

A single community was technically possible. `community.flairs.post` with `features.requirePostFlairs` gives fixed sections, and a page sort whose `score` returns `null` for other flairs can publish per-section indexes. It was rejected for the reasons above, and because every section index would regenerate on one node.

**Consequences.**

- Topic and community links always use the community's exact address (`/c/:address/t/:cid`), never the section code, so they survive a change of winner.
- A section page lists the other candidates so competing communities stay visible.
- A view across all sections has to load every section's community. Keeping the number of sections small (about ten) keeps that affordable.

## Client developers choose the section codes

The client hardcodes which section codes exist, the same way 5chan ships `/g/` and `/b/`. That controls the namespace, not what is posted: moderation belongs to each section's community, and anyone can fork the client with different sections. The codes, colors and descriptions live in `src/data/sections.ts`; [sections.md](sections.md) is the human-readable copy.

## How winners are chosen

1. **Now (v1):** candidates are a curated list in `src/data/sections.ts`, highest-ranked first. While the repository is private this is the only option, because `bitsocialnet/lists` is public.
2. **At launch:** move candidates to a `forum-directories/` folder in [bitsocialnet/lists](https://github.com/bitsocialnet/lists), next to `seedit-directories/` and `5chan-directories/`, with a revision number per file like Seedit's. The client reads that file instead of hardcoded candidates.
3. **Later:** rank candidates with [`@bitsocial/pubsub-voting`](https://github.com/bitsocialnet/pubsub-voting), as 5chan's directories do. Its v1 gate supports only non-transferable tokens, one token per vote (the 5chan Pass); token-weighted voting is deferred. Who gets to vote on forum sections is an open question in [roadmap.md](roadmap.md).

## Flairs label topics inside a section

Repositories and thread types are flairs inside a section, not sections of their own. A section's community defines its flair set in `community.flairs.post` and can require one per topic with `features.requirePostFlairs`. The suggested flairs per section are in `src/data/sections.ts`. The client shows flairs as Discourse-style tags.

## Where CommunityList fits

[`CommunityList`](https://github.com/pkcprotocol/pkc-js/blob/master/docs/protocol/community-lists.md) is a signed, immutable list of communities. It is not used for sections: a hardcoded list CID would make its curator decide section membership, any change would need a new CID, and a merged multi-community section would mix moderation teams and leave posters unsure where a topic goes. It fits two other jobs:

- the feed and search across all sections, and
- shipping the starting set of sections and candidates as a signed snapshot, with the curator shown through its `author` field.

## Forum behavior on pkc

- **Latest** is pkc's `active` sort (bump order), **New** is `new`, **Top** is `topAll`.
- Topics are flat and oldest-first, like Discourse. Section communities should set `features.noNestedReplies` and quote with `quotedCids` instead of nesting.
- A section's community should preload the `active` post sort and the `old` reply sort (see pkc-js `page-sorts.md`) so the default views load from the community record.

## Profiles

Every user should have a profile at a clean address such as `/u/someguy.bso`. In pkc-js a profile is an [author community](https://github.com/pkcprotocol/pkc-js/blob/master/docs/protocol/author-communities.md): an ordinary community addressed by the author's own key, where only the owner posts, fed by crossposts of the owner's comments. Seedit's client work for this is [bitsocialnet/seedit#852](https://github.com/bitsocialnet/seedit/issues/852).

- **Users do not run a node.** Forge RPC plans to host each profile with Forge acting as the minter, while the user's app keeps the identity key. Leaving Forge means exporting the profile and pointing it at another node (for example `bitsocial-cli` on a Raspberry Pi); the address does not change. See `forge-rpc-server/docs/AUTHOR_PROFILES_AND_PSEUDONYMITY.md`. As of 2026-10-29 that design is not implemented.
- **Create a profile on a user's first post,** not at account creation, so one-time visitors do not each cost a hosted community.
- **Before Forge:** the desktop app's built-in node can host its user's profile, so profiles can ship there first. The web app can show user pages the way Seedit does, by following an author's `previousCommentCid` chain from a known comment (`/u/:address/c/:cid`).

The repository stays private until profiles work through Forge RPC.

## Routing and deployment

- Hash routing, as in Seedit and 5chan, so one static build works at `forum.bitsocial.net`, on IPFS gateways and from `file://`. Vite builds with a relative base.
- Routes: `/` categories, `/s/:code/:sort?` section, `/c/:address/:sort?` community, `/c/:address/t/:cid` topic. `:sort` is `new` or `top`; Latest has no segment.
- `forum.bitsocial.net` will be a Cloudflare DNS record pointing at a Vercel project. Following 5chan and Seedit, production should deploy only from GitHub releases, not from every push.

## Repository, license and design

- **Separate repository**, not a bitsocial-web workspace. bitsocial-web is public and the forum must stay private for now; the forum is a full pkc client with its own release cycle and, later, a desktop build. A `bitsocial.net` subdomain does not require the monorepo: `hooks.bitsocial.net` is already served from bitsocial-react-hooks.
- **GPL-3.0-or-later**, like Seedit and 5chan. AGPL's network clause adds nothing for a static client whose source is already served to the browser.
- **Design:** Discourse's forum structure, themed with bitsocial-web's design elements. See [../DESIGN.md](../DESIGN.md).
