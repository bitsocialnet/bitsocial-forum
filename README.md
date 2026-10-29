# Bitsocial Forum

The official forum for Bitsocial projects, and the third Bitsocial client after [Seedit](https://github.com/bitsocialnet/seedit) and [5chan](https://github.com/bitsocialnet/5chan). It will be served at `forum.bitsocial.net`.

Bitsocial discussion is currently split across Telegram, Twitter and GitHub. The forum gives every major project a section of its own, in a client that works like Bitsocial's other apps: serverless, with no global admins, and with content loaded peer-to-peer in the browser.

> **Status: private prerelease.** The forum can read any Bitsocial community and shows the section layout, but posting, section communities and profiles are not built yet. The repository stays private until profiles work through Forge RPC. Progress is tracked in [docs/roadmap.md](docs/roadmap.md).

## How sections work

The forum is not one community. Each section (`/s/bso`, `/s/pkc`, `/s/5chan`, ...) is a [directory](https://docs.bitsocial.net/directories): a topic name that communities compete for. A section opens whichever community currently ranks first for it, and that community's own moderators run it. If a section's community goes away or is run badly, another community can take the section over without anyone's permission, the same way Seedit's and 5chan's directories work.

- The client decides which sections exist. The draft list is in [docs/sections.md](docs/sections.md).
- Communities decide what happens inside a section. Flairs label topics by project and type.
- Topic links always use the community's exact address, so they keep working if a section changes hands.

The reasoning behind this, and the other design decisions, is in [docs/architecture.md](docs/architecture.md).

## Stack

React 19, TypeScript, Vite, Zustand, React Router (hash routing), [`@bitsocial/bitsocial-react-hooks`](https://github.com/bitsocialnet/bitsocial-react-hooks) over pkc-js, i18next, Tailwind CSS, oxlint, oxfmt and Vitest. The interface has Discourse's forum structure, themed with bitsocial-web's design elements; see [DESIGN.md](DESIGN.md).

## Development

Requires Node 22 (see `.nvmrc`) and Corepack.

```sh
corepack yarn install
corepack yarn start
```

`yarn start` serves the app at `https://bitsocial-forum.localhost` through Portless. Use `PORTLESS=0 yarn start` to run Vite directly.

| Command | What it does |
|---|---|
| `yarn build` | Production build into `build/` |
| `yarn test` | Vitest (pkc-js is mocked, so tests never reach the network) |
| `yarn lint` | oxlint plus the `src/` module boundary check |
| `yarn type-check` | TypeScript |
| `yarn agent:verify` | Lint, type-check, tests and build in one pass, plus advisory Knip |

Any community can be opened by address while sections have no communities yet, for example `/#/c/askseedit.bso`.

Agents working in this repo follow [AGENTS.md](AGENTS.md).

## Docs

- [docs/architecture.md](docs/architecture.md): decisions and their reasons
- [docs/sections.md](docs/sections.md): the section taxonomy draft
- [docs/roadmap.md](docs/roadmap.md): milestones, progress and open questions
- [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md): product and design references

## License

GPL-3.0-or-later. See [LICENSE](LICENSE).
