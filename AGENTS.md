# Repository Guidelines

## Project Structure & Module Organization

This repository contains a SvelteKit Progressive Web App for a local raised-bed and square-foot garden planner.

- `src/routes/+page.svelte` is the app entry point and switches between the main screens.
- `src/routes/+layout.js` configures SvelteKit for client-side/static PWA behavior.
- `src/lib/components/` contains reusable Svelte components and top-level screen components.
- `src/lib/stores/planner.js` contains app state, local persistence, grid logic, dashboard hints, season logic, and mutations.
- `src/styles.css` contains the main responsive mobile design system.
- `src/lib/styles.css` imports the global stylesheet for SvelteKit.
- `src/service-worker.js` implements the PWA offline cache.
- `src/app.html` contains document metadata and PWA links.
- `static/manifest.webmanifest` contains installable PWA metadata.
- `static/assets/data/` contains required local JSON seed data.
- `static/assets/icons/` contains local PWA icons.
- `mockups/` contains visual references only.

Generated folders such as `build/`, `.svelte-kit/`, and `node_modules/` should not be edited manually.

## Build, Test, and Development Commands

Run these from the repository root.

```bash
npm install
```

Installs SvelteKit, Vite, and project dependencies.

```bash
npm run dev
```

Starts the Vite dev server. The default local URL is `http://localhost:5173`.
For smartphone testing on the same WLAN, use the `Network:` URL that Vite prints, for example `http://192.168.178.23:5173/`. Do not use `localhost` on the phone.

```bash
npm run build
```

Builds the static PWA into `build/`.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm test
```

Currently runs the production build as the project smoke test.

## Coding Style & Naming Conventions

Use Svelte 5 and modern JavaScript with 2-space indentation. Keep components small and focused. Use `UpperCamelCase.svelte` for Svelte components, `lowerCamelCase` for variables and functions, and descriptive file names.

Keep app-facing text in German unless the surrounding file clearly uses English. Avoid unnecessary packages; prefer SvelteKit, standard browser APIs, and small local helpers.

The visual direction should stay close to the mockups: dark green header, calm cream background, white cards, bottom navigation, strong raised-bed grid, generous touch targets, and a modern mobile-first PWA feel.

## Responsive & PWA Guidelines

Design mobile-first. The app is intended for smartphone use, but should remain usable on narrow and wider browser viewports.

- Do not add fake phone status bars, fake device chrome, or simulated time/battery UI.
- Use `svh`, safe-area env vars, and fixed bottom navigation carefully so content remains reachable on mobile browsers.
- Keep primary controls large enough for touch.
- Verify layout at common widths such as `360px`, `390px`, and `430px`.
- Keep offline behavior local-only via `src/service-worker.js`.
- Keep seed data fetch paths under `/assets/data/...`, backed by files in `static/assets/data/`.

## Testing Guidelines

At minimum, run `npm run build` before handing off changes. For UI changes, also run the dev server and visually check the affected screen at smartphone dimensions.

Prioritize tests or manual verification for:

- loading local JSON seed data
- creating beds from templates
- selecting a parcel and placing a plant
- saving field detail values
- LocalStorage persistence after reload
- catalog filtering and search
- responsive layout with bottom navigation
- PWA manifest and service worker build output
- LAN access from a smartphone on the same WLAN using the Vite `Network:` URL

## Commit & Pull Request Guidelines

No reliable Git history is available in this workspace, so use clear conventional-style commit messages such as `feat: migrate to sveltekit pwa` or `fix: compact mobile header`.

Pull requests should include a short summary, screenshots or screen recordings for UI changes, test results (`npm run build`), and notes about any asset or JSON schema changes. Link related issues when available.

## Security & Configuration Tips

The MVP is intentionally local-only: no login, cloud sync, external APIs, or secret keys. Keep plant, template, and season data in `static/assets/data/`. If the working app name changes, update `static/manifest.webmanifest`, `src/app.html`, `package.json`, and README references together.
