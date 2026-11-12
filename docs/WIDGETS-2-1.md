# Widget 2.1 · Reference display design

Basis: PR #8, `0c9e2594b231cb063e0559ce6d450499b78b2c6c`. Entwicklungsbranch: `feat/widgets-2-1-reference`. Ausschließlich Air-Os-Ipad wurde bearbeitet. Das getrennte Air-Os-Clean-Arbeitsverzeichnis wurde nur kontrolliert und ist unverändert. Kein Merge, Hosting oder Eingriff in Tailscale.

## Ergebnis und Größen

Die große Musik- und Foto-Uhr-Karte messen auf den geprüften iPads jeweils **344 × 344 CSS-Pixel**. Die Musik-Karte belegt damit rund 44 % der Fläche ihrer bisherigen 498 × 544-Pixel-Darstellung. Kleine Karten sind 166 × 166, mittlere 344 × 166 Pixel groß; unterhalb von 660 Pixeln passt sich das Raster auf zwei Spalten an. Auf iPads passen Musik und Uhr nebeneinander in die vorhandene Widget-Fläche.

Gespeicherte Reihenfolge und Größen in `widget-layout-v2` und die alte v1-Übernahme bleiben erhalten. Nur frische Profile bekommen standardmäßig beide Hauptkarten groß. Keine Datenbankschemaänderung, kein Zurücksetzen von Inhalten. Fenster, Dock, Ocean Blue, Lockscreen und Notch behalten ihre Gestaltung und ihre bisherigen Besitzer.

### Musik

Das Layout verwendet gemessene relative Koordinaten aus dem 650 × 650-Pixel-Ausschnitt der Nutzerreferenz: Cover links 18,46 %, oben 18,62 %, Breite/Höhe 62,92 %. Titel beginnt links bei 8,77 % und liegt über dem unteren Cover. Künstler, Leiste und Zeitangaben liegen ebenfalls vor dem Cover. Eine begrenzte Blur-Fläche und eine weiche untere Maske verbinden das Bild mit dem Material. Die dunkle Materialfarbe stammt aus einer einmaligen 8×8-Abtastung des vorhandenen Covers.

Transporttasten verwenden eigene gefüllte Air-OS-Geometrien. Play/Pause, Titelwechsel, Seek und Lautstärke steuern den originalen Air-Music-Owner. Das Songtextsymbol öffnet die bestehende Notch-Songtextansicht; ohne lokale LRC-Datei zeigt diese ihren echten Leerzustand. Das rechte Listensymbol und der Titel öffnen die Musikbibliothek. Favorit, Shuffle und Wiederholen sind über das Punktmenü erreichbar. Spotify bleibt eine lesende Projektion mit dem vorhandenen Link und erhält keine vorgetäuschten Remote-Controls.

In der kleinen Karte bleiben drei echte 44-Pixel-Transportziele erhalten; Leiste und sekundäre Aktionen entfallen bewusst. Die mittlere Karte stellt Cover und Transport nebeneinander dar. In allen Größen bleibt die Bibliothek über den Titel erreichbar. Lange Titel können innerhalb ihres Textbereichs gelesen werden und erhalten die vollständige zugängliche Beschriftung.

### Foto-Uhr

Die echte lokale Uhrzeit wird minutengenau über einem vorhandenen lokalen Foto dargestellt, mit großen transparenten Ziffern, Kontur und Schatten. Die offene Schrift **Barlow Condensed Light** ist lokal eingebettet; die OFL-Lizenz liegt im Runtime und ist in NOTICE vermerkt. Es werden keine proprietären Apple-Schriften übernommen.

Bei einem transparenten PNG-Motiv kann das Foto vor der Uhr liegen. Transparenz wird einmalig an einer kleinen lokalen Stichprobe erkannt. Optional kann ein gleichnamiges Hintergrundfoto importiert werden: `portrait.png` und `portrait-background.jpg`. Beide sind normale Dateien des vorhandenen lokalen Speichers. Die Fototaste wechselt verfügbare Motive beziehungsweise öffnet bei fehlenden Alternativen Fotos. Die Auswahl gilt für die Sitzung; eine zusätzliche Fotoauswahl-Speichermigration findet nicht statt.

Ohne importierte Fotos wird das vorhandene Air-OS-Landschaftsbild verwendet. Transparente Motive, Hintergründe und alte Crossfade-URLs werden beim Ausblenden beziehungsweise Sperren bereinigt. Die Referenzaufnahme mit **11:22** belegt separat, dass keine feste 10:09-Anzeige als Widget verwendet wird.

## Visueller Vergleich und Grenzen

[Galerie, Rohbilder und Vergleichsprotokoll](testing/widgets-2-1/README.md). Die unveränderten Referenzausschnitte stehen links, tatsächliche Playwright-Aufnahmen rechts. Die erste Iteration bleibt erhalten; die finale Aufnahme verwendet DPR 2. Skalierung auf 650 Pixel dient nur der Vergleichsdarstellung. Originalaufnahmen bleiben separat verfügbar.

Die gemessenen Musik-Landmarken liegen im finalen DOM bei unter 0,2 Pixel Abweichung auf 650 Pixel normiert. Das bedeutet **keine vollständige Pixelidentität**: Die Ziffern verwenden eine offen lizenzierte andere Schrift, Symbole sind eigene Air-OS-Geometrien, Touch-Ziele sind mindestens 44 Pixel groß und die Testfotos wurden aus den bereitgestellten Referenzen vorbereitet. Rasterung, Bildvorbereitung und Farbverläufe erzeugen sichtbare Restunterschiede; vollständige Pixel-Differenzen werden ungeschönt mitgespeichert.

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
