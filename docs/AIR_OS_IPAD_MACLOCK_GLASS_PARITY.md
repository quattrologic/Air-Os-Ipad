# MacLock Glass Material Parity

Branch: `feat/air-os-ipad-maclock-glass-parity`, Ausgangsstand `47c15663f01b4c457190cec9d32da2c1751f9163`. Kein Deployment, keine Zusammenführung und kein Zugriff auf die installierte private PWA.

Abgeschlossen auf Produkt-/Buildcommit `e621317e3ac8f6b323b329a29808d18c5709fe2d`: vollständiger Chromium-/WebKit-/QtQuick-Gate erfolgreich; finale Bilder, Messungen und PWA-Artefakt sind im Abschnitt „Finaler verifizierter Abschluss“ verlinkt. Die nachfolgenden Korrekturrunden dokumentieren auch die Zwischenstände.

## Architektur und Originalportierung

Die Originale `Glass.qml`, `liquidglass.frag` und `LockScreen.qml` wurden erneut aus MacShell `1bdb51870b621100fd2709f66c8f8e00ab17b9c4` geladen und stimmen bytegenau mit den bereits lizenzierten MIT-Referenzen überein. Quellen und Lizenz: [vorhandene Provenienz](source-ports/maclock-adaptive/provenance.json).

Der bestehende Glass-Renderer enthält nun einen vorberechneten Fallback mit derselben SDF, konvexen Kantenableitung, Snell-Brechung n=1,5, gerichteter Lichtkante, Tiefenabsorption, Meniskus und feiner Körnung. CSS überblendet nur die gecachten Bildschichten. Die alte gleichmäßige Dunkeltönung und die konische Pseudokontur werden für diese Karten ersetzt. Musik- und Mitteilungskarten behalten ihre unterschiedlichen originalen Dicke-/Tint-/Schattenparameter. Keine zusätzliche Engine, Registry oder Datenbank.

Der WebGL-Pfad behält den vollständigen originalen 24-Tap-Shader. Der begrenzte Fallback verwendet drei bilineare Farbkanalabtastungen aus derselben vorgefilterten Szene und ist deshalb eine dokumentierte Näherung, kein behaupteter identischer 24-Tap-Shader. Alle vorberechneten Maps gehören dem vorhandenen Renderer, werden im Ruhezustand nicht neu erzeugt und beim Verlassen freigegeben.

Die zweite Korrekturrunde adaptiert `gl_FragCoord` auf vollständige physische Fensterkoordinaten: Das Original rendert im Qt-Fenster, Air-OS auf einem begrenzten gemeinsamen GL-Canvas. Körnung und Taprotation verwenden dadurch dieselbe Koordinatenkonvention. Die Referenzdatei bleibt unverändert; die Abbildung erfolgt im mechanischen ES-Generator.

## Tatsächlich vorhandener nativer Vergleich

`scripts/reference/render-maclock-qt.py` rendert die unveränderte originale `Glass.qml` und den mit Qt qsb gebauten Originalshader in einem eigenen QtQuick/OpenGL-Fenster. PySide6 6.8.2.1 und Xvfb liegen ausschließlich in der isolierten Testumgebung, nicht im Produkt. Dies ist ein nativer **Materialkomponentenvergleich**, kein gestarteter vollständiger MacShell-Lockscreen und keine Hardware-GPU-Abnahme.

Die erste kontrollierte Runde verwendet dieselbe eigene tatsächliche Hintergrundtextur, 1280×710, DPR 1, denselben 224×100 großen Glasgegenstand und Radius 22. Gemessene mittlere absolute RGB-Kanaldifferenz innerhalb der gemeinsamen Materialregion einschließlich 10px Schattenraum: WebGL-Port rund 1,56/255; Fallback rund 2,23/255. Die Bilder stammen aus wirklichen Renderern; es ist kein Vergleich verschiedener Covers und keine erfundene Originalaufnahme. [Unveränderte Vollbilder und Reports](visual/maclock-glass-parity-checkpoints/round-1/).

## Visuelle Korrekturrunden

- Runde 0: gesicherter Ausgangsstand mit Wald-/Seecover, 32 bestehende Szenenprüfungen bestanden.
- Runde 1: tatsächliche Brechung im vorberechneten Fallback, kontrollierte native Referenz, 12 neue Chromium-Prüfungen bestanden.
- Runde 2: korrekte Fensterkoordinaten für Grain/Taprotation, neue Vollbilder, 12 Chromium-Prüfungen bestanden.
- Runde 2, Nachmessung: physische Pixelraster-Ausrichtung von SDF/Texture/Grain und komplementäre premultiplizierte CSS-Überblendung beseitigen den Kantenversatz und doppelte transparente Schatten.
- Runde 3: Gaussian-äquivalenter Coverblur 24 statt 64 CSS-Pixel; originale lokale artBg-Vignette mit .22 oben und .30 unten. Die Vignette wird einmal in die vorbereitete Szene eingebracht, damit Renderer und sichtbarer Hintergrund dieselben Pixel verwenden.
- Vollständige Matrix, native Referenzen und Buildnachweis sind im abschließenden verifizierten Abschnitt dokumentiert.

[Gesicherte Vollaufnahmen und Rohreports](visual/maclock-glass-parity-checkpoints/). Alle Bilder sind unbearbeitet; die unterschiedliche Größe von Ausgangs- und Kontrollviewport wird ausdrücklich getrennt behandelt. Der kontrollierte Komponentenvergleich verwendet jeweils identische Maße.

Aktuell: 60/60 vorhandene und neue Node-Modelltests sowie Paketprüfung für 141 exakte Browserassets bestanden. Die Pro-Notch-Dateien bleiben bytegleich; sämtliche 25 Apps, Audio-/Spotify-Eigentümer, IndexedDB-Schema, Backup, Service-Worker-Logik, kleine Uhr, Avatar, freie Entsperrschrift und vorhandene Geometrien bleiben erhalten.

Physisches iPad/Safari, Akku, Hardware-GPU und echte Spotify-Kontoabnahme sind weiterhin offen. Tests verwenden ausschließlich eigene synthetische Audiodaten und bereits lizenzierte Fotocover.

## Nachmessung der Kanten und Hintergründe

Die verfeinerte Rasterabbildung senkt die tatsächliche mittlere absolute RGB-Kanaldifferenz im Materialbereich bei DPR 1 auf rund 0,45/255 im WebGL-Port und 0,62/255 im Fallback. Die Schattenabweichung des Fallbacks sinkt nach Beseitigung der doppelten Alphaüberlagerung ebenfalls deutlich. [Unveränderte Vollbilder und Messdaten](visual/maclock-glass-parity-checkpoints/round-2-refined/). Das ist eine kontrollierte Komponentenreferenz, keine Behauptung identischer nativer OS-/Hardwaredarstellung.

Das zusätzliche QtQuick-Rendering der originalen artBg-MultiEffect-Parameter zeigt, dass `blurMax:64` keine Gaussian-Standardabweichung von 64px beschreibt. Ein Abgleich desselben Waldcovers ergibt ungefähr 24px als passende Browser-Näherung; die alte 64px-Abbildung verwischte die räumliche Lichtverteilung zu stark. Dies wurde an echten, separat gerenderten Szenen geprüft.

Wichtige bewusste Grenze: Qt MultiEffect verwendet eine additive Helligkeitsänderung von -0,16 und eine andere Graugewichtung. Das unveränderte Waldcover wird damit in der tatsächlichen nativen Referenz erheblich dunkler als das helle Erika-Cover des Nutzers. Air-OS behält seine bisherige multiplikative Helligkeitsabbildung 0,84, damit dunkle Cover nicht zusätzlich schwarz clippen; die Hintergrundfarbabbildung ist daher ausdrücklich keine pixelidentische Qt-MultiEffect-Portierung. Der kontrollierte **Glas**vergleich verwendet dagegen exakt dieselbe bereits vorbereitete Hintergrundtextur für beide Renderer und vermischt diese Belichtungsfrage nicht mit dem Materialvergleich.

Die verfeinerte CSS-Überblendung nutzt auf unterstützten Browsern `mix-blend-mode:plus-lighter` in einer isolierten Materialfläche mit komplementären Opazitäten. Auf älteren Browsern ohne diesen Modus bleibt eine normale CSS-Überblendung funktionsfähig, kann in der Mitte des Übergangs aber leicht in der Deckkraft abweichen. Unbewegte Flächen erzeugen keine neuen Maps, keine erneuten Szenenabtastungen und keine laufenden Shader-Repaints.

Zusätzliche echte Abläufe: tatsächliches Wiedergabeende nach Seek im vorhandenen Audioplayer bei leerem Suchergebnis/ohne folgenden sichtbaren Titel, Erhalt des letzten Covers, echter Browserneustart, wirklich nicht verfügbares WebGL, Context Loss/Restore und vollständige Entfernung der gecachten Materialreferenzen. Keine erfundenen Medienereignisse und keine zweite Musikengine.

Workflow `.github/workflows/test-ipad-maclock-glass-parity.yml`: bestehender vollständiger Browsergate plus kontrollierte Materialansichten bei DPR 1/2 in Chromium/WebKit, danach vier native QtQuick-Komponentenvergleiche auf denselben Eingabetexturen. Qt/PySide6/Xvfb sind ausschließlich Testwerkzeuge. Paketidentität: `Air-OS-iPad-MacLock-Glass-Parity`; der finale CI-Commit und Artefaktlink stehen im Abschlussabschnitt.


Der lokale Gate dieses Zwischenstands bestand mit 60/60 Node-Modelltests, 14/14 zusätzlichen Chromium-DPR-2-Material-/Lifecyclefällen und sieben nativen DPR-2-Referenzprüfungen. Die originale Qt-ShaderEffect meldet tatsächlich `Compiled`; die Referenz wurde als OpenGL-RHI-Bild erzeugt. Gemessene lokale DPR-2-MAE innerhalb der Materialregion: WebGL rund 1,36/255, Fallback rund 1,35/255. Für den automatischen nativen Gate gelten maximal 2/255 bei DPR 1 und 3/255 bei DPR 2; Rand, Inneres und Schatten werden zusätzlich getrennt protokolliert. Die anschließend ausgeführten vollständigen CI-Läufe sind unten dokumentiert.

## Vergleich A — tatsächliche Nutzerbilder

Die beiden in der Konversation bereitgestellten Bilder zeigen unterschiedliche Cover und Belichtungsverteilungen. Das Waldcover enthält viele sehr dunkle Grün-/Schwarzflächen; das Erika-Cover enthält große helle Haut-/Textilflächen und warme Brauntöne. Diese Farb- und Helligkeitsunterschiede werden ausdrücklich nicht als Beweis eines anderen Glasmaterials gezählt. Aus diesen unterschiedlichen Screenshots wird keine pixelgenaue MAE oder angebliche 1:1-Übereinstimmung abgeleitet.

| Merkmal | Vorheriger Air-OS-Pfad | Korrigierter Pfad / verbleibende Grenze |
|---|---|---|
| Brechung | Normaler Fallback mit lokal vergrößerter Bildkopie | Original-SDF/Normalen/Snell-Verschiebung; erlaubte tatsächliche Szene, separate Farbkanäle |
| Kante | Vereinfachter konischer CSS-Rim | Original gerichteter specular rim, Meniskus, innere Absorption; keine CSS-Border und kein inset-Rahmen |
| Schatten | CSS-Schatten und doppelte Alphaüberlagerung | Original-SDF-Schattenparameter, einmalige premultiplizierte Komposition |
| Materialfarbe | Gleichmäßige dunkle Fallback-Tönung | Lokale Szene, originale Tint-/Sättigungsparameter und Tiefen-/Lichtverlauf |
| Hintergrund | Sigma64 vereinheitlicht räumliche Lichtzonen zu stark | Sigma24 als gemessene MultiEffect-Näherung; Coverfarben bleiben echt, .84-Helligkeitsabbildung bleibt dokumentierte Browserabweichung |
| Texte/Bedienung | Bestehende Playergröße und Bedienelemente | Geometrie und Logik unverändert; der Materialkontrast wird am tatsächlichen Hintergrund geprüft |

## Vergleich B — kontrolliertes Originalmaterial

Der Vergleich lädt die tatsächlich im Browser benutzte eigene Hintergrundtextur als identische Eingabe für beide Materialrenderer. Kein anderer Cover-/Wallpapersatz wird unterschoben. Die Referenz rendert die **unveränderte originale Glass.qml** und das Originalfragment als tatsächliche QtQuick/OpenGL-Komponente; Qt meldet den kompilierten Shader ausdrücklich. Das ist ein echter nativer Komponentenvergleich unter kontrollierten Bedingungen, aber kein vollständiger Quickshell-/MacShell-Login und keine native iPadOS-Oberfläche.

Identisch festgelegt: Hintergrund-/Cover-Bildquelle, 1280×710 logischer Viewport, DPR 1 beziehungsweise 2, Objektposition, 224×100 Objektmaß, Radius 22 und originale Medienparameter. Der kontrollierte Fixture enthält nur Hintergrund und Materialgegenstand; der große Vordergrundplayer/Albumcover sowie Authentifizierung werden darin nicht zusätzlich nachgebaut. Beide Renderer erhalten dieselben bereits vorbereiteten Bildpixel. Unterschiedliche Mipmap-/Resampling- und Antialiasingpfade sowie nicht durchgeführte ICC-/HDR-Hardwarekalibrierung bleiben als Grenzen benannt.

Messungen erfolgen auf den unveränderten Vollbildern innerhalb der gemeinsamen Materialregion einschließlich Schattenraum, zusätzlich getrennt nach Rand, Innerem und Schatten. Es werden dafür keine zugeschnittenen oder bearbeiteten Ergebnisbilder erzeugt. Die fünf abschließenden Produktbilder sind wirkliche vollständige PWA-Browseraufnahmen; die kontrollierten Referenzbilder werden im Bericht separat gekennzeichnet.

[Nachweis unveränderter geschützter Dateien](visual/maclock-glass-parity-checkpoints/protected-files.json): Pro Notch, Audio-/Spotify-Controller, Daten-/Backupcode, Registry, Dock-/Fenstercontroller, Yosemite-Datei, Marke, Service-Worker-Template und private Windows-/Tailscale-Skripte stimmen bytegenau mit dem Ausgangsstand überein. Lediglich die generierte Assetversion/Source-Offerte und die hier beschriebenen Materialdateien ändern sich.

## Erster vollständiger CI-Lauf und Testprofilkorrektur

[Lauf 42486774481](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42486774481) auf `4f7c004d13d4113a559eb7162d3f4e4bb6f30620`: Chromium vollständig erfolgreich. WebKit bestand den bisherigen adaptiven Material-/Offlinegate und die Spotify-Mocks, scheiterte aber im neuen Vergleichsskript beim Import der beiden synthetischen Audiodateien, bevor eine neue Materialansicht aufgenommen wurde. Der ursprüngliche Fehler ist unverändert in [evidence.json](visual/ipad-maclock-glass-parity/4f7c004d13d4113a559eb7162d3f4e4bb6f30620/evidence.json) gesichert; die native CI-Referenzmatrix war dadurch noch nicht ausgeführt und wird nicht als bestanden ausgegeben.

Das neue Vergleichsskript nutzte gegenüber den bewährten Audio-/Blob-Persistenztests einen flüchtigen Browserkontext. Es verwendet jetzt ebenfalls ein frisches, ausschließlich synthetisches persistentes Testprofil und wartet vor dem Import auf die abgeschlossene Shell-Wiederherstellung. Die Import-, Daten- und Materialassertions bleiben vollständig erhalten. Zusätzliche Fehlerzustände protokollieren ausschließlich die synthetische Testsession; Produktcode, Nutzerdatenbanken und Pro Notch werden für diese Testkorrektur nicht verändert.

## Erfolgreiche vollständige Referenzmatrix vor der letzten Hoverkorrektur

[Lauf 42487877363](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42487877363) auf `36cba7bee6ae537f862207f83e1e9c41213b7681` besteht vollständig: beide Browserjobs, vier native QtQuick-Referenzen, 34 Rohreports und insgesamt 1.266 Assertions. [Unveränderte Evidenz](visual/ipad-maclock-glass-parity/36cba7bee6ae537f862207f83e1e9c41213b7681/evidence.json). Damit ist auch die Testprofilkorrektur unter WebKit tatsächlich verifiziert.

| Browser / DPR | Originalshader MAE /255 | Fallback MAE /255 |
|---|---:|---:|
| Chromium / 1 | 0,45009 | 0,61543 |
| Chromium / 2 | 1,36322 | 1,34958 |
| WebKit / 1 | 0,09543 | 0,36087 |
| WebKit / 2 | 1,00444 | 0,71562 |

Die vier nativen ShaderEffects sind tatsächlich kompiliert und in QtQuick/OpenGL gerendert. Diese Zahlen beziehen sich ausschließlich auf die identische kontrollierte Materialregion, nicht auf die unterschiedlichen Nutzerbilder oder eine Hardware-GPU-Abnahme.

Die abschließende Quellenkontrolle nimmt Lockkarten außerdem vom generischen ContourGlow-Hover des gemeinsamen Renderers aus: Das originale MacLock-Glass verwendet dort sein gerichtetes Materiallicht. Ein zusätzlicher echter Zeigertest prüft, dass Hover auf dem Musikpanel keinen generischen Glow und keine weiteren Shaderdraws auslöst. Die lokale Chromium-Abnahme bestand mit 15/15 neuen Fällen; auch die anschließend erneut ausgeführte vollständige Matrix des finalen Produkt-/Buildcommits besteht, wie im nächsten Abschnitt dokumentiert.

## Finaler verifizierter Abschluss

Produkt-/Buildcommit: `e621317e3ac8f6b323b329a29808d18c5709fe2d`; Entwicklungsbranch `feat/air-os-ipad-maclock-glass-parity`. [Vollständiger finaler Lauf 42489457217](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42489457217) ist erfolgreich: beide Browserjobs und die gesamte native QtQuick-Referenzmatrix. Evidenzcommit `dce627506d541e012dd89e5ca569f64a55371685` bewahrt die unveränderten Bilder und Rohreports: [evidence.json](visual/ipad-maclock-glass-parity/e621317e3ac8f6b323b329a29808d18c5709fe2d/evidence.json).

60/60 Node-Modelltests bestehen in jedem Browserjob; 34 GUI-/Referenzreports bestehen mit insgesamt **1.270 Assertions**. Die neuen Materialansichten umfassen je 15 reale Browserfälle in Chromium/WebKit bei DPR 1 und 2. Alle bisherigen App-, Dock-, Notch-, Responsive-, Offline-, Legacy-Daten-, Unterpfad- und sicheren Updateprüfungen sind erhalten. Spotify ist mit den bestehenden Mocks geprüft; kein echtes Konto wurde ohne Autorisierung verwendet.

| Renderer / DPR | Originalshader MAE /255 | Fallback MAE /255 |
|---|---:|---:|
| chromium / 1 | 0,45009 | 0,61543 |
| chromium / 2 | 1,36322 | 1,34958 |
| webkit / 1 | 0,09543 | 0,36087 |
| webkit / 2 | 1,00444 | 0,71562 |

Alle vier originalen Qt-ShaderEffects sind tatsächlich kompiliert und im OpenGL-RHI gerendert; die Quellhashes entsprechen dem gepinnten Original. Die Messung betrifft ausschließlich die gemeinsame kontrollierte Materialregion einschließlich Schattenraum. Rand, Inneres und Schatten sowie P95/Maximalabweichungen stehen getrennt in den Rohreports. Es ist keine Aussage über die unterschiedlichen Nutzerbilder, eine komplette native MacShell-Installation, HDR-/ICC-Hardwarekalibrierung oder physische iPad-GPU-Freigabe.

Die vier Browser-Shadernachweise verwenden die ausdrücklich isolierte Diagnose und führen den originalen Shader wirklich aus. Der normale Standardmodus behält den gecachten Fallback; Software-/Unknown-GPU-Prüfung bleibt erhalten. Die neue Zeigerprüfung bestätigt, dass auf Lockkarten kein generischer ContourGlow und keine zusätzlichen Shaderdraws gestartet werden. Idle, Kontextverlust/-wiederherstellung, Materialfreigabe, tatsächliches Wiedergabeende, letzte Musik nach Neustart, Coverwechsel und fehlendes WebGL sind erfolgreich geprüft. Physische iPad-FPS und Akkulaufzeit wurden nicht gemessen.

### Tatsächliche Vollbildaufnahmen

Die fünf finalen Produktbilder stammen aus WebKit bei 1280×710 und DPR 1, jeweils ohne Zuschnitt oder nachträgliche Bildbearbeitung. Die normalen Ansichten verwenden den vorberechneten Fallback des bestehenden Renderers; der explizite Ausfalltest verweigert wirklich die WebGL-Kontexterzeugung. Die fünfte Ansicht verwendet tatsächlich ausgeführten Originalshadercode in der isolierten Diagnose.

1. [Waldcover und korrigiertes Glas](visual/ipad-maclock-glass-parity/e621317e3ac8f6b323b329a29808d18c5709fe2d/parity-webkit-dpr1/parity-forest.png).
2. [Andere Coverpalette](visual/ipad-maclock-glass-parity/e621317e3ac8f6b323b329a29808d18c5709fe2d/parity-webkit-dpr1/parity-other-cover.png).
3. [Yosemite-Hintergrund](visual/ipad-maclock-glass-parity/e621317e3ac8f6b323b329a29808d18c5709fe2d/parity-webkit-dpr1/parity-yosemite.png).
4. [CSS-Fallback bei wirklich nicht verfügbarem WebGL](visual/ipad-maclock-glass-parity/e621317e3ac8f6b323b329a29808d18c5709fe2d/parity-webkit-dpr1/parity-css-fallback.png).
5. [Originalshader, isolierte Diagnose](visual/ipad-maclock-glass-parity/e621317e3ac8f6b323b329a29808d18c5709fe2d/parity-webkit-dpr1/parity-shader.png).

Separater kontrollierter Komponentenvergleich, ebenfalls unbeschnittene Vollbilder: [Original Glass.qml in QtQuick](visual/ipad-maclock-glass-parity/e621317e3ac8f6b323b329a29808d18c5709fe2d/native-webkit-dpr1/controlled-native.png), [WebGL-Port](visual/ipad-maclock-glass-parity/e621317e3ac8f6b323b329a29808d18c5709fe2d/native-webkit-dpr1/controlled-shader.png), [Fallback](visual/ipad-maclock-glass-parity/e621317e3ac8f6b323b329a29808d18c5709fe2d/native-webkit-dpr1/controlled-css.png). `controlled-source.png` ist ausdrücklich die gemeinsame Eingabetextur, kein angeblicher Vollbild-Screenshot; `control.json` beschreibt das reproduzierbare Fixture. Die Produktaufnahmen enthalten die wirkliche Air-OS-UI; das Komponentenfixture enthält nur Hintergrund und Glasgegenstand.

### Build, Sicherung und Grenzen

[Versioniertes CI-PWA-Paket](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42489457217#artifacts): `Air-OS-iPad-MacLock-Parity-Build-e621317e3ac8f6b323b329a29808d18c5709fe2d`, darin `Air-OS-iPad-MacLock-Glass-Parity-e621317e3ac8f6b323b329a29808d18c5709fe2d.zip` mit zugehöriger `.sha256`-Datei. 141 exakte Runtimeassets, CSP, Scope, Source-/Lizenzpaket und Ausschluss nativer Runtime sind verifiziert. Das Audit der fixierten Browsertestwerkzeuge ist erfolgreich. Artefaktaufbewahrung: 30 Tage; dies ist kein Deployment. Native Qt/PySide6/Xvfb-Abhängigkeiten befinden sich ausschließlich in der Testumgebung und nicht im PWA-Runtimepaket.

Gesicherte Implementierungscheckpoints: `921f2d17697c68ecf373953251311d89d6633ba6` (SDF/Snell-Fallback und erste echte Referenz), `4f7c004d13d4113a559eb7162d3f4e4bb6f30620` (Pixelphase, einfache Schattenkomposition und Cover-Lichttiefe), `36cba7bee6ae537f862207f83e1e9c41213b7681` (bewährtes persistentes WebKit-Testprofil), `e621317e3ac8f6b323b329a29808d18c5709fe2d` (ausschließlich originales Materiallicht bei Pointerinteraktion). Die nachfolgende Dokumentationssicherung ändert keine Runtimebytes.

Verbleibende Grenzen: bilineare Fallbackabtastung statt des originalen 24-Tap-Disks, Qt-/Browser-Mipmap- und Antialiasingunterschiede, bewusst erhaltene hellere .84-Background-Farbabbildung statt Qt-additiv -0,16, ältere Browser ohne `plus-lighter`, physische Safari/iPad-/Akku-/Hardware-GPU-Abnahme und freiwillige echte Spotify-Kontoabnahme. Keine dieser offenen Hardware-/Kontoprüfungen wird als bestanden dargestellt.

Kein Deployment, kein PR-/Branchmerge, keine Datenmigration und keine Änderung der privaten iPad-Installation oder Tailscale-Adresse. [Geschützte Dateiidentitäten](visual/maclock-glass-parity-checkpoints/protected-files.json) wurden für den finalen Stand erneut geprüft.
