# Engineering Journal

Deep dives into JavaScript, TypeScript, React, Node.js, Next.js, Go, Databases, Infrastructure, Playwright, and distributed systems. Interactive demos, real code, interview prep, and build notes from real projects. Built by a working engineer, not generated from a prompt.

Live at [nisanth-alla.github.io/engineering-journal](https://nisanth-alla.github.io/engineering-journal/)

Built with [Starlight](https://starlight.astro.build/) and deployed to GitHub Pages.

## What's here

**JavaScript** — The event loop visualized step by step, closures with scope chain diagrams, prototypes, async patterns from callbacks to async/await, and ES6+ features. Three interactive simulators.

**TypeScript** — Structural typing, narrowing, generics, utility types, and advanced patterns like branded types and discriminated unions. Two interactive demos for type inference and narrowing.

**React** — How rendering works (not what most people think), hooks explained through what they replaced, state management decisions, patterns, and performance. Three interactive demos.

**Node.js** — V8 and libuv internals, the event loop phases, streams and backpressure, error handling and graceful shutdown, Express patterns. Two interactive demos.

**Next.js** — Server and client rendering, the App Router mental model, Server Components, data fetching, caching, middleware, and deployment. Includes an interactive server/client boundary trace.

**Learning Go** — The mental model shift from Node's event loop to goroutines and channels, coming from TypeScript. What surprised me and what clicked.

**Playwright** — Browser automation from locators and actionability to isolated contexts, network control, traces, accessibility, and CI. Includes production-minded browser tests for the journal's interactive demos.

**Interview Prep** — Senior-level JavaScript, TypeScript, React, and frontend system design answers with structured reasoning and tradeoffs.

**Experiments** — Rate limiting, saga orchestration, concurrent file processing. Each one isolates a real problem and builds a working solution. Code in the [distributed-systems-lab](https://github.com/nisanth-alla/distributed-systems-lab).

**Databases** — Pages, storage engines, and B-tree indexes from first principles. MVCC and how it lets readers not block writers. Isolation levels, deadlocks, and the ACID properties without the textbook definitions. SQL vs NoSQL: the real trade-off, not the hype. Includes an interactive index vs sequential scan visualizer.

**Infrastructure** — How containers actually work (Linux namespaces, cgroups, the layer filesystem), what a CI/CD pipeline is defending against and why flakiness is debt, the three observability signals and what each answers, and deployment patterns with the database migration problem nobody mentions first. Includes an interactive CI pipeline simulator.

**Build Notes** — Architecture and lessons from projects I have built. Currently: FoxPilot, a profile-driven job discovery engine covering profile-based filtering, a two-database data-mismatch bug, and LLM cost/latency engineering.

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

## Verify

Run the complete diff-ready gate:

```bash
npm run verify
```

This checks formatting, ESLint, Astro and TypeScript diagnostics, a clean production build, the Pagefind search index, and the full Playwright browser suite against the built site. CI runs the same command on every pull request.

## Deploy

Pushes to `main` trigger the GitHub Actions workflow that builds and deploys to GitHub Pages.

## Connected repos

- [distributed-systems-lab](https://github.com/nisanth-alla/distributed-systems-lab) — runnable experiments in TypeScript and Go
- [system-design-notes](https://github.com/nisanth-alla/system-design-notes) — structured notes with interactive visualizations
- [reliable-job-platform](https://github.com/nisanth-alla/reliable-job-platform) — production-style job processing system
- [retail-discovery](https://github.com/nisanth-alla/retail-discovery) — [live visual retail discovery application](https://retail-discovery.onrender.com/) built with Java, Spring Boot, React, and computer vision

## License

MIT
