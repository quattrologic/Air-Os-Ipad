# Air-OS Ultimate iPad — Complete Desktop Parity

Entwicklungsbranch: `feat/ipad-complete-desktop-parity`.
Basis: `feature/private-ipad-pwa@7de1635c0207b8604c5409ef62c466585b4d5f04`.
Produktcommit: **`7ab977aefada10c531a1d2ae6bf7f514aa53df50`**.
Build-/Testcommit: **`6180ed44ab67353eb750d832f67f596a2201a40d`** (gleiche Laufzeitbytes, erweiterte Abnahme).

Die verwendete private Version, `main`, PR #16/#17 und die Tailscale-/Windows-Task-Konfiguration wurden nicht geändert. Beide PRs waren bei Beginn offen. **Kein Merge, keine öffentliche oder private Deploymentaktion, kein Funnel und kein Pages.** Die hier gebaute Edition ist ein eigener geprüfter Entwicklungskandidat; ein Wechsel der installierten Version benötigt Datensicherung und ausdrückliche Eigentümerfreigabe.

## Tatsächlicher Umfang

25 registrierte Apps: **16 lokale Apps und neun ausdrücklich gekennzeichnete externe Webalternativen**. Eine Registry, ein interner Window Manager und der vorhandene Audiocontroller. Echte lokale Apps statt zusätzlicher funktionsloser Icons. Das ist weitgehende Browserfunktionalität, keine behauptete vollständige native Windows-/iPadOS-Parität.

- Desktop mit Dock, Pins, laufenden/aktiven/minimierten Apps, MRU, Touch-Kontextmenüs, Pin-Reihenfolge, Launchpad mit Appgruppen, Spotlight, Fensterübersicht, Widgets und Kontrollzentrum.
- Drag/Resize, Pointercancel, Fokus/Z-Reihenfolge, Minimize/Restore/Maximize, Side-by-Side und persistierte Geometrien. Unter 640px werden Snapfenster vollbreit, damit Apps bedienbar bleiben. Ausschließlich interne PWA-Fenster.
- Finder mit echtem internem Dateibaum, Import/Export, Move/Copy/Rename, Papierkorb/Restore, Text- und Rasterbildvorschau. Notes/Dokumente mit Revisionen, explizitem bestätigtem Speichern, Konfliktschutz, Undo/Redo und Import/Export.
- Echte Reminders und Kalender; vorhandene Musik-/Coverbibliothek mit Playlists, Suche, Favoriten, Shuffle/Repeat, Metadaten, Fortschritt und einem gemeinsamen Audiostatus. Originale sieben Arcade-Spiele und AirWrite-Handschrift-/PNG-Funktionen.
- Safe Areas, VisualViewport/ResizeObserver, größere Touchziele, Pointer-/Pencil-Ereignisse, Portrait/Landscape, CSS-Glasqualitäten, Reduced Motion/Transparency und Forced Colors. Kein zusätzlicher Shader-/Audio-/Fensterrenderer.

## Architektur und Datenverträge

| Eigentümer | Aufgabe |
|---|---|
| `ipad/registry.js` | Ein Appinventar für Dock, Launchpad, Suche und Öffnen |
| `ipad/desktop.js`, `core/window-model.js` | Interne Fenster, Bounds, Restorewarteschlange, Dock und Systempanels |
| `ipad/app.js` | Bestehender privater Lockscreen/Notch, **ein** HTMLAudioElement, Musiktitel, Kalender und Timer |
| `ipad/storage.js` | Gemeinsamer Browserdatenadapter, Revisionen, Transaktionen, validierte Modelle und virtueller Dateibaum |
| `ipad/apps.js`, `widgets.js` | Datenverbrauchende Apps/Widgets; keine konkurrierenden Stores |
| `ipad/backup.js` | Konsistenter Snapshot, validierter atomarer Restore und wiederholbares Legacy-Journal |
| `scripts/build-ipad-parity.cjs` | Contenthash-Versionierung der vollständig lokalen App-Shell |

**Die existierende Datenbank `air-os-ipad-tracks-v1` wird additiv von Version 1 auf 2 erweitert.** Der Store `tracks` und bestehende IDs/Audio-Blobs bleiben bestehen. Der neue `records`-Store enthält Notes, Dokumente, Reminders, Kalender, Dateien, Karten, Playlists, Einstellungen und Mitteilungen. Musik-Metadaten werden getrennt als `trackmeta` gespeichert: Favorit/Cover/LastPlayed schreiben die alte Audiodatei nicht neu. Der tatsächliche WebKit-Test deckte einen Blob-Lesefehler nach erneutem Schreiben gelesener Blobdatensätze auf; die Trennung beseitigt diesen Pfad.

`air-ipad:last-track-v1`, `air-ipad:last-progress-v1`, `air-ipad:timer-v1` und das AirWrite-Profil behalten ihre Schlüssel. Kalender wird transaktional und idempotent übernommen; `air-ipad:calendar-v1` bleibt unverändert als Rückfallsicherung. Beschädigte Legacydaten stoppen die Migration statt einen Reset auszulösen. Ein Upgrade kann auf noch offenen alten Verbindungen warten; dann alte Clients schließen. Keine automatische Eigentümerzuordnung von Desktopdaten und kein Datenbanklöschen.

Restore schreibt Nutzerdaten und ein Journal für Timer/Player/Handschrift in **einem** IDB-Commit. LocalStorage wird danach aus dem Journal übernommen; bei Fehlern bleibt ein wiederholbarer Auftrag erhalten. Quota-/Validierungs-/Konfliktfehler melden keinen Speichererfolg. Standardimport ergänzt ohne Überschreiben; ID-Kollisionen brechen die gesamte Transaktion ab, außer Überschreiben wurde ausdrücklich bestätigt. Aktuelle Einstellungen bleiben beim Merge erhalten. Dateibaumzyklen und ungültige Eltern werden abgelehnt.

## Überprüfbare Funktionsmatrix

„Ja“ bedeutet lokaler getesteter Ablauf, nicht native Systemparität. Browserdatei-/Audiotests verwenden isolierte ausgewählte synthetische Dateien. Externe Anbieter wurden nicht automatisch aufgerufen oder angemeldet.

| App/Funktion | Desktopfunktion / Abhängigkeit | iPadfunktion und Daten | Offline / Parität | Tatsächlicher Test / Grenze |
|---|---|---|---|---|
| Finder | Main-FS, explizite Roots, native Picker | IDB-Dateibaum, Ordner, Import/Export, Copy/Move/Rename, Trash/Restore, Text/Bild | Ja / Webalternative | Echter File-Import/Textsave; Modelltests für Baumaktionen/Zyklen/Trashbatches. Kein beliebiger Dateien-App-Zugriff; natives DnD/Picker auf Hardware offen |
| Notes | lokale Datendienste | IDB-Notes, Liste/Suche/Sortierung, CAS-Save, Undo/Redo, Import/Export | Ja / weitgehend | Echte Speicherung, Tastatur-Undo/Redo, Konfliktentwurf, abgelehnter Dirty-Close, kalter Neustart |
| AirWrite | originaler JS-Handschrifteditor | Original-Canvas/Zeichenprofile/PNG plus IDB-Dokumentbibliothek, Textimport/export | Ja / eingeschränkt | Dokument-Save und Originalmodul; physisches Pencil-Zeichnen und native Auswahl offen. Kein rich-text Word-/PencilKit-Anspruch |
| Reminders | vorhandene Aufgabenlogik | Listen, Datum/Priorität, Erstellen/Bearbeiten/Erledigen/Löschen/Filter | Ja / weitgehend | Echter Create/Edit/Heute/Completed-Ablauf; Widget liest dieselben Daten |
| Kalender | lokale Termine/Navigation | ursprüngliche App plus Monat und Tages-/Wochenlistenfilter, Suche, CRUD | Ja / weitgehend | Alttermin bleibt, neuer Termin wird erstellt/bearbeitet/gelöscht. Kein nativer Apple-Kalenderzugriff |
| Air Music | Desktopaudio, ausgewählte Dateien/Metadaten | **bestehende** DB/Audioengine, Playlists/Suche/Favoriten/Shuffle/Repeat/Seek/App-Lautstärke/Cover | Ja / eingeschränkt | Alter Blob-SHA nach echtem Upgrade und Recovery identisch; echte Wiedergabe/Control-Center-Transport. Hardwareaudio/Background/Safari-Lautstärke offen |
| Fotos | Desktopdateien | derselbe virtuelle File-Store, Rasterbildimport/Galerie/Export | Ja / Webalternative | Echtes ausgewähltes PNG wird gespeichert und dekodiert; keine native Fotomediathek |
| Rechner | lokale Ausdrücke | begrenzter Parser ohne eval, Klammern und Grundrechenarten | Ja / eingeschränkt | `(2+3)*4=20`; keine vollständige wissenschaftliche Rechnerparität |
| Air Arcade | eigene sieben JS-Spiele | Originale Spielcontroller, Touch-/Tastaturaktionen | Ja / portiert | Reale 2048-Züge, Snake-Start, Pause/Resume und Intervallcleanup bei Minimize/Close; nicht jede Spielregel separat abgenommen |
| AirCard Lite | Geräte-/Wallet-Skins | lokale JSON-Kartenbibliothek, Import/Export | Ja / Webalternative | Reales Speichern; keine Wallet-/Geräte-Skin-Steuerung |
| Timer | lokale Deadline | bestehende Zeitstempel, Pause/Resume/Reset, lokaler Abschluss | Ja / erhalten | alter Timer bleibt beim Upgrade; keine garantierte OS-Hintergrundausführung |
| Downloads | native Downloadverwaltung | interner Dateibereich, expliziter Export nach Safari/Dateien | Ja / eingeschränkt | gemeinsame Finderfunktionen; kein Lesen der Safari-Downloadliste |
| Papierkorb | Dateiaktionen | interner Trash/Restore/Purge mit Batchschutz | Ja / Webalternative | Modelltest schützt bereits vorher gelöschte Kinder; keine iPadOS-Papierkorbsteuerung |
| Air Home | Desktopübersicht | echte lokale Appstarts | Ja / eingeschränkt | Registry-/Öffnen-Pfad; keine native OS-Übersicht |
| Einstellungen | native Main-/OS-Adapter | Materialien, Bewegung, Storage/Persistenzanfrage, Backup, Update | Ja / eingeschränkt | Backup/Restore/Quota/Update echt getestet; kein Bluetooth/Helligkeits-/Systemlautstärke-Faketoggle |
| Über Air-OS | Produktinfos | lokale Informationen/Quellnachweise | Ja | lokale Oberfläche, keine native App-Store-App |
| Air Web | Electron-Webfenster | validierter HTTPS-Link, neuer Browsertab | nur UI / ersetzt | kein iframe-Zwang und keine zweite Browserengine |
| Mail | Provider/Native-App | expliziter externer Providerlink | Nein / eingeschränkt | kein eigener Mailclient oder Offline-Sync |
| Übersetzer | MyMemory-Netzwerkdienst | expliziter DeepL-Weblink | Nein / ersetzt | keine lokale Übersetzungsengine; kein automatischer Texttransfer |
| Air-KI | Desktop-Ollama auf localhost | expliziter Browserlink zu einem Onlinedienst | Nein / ersetzt | iPad-localhost ist nicht der Windows-PC; kein Ollama-/LLM-/Cloud-Auth-Anspruch |
| Nachrichten | Onlinequelle | expliziter Tagesschau-Link | Nein / eingeschränkt | keine erfundenen Artikel oder gebündelte Fremdinhalte |
| Wetter | Wetteranbieter | expliziter Anbieterlink | Nein / eingeschränkt | kein Provider eingerichtet, keine erfundenen Wetterwerte; vollständiges Wetterwidget offen |
| Fußball | Onlinequelle | expliziter kicker-Link | Nein / eingeschränkt | keine Fake-Ergebnisse |
| Aktien | Onlinequelle | expliziter Börsenlink | Nein / eingeschränkt | keine Fakekurse |
| Spotify | Onlinedienst/Auth | expliziter Webplayerlink | Nein / eingeschränkt | keine native Spotify-Steuerung |
| Spotlight/Launchpad | Registry/Suchdienste | Apps, Notes, Dokumente, Tasks, Events, Dateien, Rechner; Gruppen | Ja / portiert | echte Suchtreffer, Appgruppen, Tastatur/Touch, Appstart |
| Dock/Fenster | Desktop-Lifecycle/M1/M2 | ein interner Web-Lifecycle, Pins/Reorder/MRU/Resize/Snap/Restore | Ja / adaptiert | Pointer-/Touchcancel, Side-by-Side, sechs Größen, gespeicherte Wiederherstellung. Keine native Stage-Manager-/F11-Electron-Steuerung |
| Notch/Widgets/Control Center | gemeinsame Dienste | Originalplayer/-timer plus echte Kalender-/Reminderansichten, Mitteilungen | Ja / adaptiert | ein Audioelement, echter gemeinsamer Transport. Keine native iPadOS-Island/Push-Systemintegration |
| Sperransicht | Desktopauth/native Grenzen | erhaltene private visuelle Start-/Sperroberfläche | Ja / bewusst begrenzt | keine zusätzliche sichere Anmeldung oder native iPadOS-Sperre; Tailscale bleibt separater privater Transport |

## Gemeinsam verwendeter Code und Lizenzen

- Originale eigene `airwrite.js/css` und `air-arcade-games.js/css` aus dem verbindlichen Desktopinventar wurden gezielt nach `ipad/vendor/` portiert. `vendor/SOURCE.json` nennt Original-SHA-256; Ziel-JS passt Pointerabbruch, Canvasgrenzen und sichtbarkeitsabhängige Timer an. Nicht blind einen anderen Branch gemergt.
- `src/core/music-metadata.js` aus R7 `02ccaf88724731cf685d2221f88e959020aff3f0` unverändert browserfähig übernommen, SHA-256 `b4e8d5e588a5c766fc1d22eabf1621b809a895a41b5897ed2e1b52505e53164b`.
- Bereits kuratierte MacTahoe-Assets aus der vorhandenen Air-OS-Integration: Original-SVGs, GPL-3.0-COPYING/AUTHORS/NOTICE und `provenance.json` mit Upstream-Pins. Kein zusätzliches Markenasset importiert. Das offizielle private Air-OS-Logo bleibt unverändert.
- Materialien sind der **CSS-Compositor von Chromium/WebKit** mit begrenztem Standardblur, opt-in höherer Qualität, Reduced Transparency/Forced Colors. Kein neuer GL-Renderer und keine behauptete Snell-, Hardware-GPU- oder Fremdfensterrefraktion. MacShell-/Hyprland-Desktopshader wurden nicht blind als Safari-kompatibel ausgegeben.
- Native Electron-/Windows-/Hyprland-/Cloud-Codepfade bleiben außerhalb der PWA. Keine neuen Laufzeit-CDNs, Secrets oder Telemetrie.

## Tests, Bilder und reproduzierbare Befehle

**Lokal tatsächlich bestanden:** 29 Node-Tests (alle 21 alten + acht zusätzliche), 80 Chromiumchecks unter Root und separat unter `/Air-OS/`, jeweils 28 Aufnahmeereignisse; neun zusätzliche Upgrade-/Rückfallchecks mit acht Aufnahmen. Testwerkzeug-Audit: null Vulnerabilities. 89 Runtime-Dateien byteweise gegen den Buildstand geprüft, einschließlich CSP, Scopes und Lizenzassets.

Viewports: 1024×768, 1180×820, 1366×1024, 834×1194, 820×1180, 390×600. DPR 1 bei den Größenwechseln, DPR 2 nach kaltem Neustart; Touchfähige Browserkontexte; tatsächlich injizierte Chromium-Touchbewegung/Cancel, WebKit-Tap und Pointercapture-Abbruch. Screenshots sind echte unretuschierte Browseraufnahmen. Tabellen in `report.json` enthalten Viewport/DPR und echte DOMRects für Host, Fenster, Dock und Notch. Die Original-v4- und neue Ansicht verwenden dasselbe synthetische Profil/Viewport; die Uhr läuft real weiter. Keine erfundene Pixelidentität.

Der Server wird **wirklich beendet**, anschließend wird der ganze Browserprozess geschlossen und mit demselben isolierten Profil erneut gestartet. Das prüft den App-Shell-Cache und persistierte Nutzerdaten ohne Server, nicht bloß einen iPad-User-Agent. Vorhandene Audiodaten werden nach echtem Service-Worker-Upgrade und kompatiblem Rückfall per SHA-256 verglichen.

**Abschließender CI-Lauf [41844493854](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41844493854): erfolgreich.** Chromium: 80 Checks unter Root + 80 unter Unterpfad + 9 Upgrade/Recovery. WebKit: 79 + 79 + 9. Insgesamt **336 Browserchecks**, zusätzlich 29 Node-Regressionen (in beiden CI-Jobs erneut ausgeführt). Der Unterschied um einen Check ist die Chromium-spezifische echte Touchbewegung über CDP; WebKit prüft stattdessen Touch-Tap und Pointercancel. Beide Engines bestehen auch den echten Offline-Prozessneustart und DPR 2. Vorheriger Produktlauf [41844115214](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41844115214) ebenfalls grün. Die einzigen abschließenden Workflow-Warnungen betreffen von GitHub auf Node 24 umgestellte v4-Action-Runtimes, keine fehlgeschlagenen Tests/Audits.

[Maschinenlesbare Ergebnisse, DOMRects und Performance](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/evidence.json) sind im Branch gesichert. Der zusätzliche DOMRect-Test deckte einen veralteten WebKit-VisualViewport nach schnellem Resize auf (Host bei 390×600 noch 1180px hoch). Der Renderer begrenzt ihn nun gegen `innerHeight` und berechnet Fenstergrenzen im Resizepfad unmittelbar neu. Frühere WebKit-Läufe deckten außerdem den Blob-Rewrite-Fehler und ein zu frühes Weiterlaufen des Update-Tests vor dem Reload auf. Beides wurde konkret korrigiert; keine fehlgeschlagenen Läufe als Endabnahme ausgegeben.

```sh
node --test tests/*.test.cjs
node scripts/package-ipad-parity.cjs
node scripts/check-ipad-parity-package.cjs
node scripts/build-ipad-recovery.cjs
# Nach Installation der eingefrorenen Testwerkzeuge und echten Browserengines:
AIR_PAD_ENGINE=chromium node scripts/test-ipad-parity.cjs
AIR_PAD_ENGINE=webkit node scripts/test-ipad-parity.cjs
AIR_PAD_ENGINE=webkit AIR_PAD_PREFIX=/Air-OS/ node scripts/test-ipad-parity.cjs
AIR_PAD_ENGINE=webkit node scripts/test-ipad-updates.cjs
```

## Offline, private Updates und Rückfall

Contenthash-v5 cached sämtliche lokalen Laufzeitassets, Root `./`, Manifest-ID/Start/Scope relativ. Der Safari-Redirect-Fix erzeugt weiterhin neue Response-Objekte für Navigationen. Scope-getrennte Cache-Namen vermeiden fremde Unterpfad-Löschungen; eine vorherige eigene Version bleibt erhalten. Cachewechsel löscht keine IndexedDB-Daten.

Neue Worker aktivieren bestehende v5-Clients erst nach Rückmeldung aller geöffneten Appclients. Audio und ungespeicherte Inhalte blockieren das Reload; direkt davor erfolgt eine erneute Prüfung. Der erste v4-Übergang erfordert nach Download/Pause das vollständige Schließen der alten Clients. Keine aggressive skipWaiting-/Storage-Reset-Installation. Suspend/Resume nutzt Zeitstempel und Sichtbarkeitsereignisse statt Hintergrundpolling.

Drei getrennte, **nicht deployte** Pakete: neue Parity-PWA, lesendes Vorabbackup für die alte Version und kompatible Classic-Recovery-Oberfläche. Unveränderter alter v1-Code wäre nach dem additiven v2-Upgrade kein sicherer Rollback. Recovery verwendet deshalb v2-fähige Adapter, behält neue Workspace-Daten und kann sie exportieren. Große JSON-Backups haben eine explizite 64-MiB-Binärgrenze; darüber wird kein vollständiger Export behauptet.

Der konkrete [private Umstellungsplan](AIR_OS_IPAD_PRIVATE_ROLLOUT.md) beschreibt Datensicherung, manuelle Freigabe, bewussten Umgang mit der bisherigen Branch-folgenden Windows-Aufgabe und sicheren Rückweg. Keine dieser Liveaktionen wurde ausgeführt. Browserdaten bleiben lokal, können aber durch iPadOS gelöscht werden. Andere Origins trennen Daten; Unterpfade allein sind **keine** Profiltrennung.

## Performance und verbleibende Abnahme

Lokales Chromium nach kaltem DPR-2-Neustart und Appinventar: 15 offene interne Fenster, zwei Canvas-Elemente, ein Audioelement, gemeldeter JS-Heap ungefähr 5,65 MB (eine Browsermomentaufnahme, kein Gesamt-/GPU-Speicherbenchmark). Ein Audioelement, keine JS-Glas-Renderloops, keine externen Textur-Captures. Arcade-Intervalle pausieren bei Minimize/Lock/Hidden und werden bei Close entfernt; Canvasgrößen sind begrenzt. Blob-URLs von Vorschauen werden freigegeben, Drawer-/Popup-Listener beendet. Clock/Widgets laufen nur sichtbar; Timer berechnen nach Suspend aus echten Zeitstempeln. Materialpfad, Canvasanzahl und Browserheap werden, soweit verfügbar, im Bericht erfasst. Keine erfundenen FPS oder physische GPU-Abnahme.

**Offen:** reales iPad/Safari/Home-Screen, Softwaretastatur/Trackpad/Pencil, native Datei-/Share-/Audioausgabe, lange Suspend-/Background-Wiedergabe, konkrete private Tailscale-/Task-Abnahme, große segmentierte Backups, lückenlose Spielregel-/Metadatenformatabdeckung, rich-text AirWrite, vollständige native Desktopapp-Parität. Wetter/News/Mail/LLM/Spotify bleiben ausdrücklich Webalternativen ohne Backendintegration. Cloud bleibt deaktiviert. Windows-/Desktopdateien und deren Fullscreen/M1/M2 wurden nicht geändert; diese Sitzung behauptet keine erneute native Windows-Abnahme.

## Checkpoints

| Commit | Gesicherter Inhalt |
|---|---|
| `c4a3b6d54f375ab2ad069e58c6594980b0140954` | Registry, Browserdesktop, additive Datenarchitektur, erste Apps |
| `cda83785ff04e4c913d14d2b07d70e490f1f9840` | Lebenszyklus und privater Browser-Buildkanal |
| `fb744e715603cfe649a85f0a72be4906f62d6cfc` | Touch-/Cachegrenzen und WebKit-Fehlersuche |
| `023bebec99fbec61929eb78f1a6c3c42414ffb36` | Restorevalidierung und echter kalter Offline-Neustart |
| `dbefa321480d37ca9c3a6c21aa57f04e346323f0` | Unveränderliche Musik-Blobs, Update-/Recoverypfad |
| `58c3baaf7ca8a22e5776897554a8d0b235558ae4` | Kleine Viewports, Migration-/Quota-Fehlerpfade |
| `ae45ab743442023c244fccd825aff054a5dd198b` | Vorabbackup, gemeinsame Controls, Rolloutplan |
| `7ab977aefada10c531a1d2ae6bf7f514aa53df50` | Korrigierter WebKit-Viewport, gesamtes Offline-Appinventar |
| `6180ed44ab67353eb750d832f67f596a2201a40d` | Abschließende DPR-/Accessibility-/Appinventar-Abnahme |

Jeder Produktcheckpoint wurde auf dem eigenen Featurebranch gepusht. Separate Evidence-Commits enthalten ausschließlich synthetische Browseraufnahmen. Keine Liveinstallation umgestellt.

## Konkrete Main-/Browsertrennung

Die Desktopbasis exponiert `airOS.accounts/createAccount/login/currentUser/logout/restart/quit` und `airOS.files.selectFolder/currentFolder/listDirectory/readTextFile/writeTextFile/openNative` sowie `airCardLite.listDevices/scanCards/saveArtwork/getArtwork/applySkin` in `preload.cjs`. Keiner dieser IPC-Pfade wird in die PWA kopiert. Dateifunktionen werden durch den internen IDB-Baum und ausdrückliche File-/Download-Aktionen ersetzt; Geräte-/Wallet-Funktionen bleiben nicht unterstützt. Browserlokalsitzung ist keine Ersatzimplementierung der Desktopauthentifizierung. Die übrigen lokalen Appmodelle verwenden browsergerechte Records; Desktop-OS- und Providerfunktionen bleiben klar getrennt.

## Gemessene Geometrie nach Korrektur (Chromium, DPR 1)

| Viewport | Host (x,y,Breite,Höhe) | Notes-Snap (x,y,Breite,Höhe) | Unterer Spalt |
|---|---|---|---|
| 1024×768 | 0,44,1024,724 | 0,44,512,724 | 0px |
| 1180×820 | 0,44,1180,776 | 0,44,590,776 | 0px |
| 1366×1024 | 0,44,1366,980 | 0,44,683,980 | 0px |
| 834×1194 | 0,44,834,1150 | 0,44,417,1150 | 0px |
| 820×1180 | 0,44,820,1136 | 0,44,410,1136 | 0px |
| 390×600 | 0,44,390,556 | 0,44,390,556 | 0px |

Die iPad-Touchzeile nutzt 44px-Trefferhöhen; die native 24px-Desktopmenüleiste wurde nicht verändert. Dock bleibt Overlay; Inhalt bleibt darüber scrollbar. Hardware-Safe-Area-Werte dieser Linux-Kontexte sind 0, deshalb keine physische Notch-/Safari-Keyboard-Abnahme daraus ableiten.

## Buildpakete und Download

Im erfolgreichen [Actions-Lauf](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41844493854) unter **Artifacts**:

`Air-OS-iPad-Parity-Build-6180ed44ab67353eb750d832f67f596a2201a40d`

Enthält:

- `Air-OS-Ultimate-iPad-Parity-6180ed44ab67353eb750d832f67f596a2201a40d.zip`
- `Air-OS-iPad-ReadOnly-Preflight-6180ed44ab67353eb750d832f67f596a2201a40d.zip`
- `Air-OS-iPad-Compatible-Recovery-6180ed44ab67353eb750d832f67f596a2201a40d.zip`
- jeweils benachbarte `.sha256`-Prüfsumme; `BUILD-INFO.json` innerhalb der Pakete.

Der äußere GitHub-Actions-Artefaktcontainer hat laut Actions SHA-256 `7e89336b26598d72ad3b5ad98a11d161a0e910f9a71f3348afb2c0a6ba8c4058`. **Dies ist die Containerprüfsumme, nicht die Prüfsumme einer enthaltenen PWA-ZIP**; für die einzelne Datei deren mitgelieferte `.sha256` verwenden. Artefaktretention 30 Tage; bei Ablauf exakt den dokumentierten Buildcommit erneut bauen. Kein automatisches Hosting/Release.

## Echte Vorher-/Nachher-Nachweise

Alle folgenden Bilder verwenden synthetische lokale Daten, keine persönlichen Musikdateien oder Cloudkonten:

- [Vorher: ursprüngliche private Vier-App-Oberfläche](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/update-chromium/before-desktop.png) → [Nachher: derselbe Upgrade-Testdesktop](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/update-chromium/update-desktop.png).
- [Desktop/Dock/Widgets](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/chromium/desktop-clean.png), [zwei Fenster](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/chromium/two-windows.png), [Hochformat](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/webkit/desktop-834x1194.png), [WebKit 390×600 nach Geometriefix](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/webkit/desktop-390x600.png).
- [Finder](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/chromium/finder.png), [Notes](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/chromium/notes.png), [AirWrite](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/chromium/airwrite.png), [Reminders](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/chromium/reminders.png), [Kalender](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/chromium/calendar.png), [Musik](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/chromium/music.png).
- [Fotos](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/chromium/photos.png), [Rechner](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/chromium/calculator.png), [Einstellungen](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/chromium/settings.png), [Launchpad](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/chromium/launchpad.png), [Spotlight](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/chromium/spotlight.png).
- [Kontrollzentrum](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/chromium/control-center.png), [Lockscreen](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/webkit/lockscreen.png), [kalter Offline-Neustart bei DPR 2](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/webkit/offline-cold-restart.png), [kompatible Rückfalloberfläche](visual/ipad-parity/6180ed44ab67353eb750d832f67f596a2201a40d/update-webkit/update-classic-recovery.png).

Chromium und WebKit messen nach dem Fix bei 390×600 übereinstimmend Host und vollbreiten Snap mit `(0,44,390,556)`, unterer Spalt 0px. Die Linux-Kontexte melden keinen echten iPad-Safe-Area-Wert; reale Hardwarefreigabe bleibt offen.
