# Air-OS iPad — Liquid Glass, MacDock und MacLock

Arbeitsbranch `feat/air-os-ipad-liquid-glass-maclock`; Ausgangsstand `732bb798bfe2bc9ed614610eaeee5d60296ad3e6` enthält Produkt `5b09e4d93e08bb60304f32cad40676c477cb7a9e`. Keine Installation, Veröffentlichung oder Zusammenführung. Private Tailscale-Version bleibt unverändert.

Die nachfolgende gezielte Korrektur der sechs rot markierten Stellen ist im [Bericht zur visuellen Schlusskorrektur](AIR_OS_IPAD_FINAL_VISUAL_POLISH.md) separat nachgewiesen.

Aktueller Folgeauftrag: [kleinere MacShell-Uhr und freie Entsperraktion](AIR_OS_IPAD_MACLOCK_CLOCK_UNLOCK.md), als Ersatz für die zwischenzeitlich größere Uhr und die Öffnen-Glaspille.

Darauf aufbauend: [Originales MacLock-Glas und adaptive Cover-Szene](AIR_OS_IPAD_MACLOCK_ADAPTIVE_GLASS.md), mit erhaltener kleiner Uhr und Textentsperrung.

## Implementierung und Herkunft

MacShell MIT, Referenzcommit `1bdb51870b621100fd2709f66c8f8e00ab17b9c4`. [Maschinenlesbare Pfade und SHA-256](source-ports/liquid-maclock.json), vollständiger Copyright-/Lizenztext unter `ipad/licenses/MacShell-MacLock-MIT.txt`, Attribution in `ipad/NOTICE` und mitgeliefertem Corresponding Source. Bestehende MacTahoe-/AGPL-/Shaderlizenzen bleiben erhalten.

| Original | Ausführbarer Port / Anpassung | Umfang |
|---|---|---|
| `MacShell/MacDock.qml` | `vendor/macshell/shell7.js` → `dock-material.js` | Originaler c0-/Cosinus-Kern, Radius 2,6 Iconabstände, gekoppelte Zellbreiten und Wachstum nach oben. Vorhandener Spring-Integrator bleibt; Stärke auf 1,8 abgestimmt. |
| `MacLock/Glass.qml`, `MacShell/GlassSlab.qml` | `vendor/glass/geometry.js` → bestehender Renderer | MacLock-Material: Dicke38,4, Dispersion0,078, Tintmix0,176, Rim0,5, Grain0,006, Magnify0,08. Gemeinsame Shader, Texturen, Preblur und Ressourcenverwaltung. |
| `MacShell/MacBar.qml` | `liquid-maclock.css` und Renderer-Menüleistenprofil | Browseranpassung: 24px, klarer Vordergrund, lokaler3px-Fallback statt globalem Blur. |
| `MacLock/LockScreen.qml` | `maclock.js`, vorhandene Lock-DOM, `liquid-maclock.css`, `core/visual-motion.js` | Hierarchie Datum/Uhr, quadratisches Cover, separate Medienkarte, lokale Hinweise, vorhandene lokale Entsperrung; responsive Browserberechnung. 650ms-Eintritt mit OutQuint-Näherung im bestehenden Scheduler. |

Keine Qt-/Quickshell-, PAM-, MPRIS- oder native Scene-Capture-Übernahme. Keine neue Render-, Audio-, Fenster- oder Dockengine. Kein Kopieren der nativen Fenstertexturen. Shader refraktieren ausschließlich das erlaubte gebündelte Wallpaper; CSS-Fallback ist keine Snell-Refraktion.

## Pro Notch und Daten

Alle vier Dateien unter `ipad/notch/` bleiben byte-identisch zum Ausgangscommit; Node-Regression prüft ihre SHA-256. Keine neuen Styles adressieren die Notch. Alle25 App-Einträge, Yosemite-Wallpaper, Store-Schema2, vorhandene Musikblobs und Kalenderdaten bleiben erhalten.

Der obere Nebel stammte vom globalen `body:has(#lockscreen...) .wallpaper`-Filter. Desktop-Wallpaper ist nun ausdrücklich scharf; Lock-Blur18px sitzt auf einem ausschließlich lokalen Hintergrundlayer. Vordergrund und Notch bleiben scharf. Kontrollzentrum verwendet einzelne MacShell-artige Slabs mit gemeinsamem Wallpaper-Cache, keine gestapelten globalen Blurflächen.

## Dockbedienung

Maus/Trackpad: kontinuierlicher Cosinus-Verlauf, keine unabhängigen CSS-Hover-Scales. Zentrum1,80, direkter Nachbar1,54, zweiter Nachbar1,10; reale Bildgrößen und Zellabstände wachsen gemeinsam. Hintergrundkörper58px bei48px Basisicons, ohne übergroße milchige Fläche. Bewegung endet, sobald die Feder ruht.

Touch/Pencil-Pointer: kurzes Tippen nutzt vorhandene Appaktion. Halten280ms aktiviert die Welle, horizontales Führen verschiebt Auswahl, Loslassen startet höchstens eine App. Vorzeitiges Bewegen scrollt ein zu breites Dock; Pointercancel öffnet nichts. Tastatur-Kontextmenü über Umschalt+F10/ContextMenu, Maus-Kontextmenü und native Desktop-Umordnung bleiben erhalten. Touch-Longpress für die Welle ersetzt den konkurrierenden alten Longpress-Kontextmenü-Timer. Auf schmalen Ansichten bleibt horizontales Scrollen nötig; kein Anspruch auf native macOS-Docksteuerung.

## Musik und Spotify

`core/playback-history.js` und `playback-history.js` sind ausschließlich Metadatenprojektionen über der vorhandenen Musikengine. Neue kleine Einstellung `last-played-metadata-v1` im bestehenden Settings-Store, keine Schemaänderung. Höchstens ein letzter Datensatz je Quelle; echte Wiedergabezeitstempel entscheiden, unbekannte historische Zeiten bleiben unbekannt. Lokales Cover wird begrenzt gespeichert; Pause/Neustart behalten „Zuletzt gehört“. Sperren pausiert die vorhandene Wiedergabe nicht mehr. Löschen/Abwählen in Einstellungen entfernt nur Metadaten, niemals Musikdateien.

Optionales `spotify.js`: öffentliche Client-ID erst durch Nutzer eintragen, Zustimmung ankreuzen und ausdrücklich verbinden. Authorization Code PKCE S256 mit Einmal-State,10min-Verfall und exakt registrierter HTTPS-Redirect-URI; kein Client-Secret. Scopes `user-read-playback-state`, `user-read-currently-playing`, `user-read-recently-played`. Access-/Refresh-Token ausschließlich im Arbeitsspeicher; PKCE-Versuch kurzzeitig sessionStorage, nach Callback gelöscht. Nach Prozessneustart erneut anmelden. Callback-Code/State werden aus URL entfernt. OAuth-Antworten niemals SW-App-Shell; externe Antworten cache:no-store. Keine Spotify-Steuerung: Buttons deaktiviert, vorhandener externer Spotify-Titellink.

Abfragen nur nach Anmeldung: aktuell → currently-playing → recently-played. Sichtbare aktive Wiedergabe höchstens alle30s, Pause im Hintergrund/lokaler Wiedergabe, Retry-After bei429, verständliche401/403. Trennen bricht laufende Anfragen ab. Kein systemweiter Zugriff auf andere iPad-Player. Keine Verbindung zu einem Nutzerkonto in dieser Entwicklung.

Offizielles Spotify TypeScript SDK-README bestätigt browserseitiges PKCE (öffentliches Originalrepository, kein SDK eingebettet). `developer.spotify.com` ist in dieser Umgebung nicht erreichbar; aktuelle Dashboard-/Tarif-/Development-Mode-/Premium-/Allowlist-Bedingungen konnten nicht vollständig live verifiziert werden. Reale Konto-/API-Freigabe ist OFFEN und wird nicht als bestanden ausgegeben. Spotify-Cover nur erlaubte CDN-URL, keine Offline-Download-Zusage; vorhandene lokale Air-OS-Cover funktionieren offline. Keine externe Anmeldung, keine Zugangsdaten im Bundle.

## Referenzen und visuelle Korrekturen

Nutzervideo tatsächlich empfangen und vollständig in287 Frames dekodiert: [Analyse einschließlich Original-PTS und Frame-Hashes](reference/macdock/video-analysis.json). Ausrichtung846×1300 nach Rotation, kodiert1300×846, Laufzeit6,955s. Fünf unbeschnittene Schlüsselbilder im selben Verzeichnis. Gefilmter Laptop mit wechselnder Perspektive: daraus keine exakten nativen CSS-Skalen oder60fps-Timingmessungen behauptet. Übernommen wurden sichtbarer gekoppelter Verlauf, Bodenanker, lokale Welle und klarer flacher Glaskörper; Zahlen stammen aus tatsächlichen Air-OS-DOM-Messungen und Quellkernel.

MacLock-Nutzerbild im Chat sichtbar:1688×938-Komposition mit Cover etwa296×296 ab306px, Player ab622px, Uhr oben mittig, Hinweise rechts. Original-JPEG-Bytes fehlen; kein erfundener Pixel-MAE. Browser nutzt dasselbe Seitenverhältnis, eigenes klar gekennzeichnetes Testcover und das unveränderte Yosemite-Wallpaper. Abweichungen: vorhandene gebündelte OpenRunde-Fonts mit browserabhängigem Rendering statt Qt-Schriftrasterung, lokaler Öffnen-Button statt vorgetäuschtem Passwort/PAM, Status/Herkunft in Künstlerzeile,44px-Touchziele, responsive Hinweise.

Drei echte Browserdurchläufe mit vollständigen Screenshots:

1. Runde1: neuer Hintergrund-/Dock-/Lock-Aufbau. Sichtbar: Hinweise kollidieren im Hochformat mit Uhr; Kontrollzentrum zu transparent.
2. Runde2: Hinweise unter Uhr verschoben, einzelne CC-Slabs mit lokalem Material und höherem Kontrast,44px-Medientasten. Tatsächliche Neuaufnahmen kontrolliert.
3. Runde3: überholte äußere CC-Kartenkontur entfernt, Beschriftungen präzisiert, Spotify-Settings ohne Safari-Eingabezoom; vorhandener Scheduler übernimmt MacLock-Eintritt. Erneute vollständige Aufnahmen und Geometrieprüfungen.

Vorheraufnahmen werden aus isoliertem Archiv des gepinnten Ausgangsstands erzeugt, mit identischem Viewport und denselben synthetischen Daten. Kein Checkout der privaten Version, keine Bildnachbearbeitung. Endgalerie ausschließlich vollständige Browseransichten, ohne Ausschnitte oder Collagen.

## Prüffortschritt — Checkpoint1

Lokal bisher:52/52 Node-Tests; neuer Chromium-GUI-Lauf23/23 mit12 echten Vollansichten; Spotify-Endpunkt-/PKCE-Mocks16/16. Kein reales Spotifykonto. Paketprüfung140 exakte Runtimeassets einschließlich Lizenzen bestanden. Vollständige ältere Browserregressionen, DPR2 und tatsächliches WebKit laufen im separaten Workflow `test-ipad-liquid-maclock.yml`; Endergebnisse werden nachgetragen.

Neue GUI-Prüfungen: Header24px, Notch165×24, echter Cosinuspeak und Nichtüberlappung, Idle-Paint-Stopp, Touch-Halten/Cancel/Einzelstart, echte Musiksteuerung beim Sperren, reale lokale Hinweise, getrennte Vorder-/Hintergrundfilter,25Apps/Schema2, Viewports1688×938/834×1194/1180×820/1024×768/1366×1024/820×1180/390×600, Offline-Neustart mit letztem Titel/Cover, Metadatenlöschen ohne Musiklöschung.

## Offene Grenzen

Physisches iPad/Safari, Trackpad-/Pencil-Hardware, Akku, Hardware-GPU und reale Tailscale-Adresse nicht getestet. Automatisiertes WebKit ersetzt kein iPad. GPU-Softwareguard bleibt aktiv; isolierte Shaderdiagnose ist keine Hardwarefreigabe. Kein Zugriff auf fremde Fenster, keine privaten Daten, keine Installation und kein Deployment. Safari-/Spotify-Autoplay und Hintergrundbeschränkungen gelten weiterhin. Kein exakt identisches Verhalten zur nativen MacShell-/macOS-Oberfläche versprochen.

### Checkpoint2 — Regression der Dockgrenzen

Der ältere37-Fälle-Systemlauf fand eine reale Regression: Überlappungsprüfung war auf den neuen flachen Glaskörper begrenzt, obwohl Icons darüber hinausreichen. Korrigiert auf die vollständige bestehende Dock-DOM-Geometrie; derselbe unveränderte Test besteht anschließend37/37. Pointerup/-cancel werden zusätzlich am Fenster abgefangen, damit ein außerhalb der Dockfläche endender früher Touch keine gehaltene Geste zurücklässt. Bestehende71/71 Notch- und11/11 Material-/Lifecycle-Prüfungen bestehen lokal. CI wird für diesen korrigierten Stand erneut ausgeführt.

### Maus-/Trackpad-Abnahme und unveränderte Unterkante

Zusätzlicher DPR2-Lauf mit `hasTouch:false` prüft den echten CSS-Fine-Pointer-Modus. Ein früherer separater3px-Hoverlift ist entfernt: ausschließlich der gekoppelte Cosinus verändert Größe/Abstände, alle Iconunterkanten liegen innerhalb1px auf derselben Linie. Dieser Lauf besteht24/24. Standardlauf bleibt touchfähig; synthetische Pointerereignisse prüfen Hold/Release/Cancel zusätzlich. Keine Behauptung eines Hardware-Trackpad-Tests.

[Unveränderte Vollaufnahmen und Reports der drei Korrekturrunden](visual/ipad-liquid-maclock/correction-rounds/) sind gesichert; [tatsächlich berechnete Pixeländerungen](visual/ipad-liquid-maclock/correction-rounds/pixel-differences.json) beziehen sich auf identische1688×938-Ansichten. Diese Zahlen messen Veränderungen zwischen Browserständen, keine Qualität oder Übereinstimmung mit einem nativen Video.


## Optionale Spotify-Einrichtung nach eigener Freigabe

1. Im offiziellen Spotify Developer Dashboard eine eigene zulässige Web-API-App einrichten; aktuelle Kontobedingungen, Development-Mode-Allowlist und gegebenenfalls erforderliche Tarifvoraussetzungen dort prüfen. Keine API-Freigabe wird durch Air-OS erteilt.
2. Die in Air-OS-Einstellungen angezeigte Redirect-URI exakt beim Spotify-Projekt registrieren (produktive private HTTPS-Adresse einschließlich Pfad/Slash). Öffentliche Client-ID in Air-OS eintragen; kein Secret eingeben oder veröffentlichen.
3. Lesezustimmung aktivieren und „Spotify verbinden“ drücken. Erst dann führt Air-OS zum echten Spotify-OAuth-Dialog. Keine Anmeldung wurde durch diese Entwicklung vorgenommen.
4. Nach Rückkehr erscheinen ausschließlich tatsächlich gelieferte Metadaten.403 bedeutet fehlende Freigabe statt vorgetäuschter Verbindung. Steuerung in Spotify; Air-OS ist nur lesend. Nach App-Neustart neu verbinden.
5. „Spotify trennen“ beendet Abfragen und verwirft In-Memory-Tokens; „Gespeicherte Musik-Metadaten löschen“ löscht zusätzlich lokale letzte Titelinformationen und deaktiviert weiteres Merken. Originalmusik bleibt erhalten.

## Abnahmegeometrie

Chromium DPR2,1688×938, isolierte synthetische Bibliothek:

| Element | Tatsächliches DOMRect (CSS-px) | Bezug |
|---|---|---|
| Schwarze Pro Notch | x761,5/y0/165×24 | unverändert, Safe-Area im Test0 |
| Datum/Uhr-Gruppe | y67,53/h105,77 | Vorlage Datum ungefähr y69 |
| Albumcover | x695,80/y305,78/296,41×296,41 | Vorlage ungefähr296×296 ab306 |
| Medienpanel | x695,80/y621,88/296,41×108,80 | Vorlage ungefähr296×109 ab622 |
| Profilgruppe | y747,92/h146 |44px lokaler Öffnen-Button statt Passwortfeld |
| Hinweise | x1410,55/y31,89/w265,45 | Vorlage ungefährx1410/y32/w266 |

Originalkoordinaten sind aus dem sichtbaren Inlinebild abgelesene Näherungen, keine automatisierte JPEG-Pixelmessung. Andere Testviewports prüfen Kollisionen und Erreichbarkeit. Video-PTS haben tatsächlich0,005/0,01667/0,03333/0,05s-Schritte; die nominale60fps-Angabe ist daher keine konstante Aufnahmekadenz. Kein Timingfit aus wechselnder Kameraperspektive behauptet.

## Gezielte MacLock-Shaderdiagnose

[Reproduzierbarer zusätzlicher Browserlauf](validation/test-maclock-material.cjs), nur isolierter localhost mit ausdrücklich gesetzter vorhandener Diagnosepolicy, ohne GPU-Sicherheitsflags.6/6 bestanden. Kein echter Spotifyaccount und keine Audioengine: gekennzeichnete synthetische Metadaten aktivieren ausschließlich die bestehende Lockkarte.

[Report und unveränderte vollständige Diagnoseaufnahmen](visual/ipad-liquid-maclock/isolated-lock-material/): Originale MacLock-Uniforms erreichen das tatsächlich ausgeführte Material. Umschalten der Refraktion verändert163653 von261020 Farb-/Alphakanälen, mittlere absolute Kanaldifferenz7,2254. Stationäre Karte erzeugt über650ms keine weiteren Draws; Reduced Transparency gibt Texturen, Programme und Tiles frei. Software-GPU, Szene1898×1055, ca.16,0MB geschätzte Texturen; kumulative Shaderzeit ist keine Hardware-FPS-Messung. Diagnosebilder sind bewusst getrennt von der normalen CSS-Produktgalerie.

Die Sichtprüfung fand zusätzlich einen doppelten Musikglyphen bei fehlendem Cover (ursprünglicher Textknoten plus neuer Fallback). Korrigiert und im selben Lauf geprüft. Das vorhandene Cover-/Musikmodell wurde dabei nicht verändert.

Spotify-API-Pfade und PKCE-Empfehlung zusätzlich anhand des offiziellen `spotify/spotify-web-api-ts-sdk` geprüft, HEAD `c6f34491eaa17ab73698d5464ee10332d0c551cc`, `README.md` und `src/endpoints/PlayerEndpoints.ts`. Kein SDK-Code übernommen. Aktuelle individuelle Kontofreigaben bleiben offen.

## Backup-Kompatibilität und Laufzeiteinstellungen

Die letzte Querschnittsprüfung fand eine Integrationslücke: Der bewährte v1-Backupimport besitzt eine strikte Settings-Allowlist. Die beiden neuen Laufzeitschlüssel dürfen daher nicht ungeprüft in portable Backups gelangen. `backup.js` filtert ausschließlich `last-played-metadata-v1` und `spotify-public-config` bereits im Backup-Snapshot; Größenprüfung, Export und Restore-Vertrag bleiben dadurch konsistent. Keine neuen erlaubten Importrechte, keine Schemaänderung, keine Datenbanklöschung.

Bestehende Musikblobs, lokale Cover/Trackmetadaten, letzter lokaler Titel/Abspielposition über den bisherigen Legacy-Vertrag, Kalender, Dateien, Notizen, Timer und Einstellungen bleiben im bisherigen Backupformat. Die zusätzliche zweiquellige Lock-Metadatenprojektion und öffentliche Spotify-Client-Konfiguration sind bewusst originbezogen und nicht im portablen Backup. Nach Restore in einem frischen Origin kann die lokale letzte Wiedergabe aus dem bisherigen Vertrag rekonstruiert werden; Spotify-Verlauf erst nach erneuter Einrichtung/Anmeldung. Im selben Origin bleiben bestehende Projektionen beim Import unangetastet. Keine automatische Herkunfts- oder Kontenübernahme behauptet.

Der neue GUI-Fall exportiert nach tatsächlicher Wiedergabe, prüft den Ausschluss dieser zwei Laufzeitschlüssel und stellt das Backup ausdrücklich mit synthetischen Daten wieder her; beide Musikblobs und der vorhandene letzte lokale Metadatensatz bleiben erhalten. Die normale private Installation wurde dabei nicht geöffnet.

### Abschließende Touch-Konfliktprüfung

Halten/Scrubben und das alte Dock-Kontextmenü dürfen sich nicht gleichzeitig öffnen. Der vorhandene Dockcontroller unterdrückt Kontextmenü-Ereignisse ausschließlich während seiner Touchgeste; native Bild-Callouts sind nur an Dockbuttons deaktiviert. Rechter Mausklick und Tastatur-Kontextmenü behalten den vorhandenen Besitzer. Der zusätzliche DPR2-Fine-Pointer-Lauf prüft auch dieses Ereignis, den erhaltenen rechten Mausklick und den vollständigen Backup-Rundlauf:27/27 bestanden. Physische iPad-Longpress-Gesten bleiben Hardwareabnahme.

### WebKit-DPR2-Befund und realer Medienstart

Lauf42408294692: Chromium vollständig grün, WebKit-Coarse-GUI27/27 grün; WebKit-DPR2-Fine scheiterte beim Warten auf Live-Metadaten direkt nach einem API-seitig im Test gestarteten Transport. `paused === false` allein belegt noch keine tatsächlich laufende Wiedergabe. Der reproduzierbare Szenenlauf startet jetzt per echtem Klick auf den vorhandenen Bibliothekstitel, wartet auf Decoderbereitschaft, fortschreitende Audioposition und tatsächliche Live-Metadaten und sperrt über den vorhandenen Control-Center-Button. Keine Autoplay-Policy und keine Produkt-Musikengine geändert. Fehlerreports enthalten nun zusätzlich den tatsächlichen Medienzustand.

Die Gegenprüfung fand außerdem eine fehlende CSP-Freigabe für Spotify-Cover. Ausschließlich die bereits im Metadatenmodell zugelassenen Hosts `i.scdn.co` und `mosaic.scdn.co` sind ergänzt. Ein zusätzlicher API-Mock mit tatsächlich geladenem PNG prüft nun das Cover einschließlich CSP. Keine realen Kontozugriffe;17/17 Spotify-Mockprüfungen und27/27 Chromium-DPR2-Prüfungen lokal bestanden. Die komplette Matrix wird für diesen korrigierten Stand erneut ausgeführt.

### Portabler Medien-Testfall

Lauf42409328785 liefert den konkreten WebKit-Befund: `HTMLMediaElement.error.code === 4`, Decoder-Dauer0, Position0 und keine Live-Metadaten für den großen, direkt im Browser injizierten WAV-Blob. Damit war das Testmedium nicht tatsächlich decodiert; bloßes `paused === false` war keine ausreichende Abnahme.

Die Szenen verwenden nun die bereits im Legacy-Browsergate geprüfte8s-PCM-WAV-Fixture, überprüfen gespeicherte RIFF-Bytes und Länge nach dem IndexedDB-Schreiben und aktivieren über den vorhandenen Musikbutton echtes Repeat. Tatsächliche Decoderbereitschaft, fortschreitende Position, echte Metadaten und Lock-Transport bleiben unverändert verpflichtend; kein Audio-Mock, kein Autoplay-Bypass, kein neuer Decoder. Die dargestellte Dauer stammt aus der wirklichen8s-Datei. Große Audiobibliotheken und konkrete iPad-Codecs bleiben Hardwareabnahme; keine universelle Formatzusage aus dieser UI-Fixture.

### Letzte funktionale Härtung

Der Repeat-Schalter wird im Szenenlauf korrekt über das vorhandene „Mehr“-Menü bedient. Der reale Repeat-Toast darf selbst eine gespeicherte Mitteilung erzeugen; die Prüfung vergleicht daher die sichtbare Kartenquelle mit den tatsächlich gespeicherten letzten Mitteilungen statt eine starre Zahl2 zu erzwingen. Ein streng validiertes1px-PNG ersetzt außerdem einen fehlerhaften PNG-Mock mit falscher IDAT-Prüfsumme.

Beim neuen asynchronen Metadaten-Flush muss die Update-Sicherheit **danach nochmals** gelten: Audio kann während des Schreibens wieder starten oder ein Entwurf/Transfer entstehen. Der vorhandene Safe-Reload-Pfad prüft diese drei Bedingungen unmittelbar vor `location.reload()` erneut. Der neue funktionale Race-Test hält nur den Metadaten-Flush an, löst den tatsächlichen vorhandenen Controllerchange-Handler aus, startet den bestehenden Audiotransport und belegt, dass kein Reload erfolgt; nach Pausieren darf die sichere Aktualisierung weiterlaufen. Er ergänzt die10 echten Service-Worker-/Multitab-/Recovery-Prüfungen, ersetzt sie nicht. Lokal28/28 GUI- und17/17 Spotify-Mockprüfungen bestanden; keine Schwächung von Autoplay-, Update- oder GPU-Schutzregeln.
