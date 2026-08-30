import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";

/** @type {import("eslint").Linter.Config[]} */
export default [
  // Global ignores — never lint generated output, deps, or config artifacts
  {
    ignores: ["dist/**", ".astro/**", "node_modules/**", "playwright-report/**", "test-results/**"],
  },

  // Verify script — console.log is intentional CLI output
  {
    files: ["scripts/**/*.mjs"],
    rules: { "no-console": "off" },
  },

  // TypeScript source files (components only)
  {
    files: ["src/components/**/*.tsx", "src/components/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react-hooks": reactHooks,
    },
    rules: {
      // ── Hooks rules — the ones that actually prevent runtime bugs ──────────
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // ── TypeScript rules ──────────────────────────────────────────────────
      // no-unused-vars: catch dead imports and variables the compiler misses
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          // Underscore prefix is the conventional way to acknowledge intentional
          // unused args (e.g. event handler signatures with required params)
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // Prefer explicit types on exported functions — makes the public API readable
      // without hovering in an IDE
      "@typescript-eslint/explicit-module-boundary-types": "off",
      // any is a code smell, but sometimes the right escape hatch (e.g. CSS vars,
      // Astro's Starlight internals). Warn, not error.
      "@typescript-eslint/no-explicit-any": "warn",
      // Require const when let is never reassigned
      "prefer-const": "error",
      // Catch == vs === before the reviewer does
      eqeqeq: ["error", "always", { null: "ignore" }],
      // No console.log left in components — use the demo-output classes instead
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  // Test files — relax a few rules (page.evaluate callbacks need any, console is fine)
  {
    files: ["tests/**/*.ts", "tests/**/*.spec.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
];
