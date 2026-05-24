# Repository Guidelines

## Project Structure & Module Organization

This repository contains a SvelteKit Progressive Web App for a local raised-bed and square-foot garden planner.

- `src/routes/+page.svelte` is the app entry point and switches between the main screens.
- `src/routes/+layout.js` configures SvelteKit for client-side/static PWA behavior.
- `src/lib/components/` contains reusable Svelte components and top-level screen components.
- `src/lib/stores/planner.js` contains app state, local persistence, grid logic, seasonal guidance, and mutations.
- `src/styles.css` contains the main responsive mobile design system.
- `src/lib/styles.css` imports the global stylesheet for SvelteKit.
- `src/service-worker.js` implements the PWA offline cache.
- `src/app.html` contains document metadata and PWA links.
- `static/manifest.webmanifest` contains installable PWA metadata.
- `static/assets/data/` contains required local JSON seed data.
- `static/assets/icons/` contains local PWA icons.
- `stuff/mockups/` contains visual references only.
- `stuff/Markttauglichkeit von BeetPlaner.pdf` contains product-positioning context for MVP decisions.

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

## MVP Product Direction

Build a fast, local-first, smartphone-friendly Hochbeet- und Quadratgarten-Planer for small growing spaces. The primary value is: users can create one or more beds, see the full bed clearly, place plants into square parcels, and reliably find their plan again later.

- Keep the bed and grid as the visual and functional center of the app.
- Prefer a small, dependable planning tool over an all-in-one garden assistant.
- Keep storage local and offline-capable; do not require an account or network connection.
- Do not present placeholder controls or static data as fully implemented product functionality.
- Keep control icons visually consistent; use plant emoji only as plant imagery.

## Implemented MVP Foundation

These product decisions and workflows are already implemented; keep them intact while completing the remaining MVP work:

- [x] The home screen focuses on the active bed rather than a dashboard header.
- [x] Bed previews and planner parcels preserve square grid cells.
- [x] The home screen supports horizontal swiping between multiple beds with dot navigation.
- [x] The bottom navigation is compact and exposes settings through `Mehr`.
- [x] The planting flow identifies the target parcel, avoids silent placement from the general catalog, and supports deliberate placement in the planner.
- [x] The planner keeps taps on occupied fields in context, using explicit `Bearbeiten`, `Ersetzen`, and `Löschen` actions instead of opening details immediately.
- [x] The planner communicates automatic local saving and moves demo/reset controls into secondary `Testfunktionen`.
- [x] The catalog distinguishes general browsing from selection for a specific field, including field-size context and a deliberate cancel path.
- [x] Catalog cards expose simple suitability guidance from existing local data and show a clear no-results state.
- [x] Bed creation presents named templates before a secondary custom-dimensions form, rejects dimensions that do not fit the selected raster, and opens newly created beds directly in the planner.
- [x] The home screen exposes a primary `Aktives Beet öffnen` action, keeps the complete active-bed preview visible at `360px`, `390px`, and `430px`, and displays compact occupancy status.
- [x] Home guidance is honestly labelled `Saisonhinweise`; concrete bed observations are prioritized before static monthly guidance and the UI explicitly states that these are not reminders.
- [x] The `Mehr` screen presents autosave, version, and licence details as information rather than placeholder actions, while retaining the real local reset action.
- [x] Visible nonfunctional header actions identified during the settings audit have been removed from `Mehr` and the field-detail view.
- [x] The field-detail view is a focused planting editor with `Pflanzung` and `Details` groups, explicit save/back actions, and a separate destructive delete section.
- [x] Visible raster terminology uses `Feld`, while key controls expose selected/current states, status feedback, visible keyboard focus, and larger mobile touch targets.

## Remaining MVP Work

Work through these items before treating the app as a clean MVP:

- [ ] Complete residual cross-screen normalization of headers, action icons, spacing, cards, and empty/error states after the field-detail/button/accessibility pass.
- [ ] Complete multi-bed home-screen QA: verify swipe and dot selection remain reliable after adding several beds, including at `360px`, `390px`, and `430px`.
- [ ] Review and normalize local seed content for names, field requirements, harvest information, neighbor guidance, and seasonal hints.
- [ ] Add loading, empty, and data-load error states for beds and local JSON loading. Catalog no-results feedback is already implemented.
- [ ] Harden local persistence with a state-version/migration strategy before schema changes expand.
- [ ] Verify offline PWA behavior, install metadata, local persistence after reload, and touch/responsive behavior at `360px`, `390px`, and `430px`.
- [ ] Decide on a publishable app name or subtitle before release because `BeetPlaner` remains a working title with potential discoverability conflict.

## MVP Non-Goals

Do not add these until the core planning workflow has been tested and is stable:

- login, cloud sync, community, or sharing
- AI suggestions or diagnosis
- push reminders or a full care calendar
- multi-year crop rotation or succession-planning systems
- payments, subscriptions, commerce, or partner integrations
- export and print features unless explicitly promoted into the MVP scope

## MVP Acceptance Checklist

Before declaring the MVP ready, verify that a new user can complete these workflows without explanation:

- [x] Create a bed from a template and create a custom bed.
- [ ] Switch between multiple beds on the home screen by swiping.
- [ ] Open a bed, select a parcel, place a plant, edit it, and delete it.
- [ ] Reload the app and find all created beds and plantings intact.
- [ ] Reopen the installed/offline app without network access.
- [ ] Use the app on a phone without clipped beds, obscured controls, or nonfunctional visible buttons.

## Next Commit-Sized Task

Continue the MVP hardening sequence with persistence and local-data states:

- Add an explicit persisted-state version and migration path before further schema changes.
- Add honest loading, empty, and local JSON load-error handling without introducing remote dependencies.
- Preserve the now-verified field edit/save/delete workflow and rerun mobile/offline checks after the state changes.
