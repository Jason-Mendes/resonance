# Backend

Express and TypeScript, calling Gemini. ES modules, so relative imports carry a
`.js` extension even though the sources are `.ts`.

## Run it locally

```bash
cd backend
cp .env.example .env     # then fill in GEMINI_API_KEY
npm install
npm run dev              # tsx watch, restarts on save
```

The server throws at startup if `GEMINI_API_KEY` or `FRONTEND_ORIGIN` is
missing. That is deliberate: a missing key should stop the process, not surface
as an opaque auth error on the first article request.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Watch mode via `tsx`, runs the TypeScript directly |
| `npm run build` | `tsc` to `dist/` |
| `npm start` | Runs the built `dist/index.js` |

## Endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | Outside the rate limiter, for uptime probes |
| POST | `/api/flexread` | Body `{ articleText: string }`, max 50,000 characters |

`/api` is rate limited to 60 requests per IP per 15 minutes. The endpoint is
unauthenticated, so that limit is what stops an open URL from draining the
Gemini quota.

## Before you push

CI runs `eslint . --max-warnings=0` from the repo root and `tsc --noEmit` here.
Both must pass or the pull request is blocked. Rules are in
`docs/CODING_RULES.md`.
