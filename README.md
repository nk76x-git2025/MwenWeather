# MwenWeather

MwenWeather is a personal weather memory journal. It is intended to show current weather, let the user log how the weather actually felt, what they wore, and what they wish they had worn or brought. Over time, recommendations should come from the user's own past logs instead of generic weather advice.

Core loop:

```text
current weather → personal outfit/feeling log → history → explainable recommendation
```

## Current repository state

This repository is currently in planning/setup state only.

Inspected on this planning pass:

- No `package.json` is present yet.
- No app framework or build setup is present yet.
- No `src/` folder or application code is present yet.
- No existing README was present before this planning pass.
- No existing style files are present yet.
- No existing PWA manifest or service worker files are present yet.
- No lint, build, or test commands are configured yet.
- No TypeScript configuration is present yet.
- No Tailwind configuration is present yet.
- A repository-level `AGENTS.md` has now been added for project working rules.

## Intended MVP stack

Use this stack unless a future PR documents a strong reason to change it:

- **Vite** for the frontend build tool and development server.
- **React** for the UI.
- **TypeScript** for app logic and typed data shapes.
- **Tailwind CSS** for mobile-first styling.
- **IndexedDB** for local-first personal log storage.
- **PWA manifest + conservative service worker** for installability and basic app-shell resilience.

MwenWeather v1 should remain frontend-only and local-first. Do not add login, cloud sync, a backend, a database server, or server-side API proxy unless explicitly requested.

## Programming languages and file types

Preferred for v1:

- **TypeScript (`.ts`)** for app logic, storage, data models, and utilities.
- **TSX (`.tsx`)** for React components.
- **CSS (`.css`)** only for global styles and Tailwind setup.
- **HTML (`index.html`)** only for the Vite entry point unless there is a strong reason otherwise.
- **JSON (`.json`)** for the PWA manifest, sample data, config, and export/import data shapes.
- **Markdown (`.md`)** for README and project documentation.
- **Bash/shell** only in documentation or scripts when needed.

Avoid for v1 unless explicitly requested:

- Python backend
- Django
- Flask
- Express backend
- Database server
- Authentication framework
- Cloud sync service
- Server-side API proxy
- Docker setup if the repo does not already use Docker

## Planned PR roadmap

### PR 1 — App scaffold + mobile shell

Create the Vite + React + TypeScript app scaffold. Add Tailwind CSS, a dark-mode-first mobile shell, basic navigation placeholders, and documented development commands. Do not implement weather fetching or storage yet.

### PR 2 — PWA baseline

Add a web app manifest, icons/placeholders as needed, installability metadata, and a conservative service worker strategy. Cache static app-shell assets only. Do not cache weather API responses or personal log data.

### PR 3 — Local IndexedDB data layer

Add simple, documented local data types and an IndexedDB wrapper for personal logs. Include export/import before risky storage changes and call out backup risk in the PR summary.

### PR 4 — Current weather screen

Add a current weather screen using a browser-safe weather provider. Keep secrets out of Git. Prefer providers that do not require a private server-side key for v1.

### PR 5 — New log form with permanent weather snapshot

Add the form for logging how the weather felt, what was worn, and what the user wishes they had worn or brought. Store a permanent weather snapshot inside each log entry so future recommendations do not depend on mutable API data.

### PR 6 — History screen

Add a history screen for browsing personal logs. Prioritize readable summaries, mobile tap targets, and simple filtering/sorting before advanced search.

### PR 7 — Simple explainable recommendations

Add recommendation logic based on past logs. Recommendations must be explainable by showing which past logs or patterns influenced the suggestion.

### PR 8 — UI polish + Android/PWA testing

Polish the mobile UI, verify installability and offline behavior, and manually test on Android/PWA flows where possible.

## How to run the project

The project is not runnable yet because the app scaffold has not been created. After PR 1, this section should be updated with the actual package manager and commands, such as install, development server, lint, test, and build commands.

For now, there are no configured project commands.

## Manual testing expectations

Every PR should include manual acceptance tests in the PR summary. For this planning PR, manual acceptance is documentation-focused:

- Confirm `README.md` describes the app concept and current repo state.
- Confirm the roadmap is phased and does not implement the MVP yet.
- Confirm `AGENTS.md` captures the project constraints and data-safety rules.
- Confirm no app scaffold, backend, auth, cloud sync, Docker setup, or database server was added.

Future implementation PRs should include both command-based checks and human acceptance tests. For UI changes, test mobile viewport behavior and avoid hover-only interactions.

## Known risks and limitations

- There is no runnable app yet.
- No package manager or dependency policy has been selected through generated files yet.
- Weather provider choice is still open; v1 should prefer a browser-safe provider that does not require committing real API keys.
- IndexedDB schema details are not designed yet.
- Export/import must be added before any risky storage migrations.
- PWA caching must remain conservative to avoid caching weather API responses or personal log data.
