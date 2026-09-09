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

| Method | Path                                 | Notes                                                   |
| ------ | ------------------------------------ | ------------------------------------------------------- |
| GET    | `/health`                            | Outside the rate limiter, for uptime probes             |
| POST   | `/api/flexread`                      | Body `{ articleText: string }`, max 50,000 characters   |
| POST   | `/api/podcast`                       | Same body. Returns `{ script: [{ speaker, text }] }`    |
| POST   | `/api/tts`                           | Body `{ script, hosts? }`. Returns `202` and a job id   |
| POST   | `/api/briefing`                      | Body `{ articleText, voice? }`. 60 seconds of audio out |
| GET    | `/api/voices`                        | The voice catalogue. A constant read, no model call     |
| GET    | `/api/{tts,briefing}/jobs/:id`       | Job status. Poll until `done` or `failed`               |
| GET    | `/api/{tts,briefing}/jobs/:id/audio` | The audio. `409` until the job is done                  |

## Choosing voices

`GET /api/voices` returns everything a UI needs, so no voice id is hardcoded in
two places. Both selection fields are optional and omitting them reproduces
exactly what the product sounded like before they existed.

`POST /api/tts` takes `hosts`, one of `male-female` (the default),
`male-male` or `female-female`. Each pairing uses two different voices even
when they share a gender: `multiSpeakerVoiceConfig` declares one voice per
speaker, so giving both hosts the same one makes them indistinguishable.

`POST /api/briefing` takes `voice`, one of `studio-o` (the default),
`studio-q`, `aoede` or `algieba`. An unknown value on either endpoint is a
`400` listing the valid options, rather than a silent fall back to the default.

Two things worth knowing about the catalogue:

- Gemini multi-speaker TTS and Cloud TTS Chirp3-HD share a voice roster. The
  Gemini voice `Algieba` is the same voice as `en-US-Chirp3-HD-Algieba`, which
  is why one table can drive both features and why the two added briefing
  voices are the podcast hosts rather than two more strangers.
- Studio has only two en-US voices, `Studio-O` and `Studio-Q`, and neither is
  in the Gemini roster. That is why briefing voices carry no Gemini name and
  the types stop one being used as a podcast host.

Only `Algieba` and `Aoede` have actually been listened to. `Charon` and
`Despina` were added so the same-gender pairings have a second voice and are
still unvetted.

`/api` is rate limited to 60 requests per IP per 15 minutes. The endpoint is
unauthenticated, so that limit is what stops an open URL from draining the
Gemini quota.

## Deploying

```bash
gcloud run deploy resonance-backend \
  --project nzz-sbx-hckthn08 --region us-central1 --source . \
  --allow-unauthenticated \
  --no-cpu-throttling \
  --max-instances 1 \
  --memory 1Gi --timeout 300 \
  --set-env-vars "VERTEX_PROJECT=nzz-sbx-hckthn08,VERTEX_LOCATION=us-central1,FRONTEND_ORIGIN=<frontend url>"
```

Two of those flags are not optional.

`--no-cpu-throttling` selects instance-based billing. Cloud Run's default only
allocates CPU while a request is being handled, and every render here returns a
job id immediately and then works in the background. Without this flag each job
is created and then frozen, so the studio polls a job that never progresses.

`--max-instances 1` is required because jobs live in an in-memory map. A second
instance does not share it, so a job created on one and polled on another comes
back `404`. Lift this only after jobs move to a real store.

`FRONTEND_ORIGIN` must be set for the server to start, but nothing depends on
its value: the browser talks to the frontend's own origin, which proxies here,
so no cross-origin request is ever made. On a first deploy, before the frontend
URL exists, any non-empty value works.

The Cloud Run service runs as the project's Compute Engine default service
account, which needs `roles/aiplatform.user` to reach Gemini. Without it the
build and deploy both succeed and every generation fails at runtime.

## Before you push

CI runs `eslint . --max-warnings=0` from the repo root and `tsc --noEmit` here.
Both must pass or the pull request is blocked. Rules are in
`docs/CODING_RULES.md`.
