# Resonance — Hackathon Delivery Rules

Judging criteria for the NZZ + Google Cloud hackathon, transcribed from the
organisers' "Do not forget to..." slide. These are hard constraints on what we
ship, not preferences.

Branch naming, commit format, and PR conventions live in
[`.github/rules.md`](.github/rules.md) and are not repeated here.

---

## 1. Live App Demo — no local code

The demo is presented from a deployed URL, not from a laptop. Anything the
judges see must be served by deployed infrastructure (Cloud Run, Firebase
Hosting, App Engine, or equivalent).

- Never build a feature whose demo path only works against `localhost`.
- Hardcoded `localhost` / `127.0.0.1` endpoints are a bug, not a shortcut.
  Read the host from environment configuration.
- Anything merged to `main` must survive being deployed. If a change cannot
  be deployed, it is not done.

Developing locally is expected and fine. This rule constrains the *demo
surface*, not the development loop.

---

## 2. Clean & modular architecture

- One responsibility per file. Keep files under 200 lines; split before
  exceeding it rather than after.
- Keep the existing layering in `backend/src`: `routes/` handles HTTP,
  `services/` holds business logic and third-party clients. Routes must not
  call the Gemini or Google Cloud SDKs directly.
- Prefer editing an existing module over adding a parallel one. Search for a
  helper before writing a new one.
- No dead code. No commented-out blocks kept "for later" — git is the archive.
- TypeScript stays strict at boundaries: no `any`, no untyped JSON from a
  request body or an external API.

---

## 3. Dynamic data only

Every value a judge sees is fetched at runtime. No mock data in the demo path.

- No hardcoded arrays of fake articles, placeholder transcripts, stub audio,
  or lorem ipsum rendered as if it were real content.
- No `if (isDemo) return fakeResponse` branches.
- If a live source is unavailable, show an explicit error or empty state.
  Never substitute fabricated content for a failed call.
- Fixtures are allowed in tests only, never in a code path the UI can reach.

---

## 4. Polished UX/UI

Judges see the interface before they see the code. Treat unfinished UI as an
unfinished feature.

- Every asynchronous action has a visible loading state. No frozen screens
  while Gemini or text-to-speech is working.
- Every failure has a human-readable message. Never surface a raw stack trace
  or a bare status code to the user.
- Every list has a designed empty state.
- No dead ends: from any screen there is a way forward or back.
- Responsive down to a laptop screen — that is what the demo runs on.
- Consistent spacing, typography, and colour. Match what is already there
  rather than introducing a second visual language.

---

## 5. Creativity

Judged on more than working software. When two implementations are equally
sound, pick the one that is more interesting to watch. Do not sand a
distinctive idea down into the safe version of itself.

---

## Team checklist (people, not agents)

From the same slide. Listed for completeness; nothing here is enforceable by
a coding agent.

- **Active engagement & mentorship** — tap in to mentors[^1] to help.
- **Unleash creativity.**

[^1]: The right-hand edge of the source slide is cropped in the photo; the
remainder of this line could not be read and has not been reconstructed.

---

## Before saying a task is done

- [ ] Runs from a deployed URL, not `localhost` (§1)
- [ ] No mock or hardcoded data in a path the UI can reach (§3)
- [ ] Loading, error, and empty states exist (§4)
- [ ] `tsc --noEmit` passes (§2)
- [ ] Files under 200 lines, no dead code, no `any` at boundaries (§2)
