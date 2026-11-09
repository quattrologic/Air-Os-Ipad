# Pro Notch 2.0 — Ultra Compact

Branch: `feat/air-os-ipad-pro-notch-ultra-compact`. Unveränderte, erfolgreich geprüfte Basis: `ac64d9a26544b1401227046d066a6bbd00f5d1e5` / Produkt `2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0`, CI42376851353. Der bisherige Pro-Notch-Branch und die private Installation bleiben erhalten. Kein Deployment und kein Merge.

## Geometrie und Kontur

| Zustand | Vorher | Ultra Compact (CSSpx) |
|---|---:|---:|
| Geschlossen |236×32|165×24|
| Geschlossen mit lokalem Songtext |300×58|165×24|
| Musik |440×152|310×108|
| Timer |440×176|310×132|
| Kalender |506×216|350×155|
| Shelf |440×150|310×108|
| Dateiliste |440×152|310×152|
| Erweiterter Songtext |440×260|310×196|

Die Hauptflächen sind ungefähr halb so groß. Timer benötigt7 px mehr als der Ausgangswunsch125px, um Kopfbedienung, Dauerschieber und Steuerung in drei getrennten 44px-Bändern unterzubringen. Musik, Kalender und Shelf treffen die gewünschten Ausgangsmaße. Die geschlossene Form wächst auch bei echtem laufendem LRC nicht mehr zu einer zweiten großen Kapsel.

Eine einzige schwarze Fläche bleibt am oberen Rand des verfügbaren PWA-Inhalts / Safe-Area-Rand befestigt. Ein gemeinsam animierter CSS-Pfad bildet oben konkave, nach außen auslaufende Schultern (5–8px); die unteren Rundungen (7–16 px) sind unabhängig. Kein positiver Rundungsradius oben, der daraus eine schwebende Bubble machen würde. Die Videoaufnahme wurde erneut direkt geprüft; die Schulterkurve ist eine visuelle Browseradaption, keine zurückgewonnene native Alpha-Maske. Schwarz#000, kein Blur/Glas, Glow oder Schatten. Der übrige Air-OS-Desktop bleibt unverändert.

Keine Skalierung der gesamten Komponente: echte Breite/Höhe, eigene Innenabstände,52px-Cover, neu angeordnete Kontrollen und13px/12px Medienbeschriftung. Normale Status-/Zeitangaben sind11px. Kalender zeigt kompakte echte Termine; Woche dient als44px-Datumsauswahl und kehrt bei Auswahl zur Tagesagenda zurück. Dateiliste nutzt scrollbare Zeilen mit getrennten44px-Aktionen.

## Bedienung und Motion

Aktionsbuttons, Navigation, Transport, Kalenderdatum, Dateiaktionen und Timer-Schieber besitzen echte 44px-Ziele. Browserprüfungen messen DOMRects, Hit-Tests mit `elementFromPoint` und Überschneidungen; reine transparente Polster, die Nachbaraktionen verdecken, zählen nicht als bestandene Ziele. Ausnahmen sind bewusst dokumentiert: die165×24-Kapsel und der20px hohe Musik-Suchlauf. Es gibt keine zusätzliche unsichtbare 44px-Fläche über anderen Anwendungen.

Das Musik-Icon links und drei Ansichtspunkte rechts schaffen Platz für die größeren Ziele und die mittige Kapselaktion. Kleine sichtbare Glyphen liegen in größeren Zielrechtecken. Während eines Morphs fangen die wandernden Headerziele keine versehentlichen Mehrfach-Taps ab; die Kapsel bleibt abbrechbar. Tastaturtabs, Escape und Pointercancel bleiben erhalten.

Die fünf ursprünglichen, separat gemessenen Breiten-/Höhenprofile bleiben unverändert:333ms Öffnen,300ms Erweitern,700ms Schließen/Settling,367ms Wechsel,400ms Kalender. Ein zusätzlicher Regressionstest prüft den SHA256 der serialisierten Profilwerte: `4eee1ca54fef46d27702a8cdd6cf644bb0f7c4d76c234bff37b5112ea0c48efd`. Nur die Zielgeometrien und daraus berechneten Konturen ändern sich. Unterbrechungen lesen den tatsächlich laufenden Pfad und das aktuelle Rechteck zurück. Eine WAAPI-Lease besitzt alle Effekte; kein zusätzlicher Scheduler, kein RAF-/Intervallloop.

## Daten und geschützte Bereiche

Musik, Timer, Kalender und Shelf verwenden die bisherigen Controller/Stores. Keine neue Audio-/Fenster-/Datenengine, keine IndexedDB-Migration, keine Änderung an `storage.js`, `backup.js`, dem Safari-Service-Worker-Template oder den Windows-/Tailscale-Skripten. Alle 25 Apps und das unveränderte Yosemite bleiben. Nur generierter Worker/Version und das bestehende Source-Angebot werden aktualisiert. Physische iPad-, Safari-, Pencil-, Akku- und GPU-Abnahme bleibt offen.

## Reproduzierbare Abnahme

`scripts/capture-ipad-pro-notch-compact-baseline.cjs` archiviert die geprüfte Basis separat und erzeugt mit denselben synthetischen Musik-/Timer-/Kalender-/Dateidaten echte Vorheraufnahmen. Kein verwendeter Branch wird ausgecheckt oder verändert. `scripts/test-ipad-pro-notch.cjs` liefert alle Zustände,71 gezielte Prüfungen,44 Screenshots und20 echte Zwischenframes der Morphs. Porträtbilder aller offenen Ansichten kommen zusätzlich zu sechs Viewports hinzu. Echtes Offline-Neuladen und Prozessneustart erfolgen bei abgeschaltetem lokalen Server.

`scripts/build-pro-notch-compact-comparisons.cjs` stellt die unretuschierten PNGs bei ihrer tatsächlichen CSS-Größe gegenüber; DPR2 wird nur in der HTML-Darstellung auf CSS-Pixel normalisiert. Keine unabhängige Einpassung, kein erfundener Ähnlichkeitsscore. Beschriftung und Größen-/Flächenvergleich bleiben von Produktbildern getrennt.

Lokaler Zwischenstand: 48 Node-Regressionen, 71 gezielte Chromium-Prüfungen bei DPR2 sowie 37 bestehende visuelle DPR2-Prüfungen bestanden. Die abschließende vollständige Chromium-/WebKit-Matrix und Artefakte werden nach erfolgreichem Lauf unten ergänzt.

## Erfolgreiche Endabnahme

Produkt-/Buildcommit: `5b09e4d93e08bb60304f32cad40676c477cb7a9e`. Erfolgreicher [CI-Lauf42391563671](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42391563671). Vollständige Browserjobs, Testtool-Audit, Paket-/CSP-/Lizenzprüfung und Evidenzsicherung sind grün. **48/48 Node-Regressionen und 1.014 Browserassertionen** bestanden; darunter vier aktuelle 71-Check-Notchläufe (Chromium/WebKit jeweils DPR1/DPR2). Wiederholte Prüfungen über Engines/Varianten sind keine 1.014 unterschiedlichen Funktionen.

| Gate | Chromium | WebKit |
|---|---:|---:|
| Gepinnte Pro-Notch1-Vorheraufnahme |47|47|
| Bestehende visuelle Suite, DPR1 |37|37|
| Bestehende visuelle Suite, DPR2 |37|37|
| Ultra Compact, DPR1 |71|71|
| Ultra Compact, DPR2 |71|71|
| Material-/Kontext-/Cleanup-Prüfung |11|11|
| Bestehende Apps/Daten, Root |112|111|
| Bestehende Apps/Daten, Unterpfad |112|111|
| Sichere Updates/Recovery/Mehrtab-/Musikschutz |10|10|

Viewports:1024×768,1180×820,1366×1024,834×1194,820×1180 und390×600. Zusätzliche Portraitaufnahmen zeigen alle sechs offenen Ansichten. Die frühere Header-Hitbox-Wanderung bei schnellem Mehrfach-Tap wurde tatsächlich gefunden und mit der gemeinsamen Morph-Sperre für diese Headerziele korrigiert; schnelle Kapseleingaben, Keyboard, Unterbrechung, Pointercancel und Reduced Motion bestehen. Kein permanent laufender Notch-Animator, nach Abschluss/Abbruch keine tatsächlichen DOM-Effekte. Kein Notch-Canvas oder zusätzlicher Renderer.

[Alle maschinenlesbaren Testergebnisse](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/evidence.json), [unveränderte Daten-/Infrastrukturdateien](visual/ipad-pro-notch-compact/protected-boundaries.json). Die vollständigen neuen Notchläufe umfassen 44 tatsächliche Szenen je Variante, inklusive 20 pausierter Morph-Zwischenframes. Die Originaldauern wurden zusätzlich zwischen echten Vorher-/Nachher-Berichten abgeglichen:333/300/700/367/400ms.

## Echte Vorher-/Nachher-Aufnahmen

Gleiche synthetische Bibliothek, Kalenderdaten, Timer und lokale Shelf-Dateien; keine privaten Geräteaufnahmen und keine Bildretusche. Die angezeigten Pixelgrößen folgen den tatsächlichen CSS-Abmessungen.

| Ansicht | Vorher | Ultra Compact |
|---|---|---|
| Geschlossen |[236×32](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/before-notch-chromium/notch-closed-crop.png)|[165×24](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/notch-chromium/notch-closed-crop.png)|
| Musik |[440×152](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/before-notch-chromium/notch-music-crop.png)|[310×108](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/notch-chromium/notch-music-crop.png)|
| Timer |[440×176](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/before-notch-chromium/notch-timer-crop.png)|[310×132](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/notch-chromium/notch-timer-crop.png)|
| Kalender |[506×216](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/before-notch-chromium/notch-calendar-crop.png)|[350×155](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/notch-chromium/notch-calendar-crop.png)|
| Shelf |[440×150](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/before-notch-chromium/notch-shelf-crop.png)|[310×108](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/notch-chromium/notch-shelf-crop.png)|
| Songtext |[440×260](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/before-notch-chromium/notch-local-lyrics-crop.png)|[310×196](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/notch-chromium/notch-local-lyrics-crop.png)|
| Dateiliste |[440×152](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/before-notch-chromium/notch-files-crop.png)|[310×152](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/notch-chromium/notch-files-crop.png)|

[Musik hochkant](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/notch-chromium/notch-portrait-music-crop.png), [Kalender hochkant](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/notch-chromium/notch-portrait-calendar-crop.png), [Wochenauswahl](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/notch-chromium/notch-calendar-week-crop.png), [Öffnen40%](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/notch-chromium/notch-motion-open-40-crop.png), [Schließen40%](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/notch-chromium/notch-motion-close-40-crop.png), [Retina-WebKit-Musik](visual/ipad-pro-notch-compact/5b09e4d93e08bb60304f32cad40676c477cb7a9e/notch-dpr2-webkit/notch-music-crop.png).

Flächenreduktion der tatsächlichen stabilen Aufnahmen: geschlossen47,6%, Musik49,9%, Timer47,2%, Kalender50,4%, Shelf49,3%, Songtext46,9%, Dateiliste29,5%. Die ursprüngliche laufende LRC-Kapsel300×58 schrumpft ebenfalls auf165×24; ihr Inhalt ist jetzt einzeilig.

## Artefakte und Grenzen

- [Actions-Artefakte](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42391563671): `Air-OS-iPad-ProNotch-Compact-Build-5b09e4d93e08bb60304f32cad40676c477cb7a9e` sowie zwei `Private-iPad-ProNotch-Compact-<engine>-5b09e4d93e08bb60304f32cad40676c477cb7a9e`. Letztere enthalten Rohaufnahmen und HTML-/JSON-Vergleiche, beide DPR-Varianten und alle Bestandsberichte. Aufbewahrung30Tage; kein Release/Deployment.
- Lokaler PWA-Build: `dist/Air-OS-iPad-Pro-Notch-Compact-5b09e4d93e08bb60304f32cad40676c477cb7a9e.zip`,10.224.369 Bytes; SHA256 `8b84b76ba1f9347c0f5549bbf1b3ab6e1df5ec0a35393e7ebc215930ed4b62d7` (dieses lokale ZIP; CI-ZIPs besitzen eigene begleitende SHA256-Dateien).
- Lokales Vergleichspaket: `dist/Air-OS-Pro-Notch-Ultra-Compact-Comparisons.zip`,599.795 Bytes; SHA256 `9c20e5c9c6cc2830c14cc9409c3a604b3fc04d5288ccb1ab3dbf67df28b34286`. Enthält ausschließlich echte synthetische Browseraufnahmen und ihre beschriftete Gegenüberstellung.
- Source-/Lizenzpaket und das private versionierte Service-Worker-Verfahren bleiben erhalten. Keine Datenmigration; Backup-/Storage-Code, kompletter bisheriger Audio-/Timerbesitzer und Fensterbesitzer sind bytegleich zur geprüften Basis. Die private Version und der bisherige Pro-Notch-Branch wurden nicht geändert.
- Native Radius-/Alpha-Kurven und physischer macOS-Punktmaßstab sind weiterhin unbekannt. Die obere Kontur ist eine bewusst kompakte Browseradaption der sichtbaren angeschlossenen Schultern. Kein Versprechen nativer 1:1-Pixelgleichheit.
- Geschlossene Kapsel24px und Musik-Schieber20px sind die dokumentierten Ausnahmen von44px-Höhe; die primären Aktionsbuttons sind echte44px-Ziele. Timer ist bewusst132px statt125px hoch. Kleine Zusatzzeitangaben sind11px.
- Physische Safari-/iPad-/Pencil-/Trackpad-, Safe-Area-Hardware-, GPU-/Thermik-/Akkutests bleiben offen. WebKit-Automatisierung ersetzt diese nicht. Softwarediagnose ist keine Hardware-GPU-Freigabe.

Codecheckpoint: `5b09e4d93e08bb60304f32cad40676c477cb7a9e`. Erfolgreiche Browser-Evidenz: `32f8b14889b21121f6e134d3186b7622d93a2024`. Der abschließende Berichtscommit verändert ausschließlich Dokumentation; der geprüfte Produktstand bleibt unverändert.
