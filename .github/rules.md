# AI Development & Pull Request Rules

Guidelines for AI agents and contributors working on this repository.

---

## 1. Branch Naming Conventions

Always create a dedicated branch before making changes. Never work or commit directly on `main` or `develop`.

Format: `<type>/<short-description>` (kebab-case)

### Prefixes

- `feat/` — New feature or functionality (e.g., `feat/audio-player`)
- `fix/` — Bug fix or error resolution (e.g., `fix/playback-stutter`)
- `chore/` — Maintenance, tooling, configs, or documentation (e.g., `chore/ai-rules`)
- `refactor/` — Code refactoring without changing functionality (e.g., `refactor/audio-engine`)
- `test/` — Adding or modifying tests (e.g., `test/session-cache`)

---

## 2. Commit Message Standards

Follow Conventional Commits with concise explanations focused on **why** the change was made, not just **what**.

Format: `<type>: <summary>`

### Common Types

- `feat:` A new feature
- `fix:` A bug fix
- `chore:` Routine tasks, configuration, or documentation
- `refactor:` Code improvements without feature or bug changes
- `test:` Adding or updating tests

_Example:_ `feat: add tanstack query client provider for server state hydration`

---

## 3. Pull Request Guidelines

### Pre-PR Checklist

1. **Target Branch:** Open PRs against `develop` (or `main` if single-branch flow).
2. **Quality Checks:** Ensure all standard CI checks pass before submitting:
   - Linting (`eslint`)
   - Type check (`tsc --noEmit`)
   - Tests (`jest` / `vitest`)
   - Build (`npm run build` or framework equivalent)
3. **Atomic Changes:** Keep PRs small, focused, and scoped strictly to the task.

### PR Title

Follow conventional commit format:

- `feat: implement user settings screen`
- `fix: resolve waveform rendering lag`
- `chore: update github action ci workflows`

### PR Description Template

```markdown
## Summary

Brief description of what changes were made and why.

## Key Changes

- Bullet list of specific changes

## Verification

- [ ] Lint passed
- [ ] Type check passed
- [ ] Tests passed
- [ ] Manual verification completed
```

---

## 4. Agent Safety & Workflow Rules

- **No Auto-Commit / Auto-Push:** Never commit or push without explicit user instruction.
- **No Destructive Operations:** Always request confirmation before running destructive Git commands (`git reset --hard`, `git push --force`, deleting branches).
- **Code Organization:** Keep files under 200 lines where practical; prefer editing existing files over creating new ones.
