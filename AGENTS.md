# AGENTS.md

## Purpose and priority

These are the shared instructions for agents working on Bitsocial Forum. Explicit user instructions take precedence over repository workflow guidance. MUST rules are mandatory; SHOULD rules are defaults. Read linked playbooks only when the task needs them.

Use judgment for routine implementation choices and continue authorized work. Ask only when missing information materially changes the outcome or an action needs authorization that has not already been given. Do not turn a skill's suggested procedure into an extra approval gate.

## Product and source of truth

Bitsocial Forum is a static, serverless, adminless forum client built on the Bitsocial protocol, the third Bitsocial client after Seedit and 5chan, to be served at `forum.bitsocial.net`. Topic content comes from peers, not the app origin. Sections are directory codes that communities compete for; the client never assumes one community owns the forum. Preserve hash routing and static deployment unless the user requests an architectural change. Product decisions and their reasons live in [docs/architecture.md](docs/architecture.md); progress lives in [docs/roadmap.md](docs/roadmap.md).

The repository is private during prerelease. Do not change its visibility, publish packages, or deploy without an explicit request.

Code, tests, manifests, source docs, and runtime evidence establish behavior. This file, skills, playbooks, and task logs are orientation and policy; verify their technical claims against source before editing. Check the installed dependency version before assuming a nearby repository supplies its code.

For an unexpected repo-specific issue, tell the contributor and continue independent work. After confirmation, record only recurring issues with a concrete mitigation in [known-surprises.md](docs/agent-playbooks/known-surprises.md).

## Working principles

- Define completion for non-trivial work. Continue through implementation, relevant verification, and fixes until the requested outcome is complete; stop at the user's requested boundary.
- Understand the flow before editing. Prefer skipping unnecessary work, reusing repository code, standard-library/native features, then installed dependencies, before writing new code.
- Keep diffs scoped. Preserve unrelated edits; do not reformat, rename, or refactor adjacent code without a task-related reason.
- Simplicity must preserve correctness, clarity, accessibility, validation, security, and useful tests.
- For a bug tied to a file or line, inspect `git log`/`git blame`, then relevant `git show`, before fixing it. See [bug-investigation.md](docs/agent-playbooks/bug-investigation.md).
- Never work around a `@bitsocial/bitsocial-react-hooks` bug in this repo. We maintain that library, so fix the root cause there, release it, and bump it here; without access to its repository, open an issue there with the evidence instead.
- Use existing evidence or a focused test before adding instrumentation. Remove task-owned instrumentation after verification.
- When a change completes or reshapes a roadmap item, update [docs/roadmap.md](docs/roadmap.md) in the same change.

## Task router

| Task | Required guidance/check |
|---|---|
| Visual design, layout, CSS, or themes | Read [DESIGN.md](DESIGN.md); review against its Do/Don't list |
| Files under `src/` or `scripts/` | Read the directory's `AGENTS.md` |
| Sections, directories, or section data | Read [docs/architecture.md](docs/architecture.md) and keep [docs/sections.md](docs/sections.md) in sync with `src/data/sections.ts`; run `yarn banners:generate` after adding a section or changing its color |
| Code or automation changed | Select affected checks using [verification.md](docs/agent-playbooks/verification.md); use `agent:verify` for integration/build changes or an explicitly requested full pass |
| React state, effects, data flow, or rendering performance changed | Review relevant React guidance; use advisory `yarn doctor` for newly introduced diagnostics |
| UI behavior/layout changed | Verify the affected flow; select browsers/viewports using [verification.md](docs/agent-playbooks/verification.md) |
| `package.json` changed | Run `corepack yarn install` to synchronize `yarn.lock`; keep `yarn deps:check-pinned` passing |
| Dependencies, moved files, or imports changed | `yarn boundaries` (part of `yarn lint`) must pass; see module boundaries in [src/AGENTS.md](src/AGENTS.md). Run advisory `yarn knip`; resolve relevant new findings |
| AI workflow files changed | Edit shared sources, run `yarn ai-workflow:sync`, then `yarn ai-workflow:check` and `yarn ai-workflow:test` |
| Open PR feedback or merge readiness | Use `review-and-merge-pr` within the user's requested scope |
| Work needs a durable handoff/resumption, or one run is long enough to hit context compaction | Use [long-running-agent-workflow.md](docs/agent-playbooks/long-running-agent-workflow.md) |

## Code and design

- Use Corepack-managed Yarn 4, never npm for project dependency changes. Pin exact versions and keep the lockfile synchronized. Yarn enforces a 3-day `npmMinimalAgeGate`; preapprove a package in `.yarnrc.yml` only with a stated reason.
- Stack: React 19, TypeScript, Zustand, React Router 7, Vite, `@bitsocial/bitsocial-react-hooks`, i18next, Tailwind CSS 3, oxlint, oxfmt, Vitest.
- Keep page composition in `src/views/`, reusable UI in `src/components/`, hooks in `src/hooks/`, shared state in `src/stores/`, helpers in `src/lib/`, static data in `src/data/`. Dependencies flow one way between those layers; see module boundaries in [src/AGENTS.md](src/AGENTS.md).
- Use Zustand for shared/global state; local component state may use `useState`.
- Use Bitsocial hooks for protocol data access. Do not fetch data in effects or synchronize derived state with effects; derive values during render.
- Use React Router for navigation, not manual history manipulation. Links to topics and communities use the community's exact address (`/c/:address`), never a section code, so they survive a change of section winner.
- Put every user-facing string in `public/translations/en/default.json` and read it through `react-i18next`.
- The UI is Discourse's forum structure themed with bitsocial-web's design elements (frosted header, glass panels, pill controls, Exo headings, blue selection); [DESIGN.md](DESIGN.md) is the reference.
- Add comments for non-obvious constraints or logic, not for obvious code.

## Git and ownership

- Keep `master` releasable. Start new changes on short-lived `codex/feature/*`, `codex/fix/*`, `codex/docs/*`, or `codex/chore/*` branches unless the user requests otherwise.
- For an unrelated task while another branch is active, create a separate descriptive worktree from `master`. Prefer `./scripts/create-task-worktree.sh <type> <descriptive-slug>`; it installs dependencies.
- Related delegated slices may share the task worktree with non-overlapping file ownership. Never switch branches underneath another agent.
- Stage only task-owned changes, using a selective index patch when files contain mixed edits. Do not use `git add -A` as a default.
- Never commit secrets or generated build output. Preserve preexisting artifacts and unrelated changes during cleanup.
- Only commit, push, publish, or merge when authorized. Permission already given for the action persists through its necessary steps.
- When opening a requested PR, target `master` and make it ready for review so review bots run.
- After an authorized merge, clean up only the verified merged branch/worktree; preserve any later or unrelated work. Do not run Git cleanup from lifecycle hooks.
- Use `gh` for GitHub operations. Commit/issue formatting lives in [commit-issue-format.md](docs/agent-playbooks/commit-issue-format.md); provide suggestions when requested, not on every answer.

## Verification and resource ownership

- Verify the affected behavior with the narrowest reliable checks. Add regression tests for non-trivial, testable bugs; do not add tests that merely restate a reversible wording or formatting edit.
- Run applicable checks for the final change once. Repeat or broaden them only after relevant edits, failures, or unresolved concerns. Preserve explicit user, CI, and release requirements. Documentation-only changes need document/workflow checks.
- Before heavy work, inspect existing processes. Stop only stale processes owned by this task; never stop a process of unclear ownership.
- Serialize installs, builds, full tests, React Doctor, and browser work across the task. One agent owns heavy verification.
- Use `corepack yarn exec vitest run --maxWorkers=2 [paths]` for agent-run tests. Do not use watch mode or the package's default four-worker setting.
- React Doctor is guidance for newly introduced issues, not a score target. Knip and coverage are advisory; do not invent new repository-wide gates.
- Default to fresh isolated Playwright sessions. Reuse a contributor's current browser only when explicitly authorized.
- Use `./scripts/pw-session.sh open <session> ...` and `close <session>` for every browser session. One browser may be active machine-wide. Exit 75 means busy; defer or use the wrapper's bounded wait. Never use `close-all` or `kill-all`.
- Reuse a compatible dev server in the same worktree when safe. Otherwise record and clean up the server/process you start. Never start a server for a documentation-only task.
- Review the final task-owned diff. Use `code-quality-review` for non-trivial changes or an explicit review request; apply high-confidence findings within existing authorization.
- After a bug fix or substantive review correction exposes a preventable mistake, use [retro](.agents/skills/retro/SKILL.md) before finishing to consider the smallest useful prevention.

## Skills and delegation

- Shared skills live in `.agents/skills/`; shared roles in `.agents/roles/` (`browser-check`, `reviewer`). `.claude/skills/` and harness agent files are generated compatibility outputs. See [skills-and-tools.md](docs/agent-playbooks/skills-and-tools.md).
- Keep harness-specific hooks, permissions, and metadata explicit; byte-identical files do not establish equivalent runtime behavior.
- Keep model and reasoning choices out of committed skills and custom agents. Use the app's runtime defaults, parent inheritance, and supported invocation-time choices.
- Delegate substantial independent work when it improves speed, context isolation, or independent review. Give each child its scope, acceptance criteria, context, file ownership, and evidence to return; check that evidence before accepting a child's result. Use at most four active workers by default. Browser work always remains serialized.
- Use relevant React skill guidance for state/effect/data-flow or performance work. Load only rules that fit this Vite client; use `you-might-not-need-an-effect` for a focused effect review when the reason is unclear.
- Prefer existing tools and local CLIs. Do not search for or install additional skills merely because a normal coding task mentions their domain.

## Development tooling

Development builds load Agentation and `window.__ELEMENT_SOURCE__` (from `src/lib/dev-tools.ts`) for visual feedback and source inspection; production builds omit both. Use `inspect-elements` for source attribution.

## Local commands and playbooks

Canonical dev URL: `https://bitsocial-forum.localhost`; other worktrees may use branch-scoped `*.bitsocial-forum.localhost`. Preserve the launcher's HTTPS proxy on port 443. Direct Vite fallback: `PORTLESS=0 yarn start`.

Common checks: `yarn agent:verify` (lint, type-check, tests, build, conditional workflow check, advisory Knip), `yarn doctor`, `yarn knip`, `yarn deps:check-pinned`, `yarn ai-workflow:sync`, `yarn ai-workflow:check`, `yarn ai-workflow:test`, `./scripts/pw-session.sh status`.

Load details on demand: [hooks](docs/agent-playbooks/hooks-setup.md), [verification](docs/agent-playbooks/verification.md), [skills/tools](docs/agent-playbooks/skills-and-tools.md), [long-running work](docs/agent-playbooks/long-running-agent-workflow.md), [known surprises](docs/agent-playbooks/known-surprises.md).
