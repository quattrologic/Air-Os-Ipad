# Air-OS iPad — Pro Notch

Entwicklungsbranch: `feat/air-os-ipad-pro-notch`. Produkt-/Buildstand: **`2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0`**. Kein Deployment, kein Merge und kein Zugriff auf die installierte private PWA.

## Geprüfte Ausgangsbasis

Premium4-Abschluss `35bb3375aa57cfb68b1c29d9e784fe60e48b976e`, geprüftes Produkt `07666db83bc821441c57a03b01a10715de8d88f2`, erfolgreicher [CI-Lauf42254786645](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42254786645) mit704 Browserprüfungen. Premium5 `ae0037de7efb064ff49619ed403b98f4371edf51` ist neuer, sein Lauf42261344976 ist jedoch fehlgeschlagen. Dessen69 zusätzliche CSS-Zeilen wurden nicht übernommen. System Experience3 liegt davor in der Historie. Bestehende Worktrees und verwendete Installationsbranches wurden nicht verändert.

## Tatsächlich untersuchte Referenz

Verfügbar war **Pro-Notch-Codex-Referenz.mov**:612×512,388 Frames,12,934s, nominell30fps mit tatsächlichen variablen Zeitstempeln. SHA-256:

`9f129a886e4781fd4fa17a9f1f45e740e352e71e45ce5e150cc341184c390b74`

Alle Frames wurden dekodiert; Hauptansichten und Zwischenframes wurden direkt visuell geprüft. `Pro-Notch.zip`, die separat genannte MP4 und bereits extrahierte Keyframes waren nicht verfügbar. Die Drive-Adresse lieferte Tunnel-HTTP403. Es wurde keine native App ausgeführt, dekompiliert oder als Quellcode übernommen.

Die MOV zeigt einen gefilmten Bildschirm: Perspektive, Kamerabewegung, Belichtung, Bewegungsunschärfe und harte Schnitte beeinflussen die Messung. Native macOS-Punkte/DPR sind unbekannt. Deshalb wird keine pixelidentische native Implementierung behauptet. Frameangaben sind nullbasiert. Schnitte1→2 und113→114 wurden nicht als Appanimation ausgewertet.

## Implementierte Integration

| Pfad | Tatsächliche Aufgabe |
|---|---|
| `ipad/notch/motion-data.js` | Gemessene Geometrien und getrennte Breiten-/Höhenverläufe; dokumentierte Unsicherheit und geschätzte Inhalts-/Radiusverläufe |
| `ipad/notch/model.js` | Reine Viewportbegrenzung, WAAPI-Keyframes und begrenzter Plain-Text-LRC-Parser; keine Daten-/Systemengine |
| `ipad/notch/pro-notch.js` | Ein kontinuierlicher schwarzer Außenkörper, ein abbrechbarer Animationsauftrag mit gemeinsam verwalteten Inhaltseffekten |
| `ipad/notch/pro-notch.css` | `#000000`, keine Glastextur, kein Backdropfilter, keine farbige Außenkontur; beschnittene Inhalte mit stabiler Zielbreite |
| `ipad/index.html` | Alte Glas-Kapsel/Popup-Präsentation ersetzt; vorhandene Metadatenbindungen bleiben erreichbar |
| `ipad/app.js` | Bestehenden Timer über seine ursprünglichen Zustände/Aktionen zugänglich gemacht; vorhandene Deadline-Uhr nach Aktionen neu eingeplant |
| `ipad/core/visual-motion.js` | Alten Island-Animationsbeobachter entfernt; Fenster-/Dock-Motion bleibt bestehen |
| `ipad/vendor/glass/renderer.js` | Notch aus gemeinsamen Glas-Selektoren entfernt; Dock/Widgets/Fenster bleiben im vorhandenen Materialpfad |

Musik nutzt ausschließlich `airIPad.music` und dasselbe Audioelement: Cover, Titel/Künstler, Fortschritt, Vor/Zurück und Play/Pause. Die erweiterte Ansicht behält die Playerknoten. Songtext stammt ausschließlich aus einer eindeutigen lokalen, zum Titel passenden `.lrc`-Datei im bestehenden Finder-Store; Größen-/Zeilenlimits, Textdarstellung und fehlender Inhalt sind geprüft. Kein externer Liedtextdienst und keine gebündelten Referenztexte.

Timer nutzt den vorhandenen `air-ipad:timer-v1`-Zustand: Dauer, Start/Pause/Fortsetzen, +1Minute und Reset. Die orange Skala folgt der tatsächlichen Restzeit. Kalender verwendet vorhandene lokale Termine, Datumsauswahl über die Kalenderwoche und eine Tageszeitleiste aus den gespeicherten Uhrzeiten; keine native Apple-/macOS-Kalenderanbindung.

Shelf nutzt vorhandene `shelf-files`-Referenzen, Finder-Aktionen und Air Transfers. Import erfordert Dateiauswahl/Drop. Entfernen einer Referenz löscht die Originaldatei nicht. Finderöffnung und Export verwenden vorhandene Besitzer. Die zweite Zone heißt **Importieren**: kein vorgetäuschtes AirDrop. Lokale Sitzung muss geöffnet sein; die Sperransicht bleibt eine visuelle PWA-Sitzung, keine sichere native Authentifizierung.

Neue UI, Glyphen und Animationsintegration sind eigenständige Implementierungen sichtbarer Referenzen. Kein proprietärer nativer Programmcode oder internes Asset wurde kopiert. Vorhandene AGPL-/MIT-/GPL-/OFL-Nachweise und vollständiges Corresponding Source bleiben im Paket; `ipad/NOTICE` beschreibt die Abgrenzung.

## Reproduzierbares Bewegungsmodell

| Familie | Referenzframes | Dauer |
|---|---|---:|
| Kleine Kapsel→Musik |18–28|333ms|
| Musik→erweiterter Songtext |104–113|300ms|
| Schließen einschließlich Nachschwingen |158–179|700ms|
| Kompakter Songtext→Timer |195–206|367ms|
| Songtext→Kalender |235–247|400ms|

Die Hauptkontraktion beim Schließen erfolgt in etwa270ms, danach folgt das im Video sichtbare kleine Nachschwingen. Gemessene Duplikate/Quantisierung bleiben erhalten; zwischen Samples interpoliert WAAPI linear. Keine erfundene originale Bezierkurve. Geschätzte untere Radien10–24px folgen der Höhenentwicklung; oben liegt die Form am Safe-Area-Rand an. Native Alpha-/Radiusverläufe lassen sich aus dem gefilmten Video nicht zuverlässig zurückgewinnen.

Cover/Text sind um Frame20 bereits teilweise und um Frame24 weitgehend sichtbar. Die gemeinsame Inhalts-Einblendung wurde deshalb nach dem Vollfarbvergleich von24–78% auf8–55% vorgezogen. Das ist eine sichtbasierte Schätzung der Opazität, keine native Alphaextraktion. Beim Schließen bleiben alte Inhalte bis zu ihrer geplanten Ausblendung vorhanden. Laufende Geometrie wird vor Abbruch aus dem echten DOMRect gelesen; schnelle Eingaben retargeten denselben Außenkörper.

Eine reale kleine-Viewport-Prüfung deckte einen WAAPI-Ressourcenfehler auf: ein bereits beendeter `fill:both`-Effekt blieb trotz internem Nullzähler im DOM und überlagerte spätere Größen. Alle Effekte bleiben jetzt bis zum gemeinsamen Cancel im Besitz des Auftrags. Tests verlangen zusätzlich die tatsächlich leere `getAnimations({subtree:true})`-Liste. Resize, reduzierte Bewegung, Visibility, pagehide und BFCache-Rückkehr räumen konsistent auf. Keine eigene RAF-/Intervall-Schleife.

## Bild- und Framevergleich

[Keyframes](reference/pro-notch/keyframes.json), [Messreihen](reference/pro-notch/measurements.json), [drei lokale Korrekturrunden](visual/ipad-pro-notch/review-rounds.json), [unretuschierte Iterationsausschnitte](visual/ipad-pro-notch/correction-rounds/).

1. Erste schwarze Oberfläche: Vergleich zeigte zu tiefe Medienzeilen und zu hohe Timer-/Kalenderkörper.
2. Header-Hitboxen/Stacking korrigiert; echte Navigationsbuttons geprüft, Skala an Restzeit gebunden. Frühe Testläufe stoppten an noch nicht abgeschlossenen Metadaten-/Import-UI-Aktualisierungen; diese werden nun explizit abgewartet.
3. Videokoordinaten korrigiert: Covery32, Titely28, Fortschrittsmitte etwa72, Transportmitte etwa115; kürzere Körper, kleinere Kopfmarke. Danach Kalenderkopf/Tageszeitleiste und Einblendreihenfolge anhand echter Vollfarbpaare nachkorrigiert.

| Zustand | Gemessener Referenz-Crop | PWA-CSS-Ziel |
|---|---:|---:|
| Geschlossen |235×33|236×32|
| Musik |439×153|440×152|
| Songtext |440×262|440×260|
| Timer |439×178|440×176|
| Kalender |505×214|506×216|
| Shelf |438×151|440×150|
| Dateiliste |439×154|440×152|

Referenz-Crops enthalten2px unteren Messrand; reine Körpermessungen sind entsprechend kleiner. Unsicherheit etwa±3px stabil,±6px bewegt und±1Videoframe. Die PWA passt ihre Breite an den tatsächlichen Viewport an, z.B.366px bei390px Breite.

Pro Bewegungsfamilie wurden vier echte WAAPI-Zwischenzustände bei den passenden aufgenommenen Framezeitstempeln pausiert und gerendert: insgesamt20 Zwischenframes, zusätzlich ein tatsächlich unterbrochener Öffnungsvorgang. Frühe Vergleichsfehler durch abweichenden Kompakt-/Pausezustand und gerundete Zeiten wurden korrigiert. Breiten-/Höhendifferenzen der angepassten Zwischenframes liegen ungefähr innerhalb3px. Dies bestätigt die Reproduktion der gefitteten Messreihen, keine unabhängige native Bewegungsidentität.

`scripts/analyze-pro-notch-reference.py` reproduziert die Videoanalyse mit ffmpeg/ffprobe, Pillow, NumPy und SciPy, ausschließlich als Analysewerkzeuge. `scripts/build-pro-notch-comparisons.cjs` erzeugt beschriftete Vergleiche aus tatsächlichen PWA-Crops und gemessenen, inhaltsfreien Referenzkonturen. Normalisierung: ein gefilmter Pixel entspricht einem Vergleichs-CSS-Pixel; DPR2 wird auf CSS-Größe reduziert. Keine unabhängige Einpassung beider Silhouetten; kein erfundener globaler Ähnlichkeitsscore. Rote/blaue Konturdifferenzen sind ausdrücklich Diagnosebilder.

Vollständige Originalausschnitte, Originalframes, echte PWA-Crops und beschriftete Vollfarbpaare liegen im separaten lokalen **Air-OS-Pro-Notch-Reference-Comparisons.zip**. Originales Artwork/Liedtext daraus wird weder öffentlich ins Repository committed noch als PWA-Asset ausgeliefert. Produktionsscreenshots sind unretuschiert; Vergleichsbilder ergänzen nur Ausschnitt, Anordnung und Beschriftung.

## Browser- und Regressionsergebnis

**Erfolgreich:** [GitHub Actions42376851353](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42376851353), exakter Sourcecommit`2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0`. Frozen-Toolchain-Audit, Runtime-/CSP-/Lizenzprüfung und beide vollständigen Browserjobs bestehen. **46/46 Node-Regressionen** (42 erhalten +4 neue); **898 Browserassertionen** über die folgenden Suiten,450 Chromium/448 WebKit. Das sind wiederholte Prüfungen über Engines/DPRs, keine898 unterschiedlichen Produktfunktionen.

| Browsergate | Chromium | WebKit |
|---|---:|---:|
| Gepinnte Premium4-Vorheraufnahme |37|37|
| Bestehende visuelle Produktsuite |37|37|
| Dieselbe Produktsuite bei DPR2 |37|37|
| Neue Notch: Zustände/Motion/Medien/Dateien/Offline |47|47|
| Neue Notch bei DPR2 |47|47|
| Material-/GPU-Fallback-/Context-Cleanup |11|11|
| Bestehende App-/Daten-/Cold-Restart-Suite, Root |112|111|
| Dieselbe Suite unter `/Air-OS/` |112|111|
| Sichere Updates/Mehrtab-/Musik-/Export-/Recovery-Schutz |10|10|

[Maschinenlesbarer vollständiger Bericht](visual/ipad-pro-notch/2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0/evidence.json).

**Echte Vorher-/Nachher-Szenen mit identischem synthetischem Zustand:** [vorher Island](visual/ipad-pro-notch/2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0/before-chromium/island.png), [nachher Island](visual/ipad-pro-notch/2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0/after-chromium/island.png), [vorher Desktop](visual/ipad-pro-notch/2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0/before-chromium/desktop.png), [nachher Desktop](visual/ipad-pro-notch/2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0/after-chromium/desktop.png).

**Aktuelle Hauptansichten:** [Musik](visual/ipad-pro-notch/2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0/notch-chromium/notch-music-crop.png), [Songtext](visual/ipad-pro-notch/2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0/notch-chromium/notch-local-lyrics-crop.png), [Timer](visual/ipad-pro-notch/2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0/notch-chromium/notch-timer-crop.png), [Kalender](visual/ipad-pro-notch/2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0/notch-chromium/notch-calendar-crop.png), [Shelf](visual/ipad-pro-notch/2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0/notch-chromium/notch-shelf-crop.png), [Dateien](visual/ipad-pro-notch/2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0/notch-chromium/notch-files-crop.png).

**Tatsächlich gerenderte Zwischenzustände:** [Öffnen40%](visual/ipad-pro-notch/2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0/notch-chromium/notch-motion-open-40-crop.png), [Erweitern40%](visual/ipad-pro-notch/2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0/notch-chromium/notch-motion-expand-40-crop.png), [Schließen40%](visual/ipad-pro-notch/2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0/notch-chromium/notch-motion-close-40-crop.png), [Wechsel40%](visual/ipad-pro-notch/2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0/notch-chromium/notch-motion-switch-40-crop.png), [Kalender40%](visual/ipad-pro-notch/2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0/notch-chromium/notch-motion-calendar-40-crop.png). Zusätzlich stehen alle20 Zwischenframes pro Engine/DPR in den entsprechenden Notch-Verzeichnissen. Rohszenen und27 beschriftete Konturvergleiche je Variante liegen in den Actions-Evidenzartefakten.


Getestete Viewports:1024×768,1180×820,1366×1024,834×1194,820×1180,390×600; Touch-Kontexte, DPR1/DPR2. Enthalten sind Musikwechsel während offener Ansicht, echte lokale LRC-Daten, Timer bei Appwechsel, Kalenderwechsel, Import/Referenzentfernung, echte wiederholte Touch-Taps, Tastaturtabs/Escape, unterbrochene Morphs, Pointercancel, reduzierte Bewegung, Navigation/pagehide, Idle und Offline-Datenerhalt.

Der erste vollständige Lauf42374274723 ist ausdrücklich **fehlgeschlagen**: Chromium war vollständig grün, WebKit bestand44 Notch-Prüfungen und stoppte danach mit einem internen Browserfehler beim emulierten Offline-Neuladen. Der Test verwendet nun wie die vorhandene Suite den realen Serverausfall: aktiven kontrollierenden Worker abwarten, HTTP-Server abschalten, neu laden, danach den persistenten Browserprozess bei weiterhin abgeschaltetem Server neu starten. Kein Retry oder geschluckter Fehler. Die Safari-Service-Worker-Vorlage wurde nicht geändert. Im Folgelauf42375098262 bestanden47 normale WebKit-Notchprüfungen einschließlich beider realen Offline-Stufen. Der DPR2-Lauf prüfte den Pause-Endzustand vor Verarbeitung des asynchronen Audio-Pause-Ereignisses. Der Test wartet nun zusätzlich auf pausiertes Audio und das tatsächliche32px-Endmaß; Prüfung und Aufräumkriterien bleiben bestehen. Auch dieser Zwischenlauf wird nicht als vollständige Freigabe ausgegeben.

Ein weiterer Vollfarbvergleich korrigierte die Timerdetails quantitativ: Ziffernbereich der Referenz82×28px, erste PWA61×22px, korrigierte PWA81×29px. Die Kontrollen sind36px hoch; Positionen/Abstände folgen dem gemessenen farbigen Buttonkörper. [Detailmessung](reference/pro-notch/timer-detail-measurements.json).

Im Zwischenlauf42375975859 stoppte die bestehende Retina-WebKit-Visualsuite an ihrer pauschalen400ms-Warteannahme. `settle` wartet jetzt auf den natürlichen Abschluss des vorhandenen Desktop- und optionalen Notch-Besitzers sowie auf geladene Fonts, ohne Animationen für den Test fertigzustellen oder abzubrechen. Die gepinnte Vorheraufnahme verwendet dieselbe reine Test-Synchronisation in ihrem separaten temporären Archiv; Produktpräsentation und Originalassets bleiben unverändert.

## Ressourcen und geschützte Grenzen

Die geschlossene Notch erzeugt im gemessenen Idle-Intervall keine neuen Morphs; im echten DOM bleiben nach Abschluss/Abbruch keine Effekte. Kein Notch-Canvas, keine eigenen GL-Programme/Texturen, keine zweite Audio-, Fenster-, Timer- oder Datenengine. Gemeinsame Materialtests prüfen weiterhin Context Loss/Restore und Cleanup der übrigen Systemflächen. Normale Software-GPU-Produktpfade verwenden weiterhin den bestehenden sicheren CSS-Fallback; isolierte Shaderdiagnose ist kein Hardware-GPU-Nachweis. Keine gemessene Hardware-FPS-/Akkuaussage.

[Bytevergleiche](visual/ipad-pro-notch/protected-boundaries.json) bestätigen unveränderte Storage-/Backup-Dateien, Safari-SW-Vorlage, Windows-Setup-/Update-Skripte und Yosemite. Wallpaper-SHA256:

`d1d1a71c8080696bf45b1ff0a664df592e59ac27a0710853f76d938a10a9ac06`

Alle25 Registry-Einträge bleiben; `air-os-ipad-tracks-v1`, Schema2, bestehende Musik-/Kalender-/Timer-Schlüssel und Backupformate bleiben erhalten. Keine Migration, kein Reset. Generierter Worker/Versionshash und Corresponding-Source-Archiv wurden aktualisiert; sichere Aktivierung mit Musik-/Entwurfs-/Mehrtab-Schutz bleibt im bestehenden Besitzer. Keine private Tailscale-Adresse oder Windows-Serve-Konfiguration wurde angesprochen oder geändert. `feature/private-ipad-pwa` bleibt auf`7de1635c0207b8604c5409ef62c466585b4d5f04`.

## Build und Quellenstand

[Erfolgreicher Build und Downloadartefakte](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42376851353):

- `Air-OS-iPad-ProNotch-Build-2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0`: versionierte PWA, kompatible Recovery/Preflight und SHA256-Dateien. Retention30Tage; kein veröffentlichtes Release.
- `Private-iPad-ProNotch-chromium-2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0` / `Private-iPad-ProNotch-webkit-2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0`: vollständige synthetische Screenshots, Berichte, DPR-Varianten und beschriftete Kontur-/Framevergleiche.
- Lokales PWA-ZIP: `dist/Air-OS-iPad-Pro-Notch-2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0.zip`,10.219.725Bytes,134 geprüfte Runtimeassets. SHA256: `e016306bfb40c1091fb383f75e5184ea718bca4635465cb8a93b6f785a538376`.
- Separates lokales Referenzpaket: `dist/Air-OS-Pro-Notch-Reference-Comparisons.zip`,16.360.475Bytes. SHA256: `1cb6fe86b194b8f3c4a47fc9e0cb26cfab09e3f450c10b0cf59b1cd2fcf270b8`. Dieses enthält die vollständigen Originalausschnitte nur zur Nutzeranalyse, keine freigegebenen Produktassets.


Der Workflow `.github/workflows/test-ipad-pro-notch.yml` ist auf diesen Entwicklungsbranch begrenzt: Tests, Testtool-Audit, genaue Runtime-/CSP-/Lizenzprüfung, ZIP und synthetische Evidenz. Kein Deployment. Native macOS-Dateien und das Referenzvideo sind nicht im Runtimepaket. Source-ZIP enthält lesbaren Quellcode, Buildwerkzeuge, Herkunftsnachweise und die inhaltsfreien Analyseinputs.

Checkpoints:

- `9196f94bc0c7ca9e4a75bf0af020594308caea70`: schwarze Einzeloberfläche und Datenintegration.
- `0434c252ca91146724491e0fd5f479838a06c23d`: getrennte Messkanäle, echte Zwischenframes, Ressourcen-/Datei-/Medientests und CI.
- `88b47aa36d8af50ba518f0c1400037ec9095cd2a`: korrigierte Inhalts-Einblendung und Source-Angebot.
- `11c5b34e7d6304a76fc5a37a8de8184dfeea00b2`: echte Touch-/Tastaturtests; fehlgeschlagener WebKit-Offline-Emulationslauf transparent erhalten.
- `fe664ee5dc234778939078c3226d8cb2b31197df`: dessen unveränderte Browser-Evidenz.
- `4aad40ee2fc7e84dc08a3b8092cea38d2fb80025`: realer Offline-/Prozessneustarttest; WebKit normal47 grün, DPR2-Lauf am asynchronen Pause-Endzustand gestoppt.
- `91524dcdd51eaed3b861746bf93f8a1fa4dbfca4`: der Pause-Test wartet zusätzlich auf die tatsächliche geschlossene Geometrie.

- `2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0`: gemessene Timerdetails und synchronisierte visuelle Abnahme.

Erfolgreiche finale Browser-Evidenz: `7be6da69bbae7660b3688a25fea1eda4b49c9f90` (separater Commit auf demselben Entwicklungsbranch). Der nachfolgende Berichtscommit verändert ausschließlich Dokumentation/Evidenzindizes; der geprüfte PWA-Build bleibt`2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0`.

## Verbleibende Abweichungen / offene Abnahmen

- Native Implementierung, Quellkurven, macOS-Punktmaßstab, genaue Radius-/Alpha-Kurven und Hardware-Framerate sind nicht bekannt; das Video erlaubt keine garantierte1:1-Identität auf jedem iPad.
- Schwarzwert ist ausdrücklich#000 statt des kamerabedingt aufgehellten Videobildes. Native Schrift-/Rasterung, Kameraunschärfe und perspektivische Neigung werden nicht künstlich in die PWA eingebaut.
- Spotify-/Providerzeichen fehlen bewusst. AirDrop wird durch tatsächlichen Browserimport ersetzt. Originale Musik/Liedtexte/Kalendereinträge werden nicht gebündelt; Produktansichten zeigen tatsächliche lokale Daten, Tests klar synthetische Daten.
- Die externe Timerblase der Referenz bleibt innerhalb der einzigen Kapsel. Die kleinen Pegelbalken sind ein statischer Wiedergabestatus, keine Audioanalyse. Die Tageszeitleiste zeigt Startmarkierungen vorhandener Termine, keine native Dauerplanung. Zusätzliche native Systemaktionen und systemweite macOS-/iPadOS-Notchkontrolle werden nicht behauptet.
- Kleine Viewports passen die Silhouette an. Kompakte Headerziele folgen den Referenzproportionen; ihre physische Bedienbarkeit ist auf einem echten iPad noch abzunehmen.
- **Offen:** echte iPadOS-Home-Screen-Installation, physisches Safari/Touch/Pencil/Trackpad, Safe-Area-Hardware, Suspend-/Hintergrundaudio, Akku, thermische Last und Hardware-GPU. Linux-WebKit-Automatisierung ersetzt diese Tests nicht.
