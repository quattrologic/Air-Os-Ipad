# Air-OS iPad Ultra Design

Der geprüfte Stand ersetzt die bisherige iPad-Präsentation: lizenzierte Naturfotografie, schlanke Systemleiste, MacShell-Widgetkomposition, dichter Dock, neutrales MacTahoe-Fenster-Chrome, neue Panelkomposition und gemeinsame Materialien. Die bestehende App-, Audio-, Fenster- und Datenarchitektur bleibt maßgeblich.

- Basis: `e4b1c4203c2430da04bccc5dd33953fb44cc0781` auf `feat/air-os-ipad-ultimate-2`.
- Entwicklungsbranch: `feat/air-os-ipad-ultra-design`.
- **Geprüfter Produkt-/Buildcommit:** `d6d9395f022957047a074b4a3693a5f4f769b507`.
- **CI bestanden:** [42088042673](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42088042673), Chromium und WebKit.
- **40/40 Regressionstests und 542 bestandene Browserprüfungen.** Die Browserzahl umfasst die getrennten Vorher-, Root-, Unterpfad-, Material- und Updateabläufe.
- Kein Deployment, kein Eingriff in Tailscale, keine Umstellung der installierten Version und kein Merge in einen anderen Produktbranch.

## Tatsächlich integrierte Quellen

| Quelle | Originalpfad / Stand / Lizenz | Ausgeführter Air-OS-Pfad | Einordnung |
|---|---|---|---|
| MacShell | `MacShell/ClockWidget.qml`, `1bdb51870b621100fd2709f66c8f8e00ab17b9c4`, MIT | `ipad/vendor/macshell/clock-dial.js` → `ipad/widgets.js` | Direkter Port von `tickGeo`: 60 Strahlen mit Schnittpunkten an einer abgerundeten Rechteckkontur. DOM-Striche werden bei Größenänderung neu positioniert. |
| MacShell / vorhandener R7-Port | `liquidglass.frag`, `dockglass.frag`, `contourglow.frag`; bestehende WebGL-Adaption aus Air-OS `02ccaf88724731cf685d2221f88e959020aff3f0`, MIT | `ipad/vendor/glass/{renderer,shaders,geometry}.js` | Bestehende GLASS-3-Pipeline für Browserselektoren, Qualitätsstufen und Lifecycle adaptiert. Originalbasierte Refraktion, Dispersion, Kontur und gecachter Gaussian-Prepass laufen im geprüften Shaderpfad. |
| MacShell | `MacWidgets.qml`, `WidgetVisual.qml`, `CalendarWidget.qml`, `PlayerWidget.qml`, `GlassSlab.qml`, gleicher MacShell-Pin, MIT | `ipad/widgets.js`, `ipad/desktop.css`, bestehende Audio-/Kalendercontroller | Komposition und Materialhierarchie adaptiert: zwei kleine Module über breiten Modulen, echter Monatsraster, Artwork, Transport und Fortschritt. QML selbst wird nicht ausgeführt. |
| MacShell, vorhandener Port | `MacDock.qml`, `Spring.qml`, gleicher Pin, MIT | `ipad/vendor/macshell/shell7.js` → `ipad/dock-material.js` | Gekoppelte Cosinus-Magnifikation und Spring bleiben erhalten. Dynamische Höhe verhindert abgeschnittene Hovericons; Überlappung verwendet die tatsächliche Dockposition. |
| InfinityOS Web | `styles.css::winOpen`, `a6584135cbcad837d57484211119451bbb2d8fb2`, AGPL-3.0 | `ipad/core/visual-motion.js` | Originalkurve `cubic-bezier(.34,1.56,.64,1)` adaptiert. Für Touch kleinere Bewegung/Skalierung und 250 statt 350 ms. Abbrechbare WAAPI-Präsentation; bestehende Datenports bleiben erhalten. |
| MacTahoe GTK | `src/sass/_colors.scss`, `1e45e19f510edb8cde18fa84d6cd5319f60b086b`, MIT | `ipad/desktop.css` | Neutrale Palette und Chrome adaptiert: Sidebar `#242424`, Header `#282828`, Arbeitsfläche `#f5f5f5`, Text `#363636`. Keine GTK-Laufzeit. |
| MacTahoe Icons | Bereits kuratierte GPL-3.0-Assets unter `ipad/icons/source/` | Bestehendes `airApps.icon`, Dock, Launcher, Suche, Titelleisten, monochrome Medienmasken | Originalassets weiterverwendet; eigene ergänzende Linienglyphen werden als eigene Integration behandelt. |
| Open Runde | Unveränderte vorhandene R7-Schriften unter `third_party/maclock/fonts/`, OFL-1.1 | `ipad/assets/fonts/`, lokale `@font-face` | Regular/Semibold, ohne CDN. Vollständiger OFL-Text gebündelt. |
| KDE Wallpaper „Path“ | `Path/contents/images/2560x1600.jpg`, `0643e9404da07d204014549d9f734424fdf961ed`, Risto Saukonpää, LGPLv3 | `ipad/assets/forest-path.jpg` | Unveränderte Naturfotografie mit Originalmetadaten und Lizenz. Das Yosemite-/Apple-Bild der Referenz wird ohne Rechtebeleg nicht gebündelt. |

Exakte Quellhashes und Zielpfade: [Provenienz](../ipad/vendor/glass/provenance.json). Vollständige MIT-/GPL-/AGPL-/OFL-/LGPL-Texte stehen in `ipad/licenses/` und `ipad/icons/`; MacTahoe GTK behält den Copyrightvermerk der WhiteSur Developers. Kombinierte Browseredition weiterhin AGPL-3.0, Desktop-Lizenz unverändert. Der vollständige lesbare PWA-Quellstand mit Assets und Build-/Testwerkzeugen wird lokal/offline über `source/source.zip` angeboten.

Eigenständige Integration sind Browser-CSS, Control-Center-Komposition, Fokus-/Touchdarstellung, Linienglyphen und Controlleradapter. Es wurden keine ungeklärten Origin-/ISO-Dateien, proprietären Wallpaper oder neue Systemabhängigkeiten übernommen. Die Prozentangaben des Auftrags wurden als Gestaltungsprioritäten verwendet.

## Präsentation und Architektur

`ipad/desktop.css` wurde als Präsentationsschicht ersetzt. Das Dock nutzt für unkonfigurierte Profile 13 reale Einträge einschließlich Launcher und Dateiablage; bereits gespeicherte Pins werden gelesen und bleiben erhalten. Running Indicators, Reorder, Kontextaktionen und gekoppelte Magnifikation verwenden denselben Dockcontroller.

Die Widgets lesen die vorhandenen Kalender-, Reminder- und Musikdaten. Aufgaben ersetzen bewusst eine Wetterattrappe. Kalender und Uhr sind kleine quadratische Module; Player und Heute-Modul sind breit. Uhr/Datum werden sichtbar minutenweise aktualisiert; der originale 33-ms-Sekundentrail bleibt aus Energiegründen offen.

Fenster erhalten dunkles Chrome, kleine sichtbare Trafficlights in größeren Buttons, neutrale Sidebars und helle Arbeitsflächen. Notes/AirWrite bekommen eine obere Toolbar, eine klare Titel-/Papierhierarchie und korrigierte Scrollränder. Fachlogik, Dirty-Schutz und Speichern bleiben in ihren vorhandenen Controllern. Alle **25 Registryeinträge** bleiben erhalten: 16 lokale Apps und neun bereits ausgewiesene externe Webalternativen.

Kontrollzentrum, Spotlight, Launchpad, Mitteilungen und Island verwenden dieselben Materialien und Icons. Die Transportcontrols steuern das eine vorhandene Audioelement. Lautstärke bleibt ausdrücklich App-Lautstärke. MacLock zeigt echte vorhandene Artworkdaten mit zentralem Medienbereich; es bleibt eine lokale visuelle Start-/Sperransicht. Kalender-/Reminder-Ergänzungen sind vor dem Öffnen der lokalen Sitzung verborgen.

Eigentümer bleiben `desktop.js` für Fenster und Appaktionen, `app.js` für den gemeinsamen Medien-/Kalender-/Timerzustand, `storage.js` für IndexedDB und `backup.js`/`transfers.js` für Sicherungen. Es gibt keine neue Registry, Datenbank, Fenster- oder Musikengine. Rendererbestandteile verwenden Browser-APIs; Electron-/GNOME-Code wird nicht in der PWA ausgeführt.

**Unverändert gegenüber der Basis:** IndexedDB-/Backupimplementierung, Service-Worker-Template einschließlich Safari-Redirect-Fix und vorhandene Windows-/Tailscale-Skripte. Datenbank `air-os-ipad-tracks-v1`, Schema und Bestandsdaten werden durch den Designumbau nicht zurückgesetzt.

## Materialpfade und Performance

- **Standard:** begrenzte CSS-Ebenen des eigenen Wallpapers. Der vorhandene Materialeigentümer richtet diese an den Oberflächen aus. Ein CSS-Blur pro Ebene; `backdrop-filter` wird dafür abgeschaltet. Das behebt die im Linux-WebKit sichtbare Abweichung des ursprünglichen Compositor-Fallbacks.
- **Hochwertig:** ausdrücklich gewählte GLASS-3-Stufe. WebGL2, GPU-Klassifikation, Shaderkompilierung und Fehlerpfad bleiben geprüft. Software-/unbekannte GPUs fallen auf CSS zurück. Szene maximal zwei Millionen Pixel, Texturdimension maximal 2048, Szenenbreite maximal 1920; vorhandene adaptive Materialauflösung bleibt aktiv.
- **Reduzierte Transparenz:** undurchsichtige Systemflächen; CSS-Wallpaper-Ebenen und GL-Ressourcen werden entfernt. Reduced Motion und Forced Colors bleiben berücksichtigt.
- **Isolierte Diagnose:** nur im Test aktivierte Originalshaderprüfung. Sie ist keine Hardwarefreigabe und kein aktivierter Software-Produktmodus.

CSS-Fallback und Shader nutzen ausschließlich das eigene Wallpaper. CSS-Blur ist keine Snell-Refraktion; Live-Fenster-/Desktoptexturen werden nicht aufgenommen. Der portable CSS-Pfad ist auf das gebündelte Foto mit Seitenverhältnis 2560:1600 ausgerichtet. Frei wählbare zukünftige Wallpaper benötigen eine Erweiterung dieses Bildseitenvertrags.

Messung bei 1180×820/DPR2 aus dem finalen CI-Bericht:

| Messwert | Chromium | WebKit |
|---|---:|---:|
| Standard: Programme / GL-Texturen | 0 / 0 | 0 / 0 |
| Normaler High-Pfad | CSS, Software-GPU erkannt | WebGL2, als Hardware-Kandidat klassifiziert |
| Diagnose: Programme / Materialprogramme | 4 / 3 | 4 / 3 |
| Diagnose: GL-Texturen / geschätzte Texturbytes | 5 / 21.356.816 | 5 / 21.356.816 |
| Initial gezählte Materialdraws / Prepassdraws | 6 / 6 | 6 / 6 |
| Geänderte Farbkanäle beim Refraktion-Aus-Test | 433.074 von 1.047.196 | 437.494 von 1.047.196 |
| Mittlere absolute Kanaländerung | 1,878 | 1,885 |
| Zusätzliche Idle-Draws nach Beruhigung | 0 | 0 |
| Context-Loss/Restore | bestanden | bestanden |
| Programme / Texturen / Tiles nach Navigation | 0 / 0 / 0 | 0 / 0 / 0 |

Die Idle-Messung wartet auf Fonts und Dock-Endzustand und verwendet im isolierten Materialvergleich Reduced Motion. Die normalen UI-/Touchabläufe werden separat geprüft. Kumulierte Transferzeiten bis zum Diagnose-Snapshot waren 1379 ms bzw. 372 ms; diese CI-Werte sind keine FPS oder Hardware-Leistungsfreigabe. Die hohen Kosten begründen den sicheren Standardpfad. Physische iPad-GPU-, Akku- und High-Qualitätsabnahme bleiben offen.

## Visuelle Vergleiche und Korrekturen

Die im Gespräch sichtbaren MacShell-Bilder dienten als Kompositionsreferenz. Lokale Originalbilddateien liegen nicht vor; es wird keine Pixelidentität oder erfundene Ähnlichkeitsquote behauptet. Die folgenden Produktbilder sind unveränderte Browseraufnahmen mit identischen synthetischen Inhalten, kontrollierter Uhrzeit und gleichen Viewports.

1. [Runde 1](visual/ipad-ultra-local/round1/desktop.png): neue Komposition; abgeschnittene Hovericons und alte Emoji-Transporte erkannt.
2. [Runde 2](visual/ipad-ultra-local/round2/dock.png): Dockhöhe, echte Standardapps und monochrome Medienmasken korrigiert; Notes-Scrollrand blieb sichtbar problematisch.
3. [Runde 3](visual/ipad-ultra-local/round3/notes.png): negative Sidebarmargins entfernt, Toolbar/Titel/Papier neu geordnet. Anschließend quadratische Widgetproportionen, dichterer Monatsraster und lokale Originalschriften korrigiert.
4. Zusätzliche WebKit-Runde: [ursprünglich scharfer Fallback](visual/ipad-ultra-local/webkit-material-correction/observed-webkit.png) gegen [korrigierten finalen WebKit-Desktop](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/after-webkit/desktop.png). Die Korrektur betrifft Produktcode, nicht Bildnachbearbeitung.

| Ansicht | Vorher, gepinnte Basis | Nachher, geprüfter Produktstand |
|---|---|---|
| Desktop quer | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/before-chromium/desktop.png) | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/after-chromium/desktop.png) |
| Desktop hoch | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/before-chromium/desktop-portrait.png) | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/after-chromium/desktop-portrait.png) |
| Dock | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/before-chromium/dock.png) | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/after-chromium/dock.png) |
| Menüleiste | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/before-chromium/menubar.png) | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/after-chromium/menubar.png) |
| Kontrollzentrum | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/before-chromium/control-center.png) | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/after-chromium/control-center.png) |
| Widgets | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/before-chromium/widgets.png) | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/after-chromium/widgets.png) |
| Island | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/before-chromium/island.png) | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/after-chromium/island.png) |
| MacLock | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/before-chromium/lockscreen.png) | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/after-chromium/lockscreen.png) |
| Finder | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/before-chromium/finder.png) | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/after-chromium/finder.png) |
| Musik | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/before-chromium/music.png) | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/after-chromium/music.png) |
| Notes | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/before-chromium/notes.png) | [Bild](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/after-chromium/notes.png) |

Die Geometrieberichte decken 1024×768, 1180×820, 1366×1024, 834×1194, 820×1180 und 390×600 ab. Touch und zusätzliche DPR2-Material-/Offlineabläufe wurden ausgeführt. Beispiel 1180×820: Fensterhost `(0,28,1180,792)`, Island `(524,0,132,39)`, Dock am unteren Rand ohne Flächenreserve. Die sichtbare Menüzeile misst 28 CSS-Pixel. Die Notes-Titeleingabe liegt vollständig im Inhaltsrechteck; keine horizontale Dokumentüberbreite in den geprüften Ansichten.

## Abschließende Prüfungen

| Prüfung | Chromium | WebKit |
|---|---:|---:|
| Gepinnte Vorherszenen | 7 | 7 |
| Neue visuelle Oberfläche | 20 | 20 |
| Material, GPU-Fallback, Pixel, Context-Lifecycle | 11 | 11 |
| Apps, Touch, Daten, Offline am Rootpfad | 112 | 111 |
| Derselbe Ablauf unter `/Air-OS/` | 112 | 111 |
| Bestandsupdate, Entwurfsschutz, Exportlease, Recovery | 10 | 10 |

Alle 37 ursprünglichen Node-Regressionen erhalten; drei neue Dial-/GPU-/DPR-Materialtests ergeben **40/40**. Gefrorene Playwright-Toolchain `1.62.1`, Audit **0 bekannte Schwachstellen**. Paketprüfung: **120 exakt verglichene Runtimeassets**, CSP, relative Manifest-/Workerpfade, Lizenz- und Sourceangebot, keine Electron-/Node-Runtime im Webpaket.

Frühere CI-Fehler bleiben nachvollziehbar: [erster Material-Idle-Test](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42067511908) und [zeitabhängiger Chromium-Legacy-Handoff](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42070298695). Der Idle-Test wartet jetzt auf eine tatsächlich ruhige Geometrie. Der Update-Test prüft die vollständige Zielgeneration und die echte Workeraktivierung nach Schließen kontrollierter Testseiten. Der Cache-Trace bestätigte bereits korrekt gespeicherte neue HTML-Dateien; der produktive Worker wurde nicht verändert. Musik-SHA-256, Kalender, Timer, gespeicherte Entwürfe und Recovery werden weiterhin streng geprüft.

Vollständige finale Berichte: [evidence.json](visual/ipad-ultra/d6d9395f022957047a074b4a3693a5f4f769b507/evidence.json). Weitere Browserbilder und Diagnoseaufnahmen liegen im [CI-Artefaktbereich](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42088042673#artifacts).

## Build und Git-Checkpoints

CI-Artefakt: `Air-OS-iPad-Ultra-Build-d6d9395f022957047a074b4a3693a5f4f769b507`.
Enthaltene PWA: `Air-OS-iPad-Ultimate-2-d6d9395f022957047a074b4a3693a5f4f769b507.zip` samt SHA-256-Datei; zusätzlich kompatible Recovery-/Read-only-Preflight-Pakete. Worker-Version: `air-os-ipad-v5-1153bfe297fa3e7c57a7`. Artefakte werden 30 Tage aufbewahrt. Es wurde keine Website veröffentlicht.

Das separat lokal erzeugte und geprüfte ZIP liegt unter `dist/` und hat SHA-256 `2afcd84c448035ebe5a4aa7164780768e6e0412e94f32f1ee59e5225a95d1875`. Dieser Hash gilt für das lokale ZIP; der CI-ZIP-Hash steht in dessen Begleitdatei. ZIP-Zeitstempel können sich unterscheiden.

| Checkpoint | Commit |
|---|---|
| Neue Präsentation, Uhrport, GLASS-3 | `1fca54be5340f32b36d631666070d140e76eba8f` |
| Drei visuelle Korrekturrunden / Browserworkflow | `e843949643b75196b32844559bb7e9cc2e632fb7` |
| Lock-Informationsgrenze / beruhigter Materialtest | `2506a6c617bad52023c94d8b5e7287df57a3ec9c` |
| Portabler WebKit-/Chromium-Materialpfad | `501982950d710731999979cd9bfb047354ee7a33` |
| Vollständige GTK-Lizenzauslieferung | `8e944cb1b014f9338ae317048d95b21fa789cb74` |
| Geprüfter Abschlussstand / Updateharness | `d6d9395f022957047a074b4a3693a5f4f769b507` |

Die danach gespeicherten synthetischen Belege und dieser Abschlussbericht ändern den geprüften Produktcode nicht. Der abschließende Dokumentationscommit wird in der Abschlussantwort genannt.

## Verbleibende Grenzen

Physische Safari-/iPadOS-Abnahme, Installation zum Home-Bildschirm, Bildschirmtastatur, Pencil, Akku, Suspend/Resume und echte Hardware-GPU bleiben offen. Automatisiertes Linux-WebKit ersetzt diese Tests nicht. Die Benutzerreferenzen wurden kompositorisch ausgewertet; eine identische Qt-/Compositor-Pixelausgabe wird nicht behauptet.

Qt-spezifische lokale Glaslinsen, vollständige Morph-/Dissolve-Komponenten und native Systemmenüs sind nicht vollständig als Originalkomponenten portiert. Die vorhandenen Browseraktionen und begrenzten Animationen bleiben maßgeblich. Wetter und weitere externe Dienste behalten ihren tatsächlichen Online-/Verfügbarkeitsstatus. Browserstorage kann verloren gehen; vorhandener Export/Backup bleibt wichtig.

Die private Installation ist weiterhin auf ihrem bisherigen Branch/Origin. Eine spätere Umstellung braucht eine gesonderte Datensicherung, Prüfung auf dem eigenen iPad und ausdrückliche Freigabe. Hier wurden weder persönliche Daten migriert noch ein Deployment oder Versionswechsel der Installation ausgelöst.
