# Contributing

Thanks for considering a contribution to the Engineering Journal. This is a personal learning and documentation site covering JavaScript, TypeScript, React, Node.js, Next.js, Go, Playwright, and distributed systems.

## Getting started

1. Read the [README](README.md) for the stack and structure.
2. Articles live under `src/content/docs/` as MDX. Interactive demos live under `src/components/` as React components.
3. Open an issue or discussion before large changes so the approach is agreed in advance.

## Development rules

- **Formatting**: run `npm run format`.
- **Checks**: run `npm run check` (Astro + TypeScript diagnostics).
- **Build**: run `npm run build`.
- **Browser tests**: run `npm run test:e2e` (requires Playwright Chromium installed).
- **Full gate**: run `npm run verify` to validate formatting, checks, build, search index, and browser tests in one command.
- Write in the journal's voice: precise, senior, and non-generic. No AI-sounding filler.
- Every article that introduces a concept should be self-contained and, where useful, end with an "Interview angles" section.
- Interactive demos should teach real behavior. Avoid decorative components that add no learning value.
- Never commit `.env`, `dist/`, `.astro/`, or credentials.

## Commit and publishing

Leave commits and publishing to the repository owner. Ensure `npm run verify` passes before opening a pull request.

## License

By contributing, you agree that your contributions are licensed under the same [MIT License](LICENSE) that covers this project.
