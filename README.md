# Resonance

An editorial studio for NZZ articles. An editor opens a story, and the app
turns it into the things a newsroom now has to publish alongside the text: a
two-voice podcast, a narrated sixty-second briefing, a layered summary for
readers who will not read to the end, and a social carousel written over the
photographs the piece was published with.

Built for the NZZ and Google Cloud hackathon. Twenty-nine real NZZ articles are
loaded into Firestore, and an editor can add or edit an article in the app.

**Live:** https://resonance-frontend-986846892302.europe-west6.run.app

**Planning board:** https://miro.com/app/board/uXjVHp11Mko=/ — where the
product was worked out, and the place to look for why something is the shape it
is rather than what it does.

## How it fits together

```
browser  ──►  Next.js frontend  ──►  Express backend  ──►  Vertex AI (Gemini)
              (public)               (private)         └─►  Firestore
```

Three rules explain most of the code.

**The browser never talks to the backend.** It calls the Next.js app's own
routes under `/api`, which forward to the backend server-side. So no request is
ever cross-origin and the backend can stay private.

**The browser never sends article text.** It sends an article id. Every route
that spends money on a model re-reads the article from Firestore first, so a
client cannot substitute its own content into a paid call.

**Long work is a job, not a request.** Rendering a podcast takes about a
minute. Those routes return a job id immediately and the studio polls it.

## What it does

| Feature         | Where it starts                      | What comes back                                |
| --------------- | ------------------------------------ | ---------------------------------------------- |
| Podcast         | `POST /api/podcast`, then `/api/tts` | A two-host script and rendered audio           |
| Audio briefing  | `POST /api/briefing`                 | One voice, roughly sixty seconds               |
| FlexRead        | `POST /api/flexread`                 | A headline, a sixty-second summary, key points |
| Social carousel | `POST /api/social`                   | An opening, a caption per photograph, hashtags |
| Add an article  | `POST /api/articles`                 | The stored article, with its new id            |
| Edit an article | `PUT /api/articles/:id`              | The stored article, sections rebuilt           |

Two controls shape a generation before it runs: a tone preset, and a list of
words the piece must not use. Both are presets rather than free text, so a tone
is a prompt fragment somebody wrote and tested.

Editing matters more than it sounds. Every generation reads the article from
Firestore, so correcting a sentence and pressing Generate rebuilds the podcast,
the briefing and the key points from the corrected text.

## Running it locally

You need Node 22, and gcloud logged in with access to `nzz-sbx-hckthn08`:

```bash
gcloud auth application-default login
```

The backend reads `backend/.env`. Copy the example and fill it in:

```bash
cp backend/.env.example backend/.env
```

The frontend needs one variable in `frontend/.env.local`:

```
BACKEND_URL=http://localhost:8080
```

Then, in two terminals:

```bash
cd backend  && npm install && npm run dev    # :8080
cd frontend && npm install && npm run dev    # :3000
```

Open http://localhost:3000. The articles come from the shared Firestore
database, so there is nothing to seed for everyday work.

## Loading the NZZ articles

Only needed to populate an empty database, or to restore an article whose
images an editor flattened by editing it:

```bash
cd backend && npm run seed:articles
```

It reads the 29 JSON files under `Data/LiquidStoryEngine/input/articles`, which
are gitignored and live outside the repository, and writes them to the
`articles` collection keyed on their NZZ document id. Re-running overwrites
rather than duplicating. Set `ARTICLES_DIR` to point somewhere else.

## Layout

```
backend/          Express API. Talks to Vertex AI and Firestore.
  src/routes/     One file per endpoint. Validation and status codes.
  src/services/   The Gemini and speech calls.
  src/lib/        Article parsing, jobs, clients, generation controls.
  src/scripts/    seed-articles.ts, run by hand.

frontend/         Next.js app router.
  src/app/api/    Server-side proxies to the backend.
  src/components/ features/ by domain, ui/ for shared pieces.
  src/hooks/      Query hooks and the studio's generation state.
  src/lib/        Article text, drafts, waveform, transport.

docs/             CODING_RULES.md
```

`backend/README.md` and `frontend/README.md` cover each side in more detail,
including why the deploy flags are what they are.

## Checks

```bash
npm run lint          # eslint across both apps, zero warnings allowed
npm run format:check  # prettier
cd backend  && npx tsc --noEmit && npm test
cd frontend && npx tsc --noEmit
```

69 tests across 12 files. They mock Gemini and Firestore, so nothing on the
network is touched and no model call is paid for.

## Deployment

Both services run on Cloud Run in `europe-west6`, next to the Firestore
database, so reading an article stays in Zurich.

|           |                                                              |
| --------- | ------------------------------------------------------------ |
| Frontend  | https://resonance-frontend-986846892302.europe-west6.run.app |
| Backend   | https://resonance-backend-986846892302.europe-west6.run.app  |
| Firestore | `europe-west6`, native mode                                  |
| Vertex AI | `us-central1`                                                |

Vertex is the exception, and deliberately. Calling
`gemini-2.5-pro-preview-tts` from `europe-west6` returns a 404 saying the
publisher model does not exist there, while the same call from `us-central1`
returns audio. So the speech call goes Zurich to Iowa and nothing else leaves
Switzerland.

The frontend is public. The backend is not, and is reached with an identity
token the frontend fetches from the Cloud Run metadata server. Locally there is
no metadata server, so no token is sent and the backend is a plain process.

Deploy commands, and why each flag is not optional, are in the two READMEs.

## Known limits

**Jobs live in memory.** `backend/src/lib/jobs.ts` holds them in a `Map`, which
is why the backend runs with `--max-instances 1`: a second instance does not
share it, so a job created on one and polled on another returns 404. A restart
also loses whatever was rendering. Moving jobs to Firestore and audio to Cloud
Storage is the next substantial piece of work, and audio has to go to Storage
rather than Firestore because a one-minute episode is several megabytes and a
Firestore document caps at 1 MiB.

**Editing an article flattens it.** The body is one plain-text field, and
nothing in plain text can express a photograph. Editing an NZZ article drops
its in-article images and turns infoboxes and interview turns into paragraphs.
The form counts what will be lost and says so before you save, and re-running
the seed script restores the original.

**Transcript edits are not stored.** A turn can be edited and the audio
re-synthesised from it, but nothing persists the edited script, so it is gone
on reload.

**Simultaneous edits.** Two editors saving the same article at once: the second
overwrites the first's headline and body. The write is transactional, which
keeps the fields the form never collected consistent, but that is not conflict
detection. Catching it needs a version on the document and a refusal the editor
can see.
