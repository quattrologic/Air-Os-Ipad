# iPad Desktop and Dock Correction

Entwicklungsbranch: `feat/air-os-ipad-desktop-dock-correction`. Geprüfte Basis: `f469a6441c8532eeed63126487978a8dc1553061` auf `feat/air-os-ipad-maclock-glass-parity`. Die beiden rot markierten echten iPad-Aufnahmen aus dem Auftrag wurden als Fehlerreferenzen verwendet. Browseraufnahmen sind keine physische iPad-Abnahme.

Abgeschlossen auf Produkt-/Buildcommit `8842fc337ec10e373df94e2bde6c8f39099bc8c0`: [finaler CI-Gate erfolgreich](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42518248706), einschließlich Chromium, WebKit und vier nativen Referenzen; Bilder und PWA-Paket sind im Abschlussabschnitt verlinkt.

## Ursachen und gezielte Korrekturen

| Stelle | Tatsächliche Ursache | Korrektur |
|---|---|---|
| Spotify-Widget | `ipad/widgets.js` las ausschließlich `airIPad.music.snapshot()` | Optionale Quellenprojektion `airPlaybackMetadata.snapshot('spotify')` derselben validierten und gespeicherten History wie MacLock; Event `air-playback-metadata`, kein eigener Store oder Poller |
| Dockform | `bottom:0`, unten offene Rundung, Safe Area als Innenpolster, niedrige separat bemessene Materialfläche | 10px Abstand **außerhalb** der sicheren unteren Grenze; Radius 20 an allen vier Ecken, 8px vertikale und 10px horizontale Innenabstände; Materialfläche und Iconzeile teilen dieselbe gemessene Größe |
| Magnifikation | Cosinus vergrößerte Icons/Container, aber nicht die niedrige Glasscheibe | Bestehender MacShell-Cosinus und Spring unverändert; gemeinsamer Körper wächst mit dem höchsten Icon nach oben; gleiche Baseline, keine weitere Hoverbewegung |
| Statisches Dockglas | Gemeinsamer Renderer ersetzte die Szene durch `var(--system-wallpaper)` | Dockmaterial nutzt ausschließlich WebKit-/CSS-`backdrop-filter` auf der tatsächlich darunterliegenden Air-OS-Komposition; positive Materialebene unter den Icons, keine isolierende oder filternde Elternfläche |
| Breiter oberer Blur | Wallpaper-Kopien nicht nur hinter der Menüleiste, sondern auch auf fokussierten Titelleisten | Diese drei Desktopflächen sind aus dem Wallpaper-/Shader-Tile-Selektor entfernt; keine Wallpaper-Pseudoelemente mehr auf Titel-/Menüleiste; tatsächlicher Blur nur innerhalb der 24px-Menüleiste, MacTahoe-Titelleiste bleibt scharf |
| Notch-Abstand | `top:env(safe-area-inset-top)` verschob den bereits eigenständigen schwarzen Körper | Ausschließlich äußere Anschlussregel `body > #pro-notch { top:var(--pad-offset,0px) }`; alle vier eingefrorenen Originaldateien der Notch bleiben bytegleich |
| Appfläche | Überlagerte alte 28-/24px-Angaben, ungenutzter VisualViewport-Offset; Wallpaper-Titelleiste wirkt wie ungenutzter Platz | Gemeinsame Höhe 24px; nutzbare Fläche aus VisualViewport-Höhe/-Breite/-Offsets, Safe Areas genau einmal; kein zusätzlicher eigener unterer Streifen |
| Erreichbarkeit | Das schwebende Dock kann letzte Einstellungseinträge überlagern | Scrollbarer Endabstand aus tatsächlicher Dockhöhe; letzte Bedienaktion wird über das Dock gescrollt und per Hit-Test geprüft |
| Tastatur | Materialelement war das erste Kind der Docknavigation | Home/End/Pfeile navigieren ausschließlich über vorhandene `.pad-dock-app`-Aktionen |

## Spotify und Datenschutz

Das Desktopwidget ist jetzt ausschließlich eine lesende Spotify-Ansicht. Die lokale Musik-App samt Audioplayer, Dateien und Lockscreen-Steuerung bleibt vorhanden. Die normale parameterlose Historyprojektion behält ihre bisherige Quellpriorisierung; die gezielte Spotifyprojektion ändert keine globale Wiedergabe und erzeugt keine zweite Quelle.

Aktive, pausierte, gespeicherte und offline bekannte Titel verwenden dieselben validierten Metadaten und den bereits vorhandenen begrenzten Covercache. Ohne Anmeldung oder Daten erscheint der Verbindungszustand mit einer Aktion zu den bestehenden Einstellungen. Es gibt keine vorgetäuschten Play-/Skip-Aktionen. Der echte Link führt zu `open.spotify.com/track/<id>` und öffnet getrennt mit `noopener noreferrer`. OAuth-PKCE, Scopes, Tokenhandling und Netzwerkadapter in `ipad/spotify.js` bleiben bytegleich.

Die Browserprüfungen verwenden explizit synthetische PKCE-Anmeldungen und gemockte offizielle Endpunkte, lizenzierte vorhandene Coverfotos und frische Testprofile. Die sichtbaren Titel heißen deshalb **Spotify-Testtitel**, ihre Künstlerangabe **Autorisierte API-Testdaten**. Es wurde kein Nutzerkonto verbunden. Echte Spotify-Kontoabnahme bleibt offen.

## Material und Schutzgrenzen

Vorhandene Quellen-/Lizenznachweise bleiben erhalten: [MacDock/MacLock-Port](AIR_OS_IPAD_LIQUID_GLASS_MACLOCK.md) und [Material-Parity](AIR_OS_IPAD_MACLOCK_GLASS_PARITY.md). Es wurden für diese Korrektur keine neuen fremden Originaldateien übernommen.

Das Dock erhält einen ehrlichen nativen Live-Backdrop, keine Behauptung von Shader-Refraktion der vollständigen Fensterszene. Es erfasst weder native iPad-Fenster noch Bildschirm-/private Systeminhalte. Die Farbprüfung belegt den tatsächlichen Untergrundbezug, keine pixelidentische Blur-/Refraktionswirkung aller Browserkompositoren oder eine physische Safari-GPU-Abnahme.

Der vorhandene Glass-Renderer bleibt Eigentümer aller übrigen geeigneten Materialflächen; MacLock-SDF, Snell-Modell, nativer QtQuick-Vergleich und dynamischer Coverhintergrund bleiben erhalten. Reduzierte Transparenz schaltet den Live-Backdrop wie bisher auf ein solides Material; reduzierte Bewegung schaltet die Dockvergrößerung ab.

Die lokale Vorher-Messung ohne Safe Area zeigt bereits 24px als wirksame Menüleistenhöhe und Arbeitsflächenbeginn; eine aktive zusätzliche 4px-Lücke wird deshalb ausdrücklich nicht behauptet. Die alte 28px-Angabe wurde konsolidiert. Der breite Streifen ist in diesen Aufnahmen die fehlerhafte Wallpaper-Titelleiste.

Die native iPadOS-Statusleiste wird weder versteckt noch kontrolliert. Der Notchkörper sitzt an der Oberkante des vom Browser tatsächlich bereitgestellten visuellen Viewports; die Menüleiste und die Bedienelemente respektieren die Safe Area. Browserautomation liefert dafür normale WebKit-Viewports und zusätzlich eine ausdrücklich **synthetische CSS-Safe-Area-/VisualViewport-Fixture**, keine Hardwarebestätigung.

Geschützt und nicht geändert: alle vier Pro-Notch-Quelldateien, `ipad/maclock.js`, originale Shader/Geometrie, `ipad/spotify.js`, Registry mit 25 Apps, Musikengine, Datenbankschema, Backup, Yosemite-PNG, Service-Worker-Template und private Windows-/Tailscale-Skripte. Keine Datenmigration, keine Nutzerdaten, kein Deployment, kein Merge und kein Zugriff auf die private Installation.

## Visuelle Kontrolle

[Ausgangsaufnahmen](visual/ipad-desktop-dock-correction/before/) sind unveränderte Vollbilder bei 1180×820 und DPR 2. [Erste Korrekturrunde](visual/ipad-desktop-dock-correction/round-1/) zeigte den bereits schwebenden Dockkörper; der weiterhin sichtbare Titel-Wallpaperstreifen wurde danach entfernt. Die nachfolgenden tatsächlichen Browserbilder dokumentieren das klare App-Chrome, Spotifyzustände, schwebendes Dock, gemeinsame maximale Magnifikation und Hochformat.

Die vorhandenen Apps verwenden überwiegend helles App-Chrome. Der zusätzliche dunkle Kompositionstest nutzt daher ausdrücklich eine Test-Fixture: dieselbe echte Air-Arcade-Fensterinstanz mit ausschließlich im Browsertest ersetzter dunkler Grundfarbe. Es wird kein ausgelieferter Dunkelmodus erfunden.

Pixelmessungen lesen nur Bereiche der unveränderten **Vollbilder**; es werden keine Ausschnitte, Collagen oder nachträglich veränderte Ergebnisbilder erzeugt. Die unterschiedliche Belichtung der echten iPad-Referenz wird nicht als präziser Farbmessvergleich ausgegeben.

## Reproduzierbare Prüfung und Build

```
node --test --test-reporter=tap tests/*.test.cjs
node scripts/package-ipad-desktop-dock.cjs
node scripts/check-ipad-parity-package.cjs
node scripts/test-ipad-desktop-dock.cjs
```

Neue tatsächliche Browserprüfungen umfassen Spotify-Verbindung/Wechsel/Pause/Neustart, Live-Materialpixel, Inhalt innerhalb der Dockgeometrie, starke Magnifikation, Hold/Scrub/Pointercancel, Touchstart, schmale Docknavigation, Tastatur, Safe Area/VisualViewport, sechs Viewports und Offline-Neustart. Vollständige bestehende Audio-/Legacy-IndexedDB-/Backup-/App-/Notch-/Updateprüfungen laufen zusätzlich. Der bisherige Widget-Transporttest wurde auf die neue ausdrücklich lesende Oberfläche umgestellt; echte lokale Play-/Skip-Aktionen werden weiterhin geprüft, nun über dieselben vorhandenen Bedienelemente in der Musik-App. Es wurden keine entsprechenden Audioassertions entfernt.

Workflow: [test-ipad-desktop-dock.yml](../.github/workflows/test-ipad-desktop-dock.yml), ausschließlich der separate Korrekturbranch. Chromium und WebKit, jeweils DPR 1 und 2, inklusive kontrollierter nativer MacLock-Komponentenreferenz und Lizenz-/CSP-/Paketgate. Der Workflow enthält **keinen Deploymentjob**. Er bewahrt ausschließlich synthetische Evidenz auf diesem Entwicklungsbranch.

Lokaler Zwischenstand: 60/60 Modelltests und 39/39 neue Chromium-DPR-2-Browserfälle erfolgreich. Vollständiger CI-/Buildcommit und endgültige Bildverweise stehen im finalen Abschlussabschnitt. Physische iPad-/Standalone-/Touchhardware-, Akku- und reale Spotify-Prüfung bleiben offen.

## Erster CI-Lauf und WebKit-Mockkorrektur

[CI 42515171332](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42515171332) auf `aadc559bff87036e95041a1e2ccee0acb62fc40c`: Chromium besteht den kompletten Gate, einschließlich beider neuen DPR-Prüfungen. WebKit besteht die bisherigen MacLock-/Dock-/Spotify-/Cover-/Materialpfade, bricht aber nach drei Assertions im **neuen** Widgettest beim gemockten Tokenaustausch ab; keine neue WebKit-Dockabnahme oder native CI-Referenz wird für diesen Lauf behauptet. [Unveränderter Rohreport](visual/ipad-desktop-dock-correction/aadc559bff87036e95041a1e2ccee0acb62fc40c/evidence.json), gesichert in `e81c6da67901922cf9d3ad435e30aa234e70dba8`.

Die bewährte Spotify-Mockprüfung blockiert Service Worker; der neue kombinierte OAuth-/Offline-Test hatte sie gleichzeitig aktiviert. Die Testkorrektur verwendet dieselbe SW-freie Mockphase, schließt anschließend den Browserkontext und öffnet **dasselbe gespeicherte Profil** mit echtem Service Worker für den Offline-Neustart. Keine Datenlöschung, keine gelockerte Assertion, keine Änderung an OAuth oder am Produktnetzwerkadapter. Die gesamte CI-Matrix wird auf dem gesicherten Korrekturcommit erneut ausgeführt.

## Zweiter CI-Lauf und tatsächlicher Offline-Hostausfall

[CI 42516301486](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42516301486) auf `86dc35c89af41e14c0bfdcd4ad4698650017686f`: Chromium besteht erneut vollständig. WebKit besteht im neuen Test 33 Assertions einschließlich der Bild-/Spotify-/Dock-/Pointerprüfungen, bricht dann beim über Playwright emulierten Offline-Reload mit `WebKit encountered an internal error` ab. Dies korrigiert auch die vorläufige Engine-Zuordnung aus der laufenden Jobanzeige: Die verbindlichen Ergebnisse sind die enginebeschrifteten Rohreports. [Unveränderte Evidenz](visual/ipad-desktop-dock-correction/86dc35c89af41e14c0bfdcd4ad4698650017686f/evidence.json), gesichert in `65b061d63fd2e1571f62bca9c2ff245872be2a2f`.

Der neue Test übernimmt dafür den bewährten tatsächlichen Hostausfall aus `test-ipad-parity.cjs`: Nach Aufbau des echten App-Shell-Caches wird der lokale HTTP-Server vollständig beendet; Offline-Neuladen und ein weiterer **kalter Browserprozessstart** verwenden danach dasselbe Profil ohne erreichbaren Host. Der Offlinezustand wird nicht durch einen Ersatzserver oder gemockte App-Shell kaschiert. Die Safe-Area-Fixture läuft vor dem Hostausfall. Spotify-Assertions bleiben erhalten, einschließlich cached Cover, letzter Titel und fehlender Livebehauptung. Produkt, Service-Worker-Template, Redirect-Fix und OAuth bleiben unverändert.

## Untere Safe Area: Hintergrund und Touchbereich getrennt

Die abschließende Safe-Area-Kontrolle trennt die zeichnungsfähige Fensterfläche von sicheren Bedienabständen: Maximierte Fenster reichen bis zum unteren zugewiesenen PWA-Viewport, statt einen zusätzlichen Yosemite-Streifen in Höhe des unteren Insets zu erzeugen. Der Dockabstand bleibt 10px **über** dem unteren Safe-Area-Inset; der scrollbare Endabstand enthält dieses Inset für Bedienelemente. Die synthetische 820px-Ansicht mit 20px unterem Inset erwartet deshalb einen Fensterhintergrund bis 820px, nicht nur bis 800px. Die Keyboard-Fixture prüft entsprechend das Ende bei 518px und den Dockabschluss bei 488px. Keine native iPadOS-Leiste wird übermalt oder versteckt.

## Finaler verifizierter Abschluss

Produkt-/Buildcommit: `8842fc337ec10e373df94e2bde6c8f39099bc8c0`. [Vollständiger erfolgreicher CI-Lauf](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42518248706). Evidenzcommit: `dae6ca63b14077bde29f434a665f72cd43199ed6`; [unveränderte Rohreports](visual/ipad-desktop-dock-correction/8842fc337ec10e373df94e2bde6c8f39099bc8c0/evidence.json).

60/60 Node-Modelltests pro Browserjob, **38 erfolgreiche Browser-/Referenzreports und 1.430 Assertions**. Die neue Korrekturmatrix besteht mit je 40/40 Fällen in Chromium und WebKit bei DPR 1 und 2. Die bestehende gesamte App-, Legacy-Daten-, Backup-, Notch-, Offline- und Updateprüfung bleibt erfolgreich. Der Testprofilwechsel in der OAuth-/Offline-Fixture ist damit auch in WebKit tatsächlich verifiziert.

### Gemessene Darstellung

Bei 1180×820 CSS-Pixeln hat das ruhende Dock 731×72px und endet 10px vor der unteren nutzbaren Grenze. Bei maximalem Cosinuspeak wächst derselbe Körper auf rund 831×110px; alle Icons bleiben mit ihrer gemeinsamen Baseline innerhalb der Materialfläche. Der aktive Peak bleibt 1,8. Die tatsächlich gemessenen Fraktionen und Viewportgeometrien stehen pro Engine/DPR in den Rohreports.

Die Vorher-Aufnahme enthält eine aktive Zeigervergrößerung: 103px hoher Dockcontainer, aber nur 58px hohe Materialfläche bis zum unteren Rand. Die erste Korrekturrunde zeigt bereits identische Höhe von Körper und Oberfläche; die nächste Runde entfernt die verbliebene unscharfe Wallpaper-Titelleiste. Die Messungen werden nicht mit einem angeblich identischen ruhenden Vorherzustand verwechselt.

Die folgenden Mittelwerte sind RGB-Kanalmittel aus begrenzten Messbereichen der unveränderten Vollbilder, keine zugeschnittenen Ergebnisbilder, keine FPS und keine Hardwaremessungen. Die dunkle Grundfarbe ist die ausdrücklich gekennzeichnete Test-Fixture innerhalb eines vorhandenen Appfensters.

| Engine / DPR | Yosemite | Helle Einstellungen | Kontrollierte dunkle Fläche |
|---|---:|---:|---:|
| chromium / 1 | 45.49 | 254.59 | 50.00 |
| chromium / 2 | 46.24 | 254.77 | 50.33 |
| webkit / 1 | 46.89 | 255.00 | 49.33 |
| webkit / 2 | 46.85 | 255.00 | 49.33 |

Die nativen QtQuick/OpenGL-Komponentenvergleiche bestehen in allen vier Browser-/DPR-Eingabetexturen weiterhin. Originales `Glass.qml` und Fragment bleiben unverändert; Materialregion, Rand/Inneres/Schatten und tatsächliche Shaderkompilierung sind in den vier `native-*`-Reports belegt. Dies ist keine vollständige native MacShell-Installation und keine iPad-Hardware-GPU-Abnahme.

### Tatsächliche Vollbildaufnahmen

Die sieben finalen Bilder stammen aus **WebKit, 1180×820, DPR 2**, jeweils vollständig mit 2360×1640 Bildpixeln. Keine Nachbearbeitung, kein Zuschnitt. Spotify ist durch die ausdrücklich benannten autorisierten API-Testdaten dargestellt; ein echtes Nutzerkonto wurde nicht verwendet.

1. [Desktop mit Spotify-Testdaten](visual/ipad-desktop-dock-correction/8842fc337ec10e373df94e2bde6c8f39099bc8c0/desktop-dock-webkit-dpr2/desktop-spotify.png).
2. [Desktop mit schwebendem Dock](visual/ipad-desktop-dock-correction/8842fc337ec10e373df94e2bde6c8f39099bc8c0/desktop-dock-webkit-dpr2/desktop-floating-dock.png).
3. [Dock über maximierten hellen Einstellungen](visual/ipad-desktop-dock-correction/8842fc337ec10e373df94e2bde6c8f39099bc8c0/desktop-dock-webkit-dpr2/dock-settings.png).
4. [Dock über Yosemite](visual/ipad-desktop-dock-correction/8842fc337ec10e373df94e2bde6c8f39099bc8c0/desktop-dock-webkit-dpr2/dock-yosemite.png).
5. [Dock mit maximaler Magnifikation](visual/ipad-desktop-dock-correction/8842fc337ec10e373df94e2bde6c8f39099bc8c0/desktop-dock-webkit-dpr2/dock-maximum.png).
6. [Einstellungen mit korrigierter Oberkante](visual/ipad-desktop-dock-correction/8842fc337ec10e373df94e2bde6c8f39099bc8c0/desktop-dock-webkit-dpr2/settings-full-workarea.png).
7. [Desktop mit bündiger Pro Notch](visual/ipad-desktop-dock-correction/8842fc337ec10e373df94e2bde6c8f39099bc8c0/desktop-dock-webkit-dpr2/desktop-flush-notch.png).

Zusätzliche Vollbilder und Reports enthalten unverbundene/pausierte/neu gestartete Offline-Spotifyzustände, Hochformat und die gekennzeichnete dunkle Material-Fixture. Die finale Matrix prüft sechs Viewports, Touch-Hold/Scrub/Abbruch, normale Touchstarts, horizontales Scrollen, Tastaturnavigation, reduzierte Bewegung/Transparenz und die synthetische Safe-Area-/Bildschirmtastatur-Fixture.

### Build und Integrität

[PWA-Artefakt](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42518248706#artifacts): `Air-OS-iPad-Desktop-Dock-Build-8842fc337ec10e373df94e2bde6c8f39099bc8c0`, darin `Air-OS-iPad-Desktop-Dock-Correction-8842fc337ec10e373df94e2bde6c8f39099bc8c0.zip` mit zugehöriger SHA-256-Datei sowie kompatibler Recovery und Read-only-Preflight. 141 exakt geprüfte Runtimeassets, CSP, Scope, Safari-Redirect-Fix, vollständiges Source-/Lizenzpaket, Ausschluss nativer Runtime und Testtool-Audit sind erfolgreich geprüft. Aufbewahrung der Actions-Artefakte: 30 Tage.

[18 geschützte Dateiidentitäten](visual/ipad-desktop-dock-correction/protected-files.json) wurden gegen Basis und finalen Produktcommit geprüft. Insbesondere bleiben alle vier Pro-Notch-Dateien bytegleich; nur die getrennte äußere CSS-Anschlussregel verändert ihre Position. Lockscreencontroller, originale Materialmodelle/Shader, OAuth, Apps/Daten/Backups, Yosemite und private Serve-Skripte bleiben erhalten.

Physische iPad-/Standalone-/Safari-/Pencil-/Trackpadhardware-, Akku- und echte Spotify-Kontoabnahme bleiben offen. Browserautomation und synthetische Safe-Area-Werte ersetzen diese Abnahme nicht. Es wurden keine fremden nativen Fenster erfasst, keine persönlichen Daten berührt und keine Daten migriert.

Der Korrekturbranch und die überprüften Nachweise sind gesichert. Kein Merge in einen anderen Branch, kein Deployment, keine Änderung der privaten Tailscale-URL oder Installation.
