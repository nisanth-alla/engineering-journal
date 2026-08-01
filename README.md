# Engineering Journal

Deep dives into JavaScript, TypeScript, React, Node.js, Go, and distributed systems. Interactive demos, real code, and interview prep. Built by a working engineer, not generated from a prompt.

Live at [nisanth-alla.github.io/engineering-journal](https://nisanth-alla.github.io/engineering-journal/)

Built with [Starlight](https://starlight.astro.build/) and deployed to GitHub Pages.

## What's here

**JavaScript** — The event loop visualized step by step, closures with scope chain diagrams, prototypes, async patterns from callbacks to async/await, and ES6+ features. Three interactive simulators.

**TypeScript** — Structural typing, narrowing, generics, utility types, and advanced patterns like branded types and discriminated unions. Two interactive demos for type inference and narrowing.

**React** — How rendering works (not what most people think), hooks explained through what they replaced, state management decisions, patterns, and performance. Three interactive demos.

**Node.js** — V8 and libuv internals, the event loop phases, streams and backpressure, error handling and graceful shutdown, Express patterns. Two interactive demos.

**Learning Go** — The mental model shift from Node's event loop to goroutines and channels, coming from TypeScript. What surprised me and what clicked.

**Experiments** — Rate limiting, saga orchestration, concurrent file processing. Each one isolates a real problem and builds a working solution. Code in the [distributed-systems-lab](https://github.com/nisanth-alla/distributed-systems-lab).

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:4321/engineering-journal/`.

## Build

```bash
npm run build
npm run preview
```

## Deploy

Pushes to `main` trigger the GitHub Actions workflow that builds and deploys to GitHub Pages.

## Connected repos

- [distributed-systems-lab](https://github.com/nisanth-alla/distributed-systems-lab) — runnable experiments in TypeScript and Go
- [system-design-notes](https://github.com/nisanth-alla/system-design-notes) — structured notes with interactive visualizations
- [reliable-job-platform](https://github.com/nisanth-alla/reliable-job-platform) — production-style job processing system

## License

MIT
