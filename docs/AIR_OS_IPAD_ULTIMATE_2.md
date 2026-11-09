# Air-OS iPad Ultimate 2.0 — geprüfter Entwicklungsstand

Stand 4. November 2026. Branch **`feat/air-os-ipad-ultimate-2`**, Basis **`a228d895939861bf5379917d6d69849aaadc2f84`** (`feat/ipad-complete-desktop-parity`). Produkt-/Buildcommit **`7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a`**. Dokumentations-/Evidenzcommits danach ändern keine Runtime. Der Abschlusscommit ist im Git-Verlauf dieser Datei und im Abschlussbericht angegeben.

**Keine Installation umgestellt:** `feature/private-ipad-pwa` bleibt auf `7de1635c0207b8604c5409ef62c466585b4d5f04`. Keine Änderung an Windows-Aufgabe, Tailscale Serve/ACL/Funnel, main oder öffentlicher Website. Die bestehende Installation wurde weder als Testhost benutzt noch automatisch aktualisiert.

## Tatsächlich implementiert

- **Finder:** Original-CSV-Parser einschließlich BOM, eingebetteter Zeilenumbrüche und Quotes; sichere Tabellenvorschau mit Textknoten, weiterhin Textbearbeitung/Export. Originalbasierte Größen-/Typ-/Namens-/Datumsordnung, korrekte Binärgrößen statt pauschaler 1-KB-Anzeige. Liste/Raster mit sofortigem Klassenwechsel, bestätigter Ansichtspersistenz und getestetem Quota-Rollback, echte Breadcrumbs, F2-/Kontextaktionen, Touch-/Pen-Long-Press mit Bewegungs- und Pointercancel-Abbruch. Späte Lese-/Navigationsantworten ersetzen keine neuere Auswahl; Speichern bestätigt nur den tatsächlich geschriebenen Entwurf.
- **Multitasking:** vier interne Arbeitsbereiche; Fenster verschieben, echte laufende Apps auswählen, benannte Fenstergruppen speichern, gruppiert minimieren/wiederherstellen. Wechsel schließen keine Apps und verwerfen keine Entwürfe. Bestehender Window Owner, MRU, Snap, Maximize/Restore und Geometrie-Clamping bleiben maßgeblich. Gruppen/Arbeitsbereiche werden im vorhandenen IDB-v2-Store gespeichert und beim Neustart wiederhergestellt.
- **PWA-App-Vollbild:** Fensteraktion, Kontrollzentrum oder Ctrl/Cmd+Alt+Enter. App füllt den zugewiesenen PWA-Viewport; Shell/Dock/Widgets werden intern verborgen. Sichtbarer 44px-Exit, Escape nach Dialogvorrang, App-/Workspacewechsel, Minimieren und Sperransicht führen zurück. Exakte vorherige Normal-/Snapgeometrie wird wiederhergestellt und auch während Vollbild als Restartzustand gespeichert. **Kein nativer iPadOS-/Safari-Fullscreen und keine Stage-Manager-Steuerung.**
- **Dock:** ausgeführte MacShell-R7-Algorithmen für gekoppelte Icongrößen/Nachbarbreiten und Spring. Opt-in Intellihide benutzt tatsächlich den GPL-Original-Rechtecktest auf eigenen Fenstergeometrien. Touch-Rückweg „Dock einblenden“, keine versteckte klickblockierende Fläche. Dateiablage mit bis zu 40 Referenzen auf bestehende interne Dateien, Finderaktionen und internem Drag-and-drop; Entfernen einer Referenz löscht keine Datei. Lade-/Fehler-/Retryzustände, keine zweite Blob-Datenbank. Pins/Registry, untere Außenform und horizontaler Overflow bei schmalem Viewport bleiben erhalten.
- **Mitteilungen:** adaptierter Original-View-Lifecycle im bisherigen Toast-Host; echte Appaktion Öffnen/Fokussieren, Lesen/Entfernen/Alle entfernen mit Bestätigung, Zeitangaben, Escape und gespeicherter Fokusmodus. Ein bestehender Notice-Store; keine native Notification-API ersetzt, kein Berechtigungsbypass, kein automatischer Ton.
- **Downloads/Updates:** ein gemeinsamer Blob-Übergabepfad für Dateiexporte und Sourceangebot; maximal acht kurze URL-Leases, Cleanup spätestens nach 30 Sekunden, Anzeige in der Notch. Status lautet ausdrücklich „An Safari/Dateien übergeben; Abschluss dort prüfen“: keine erfundene native Abschluss-/Fortschrittsmessung. Sichere Reload-/Workeraktivierung wartet auch auf solche Übergaben. Offline-Source-Download funktioniert nach komplettem Browserneustart ohne Server.
- **Backup/Robustheit:** lesende Größenprüfung vor Base64-Materialisierung, keine stillen Teilbackups oberhalb 64 MiB Binärdaten/96 MiB Datei. „Backupgröße prüfen“ zeigt reale Mengen und JSON-Schätzung. Bestehendes transaktionales Restoreformat/Schema bleibt erhalten. Arcade-Timer pausieren zusätzlich hinter immersiven Apps und werden mit ihren Observern geschlossen. Kein neuer Idle-Renderloop.

Die 25 vorhandenen Registryeinträge bleiben erhalten: **16 lokale Apps und neun ausdrücklich bezeichnete externe Webalternativen**. Die bestehenden Apps wurden nicht neu als InfinityOS-Ports ausgegeben. [Vollständige App-/Offline-Matrix der Basis](AIR_OS_IPAD_COMPLETE_PARITY.md).

| Appbereich | Weiterverwendeter realer Ablauf | Neue Integration / Grenze |
|---|---|---|
| Finder / Downloads / Papierkorb | Nutzerauswahl, virtuelle Ordner, Textdatei speichern, Kopieren/Verschieben, Trash/Restore, Blobexport | CSV, Sortierung, Raster, Breadcrumbs, Dockreferenzen; kein beliebiger iPad-Dateizugriff |
| Notes / AirWrite | IDB-Speichern, Suche, echter Undo/Redo, Konfliktschutz, Zeichnen, Import/Export | Gruppen/Workspaces/Vollbild bewahren Entwürfe; kein neuer Editor-/Dokumentstore |
| Reminders / Kalender | echte Aufgaben/Termine, Fälligkeit/Priorität/Filter, Kalender-/Heute-Daten | gemeinsame Fenster-/Mitteilungsaktionen; kein nativer Apple-Kalender |
| Musik / Timer | eine Audioengine, importierte Musikbytes, Playlists/Favoriten, tatsächliche Zeitstempel | Dock/Notch/Control Center unverändert dieselben Controller; keine zweite Audioengine |
| Fotos / Rechner / Arcade / AirCard | reale lokale Bilder, Ausdrucksauswertung, 2048/weitere Spiele, lokale Karten | Offline weiter geprüft; Arcade-Idlecleanup vertieft; kein Wallet-/PencilKit-Versprechen |
| Home / Einstellungen / Über Air-OS | lokale Übersicht/Material/Backup/Quellcode | neue Dock-/Fokuspräferenzen und Backupprüfung |
| Air Web / Mail / Übersetzer / KI / News / Wetter / Fußball / Aktien / Spotify | neun klar benannte Webalternativen mit sicheren externen Links | keine heimlichen Provider, API-Secrets, Fake-Wetterwerte, Cloud- oder OS-Steuerungen |

## Technische Architektur und Datenbestand

| Eigentümer | Tatsächlicher Pfad | Grenze |
|---|---|---|
| Appinventar | `ipad/registry.js` | eine Registry, keine ausführbaren importierten Appskripte |
| Fenster/Fokus/Geometrien | `ipad/desktop.js`, reine `core/desktop-sessions.js`-Modelle | ausschließlich eigene PWA-DOM-Fenster; keine OS- oder WinBox-Registry |
| Apps/Dateien | `ipad/apps.js`, `ipad/storage.js` | File-/Blob-Auswahl und virtuelle Records; kein Node/IPC/native FS |
| Musik/Kalender/Timer/Notch | vorhandenes `ipad/app.js` | ein Audioelement, reale lokale Zustände, visuelle Lokalsperre |
| Dockmaterial/Geometrie | `ipad/dock-material.js`, vorhandener MacShell-Port | Präsentation und Überlappung, kein zweiter Pin-/Window-Owner |
| Mitteilungen | bisherige Notice-Records + `core/infinity-notification.js`-View | View besitzt nur seinen Toast/Timeout; kein paralleler Verlauf |
| Exporte/Source | `ipad/core/transfers.js` | zeitlich/bezüglich Anzahl begrenzte Blob-URLs, keine native Downloadüberwachung |
| Offline/Updates | bestehender Service Worker, contentbasierter Builder | relative Scope-Caches; Datenbank wird beim Cachewechsel nicht gelöscht |

Die Datenbank **`air-os-ipad-tracks-v1` bleibt Schema v2** mit `tracks` und `records`. 2.0 fügt nur validierte Einstellungen/Referenzen hinzu. Vorhandene Musikblobs, Kalender-/Timer-/Positionsschlüssel und das additive v1→v2-Verfahren bleiben erhalten. Kein Neuimport fremder Desktopprofile, kein automatisches Reset, keine neue Cloud- oder Clipboard-Datenhaltung. Neue Einstellungen sind im bestehenden Backup-Whitelistvertrag geprüft. Native Main-/Preload-Dateien und Windows-Fullscreen aus R6.1/R7 werden durch diesen PWA-Branch nicht geändert.

## Originalcode, eigene Integration und Lizenzen

[Verifizierte Quellen/ISO-Status](INFINITYOS_SOURCE_INVENTORY.md), [detaillierte Portmatrix](AIR_OS_INFINITYOS_DEEP_PORT.md), [exakte Quellpfade/Commits/SHA-256](source-ports/infinityos.json).

Direkte/adaptierte InfinityOS-Webfunktionen: AGPL-3.0. Reine Dockgeometrie aus dem getrennten Fedora/GNOME-Projekt: GPL-3.0. Die kombinierte iPad-2.0-PWA wird unter **AGPL-3.0** verteilt; vorhandene MIT-/GPL-/MacTahoe-/MacShell-Notices bleiben erhalten. Root-Desktoplizenz und Desktopruntime wurden nicht umgeschrieben. Workspaces, Gruppen, Vollbild, Dateireferenzen, sichere Popoveranker und Updatekoordination sind eigene Air-OS-Integration; **kein kopierter WinBox-/GNOME-Window-Manager**.

Jeder Build liefert `NOTICE`, volle Lizenztexte, Herkunftsdateien und **`source/source.zip`** mit exaktem lesbarem Corresponding Source sowie Buildwerkzeugen. Sichtbares Sourceangebot auch vor der rein visuellen Lokalsitzung und in Einstellungen, offline getestet. Lokaler Content-Snapshot `7ddbc844b0774be3fc658882e0a8c92d2c4da768f20aa3ff3f890158677bb5d2`; Source-ZIP-SHA256 `2d9e3ae0e3f8f6f60713334ab7d8540ba0ddf071edfa50f934f2bcdc8fa9c495`. Keine Nutzerdaten im Paket.

## Tests, Paket und Messwerte

**Lokaler Abschluss:** 37/37 Node-Tests (alle 29 Basisregressionen erhalten), 112/112 Chromiumchecks am Root, 112/112 unter `/Air-OS/`, 10/10 Upgrade-/Recoverychecks. Je 36 Root-/Unterpfadaufnahmen und acht Updateaufnahmen, ausschließlich isolierte synthetische Daten. Lokaler Chromium 154, Linux; keine physische iPad-Abnahme.

**CI: vollständig grün.** [Abschlusslauf 41888353373](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41888353373) für exakt den Produkt-SHA oben: 37 Node-Regressionen je Enginejob, Audit/Build/Recovery sowie **466 echte Browserchecks**. Ubuntu-24.04-Runner, offizielles Chromium 151.0.7922.34 und Playwright-WebKit (Safari-UA 26.5), keine macOS-/iPad-Hardwarebehauptung.

| Engine | Root | `/Air-OS/` | Upgrade/Recovery | Ergebnis |
|---|---:|---:|---:|---|
| Chromium | 112 | 112 | 10 | bestanden |
| WebKit | 111 | 111 | 10 | bestanden |

Die Differenz von einem Check pro GUI-Lauf entspricht CDP-Touchdrag/Cancel in Chromium gegenüber echtem WebKit-Touch-Tap; zusätzliche Pointercancel-/Pen-Ereignistests sind ausdrücklich synthetisch. 160 Screenshotvorgänge, **156 abgelegte PNG-Dateien** (einige Szenennamen werden im Ablauf aktualisiert), [vollständige maschinenlesbare Evidenz](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/evidence.json). Evidenzcommit **`b566132be6380fbf0335c700d88e836b85141bf9`**.

Vorherige rote WebKitläufe sind erhalten: fehlender Browserquota-Fallback sowie verfrühte Testabfragen vor bestätigter Raster-/Dateiablage-Ladung. Quota-/Ladezustände und unmittelbar aktualisierte Finderansicht mit Quota-Rollback sind korrigiert; beide Richtungen werden per DOM **und** bestätigtem IDB-Wert geprüft. Keine Prüfung entfernt. Ein früherer lokaler Chromium154-SIGSEGV in einer anderen Download-/Neustartreihenfolge ist dokumentiert; offizielles CI-Chromium151 bestand jenen Pfad, abschließende Root-/Unterpfad-/Offlineexportläufe ebenfalls. Das ist keine GPU-Hardwarefreigabe. Actions melden lediglich einen Node20-Aktionsversionshinweis (Runner führt sie unter Node24 aus), keinen fehlgeschlagenen Audit-/Testschritt.

Paket lokal gebaut und geprüft: **106 byteidentische Runtimeassets**, relative Manifest-ID/Start-URL/Scope `./`, CSP, Lizenzinventar, lokale Offlineassets, kein Electron-/Node-Code im Browser. Eingefrorene Playwright-1.62.1-Werkzeuge: `npm audit --prefix build/ipad-parity-tests --audit-level=high` meldet **0 Schwachstellen**. Keine neuen Produktabhängigkeiten.

Lokale ZIP: `Air-OS-iPad-Ultimate-2-7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a.zip`, SHA-256 **`ff518593d1c944b55e3a62e73d1103ebf88674b7202c5aa50c369387f75ac905`**. Dies ist die tatsächlich lokal erzeugte ZIP; CI-ZIPs können wegen ZIP-Zeitstempeln einen anderen Archivhash haben. Für das CI-Artefakt ausschließlich dessen beiliegende `.sha256` verwenden. Kein erfundener CI-Archivhash.

Workflow `.github/workflows/test-ipad-ultimate2.yml` erzeugt nur Build-/Browserartefakte. Name: `Air-OS-iPad-Ultimate2-Build-7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a`, einschließlich separater ReadOnly-Preflight-/Compatible-Recovery-ZIPs. Verifizierter **Actions-Sammelartefakt-Digest** `e4c2e0c82837e9aca1e216504cc7df7e23a55cff46f7a825d34081b4e2e8b5e1` (nicht der innere PWA-ZIP-Hash). Download im grünen Actions-Lauf, Artefaktaufbewahrung 30 Tage; Evidenz zusätzlich im Git. Kein Deploymentjob.

| Renderer / DPR1 | Fensterhost (x,y,b,h) | Überlauf |
|---|---|---|
| 1024×768 | 0,44,1024,724 | keiner |
| 1180×820 | 0,44,1180,776 | keiner |
| 1366×1024 | 0,44,1366,980 | keiner |
| 834×1194 | 0,44,834,1150 | keiner |
| 820×1180 | 0,44,820,1136 | keiner |
| 390×600 | 0,44,390,556 | keiner |

Keine Dockreserve; Host geht bis zum unteren Viewportrand. PWA-App-Vollbild bei 1180×820: `0,0,1180,820`; Escape stellt die vier vorherigen Stylewerte exakt wieder her. Dock im gemessenen Workload 623px breit, bei 390px Viewport auf 372px mit internem Scrollen begrenzt. Notch separat 44px hoch, unverändert. Das ist die iPad-Shell, keine Behauptung der nativen Desktop-24px-Leiste.

DPR2 nach kaltem Offline-Prozessneustart: ein Audioelement, 15 geöffnete interne Apps, zwei Canvasflächen (bestehende Zeichen-/Spieleflächen), CSS-Compositor, Service Worker aktiv. Lokale Chromium-JS-Heap-Stichprobe 7.23 MB: workload-/engineabhängiger Einzelwert, kein nativer Gesamtspeicher-/FPS-Benchmark. Dock-RAF stoppt nach Spring-Settle; Arcade-Intervalle stoppen bei Minimize, Verbergen durch Vollbild und Close. **Keine GL-Programme/Textures/Draws gemessen, da hier keine PWA-WebGL-Engine läuft.**

## Bildnachweise und Bewertung

Die gemeinsamen Basis-/2.0-Browserabläufe erzeugen dieselben synthetischen Notes-/Finder-/Musikszenen bei 1180×820. [Vorher: Finder](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/chromium/finder.png), [Vorher: Desktop](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/chromium/desktop-clean.png). Nachher:

| Szene | Chromium | WebKit |
|---|---|---|
| Desktop / erhaltene Identität | [Desktop](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/chromium/desktop-clean.png) | [Desktop](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/webkit/desktop-clean.png) |
| Finder, gleiche Textdatei | [Finder](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/chromium/finder.png) | [Finder](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/webkit/finder.png) |
| Original-CSV-Vorschau | [CSV](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/chromium/infinity-csv.png) | [CSV](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/webkit/infinity-csv.png) |
| Arbeitsbereiche / Fenstergruppen | [Übersicht](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/chromium/workspace-overview.png) | [Übersicht](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/webkit/workspace-overview.png) |
| App-Vollbild / sichtbarer Rückweg | [Vollbild](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/chromium/workspace-immersive.png) | [Vollbild](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/webkit/workspace-immersive.png) |
| Dockablage | [Dateiablage](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/chromium/dock-file-shelf.png) | [Dateiablage](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/webkit/dock-file-shelf.png) |
| Gekoppelter Dockhover | [Hover](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/chromium/dock-macshell-hover.png) | [Hover](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/webkit/dock-macshell-hover.png) |
| Verlauf / echte Appaktionen | [Mitteilungen](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/chromium/system-notifications.png) | [Mitteilungen](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/webkit/system-notifications.png) |
| Kalter Offline-Neustart | [Offline](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/chromium/offline-cold-restart.png) | [Offline](visual/ipad-ultimate2/7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a/webkit/offline-cold-restart.png) |

Alle Dateien sind unveränderte Browseraufnahmen aus isolierten Testprofilen. Weitere Quer-/Hochformat-, Lock-, App-, Update-/Recoverybilder liegen neben der Evidenzdatei. Die Uhr läuft real; kein behaupteter zeitfixierter Pixelidentitätsvergleich und keine Retusche.

Tatsächlich sichtbare Änderungen: Finder zeigt Bytegrößen, Sortier-/Ansichtsauswahl und Dockaktion; Dock hat zusätzliche Dateiablage und gekoppelte Nachbarbreiten; Systemleiste bietet Fensterübersicht/Sperransicht; Gruppenübersicht und App-Vollbild sind echte bedienbare Zustände. Im direkten Bildvergleich bleibt das CSS-Glas gegenüber dem nativen MacShell-Compositor flacher. Das wurde nicht als Originalshader-Refraktion umbenannt. Die vorhandenen Air-OS-Formen, dunklen Header und hellen Arbeitsflächen bleiben erhalten. Kein neues MacShell-Referenzbild erfunden.

## Grenzen und konkrete Fortsetzung

1. **ISO-Zuordnung offen:** beide Drive-Dateien werden durch die Entwicklungsumgebung mit Tunnel-HTTP403 blockiert; keine ISO-Bytes/Hash/Distribution bestätigt. Beide öffentlichen Repos sind separat geprüft. Read-only ISO9660-Inspector an synthetischem Image getestet, SquashFS-/echte ISO-Analyse ausstehend.
2. **Hardware offen:** tatsächliches iPadOS/Safari, Home-Screen-Installation, Bildschirmtastatur, Safe Areas mit Geräte-Inset, Pencil, Trackpad, native Picker-/Downloadabschlüsse, Audioausgabe und Suspend/Resume. Linux-WebKit ersetzt das nicht.
3. **Materialport offen:** MacShell-/Hyprland-GLASS-3-/Qt-Shader laufen nicht in dieser PWA. Kein Live-Fensterbackdrop, keine Screen-Captures und keine neue Engine. Weitere Blur-/Linseneffekte erfordern gesonderte WebKit-/Energieprüfung.
4. **Große Daten:** segmentierte Bibliotheksbackups/-restores oberhalb der dokumentierten JSON-Grenzen bleiben offen. Frühe Größenprüfung und Einzeldateiexport sind real verfügbar. Kein Freigabewechsel ohne verifizierte Sicherung.
5. **Weiterer Funktionsumfang:** reichere AirWrite-Formatierung, breite Metadaten-/Arcade-Regelabdeckung, weitergehendes Safari-Datei-DnD, visuelle Layout-/Widgetverfeinerung und optionale erlaubte Provider sind Restarbeit. WebKit-native Selects weichen im Kontrast sichtbar von Chromium ab; zusätzliche Gestaltung und physische Lesbarkeitsprüfung bleiben offen. Keine Dummy-Apps als fertig gezählt.
6. **Privater Rollout bleibt ausstehend:** [Freigabe-/Backup-/Recoveryplan](AIR_OS_IPAD_2_PRIVATE_ROLLOUT.md). Lokalsperre ist weiterhin eine visuelle Oberfläche ohne zusätzliche Sicherheitsauthentifizierung; keine native iPadOS-Sperre/Cloudprofile.

## Gesicherte Checkpoints

| Phase | Vollständiger SHA | Nachweis |
|---|---|---|
| A: Originalhelpers, Source, statischer ISO-Inspector | `94a29dca1a9767806040849fadaa124b62dfb459` | Modell-/Source-/ISO-Tests, erster Browserlauf |
| B: Gruppen, Workspaces, Dock, Finder, Mitteilungen | `ca2f846593f8c87f3adc0ef0e2ed81f5144ce20a` | 35 Node / 100 lokale GUI / 9 Updatechecks |
| C: reversibles App-Vollbild | `7116d6c614e813a23f4e52d1a8c41674208a752b` | 36 Node / 105 lokale GUI |
| D: Backup-/Touch-/Idle-/Updatehärtung | `530419d321591b3f1787f6986cbe89075a4534fc` | 37 Node / 111+111 lokale GUI / 10 Updates |
| E: unmittelbare Finderansicht, bestätigtes Speichern und Quota-Rollback | `7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a` | 37 Node / 112+112 lokale GUI / 10 Updates; gesamtes CI grün |

Alle Produktcheckpoints auf denselben Featurebranch gepusht. Botcommits sichern ausschließlich synthetische Browsernachweise. Nichts ungefragt verworfen oder in die verwendete Installation gemergt.
