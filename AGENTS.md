# Repository Guidelines

## Project Structure & Module Organization
- The uni-app/Vue 3 codebase lives at the repo root. Core source sits in `src/` (`data/` holds offline JSON content, `stores/` Pinia logic, `types/` shared models). Page single files are under `pages/`, while reusable UI goes in `components/`.
- Static media and icon assets ship from `static/`. Mini Program outputs appear in `unpackage/dist/` after each build. Keep demo-only resources inside `static/img/` with placeholder naming (e.g., `crab.jpg`).

## Build, Test, and Development Commands
- `npm install` – install dependencies (Pinia, TypeScript, uni tooling).
- `npm run dev` – run the uni CLI; then import `unpackage/dist/dev/mp-weixin/` into WeChat DevTools for live preview.
- `npm run build` – produce production assets.
- `npx tsc --noEmit` – strict type-check; run before commits to ensure offline JSON and store typings line up.

## Coding Style & Naming Conventions
- Use Vue 3 `<script setup>` with Composition API. Components are PascalCase (`MiniPlayerBar.vue`), refs/composables camelCase, files in kebab-case.
- Type definitions belong in `src/types/`; extend existing models instead of redefining.
- JSON content follows 2-space indent, double quotes, ISO 8601 timestamps, and includes bilingual fields (`name.zh`, `name.en`).
- Styles stay scoped; prefer utility-like class names (`map-page__term-card`) mirroring the component structure.

## Testing Guidelines
- There is no automated test harness; rely on `npx tsc --noEmit` plus manual smoke tests in WeChat DevTools (verify map markers, offline lexicon search, audio playback).
- When adding behavioural logic, document manual steps in the PR and update fixtures in `src/data/` with deterministic sample data.

## Commit & Pull Request Guidelines
- Commit format: `<scope>: <imperative>` (examples: `map: render term markers`, `data: add mitten crab entry`). Group related JSON, store, and UI updates together.
- PRs must explain intent, list verification commands (`npx tsc --noEmit`, DevTools scenario run), highlight schema or coordinate changes, and attach screenshots/GIFs for UI shifts.

## Security & Configuration Tips
- Never commit secrets; `.env*` is gitignored. Demo AppIDs must be updated in both `manifest.json` and `project.config.json`.
- Static bundles ship with the Mini Program—confirm licensing before adding media. For third-party data, document sources within `sources[]` in JSON so auditors can verify provenance.
