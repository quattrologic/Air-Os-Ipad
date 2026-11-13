# Widget 2.2

Fortsetzung von PR #9 auf `feat/widgets-2-1-reference`. Ausgangspunkt: `ae7ad0b`.
Desktop-Repository, Deployment und Tailscale werden nicht geändert.

## Größen und Textaktion

| Größe | CSS-Pixel |
| --- | --- |
| Klein | 96 × 96 |
| Mittel | 200 × 96 |
| Groß | 200 × 200 |

Das Raster verwendet 96-Pixel-Einheiten mit 8 Pixel Abstand. Die bestehenden
Größen-IDs, Reihenfolgen und v1/v2-Layouts bleiben erhalten. Cover, überlagerte
Titel, transparente Uhrziffern und Materialien behalten ihre Referenzpositionen.
Die drei lokalen Transporttasten bleiben 44 × 44 Pixel groß. Fünf solche Tasten
brauchen 220 Pixel Breite; Songtext und Bibliothek sind bei 200 Pixeln deshalb
über das vorhandene Menü beziehungsweise den oberen Musikknopf erreichbar.
Kleine Varianten behalten Zusatzaktionen im gleichen Menü. AIR FLOW bleibt die
gemeinsame Animationsschicht.

„Widgets anpassen“ hat transparenten Hintergrund, keinen Rahmen, keine Glasfläche
und weder Kasten- noch Textschatten. Hover, Touch und Tastaturfokus markieren nur
den Text. Die Bedienfläche bleibt mindestens 44 Pixel hoch. Der Bearbeitungsmodus
verwendet weiterhin seine vorhandenen Steuerelemente.

## Musikquelle und Datenschutz

Das Widget bevorzugt standardmäßig Spotify. Seine Auswahl wird im bestehenden
Setting-Store unter `widget-music-source-v1` gespeichert. Das Menü bietet
„Air Music anzeigen“ beziehungsweise „Spotify bevorzugen“. Die globale
Metadaten-Auswahl für Lockscreen und Notch behält aktives lokales Audio als direkt steuerbare Quelle; sonst bleibt die chronologische Auswahl erhalten.
Der Widget-Transport adressiert den lokalen Besitzer gezielt; eine neue lokale
Datei ersetzt die Spotify-Anzeige nicht automatisch.

Spotify verwendet den bestehenden OAuth-/PKCE-Besitzer und dessen freigegebene
Lese-Endpunkte. Die Ansicht bietet echte Verbindungs-, Aktualisierungs- und
Spotify-Link-Aktionen. Lokale Play/Pause-, Skip- und Seek-Befehle werden dort
nicht als Spotify-Steuerung dargestellt. Air Music verwendet weiter sein
originales Audioelement und die bestehende Bibliothek.

Ein gemeinsamer Reader aktualisiert bei sichtbarer Anwendung ungefähr alle
30 Sekunden, auch bei pausiertem Spotify oder parallelem Air Music. Manuelle und
Rückkehr-Anfragen teilen einen Mindestabstand von 15 Sekunden. `Retry-After` hat
Vorrang. Verstecken, Offline-Zustand und Trennung stoppen den Reader; Rückkehr und
Entsperren benutzen denselben Reader. Es gibt keinen zweiten Widget-Poller und
keine neuen Spotify-Schreibberechtigungen.

Der bekannte Song und ein begrenztes Cover-Vorschaubild werden nur mit aktivierter
Verlaufsspeicherung im vorhandenen Metadaten-Setting gespeichert. Nach Trennung
oder Neustart erscheinen erlaubte Verlaufsdaten als zuletzt gehört, ohne Live-
Status. Bei abgeschalteter Speicherung bleiben neue autorisierte Daten nur im
Arbeitsspeicher; beim Neustart werden alte Verlaufsfelder ignoriert. Access- und
Refresh-Token bleiben ausschließlich im Arbeitsspeicher. Die bestehende kurzlebige
PKCE-Transaktion und öffentliche Client-ID werden unverändert behandelt.

## Lokale Uhr und Lebenszyklus

Die Uhr formatiert `new Date()` über die lokale Browser-/iPad-Zeitzone. Runtime-
Dateien setzen keine Demo-Uhrzeit oder Zeitzone. Der vorhandene Minutentimer wird
auf die nächste echte Minutengrenze ausgerichtet.

Fokus, Entsperren, Sichtbarkeitswechsel, `pageshow`, App-Fokus und Workspace-Wechsel
synchronisieren die Anzeige. Derselbe Timer bleibt zuständig. Unveränderte
Textwerte werden nicht neu erzeugt. Foto-URLs, der optionale transparente
Vordergrund und reduzierte Animationen bleiben erhalten.

## Prüfung und Reproduktion

- `npm test`, `npm run build`, `npm run check`, `npm run audit:public`
- `npm run test:widgets`, `npm run test:widgets-22`
- `node scripts/test-ipad-spotify.cjs`
- `node scripts/test-ipad-desktop-dock.cjs` mit `AIR_DOCK_DPR=1` und `2`
- Vollständige Chromium-/WebKit-Matrix mit Sicherheit, Offline-PWA, AIR FLOW,
  Classic Genie, Lockscreen, Notch und Materialien.

`test-ipad-widgets-22.cjs` verwendet eine echte PWA, native synthetische WAV-Dateien
und ausdrücklich simulierte autorisierte Spotify-Endpunkte. Es prüft Priorität,
Speicherung und Opt-out, Neustart, API-Grenzen, getrennte 44-Pixel-Touchflächen,
Tastaturfokus und den Minutentimer. Die kontrollierte Browser-Testuhr und der
simulierte Sichtbarkeitswechsel sind ausschließlich Testfixtures.

Prüfsummenänderungen der Metadaten-/Spotify-Dateien stehen mit vorherigem und neuem
Hash in `docs/security/protected-surfaces.json`. Bestehende Schutzprüfungen, CSP,
Endpunktbegrenzungen und Speicher-Schemata bleiben aktiv. SRI und Offline-Inventar
werden vom vorhandenen Builder erzeugt.

Die endgültigen Testergebnisse und echten Screenshots werden in PR #9 dokumentiert.
Ein echtes Spotify-Konto und Safari auf einem physischen iPad stehen hier nicht
zur Verfügung. Aus Browser-Labortests folgt keine 60-FPS-Garantie.

## Offline-Archiv und Testergebnisse

Chromium 154 meldete beim Cache-Schreiben des etwa 15 MB großen, bereits korrekt
geprüften Quellenarchivs einen reproduzierbaren `Cache.put()`-Netzwerkfehler.
Die Diagnose bestätigte identische SHA-256-Werte und erfolgreiche Speicherung,
sobald beide Schreibphasen eigenständige Byte-Antworten erhielten. Der Worker
verwendet deshalb die bestehenden begrenzt gelesenen, hashgeprüften Bytes für
Staging und Veröffentlichung. Der Staging-Inhalt wird vor Veröffentlichung erneut
geprüft. Länge und Encoding-Header werden an die bereits dekodierten Bytes
angepasst. MIME-, Status-, Redirect-, Größen- und Hash-Prüfungen bleiben aktiv.
Ein fehlgeschlagener Download führt weiterhin zum Abbruch der Generation.

Lokal bestanden: 72 Node-, 46 bestehende Widget-, 44 Widget-2.2-, 20 Spotify-,
32 AIR-FLOW-, 54 Genie- sowie 61 Dock-Prüfungen jeweils bei DPR 1 und 2. Build und Integrität
prüfen 153 Runtime-Dateien. Echte Browser-Screenshots und Referenzvergleiche liegen
unter `docs/testing/widgets-2-2/`. Die vollständige CI und gegebenenfalls zusätzliche
Ergebnisse werden nach Abschluss im bestehenden PR #9 verlinkt.
