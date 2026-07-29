# Engineering Journal

Notes, experiments, and lessons from building distributed systems, learning Go, and studying system design. Written as I learn, not after I've mastered it.

Built with [Starlight](https://starlight.astro.build/) and deployed to GitHub Pages.

## What's here

**Learning Go** — Coming from TypeScript/Node, documenting the mental model shifts, the things that surprised me, and the concepts I had to unlearn and relearn. Each article references real code from the distributed systems lab.

**Experiments** — Walkthroughs of the experiments in the [distributed-systems-lab](https://github.com/nisanth-alla/distributed-systems-lab). Goes deeper than the README with context on why each design decision was made.

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

- [distributed-systems-lab](https://github.com/nisanth-alla/distributed-systems-lab) — the runnable experiments this site documents
- [system-design-notes](https://github.com/nisanth-alla/system-design-notes) — structured notes with interactive visualizations
- [reliable-job-platform](https://github.com/nisanth-alla/reliable-job-platform) — production-style job processing system

## License

MIT
