# BeetPlaner PWA

BeetPlaner ist eine SvelteKit Progressive Web App für die schnelle Planung kleiner Hochbeete und Quadratgärten. Der Name bleibt ein Arbeitstitel und ist zentral in `static/manifest.webmanifest`, `src/app.html` und `package.json` austauschbar.

## Produktpositionierung

Die App ist kein allgemeiner Gartenplaner, kein KI-Gartenhelfer und keine All-in-One-Garten-App. Sie ist ein einfacher, schneller, lokaler und offline nutzbarer Hochbeet- und Quadratgarten-Planer für kleine Flächen.

Kernversprechen: In wenigen Minuten ein kleines Beet planen, bepflanzen und über die Saison im Blick behalten - ohne Login, ohne Cloud und ohne überladene Funktionen.

## MVP-Ziel

Der MVP prüft, ob Nutzer ein Hochbeet ohne Erklärung anlegen, ein Raster verstehen, ein Feld antippen, eine Pflanze auswählen, die Pflanzung speichern und danach auf der Startseite die wichtigsten saisonalen Hinweise sehen können.

## Setup

Es gibt keine Flutter- oder Android-Abhängigkeiten mehr. Die PWA läuft mit SvelteKit und Vite:

```bash
npm install
npm run dev
```

Danach ist die App unter `http://localhost:5173` erreichbar. Der Produktionsbuild läuft mit:

```bash
npm run build
```

## Projektstruktur

- `src/routes/+page.svelte`: App-Einstieg und Screen-Switching.
- `src/lib/components/`: wiederverwendbare Svelte-Komponenten für Header, Navigation, Raster und Screens.
- `src/lib/stores/planner.js`: Datenmodell, lokale Speicherung, Saisonlogik und Aktionen.
- `src/styles.css`: mobiles PWA-Design nahe an den Mockups.
- `src/service-worker.js`: Offline-Cache für App-Shell und lokale Daten.
- `static/manifest.webmanifest`: PWA-Metadaten.
- `static/assets/data/plants.json`: MVP-Pflanzenstammdaten.
- `static/assets/data/bed_templates.json`: Beetvorlagen.
- `static/assets/data/planting_templates.json`: Beispielbepflanzungen.
- `static/assets/data/season_hints.json`: lokale Saisonhinweise.
- `mockups/`: visuelle Referenzen.

## Lokale Speicherung

App-Daten werden im Browser per `localStorage` gespeichert:

- Beete
- Pflanzungen je Feld
- Pflanzdatum, Pflanztyp, Anzahl, Sorte und Notiz

Es gibt keine Cloud, kein Login, keine externe Pflicht-API und keine geheimen API-Keys.

## Bewusst nicht umgesetzt

- Login und Benutzerkonto
- Cloud-Sync
- Community-Funktionen
- Chat oder KI-Assistent
- KI-Planung
- Wetterdaten, Standortdaten, Frostwarnungen
- Push Notifications
- Shop, Abo oder Zahlungsfunktionen
- komplexe Mischkultur-Optimierung
- Fruchtfolge über mehrere Jahre
- umfangreiche Pflanzenbilder

## Lizenzhinweise

Die Pflanzen werden konsistent mit Unicode-Emojis visualisiert. Es werden keine generierten Gemüsebilder, Fotos oder externen Iconpakete verwendet. Das Hochbeet wird mit CSS als Holzrahmen, Erde und Quadrat-Raster gerendert.
