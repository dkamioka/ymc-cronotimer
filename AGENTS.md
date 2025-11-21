# Repository Guidelines

## Project Structure & Module Organization
- Frontend (to be generated via Vite): `src/` for React + TypeScript views, hooks, Zustand stores, and UI atoms; `src/assets/` for static media; `src/routes/` once React Router is wired.
- Styling: `src/index.css` with Tailwind layers; custom design tokens live in `tailwind.config.js`.
- Build tooling: roots in `vite.config.ts`, `tsconfig*.json`; keep PWA setup (service worker, manifest) under `public/` when added.
- Documentation: `docs/` for plans and architecture decisions; keep contributor notes here.

## Build, Test, and Development Commands
- `npm install` — install dependencies after scaffolding.
- `npm run dev` — Vite dev server with hot reload; default port 5173.
- `npm run build` — production bundle check; ensure it stays warning-free.
- `npm run preview` — serve the built bundle locally for PWA verification.
- (When tests are added) `npm test` — reserve for Vitest or Playwright suites; keep headless by default.

## Coding Style & Naming Conventions
- Language: TypeScript-first; prefer typed hooks and component props.
- Formatting: rely on Prettier/ESLint defaults from Vite; 2-space indent, single quotes allowed, semicolons discouraged unless tooling enforces.
- Components: `PascalCase.tsx`; hooks: `useThing.ts`; Zustand slices/stores: `*.store.ts`.
- Files inside feature folders should co-locate tests (`*.test.ts(x)` or `*.spec.ts(x)`) and styles when practical.
- Tailwind: favor utility-first; extract repeated patterns into small components before adding custom CSS.

## Testing Guidelines
- Target frameworks: Vitest for unit/component tests; Playwright (optional) for flows on the timer and TV display.
- Prefer deterministic timers using fake timers for countdown/count-up logic; avoid real-time waits.
- Test naming: mirror source path and describe scenario, e.g., `editor/Timeline.test.tsx`.
- Aim for coverage on workout hierarchy parsing, repeat/duplicate flows, and timer accuracy; treat regressions here as blocking.

## Commit & Pull Request Guidelines
- Use Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`) matching existing `chore: initialize Vite...` pattern.
- Keep commits scoped and buildable; avoid bundling dependency changes with feature logic.
- PRs should include: purpose summary, linked issue/plan section, before/after screenshots for UI, and dev/preview commands run.
- Call out any schema or Supabase policy changes explicitly and include migration steps or SQL snippets.

## Security & Configuration Tips
- Do not commit Supabase keys or `.env*`; use `.env.local` for dev and document required variables (e.g., `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- Enforce RLS-aligned access in client queries; never bypass tenant filters in temporary scripts.
- When adding service workers/PWA features, verify HTTPS-only assumptions and cache-busting on deploy previews.
