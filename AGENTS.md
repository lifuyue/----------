# Repository Guidelines

## Project Structure & Module Organization
- Root hosts uni-app (Vue 3 + TypeScript) source. Core code lives under `src/` (`data/`, `stores/`, `types/`) with pages in `pages/` and reusable components in `components/`.
- Static assets reside in `static/` (e.g., `/static/img/` for bundled media). Generated Mini Program build artifacts land in `unpackage/`. Test data and configuration stay alongside their domains.

## Build, Test, and Development Commands
- `npm install` – install dependencies (Pinia, uni tooling, TypeScript).
- `npx tsc --noEmit` – type-check the project.
- `npm run dev` / `npm run build` – invoke the uni-app CLI for local dev server or production build.
- WeChat tooling: import `unpackage/dist/dev/mp-weixin/` into the DevTools after running the dev build.

## Coding Style & Naming Conventions
- Vue 3 `<script setup>` with TypeScript; prefer composition API + Pinia stores.
- JSON data uses snake_case keys where appropriate and ISO timestamps (`updatedAt`).
- Keep styles scoped within components; use PascalCase for components (`FeaturedBanner.vue`), camelCase for composables/refs, kebab-case for file paths.
- Run `tsc` before commits to ensure types pass; format using the editor’s standard (2-space indentation).

## Testing Guidelines
- No automated test suite yet; validate by running `npx tsc --noEmit` and exercising flows in the WeChat DevTools.
- When adding logic modules, co-locate lightweight unit tests or provide manual verification notes in PRs.

## Commit & Pull Request Guidelines
- Commit messages: `<scope>: <imperative>` (e.g., `lexicon: add lantern festival term`). Keep commits focused.
- PRs should describe intent, list manual checks (`npx tsc --noEmit`, WeChat DevTools smoke test), mention data schema updates (`src/data/*.json`), and attach screenshots of new UI sections when relevant.

## Security & Configuration Tips
- Never commit secrets; `.env*` is ignored. For demo AppIDs, update both `manifest.json` and `project.config.json`.
- Static media bundled in `/static/` ships with the Mini Program; ensure licensing clearance before inclusion.
