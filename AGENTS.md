# AGENTS.md — MwenWeather Working Rules

These instructions apply to the entire repository.

## Product direction

MwenWeather is a personal weather memory journal. The core loop is:

current weather → personal outfit/feeling log → history → explainable recommendation

For v1, keep the app frontend-only, local-first, and intentionally small unless the user explicitly asks otherwise.

## PR workflow

1. Work in small PRs.
2. Do not make unrelated changes.
3. Add acceptance tests to every PR summary.
4. Before schema or storage changes, call out backup risk.
5. Do not implement multiple roadmap phases in a single PR unless explicitly requested.

## Data safety and storage

1. Preserve personal data.
2. Export/import must exist before risky storage changes.
3. Weather snapshots must be stored permanently in each log.
4. Recommendations must be explainable from past logs.
5. Keep data types simple, readable, and documented.
6. Do not cache weather API responses or personal log data.

## Architecture constraints for v1

1. Do not add auth, cloud sync, or a backend for v1 unless asked.
2. Do not introduce Python, Django, Flask, Express, Docker, or a database server for v1 unless explicitly requested.
3. Prefer browser-safe weather providers for v1.
4. Use environment variables only when needed.
5. Keep secrets out of Git.
6. Do not commit real API keys.

## Preferred stack

Use this stack unless the repository clearly changes direction later:

- Vite
- React
- TypeScript
- Tailwind CSS
- IndexedDB for local-first storage
- PWA manifest and conservative service worker

## Languages and file types

1. Prefer TypeScript and TSX for new app code.
2. Use CSS only for global styles and Tailwind setup.
3. Use HTML only through the Vite entry point unless there is a strong reason otherwise.
4. Use JSON for manifest, sample data, config, and export/import data shapes.
5. Use Markdown for README and documentation.
6. JavaScript is acceptable only for tooling/config files when required, but prefer TypeScript for app logic.

## UI expectations

1. Use mobile-first, dark-mode-first UI.
2. Avoid tiny tap targets and hover-only actions.
3. Treat Android/PWA behavior as a first-class target.

## PWA and caching

1. Use conservative service worker caching.
2. Cache static app shell assets only when safe.
3. Do not cache weather API responses.
4. Do not cache personal log data in the service worker.
