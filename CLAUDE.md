# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run lint     # run ESLint
```

No test suite is configured.

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SLACK_WEBHOOK_BASERATE_DEV=
```

The Habitica API credentials are stored per-user in Supabase (not in env vars).

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase · Framer Motion

**Auth / Session:** No NextAuth or cookie-based auth. The selected user record is stored in `localStorage` (key `current_user`) and rehydrated by `UserProvider` (`context/UserContext.tsx`). `isRehydrating` guards redirects to avoid flash-to-login.

**Data flow:**
1. User logs in via `/login` — picks a user row from Supabase, stored in context.
2. `/upload` — user uploads a photo of their "done list". `useUpload` sends the image to an AI endpoint, which returns parsed `doneItems`. These are editable before being sent.
3. Each done item can be sent to **Habitica** (via `useHabiticaSend`, hitting the Habitica REST API directly from the client) and/or to **Slack** (via `useSlackSend`, which calls `/api/slack` — a thin server-side proxy to hide the webhook URL).
4. `/lists` and `/lists/[id]` show historical upload lists from Supabase.

**Hooks pattern:** Business logic lives in `hooks/`. Pages are thin orchestrators that wire hooks together. Hooks fetch/mutate directly against Supabase or external APIs.

**Sprite system:** `lib/sprites/registry.ts` registers sprite sheets (`medival`, `forest`) from JSON manifests in `public/ui/`. `getSpriteBackgroundStyle` computes CSS `background-position` for rendering individual sprites. `SpriteNineSlice` component handles nine-slice panel rendering. `DecorativeAsset` maps named slots (e.g. `rabbit-peek`, `tree-border-left`) to specific sprite IDs via `components/decorative/assetMap.ts`.

**Path alias:** `@/` maps to the repo root (e.g. `@/components/Nav` → `components/Nav.tsx`).

---

## Code style

- Always use **React / TypeScript / Tailwind CSS** unless explicitly told otherwise.
- When showing changes, **show only what needs to change and where** — never output a full file unless explicitly asked.
- Never use emojis anywhere: not in UI, not in comments, not in console logs.
- Always look up and follow official documentation for any library or component before writing code. Do not rely on assumptions about APIs.
- When given an implementation plan, follow it step by step and ask before each major change.
- Keep components small and focused on a single responsibility.
- Extract repeated logic into custom hooks.
- Prefer explicit over implicit — name things clearly, avoid clever abbreviations.

---

## React rules (from react.dev/reference/rules)

These are rules, not guidelines. Breaking them causes bugs and unpredictable behaviour.

### Components and hooks must be pure

- **Components must be idempotent** — always return the same output for the same props, state, and context.
- **No side effects during render** — side effects must run outside of render (in event handlers or `useEffect`), never at the top level of a component function. React may render components multiple times.
- **Props and state are immutable** — never mutate them directly. Treat them as snapshots.
- **Hook return values and arguments are immutable** — once passed to a hook, do not modify those values.
- **Do not mutate values after passing them to JSX** — mutate before creating JSX, never after.

### React calls components and hooks

- **Never call component functions directly** — only use components in JSX, never as regular function calls.
- **Never pass hooks around as values** — only call hooks inside components or other hooks. Never store them in variables or pass them as props/arguments.
- **Let React handle rendering declaratively** — do not manually orchestrate when components render.

### Rules of Hooks

- **Only call hooks at the top level** — never inside loops, conditions, or nested functions.
- **Only call hooks from React functions** — call them from function components or custom hooks only, never from plain JavaScript functions.
- Custom hooks may call other hooks freely.

always first look at supabase.ts before suggesting database items and if it seems outdated ask me to update it with `npx supabase gen types typescript --project-id kfvczqsplhefjqcfpwak > supabase.ts`