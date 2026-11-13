# Widget 2.1 · Reference display design

Basis: PR #8, `0c9e2594b231cb063e0559ce6d450499b78b2c6c`. Entwicklungsbranch: `feat/widgets-2-1-reference`. Ausschließlich Air-Os-Ipad wurde bearbeitet. Das getrennte Air-Os-Clean-Arbeitsverzeichnis wurde nur kontrolliert und ist unverändert. Kein Merge, Hosting oder Eingriff in Tailscale.

## Ergebnis und Größen

Die große Musik- und Foto-Uhr-Karte messen auf den geprüften iPads jeweils **220 × 220 CSS-Pixel**. Sie belegen rund 41 % der vorherigen 344 × 344-Pixel-Fläche (59 % weniger). Kleine Karten sind 106 × 106, mittlere 220 × 106 Pixel groß; unterhalb von 500 Pixeln passt sich das Raster auf zwei Spalten an. Auf iPads passen Musik und Uhr nebeneinander in die vorhandene Widget-Fläche.

Gespeicherte Reihenfolge und Größen in `widget-layout-v2` und die alte v1-Übernahme bleiben erhalten. Nur frische Profile bekommen standardmäßig beide Hauptkarten groß. Keine Datenbankschemaänderung, kein Zurücksetzen von Inhalten. Fenster, Dock, Ocean Blue, Lockscreen und Notch behalten ihre Gestaltung und ihre bisherigen Besitzer.

### Musik

Das Layout verwendet gemessene relative Koordinaten aus dem 650 × 650-Pixel-Ausschnitt der Nutzerreferenz: Cover links 18,46 %, oben 18,62 %, Breite/Höhe 62,92 %. Titel beginnt links bei 8,77 % und liegt über dem unteren Cover. Künstler, Leiste und Zeitangaben liegen ebenfalls vor dem Cover. Eine begrenzte Blur-Fläche und eine weiche untere Maske verbinden das Bild mit dem Material. Die dunkle Materialfarbe stammt aus einer einmaligen 8×8-Abtastung des vorhandenen Covers.

Transporttasten verwenden eigene gefüllte Air-OS-Geometrien. Play/Pause, Titelwechsel, Seek und Lautstärke steuern den originalen Air-Music-Owner. Songtextsymbol und Eintrag im bestehenden Musikmenü öffnen die Notch-Songtextansicht; ohne lokale LRC-Datei zeigt diese ihren echten Leerzustand. Musik-Symbol, Cover-Kurzbefehl und Bibliothekseintrag öffnen die Musikbibliothek. Favorit, Shuffle und Wiederholen sind über das Punktmenü erreichbar. Spotify bleibt eine lesende Projektion mit dem vorhandenen Link und erhält keine vorgetäuschten Remote-Controls.

Bei 220 Pixeln bleiben die sichtbaren Musik-Landmarken proportional: Cover, Titel über dem unteren Bild, Fortschrittsleiste und Uhrziffern. Die Punktmenütaste sitzt im Kopfbereich, damit sich alle 44-Pixel-Touchziele voneinander trennen. Der Cover-Kurzbefehl belegt den oberen Coverbereich; seine Beschriftung erscheint weiterhin an der Referenzposition. Die große Karte behält interaktives Seeking. In der mittleren Karte ist die Leiste eine echte Fortschrittsanzeige, Seeking bleibt im großen Widget und Air Music erreichbar. In der kleinen Karte bieten Play und das bestehende Menü jeweils mindestens 44 Pixel; Vor/Zurück und Songtext bleiben dort funktional über das Menü erreichbar. Die mittlere Karte stellt Cover und drei Transportziele nebeneinander dar. Die Bibliothek bleibt über den Cover-Kurzbefehl erreichbar. Lange Titel können innerhalb ihres Textbereichs gelesen werden und erhalten die vollständige zugängliche Beschriftung.

### Foto-Uhr

Die echte lokale Uhrzeit wird minutengenau über einem vorhandenen lokalen Foto dargestellt, mit großen transparenten Ziffern, Kontur und Schatten. Die offene Schrift **Barlow Condensed Light** ist lokal eingebettet; die OFL-Lizenz liegt im Runtime und ist in NOTICE vermerkt. Es werden keine proprietären Apple-Schriften übernommen.

Bei einem transparenten PNG-Motiv kann das Foto vor der Uhr liegen. Transparenz wird einmalig an einer kleinen lokalen Stichprobe erkannt. Optional kann ein gleichnamiges Hintergrundfoto importiert werden: `portrait.png` und `portrait-background.jpg`. Beide sind normale Dateien des vorhandenen lokalen Speichers. Die Fototaste wechselt verfügbare Motive beziehungsweise öffnet bei fehlenden Alternativen Fotos. Die Auswahl gilt für die Sitzung; eine zusätzliche Fotoauswahl-Speichermigration findet nicht statt.

Ohne importierte Fotos wird das vorhandene Air-OS-Landschaftsbild verwendet. Transparente Motive, Hintergründe und alte Crossfade-URLs werden beim Ausblenden beziehungsweise Sperren bereinigt. Die Referenzaufnahme mit **11:22** belegt separat, dass keine feste 10:09-Anzeige als Widget verwendet wird.

## Visueller Vergleich und Grenzen

[Galerie, Rohbilder und Vergleichsprotokoll](testing/widgets-2-1/README.md). Die unveränderten Referenzausschnitte stehen links, tatsächliche Playwright-Aufnahmen rechts. Die erste Iteration und der vorherige 344-Pixel-Stand bleiben erhalten; die aktuellen Aufnahmen unter `compact-220/` verwenden DPR 2. Skalierung auf 650 Pixel dient nur der Vergleichsdarstellung. Originalaufnahmen bleiben separat verfügbar.

Die historischen 344-Pixel-Landmarken lagen bei unter 0,2 Pixel Abweichung auf 650 Pixel normiert. Im aktuellen 220-Pixel-Stand bleiben die relativen Cover-, Titel-, Künstler- und Leistenpositionen erhalten; minimale Schriftgrößen und 44-Pixel-Touchziele haben Vorrang vor einer reinen Skalierung. Das bedeutet **keine vollständige Pixelidentität**: Die Ziffern verwenden eine offen lizenzierte andere Schrift, Symbole sind eigene Air-OS-Geometrien, Touch-Ziele sind mindestens 44 Pixel groß und die Testfotos wurden aus den bereitgestellten Referenzen vorbereitet. Rasterung, Bildvorbereitung und Farbverläufe erzeugen sichtbare Restunterschiede; vollständige Pixel-Differenzen werden ungeschönt mitgespeichert.

Die Medienvorbereitung erzeugt keine Oberfläche: Sie trennt Foto und eingebrannte Beschriftung. Beschriftungsbereiche im Albumcover werden aus benachbarten verschwommenen Bildpixeln geglättet; bei der Uhr werden Motiv und Hintergrund getrennt und die eingebrannte Uhr entfernt. Diese Bilddateien werden anschließend wie normale lokale Nutzermedien in die echte PWA importiert. Texte, Laufzeit, Fortschritt, Uhr und Controls werden durch die Anwendung erzeugt. Die Audiodatei ist ein synthetischer 153-Sekunden-PCM-Track mit der in der Referenz gedruckten Testmetadaten-Beschriftung; keine kommerzielle Aufnahme und kein echtes Konto werden verwendet. Referenzmedien werden nicht als PWA-Standardassets ausgeliefert. EXIF wird entfernt.

## Performance und gemeinsame Architektur

AIR FLOW bleibt der einzige Animationsbesitzer. Layoutwechsel verwenden FLIP ausschließlich für geänderte sichtbare Karten. Eine unterbrochene Bewegung wird vom tatsächlich sichtbaren Rechteck fortgesetzt. Unveränderte Kartennodes bleiben eingehängt. Reduzierte Bewegung und die bestehenden Qualitätsstufen bleiben wirksam.

Die neuen Display-Materialien markieren sich mit `data-widget-surface`. Der vorhandene Glasrenderer lässt nur diese Karten aus seiner Wallpaper-Reprojektion heraus. So werden beim Skalieren keine unnötigen Wallpaper-Offsets oder Glastexturen für die Karten nachberechnet. Andere Glasoberflächen bleiben unverändert. Die strenge Dateiprüfung pinnt die neuen genehmigten Renderer-Bytes; der vorherige Hash bleibt dokumentiert. CSP, OAuth, Datenbesitzer und Deployment-Skripte werden nicht geändert.

Der Benchmark vergleicht das gespeicherte **PR-8-Paket** mit dem neuen Paket. Pro Szenario werden vier Größenwechsel ausgeführt, mindestens 1,8 Sekunden beobachtet und alle begonnenen AIR-FLOW-Effekte abgewartet. Erfasst werden echte rAF-Abstände, Long Tasks, DOM-Mutationen und bereinigte Effekte. Die Ergebnisse sind kurze Headless-Laborstichproben, keine 60-FPS-Garantie und keine physische iPad-Abnahme.

## CI-Korrekturen

- PR #8, Chromium: Mehrdeutige Wiedergabe-/Pause-Auswahl wird auf `.s3-control-center` begrenzt. Beide realen Player bleiben erhalten.
- PR #8, WebKit: Die vorhandene strenge Fenster-Nachbarschaftsprüfung wartet auf das Ende der tatsächlichen AIR-FLOW-Animation. Der Geometrievergleich wird nicht gelockert.
- Die volle GUI-Suite wählt die Materialqualität gezielt nach dem enthaltenen Optionstext statt beliebige Settings-Selects anzusprechen.
- Touch-Abbruch und der native Genie-pagehide-Beleg werden bis zum tatsächlichen Eintreten abgewartet; Cleanup-Assertions bleiben erhalten.
- Ältere MacLock-/System-Szenen prüfen die vorhandene AIR-FLOW-Glasfläche, die geschlossene Pro Notch und tatsächlich sichtbare Transporttasten statt entfernte Vorgängerelemente vorauszusetzen. Die App-Öffnungsprüfung misst direkt die Keyframes des betroffenen Fensters und deren Icon-Proportionen; ein globaler „letzter Effekt“ kann durch parallele Coveranimationen überschrieben werden. Der Material-Select wird nach seinem Beschriftungsinhalt abgegrenzt; die Hintergrundprüfung erwartet das seit PR #7 vorhandene Ocean Blue.
- Die alten Albumcover-Materialtests wählen in ihrem isolierten Profil ausdrücklich Yosemite. Seit PR #7 behält Ocean Blue absichtlich den Wasserhintergrund statt ein Albumcover als Hintergrund zu setzen; die eigentliche Ocean-Funktion wird separat unverändert geprüft.
- PR #9, Chromium: Die Materialprüfung wartet nach einem Reload auf Hintergrund, Glasrenderer, AIR FLOW und Pro Notch. Ein früher verfügbares Hintergrundobjekt beweist noch nicht, dass alle nachfolgenden defer-Skripte initialisiert sind. Die eigentlichen Material-/Geometrieassertionen bleiben erhalten.
- PR #9, WebKit: Der Genie-Test hält die nativen Effekte direkt bei play/reverse an, bevor ein langsamer GTK-Touch-Dispatch die gesamte Animation beendet. Er misst weiterhin tatsächlich gerenderte Inhalte und beide Kanten bei unverändert 9 Pixel Toleranz.
- Die bestehende Economy-Stufe verwendet nun eine affine, beschnittene 2D-Streifenprojektion, weil WebKits Softwarepfad die projektive Perspektivdivision verliert. Die äußere Kurve stammt aus demselben Modell; die Textur innerhalb eines Streifens ist eine Näherung. Der volle Modus verwendet die mathematisch äquivalente gekippte CSS-Ebene. Zwei zusätzliche Geometrieprüfungen sichern Eckpunkte und Clipping ab. Anzahl der Streifen, Umkehr, Dock-Verankerung, AIR-FLOW-Ownership und Ressourcenlimits bleiben erhalten.
- Die Widget-Medienfixtures verwenden echte native Dateiimporte und isolierte persistente Profile. Native Import-IDs und Blob-Datensätze bleiben unangetastet; Titel und Cover werden über den bestehenden `trackmeta`-Besitzer gespeichert. Der Titelwechsel-Test meldete unter WebKit trotz lesbarer Bytes Decoderfehler. Die Fixtures verwenden echte Dateien auf dem Test-Dateisystem statt injizierte Speicher-File-Payloads; diese Dateien bleiben bis zum Schließen des Browserprofils erhalten. Im Fehlerfall protokolliert ein unabhängiges Audioelement die Decodierbarkeit desselben Blobs. Die Offline-Prüfungen schalten den tatsächlichen Loopback-Server ab. Es werden keine Netzwerkantworten als Offline-Erfolg vorgetäuscht.
- Die AIR-FLOW-Suite verwendet ihr bereits angelegtes isoliertes Profil auch beim Browserstart. Damit bleiben echte Foto-/Audio-Blobs in WebKit über den Reload verfügbar; der vorherige Start verwendete versehentlich den flüchtigen Speicher. Der Ocean-Test wartet vor seinem ersten Reload auf die vollständig installierte, kontrollierende Service-Worker-Generation und protokolliert bei Fehlern deren Zustand. Offline-Range- und Reload-Assertions bleiben unverändert.
- Der zusätzliche Decoder-Beleg isolierte den WebKit-Titelwechsel: Derselbe gespeicherte Blob lädt in einem neuen Audioelement mit 180 Sekunden, während der vorhandene Player beim Wechsel nach Seek `MEDIA_ERR_SRC_NOT_SUPPORTED` meldet. Der bestehende Musikbesitzer gibt dem Decoder eine eigene vollständige Blob-Ansicht (`slice`, einschließlich MIME-Typ), setzt die Ressourcenwahl mit `audio.load()` explizit zurück und gibt erst dann die vorherige URL frei. Die originale IndexedDB-Datei bleibt unverändert; ihre Bytes werden nicht vorab in ein zusätzliches JavaScript-Array kopiert. Die Sicherheitsprüfung vergleicht weiterhin den gesamten ursprünglichen Musik-/Timer-Code, ausschließlich mit diesem exakt deklarierten Delta; beide Präfix-Hashes bleiben dokumentiert.
- Die Material-Suite verwendet eine explizite isolierte generische Glasprobe für die bisherigen CSS-/Shader-Prüfungen, da Produkt-Widgets jetzt das angeforderte Display-Material besitzen. Originale Refraction-, Ressourcen- und GPU-Guard-Prüfungen bleiben bestehen.

Lokal stehen Node und Chromium zur Verfügung. Der zusätzliche Versuch, das offizielle Playwright-Containerpaket für WebKit zu beziehen, scheiterte mit `Forbidden`; das lokale WebKit-Browserpaket fehlt. Die bestehende GitHub-Matrix führt Chromium und WebKit aus. Lokale und CI-Ergebnisse werden getrennt ausgewiesen.

## Reproduktion

```sh
npm test
npm run build
npm run check
AIR_PAD_CHROMIUM=/usr/bin/chromium npm run test:widgets
AIR_PAD_CHROMIUM=/usr/bin/chromium node scripts/capture-ipad-widgets-21.cjs
python3 scripts/compare-widget-reference.py
AIR_PAD_CHROMIUM=/usr/bin/chromium npm run measure:widgets
```

`WIDGETS21_OUTPUT` wählt den Aufnahmeordner; `WIDGETS_SITE` ein separates geprüftes Benchmark-Paket, `WIDGETS_MEASURE_OUTPUT` den Messordner. Die bereits vorbereiteten Testmedien liegen in der Galerie. `prepare-widget-reference.py` dokumentiert die optionale Neuvorbereitung aus den zwei ursprünglichen Nutzer-JPEGs.

## Browser-Testport der Größenkorrektur

Widget-Suite und Referenzaufnahme verwenden in der Linux-CI WebKit/GTK unter Xvfb (wie die Genie-Abtastung). Der WPE-Headless-Port meldete beim Start oder Rückwechsel eines langen synthetischen PCM-WAV-Blobs intermittierend `MEDIA_ERR_SRC_NOT_SUPPORTED`, trotz lesbarer gespeicherter Bytes. Dieser WPE-Fehler bleibt dokumentiert und wird nicht als bestanden ausgegeben. GTK führt dieselben echten Wiedergabe-, Seek-, Touch-, Größen-, Lebenszyklus- und Offline-Assertions aus; Audio wird nicht gemockt. Der Bericht nennt den tatsächlichen Browser-Port. Die übrigen WebKit-Sicherheits-/GUI-Suiten bleiben im bisherigen Headless-Port. Das ist keine physische iPad-/Safari-Abnahme.

Die aktuelle Sicherheits-/Upgrade-Suite wartet bei der gehärteten Generation zusätzlich auf Notch, Widgets, Hintergrund und Glasrenderer. Ältere Kontrollgenerationen ohne `airSecurity` behalten ihren ursprünglichen Bereitschaftsvertrag. Damit werden nach einem tatsächlichen Reload keine nachfolgenden defer-APIs zu früh aufgerufen; die Upgrade-, Geometrie- und Datenassertions bleiben unverändert.

Vor Referenzaufnahmen wird die echte Wiedergabe pausiert und auf 1:42 gesetzt. Der Test wartet auf den abgeschlossenen Seek samt tatsächlicher Zeitanzeige, startet anschließend den vorhandenen Player wieder und prüft dessen Wiedergabezustand. Die Aufnahme kann währenddessen normal fortschreiten; kein Fortschritt oder Pausensymbol wird künstlich gesetzt.

Die Materialprüfung aktiviert nach Reloads ihre echte Browserseite, bevor sie auf sichtbare, ruhende Materialien wartet. Hintergrundseiten dürfen die produktiven Animationen pausieren; dies wird nicht durch künstliches Fertigstellen von Effekten umgangen. Im Fehlerbericht stehen Sichtbarkeit und Ressourcen-/Motion-Zustände zur Diagnose.
