# Backend

Express and TypeScript, calling Gemini. ES modules, so relative imports carry a
`.js` extension even though the sources are `.ts`.

## Run it locally

```bash
cd backend
cp .env.example .env
gcloud auth application-default login
gcloud auth application-default set-quota-project nzz-sbx-hckthn08
npm install
npm run dev              # tsx watch, restarts on save
```

There is no API key. The organisation policy on the hackathon project
disallows them, so Gemini and Cloud Text-to-Speech both authenticate through
Application Default Credentials. On Cloud Run the service account is used
automatically and neither `gcloud` command applies.

The server throws at startup if `FRONTEND_ORIGIN` is missing, since a server
running without a CORS origin is a hole rather than an inconvenience.
`VERTEX_PROJECT` fails on first use instead, so a missing value breaks the one
request that needed it rather than the whole backend.

## Scripts

| Command         | What it does                                       |
| --------------- | -------------------------------------------------- |
| `npm run dev`   | Watch mode via `tsx`, runs the TypeScript directly |
| `npm run build` | `tsc` to `dist/`                                   |
| `npm start`     | Runs the built `dist/index.js`                     |

## Endpoints

| Method | Path                                 | Notes                                                      |
| ------ | ------------------------------------ | ---------------------------------------------------------- |
| GET    | `/health`                            | Outside the rate limiter, for uptime probes                |
| POST   | `/api/flexread`                      | Body `{ articleText: string }`, max 50,000 characters      |
| POST   | `/api/podcast`                       | Same body. Returns `{ script: [{ speaker, text }] }`       |
| POST   | `/api/tts`                           | Body `{ script }`. Returns `202` and a job id              |
| POST   | `/api/briefing`                      | Same body as flexread. Article in, 60 seconds of audio out |
| GET    | `/api/{tts,briefing}/jobs/:id`       | Job status. Poll until `done` or `failed`                  |
| GET    | `/api/{tts,briefing}/jobs/:id/audio` | The audio. `409` until the job is done                     |

`/api` is rate limited to 60 requests per IP per 15 minutes. The endpoint is
unauthenticated, so that limit is what stops an open URL from draining the
Gemini quota.

## Before you push

CI runs `eslint . --max-warnings=0` from the repo root and `tsc --noEmit` here.
Both must pass or the pull request is blocked. Rules are in
`docs/CODING_RULES.md`.
