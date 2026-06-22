---
name: run-habiticaslack
description: run, start, launch, build, screenshot, verify the HabiticaSlack app
---

HabiticaSlack is a Next.js 16 (App Router) web app. Drive it via `chromium-cli` against the dev server — no custom driver needed.

## Prerequisites

Node.js and npm must be installed. `chromium-cli` for headless browser interaction.

## Build

```bash
npm install
```

## Run: dev server

```bash
npm run dev
```

Server starts at `http://localhost:3000` (may use 3001 if 3000 is taken — check terminal output).

## Run (agent path) — chromium-cli

Start the dev server first (above), then drive it with `chromium-cli`:

```bash
chromium-cli navigate http://localhost:3000/login
chromium-cli screenshot login.png
```

### Key routes

| Route | Purpose |
|---|---|
| `/login` | Pick or create a user (name, Habitica user ID, API token) |
| `/upload` | Upload a photo of done items — requires login (localStorage) |
| `/lists` | View historical upload lists from Supabase |
| `/lists/[id]` | Single upload list detail |

### Smoke check without a browser

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login
# expect: 200

curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/upload
# expect: 200 (redirects to login if no localStorage user — JS-side, so curl sees 200)

curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/lists
# expect: 200
```

## Gotchas

- **Auth is localStorage-only.** There are no cookies or server-side session tokens. `curl` always sees the unauthenticated page shell — the redirect to `/login` is client-side JS, so HTTP status is always 200. To test authenticated flows, you must use a real browser or inject `localStorage.setItem('current_user', JSON.stringify({...}))` via `chromium-cli eval`.
- **Port conflict.** If port 3000 is already in use (e.g. the dev server is already running), Next.js silently picks 3001. Check the terminal output for the actual URL.
- **Supabase required.** `.env.local` must contain `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the login user-list and lists pages to load data. Without them the app shells load but data fetches fail silently.
- **AI endpoint.** The `/upload` flow calls an AI endpoint to parse the done-list image. This requires the AI service to be configured — not needed for UI-only testing.

## Troubleshooting

- **`⨯ Another next dev server is already running`** — the dev server is already up at port 3000. Use that one; you don't need to start another.
- **Blank page / hydration errors** — usually missing env vars. Check `.env.local` contains the Supabase keys.
- **`Module not found`** — run `npm install` first.
