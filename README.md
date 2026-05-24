# BeetPlaner PWA

BeetPlaner ist eine SvelteKit Progressive Web App für die schnelle Planung kleiner Hochbeete und Quadratgärten. Der Name bleibt ein Arbeitstitel und ist zentral in `static/manifest.webmanifest`, `src/app.html` und `package.json` austauschbar.

## Produktpositionierung

Die App ist kein allgemeiner Gartenplaner, kein KI-Gartenhelfer und keine All-in-One-Garten-App. Sie ist ein einfacher, schneller, lokaler und offline nutzbarer Hochbeet- und Quadratgarten-Planer für kleine Flächen.

Kernversprechen: In wenigen Minuten ein kleines Beet planen, bepflanzen und über die Saison im Blick behalten - ohne Login, ohne Cloud und ohne überladene Funktionen.

## MVP-Ziel

Der MVP prüft, ob Nutzer ein Hochbeet ohne Erklärung anlegen, ein Raster verstehen, ein Feld antippen, eine Pflanze auswählen, die Pflanzung automatisch lokal sichern und danach auf der Startseite die wichtigsten saisonalen Hinweise sehen können.

## Aktueller Kernworkflow

Der zentrale Planungsablauf ist bereits geführt umgesetzt:

1. Über eine klar benannte Vorlage schnell ein Beet anlegen oder bewusst ein Maßbeet mit validiertem Raster erstellen.
2. Auf der Startseite das aktive Beet, seinen kompakten Status und lokale `Saisonhinweise` sehen und mit `Aktives Beet öffnen` in die Planung wechseln.
3. Im Planer das vollständige Raster sehen und ein freies oder belegtes Feld antippen, ohne den Planungskontext zu verlassen.
4. Bei einem freien Feld über `Pflanze auswählen` gezielt in den Feld-Auswahlmodus wechseln.
5. Eine Pflanze anhand von Lichtbedarf, Erntezeitraum, Pflanzenanzahl und einfacher Feldeignung auswählen.
6. Nach dem Pflanzen zurück im Raster die Pflanzung sehen, in einer gruppierten Detailansicht bearbeiten und bewusst speichern, ersetzen oder löschen.

Änderungen im Planer werden automatisch in `localStorage` gespeichert. Der allgemeine Pflanzenkatalog bleibt daneben zum Stöbern verfügbar; `Im Beet verwenden` führt mit einer Platzierungsaufforderung in den Planer zurück. Saisonhinweise stammen aus lokalen Monatsdaten und dem aktuellen Beetstatus; sie sind keine Aufgaben, Erinnerungen oder Benachrichtigungen. Im sichtbaren Workflow heißen Rasterplätze einheitlich `Feld`; Rasterfelder, Filter und Navigation geben ihren Zustand auch für assistive Bedienung aus.

## UX-Sprint-Stand

- [x] Sprint 1: Planer als geführten Arbeitsbereich strukturieren, automatische Speicherung offen kommunizieren und Feldaktionen in eine zentrale Kontextkarte legen.
- [x] Sprint 2: Allgemeinen Katalog und konkrete Feldauswahl unterscheiden, Pflanzenkarten ergänzen und leere Suchergebnisse erklären.
- [x] Sprint 3: Beet-Anlage um Vorlagen zuerst und eigene Maße als Zusatzoption strukturieren.
- [x] Sprint 4: Startseite mit Hauptaktion und ehrlichen Saisonhinweisen schärfen sowie sichtbare Platzhalteraktionen entfernen.
- [x] Sprint 5: Detailansicht als klare Bearbeitungsseite mit gruppiertem Formular und getrenntem Löschbereich entschlacken.
- [x] Sprint 6: Begriffe auf `Feld` konsolidieren, mobile Touchziele nachschärfen und Accessibility-Basics für Raster, Filter, Navigation, Fokus und Toasts ergänzen.

## Verifikation Sprint 5/6

- `npm run build` erfolgreich ausgeführt.
- Bearbeiten, Speichern und Löschen einer vorhandenen Pflanzung im lokalen Browserlauf bei `360px`, `390px` und `430px` erfolgreich geprüft.
- Die Detailansicht wurde an allen drei Breiten visuell auf lesbare Gruppen, erreichbare Aktionen und fehlendes horizontales Überlaufen kontrolliert.

## Setup

Es gibt keine Flutter- oder Android-Abhängigkeiten mehr. Die PWA läuft mit SvelteKit und Vite:

```bash
npm install
npm run dev
```

Danach ist die App am Entwicklungsrechner unter `http://localhost:5173` erreichbar. Für den Test auf einem Smartphone im selben WLAN die von Vite ausgegebene `Network:`-Adresse verwenden, zum Beispiel `http://192.168.178.23:5173/`; `localhost` verweist auf dem Smartphone nicht auf den Entwicklungsrechner.

Der Produktionsbuild läuft mit:

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
- `stuff/mockups/`: visuelle Referenzen.

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
- Aufgaben-Engine oder Erinnerungen für Saisonhinweise
- Shop, Abo oder Zahlungsfunktionen
- komplexe Mischkultur-Optimierung
- Fruchtfolge über mehrere Jahre
- umfangreiche Pflanzenbilder

## Lizenzhinweise

Die Pflanzen werden konsistent mit Unicode-Emojis visualisiert. Es werden keine generierten Gemüsebilder, Fotos oder externen Iconpakete verwendet. Das Hochbeet wird mit CSS als Holzrahmen, Erde und Quadrat-Raster gerendert.
