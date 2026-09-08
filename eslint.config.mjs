/**
 * Root ESLint flat config (ESLint 10).
 *
 * Syntactic-only on purpose: no `parserOptions.project`, so no type-aware
 * rules. The backend pins typescript@^7.0.2 while typescript-eslint@8 declares
 * `typescript >=4.8.4 <6.1.0`; loading the type-checker here would collide with
 * that.
 *
 * Rationale for each rule is in docs/CODING_RULES.md.
 */
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import-x";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      // Next.js build output. Absent from the original list, so a local
      // `next build` made `npm run lint` report tens of thousands of errors in
      // generated code. CI never saw it because it lints without building.
      "**/.next/**",
      "**/coverage/**",
      "**/*.d.ts",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    plugins: { "import-x": importPlugin },
    rules: {
      // --- Type and correctness ------------------------------------------
      "@typescript-eslint/no-explicit-any": "error",
      // No maxDepth cap on purpose. Capping at 2 lets cycles of length 3 or
      // more (A imports B imports C imports A) pass silently.
      "import-x/no-cycle": "error",
      "max-params": ["error", 4],
      // The base `no-shadow` false-positives on TypeScript type and enum
      // declarations, so it is off and the typescript-eslint extension does
      // the work.
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": ["error", { allow: ["error"] }],
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // --- Naming ---------------------------------------------------------
      // Encodes the convention the codebase already follows, so it survives
      // the next contributor. Deliberately NOT using the `default` selector:
      // that would also police object literal keys, and API payloads
      // legitimately carry snake_case fields we do not control.
      "@typescript-eslint/naming-convention": [
        "error",
        // PascalCase is allowed for variables and functions because a React
        // component is both.
        { selector: "variable", format: ["camelCase", "UPPER_CASE", "PascalCase"] },
        { selector: "function", format: ["camelCase", "PascalCase"] },
        { selector: "parameter", format: ["camelCase"], leadingUnderscore: "allow" },
        { selector: "typeLike", format: ["PascalCase"] },
      ],

      // --- Import order ---------------------------------------------------
      // Import churn is the noisiest kind of diff: it hides the real change
      // behind reshuffled lines. Fixed groups plus alphabetising makes the
      // order mechanical, and --fix applies it, so nobody argues about it.
      "import-x/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      // --- Size and shape -------------------------------------------------
      // Blank lines and comments do not count, so documenting a file is never
      // punished. Config, tests and generated code are exempt below.

      // .github/rules.md section 4 asks for under 200 lines as the target.
      // 300 is the hard fail.
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["error", { max: 50, skipBlankLines: true, skipComments: true }],
      "max-depth": ["error", 4],
      // Cyclomatic complexity: roughly the number of independent paths through
      // a function. Past ~15 it stops fitting in one head and cannot be
      // meaningfully tested.
      complexity: ["error", 15],
      "no-nested-ternary": "error",

      // --- Deliberately off ----------------------------------------------
      // Both are high-churn and cost more than they return under time
      // pressure. Hackathon code is full of legitimate literals, and return
      // annotations add signature churn for little gain this early. Revisit
      // once the product settles.
      "@typescript-eslint/no-magic-numbers": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },

  // These file types legitimately run long, so the length rules do not apply:
  // config is a flat lookup table, tests colocate fixture data, and generated
  // clients are machine-written.
  {
    files: [
      "**/*.config.{ts,js,mjs,cjs}",
      "**/*.test.{ts,tsx,js,jsx}",
      "**/*.spec.{ts,tsx,js,jsx}",
      "**/__tests__/**",
      "**/generated/**",
    ],
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
    },
  },

  // MUST STAY LAST. Turns off every ESLint rule that would fight Prettier over
  // formatting. Anything placed after this could re-enable one of them and
  // reintroduce the conflict.
  prettierConfig,
];
