# Coding Rules and Guidelines

Enforced by `.github/workflows/code-quality.yml` on every pull request. A
violation fails the check and the PR cannot merge until it is fixed.

## How to run the gate locally

```bash
npm install          # once
npm run lint         # same command CI runs
npm run lint:fix
npm run format:check # same command CI runs
npm run format       # rewrites files
```

Run `lint:fix` before `format`. ESLint reorders imports, and Prettier then
formats the lines it moved. The other order needs a second pass.

`npm run lint` is `eslint . --max-warnings=0`. The flag is what makes it
binding. Without it ESLint exits 0 whenever every finding is a warning, so CI
goes green over broken code and the rules are decorative.

## Enforced rules

| Rule                                   | Setting                         | What it stops                                          |
| -------------------------------------- | ------------------------------- | ------------------------------------------------------ |
| `@typescript-eslint/no-explicit-any`   | error                           | Untyped values crossing a boundary                     |
| `@typescript-eslint/no-unused-vars`    | error, `_` prefix exempt        | Dead imports and leftover variables                    |
| `@typescript-eslint/no-shadow`         | error, `error` allowed          | An inner name silently hiding an outer one             |
| `import-x/no-cycle`                    | error, no depth cap             | Circular imports and their half-initialised modules    |
| `max-params`                           | error, 4                        | Argument lists nobody can call correctly               |
| `prefer-const`                         | error                           | `let` for something never reassigned                   |
| `eqeqeq`                               | error                           | `==` and its coercion surprises                        |
| `max-lines`                            | error, 300                      | Files that have quietly become two files               |
| `max-lines-per-function`               | error, 50                       | Functions doing more than one thing                    |
| `max-depth`                            | error, 4                        | Nesting past the point of readability                  |
| `complexity`                           | error, 15                       | Functions with more paths than anyone can test         |
| `no-nested-ternary`                    | error                           | `a ? b : c ? d : e`                                    |
| `@typescript-eslint/naming-convention` | error, 4 selectors              | Casing conventions drifting apart between contributors |
| `import-x/order`                       | error, grouped and alphabetised | Import churn that hides the real change in a diff      |

Blank lines and comments do not count toward the length rules, so documenting a
file is never penalised. Config files, tests and generated code are exempt from
them.

`.github/rules.md` section 4 asks for files under 200 lines. Treat that as the
target and 300 as the hard fail.

## Formatting

Prettier owns formatting. ESLint owns semantics. They do not overlap, because
`eslint-config-prettier` sits last in `eslint.config.mjs` and switches off every
ESLint rule that has an opinion about layout. Without it the two fight and
`lint:fix` and `format` undo each other on every run.

Settings live in `.prettierrc.json` and were chosen to match the code that was
already there, not by taste:

| Option          | Value | Why                                                                                                                        |
| --------------- | ----- | -------------------------------------------------------------------------------------------------------------------------- |
| `printWidth`    | 100   | At Prettier's default of 80, 174 existing lines rewrap. At 100, only 80 do.                                                |
| `singleQuote`   | false | The frontend already had 242 double-quoted imports and the backend 20 single-quoted. Majority wins, and it is the default. |
| `semi`          | true  | 1,059 lines already ended in a semicolon.                                                                                  |
| `tabWidth`      | 2     | Matches the existing indentation.                                                                                          |
| `trailingComma` | all   | Adding an item touches one line, so blame stays accurate.                                                                  |

`.prettierignore` excludes `infra/`, lockfiles, build output and `*.d.ts`:
machine-written or someone's local container state, none of it ours to reformat.

## Deliberately off

| Rule                                               | Why                                                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `@typescript-eslint/no-magic-numbers`              | Hackathon code is full of legitimate literals. Enabling it costs more than it returns right now. |
| `@typescript-eslint/explicit-function-return-type` | Signature churn for little gain this early.                                                      |

Both are off with a reason rather than silently absent. Revisit once the
product settles.

## What is not enforced yet

The root config is syntactic only. It sets no `parserOptions.project`, so
type-aware rules such as `no-unnecessary-condition` and
`prefer-nullish-coalescing` cannot run. The reason is a version conflict:
`backend/package.json` pins `typescript@^7.0.2`, while `typescript-eslint@8`
declares support for `typescript >=4.8.4 <6.1.0`. Loading the type-checker here
would collide with that.

`backend/tsconfig.json` is type-checked separately by the workflow, but only
once the backend is committed.
