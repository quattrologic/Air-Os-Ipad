# Widget 2.1 · echte Referenzvergleiche

Alle Anwendungsbilder sind echte Playwright-Screenshots der laufenden, paketierten PWA. Die Referenzausschnitte sind aus den ursprünglichen Nutzerbildern erhalten. Keine KI-generierten Oberflächen oder Mockups. Die finalen Aufnahmen verwenden **DPR 2**, die erste Iteration DPR 1. Die Vergleichspanels skalieren nur zur gemeinsamen Darstellung auf 650 Pixel.

| Aufnahme | Datei |
| --- | --- |
| Musik · Referenz und tatsächliches Ergebnis | [Vergleich](comparisons/music-final.png) · [Originalaufnahme](final/music.png) |
| Uhr · Referenz und tatsächliches Ergebnis | [Vergleich](comparisons/clock-final.png) · [Originalaufnahme](final/clock.png) |
| Bisheriger und kompakter Homescreen | [PR #8 gegenüber Widget 2.1](comparisons/home-before-after.png) |
| Homescreen im Querformat | [1180 × 820 CSS-Pixel](final/home-landscape.png) |
| Homescreen im Hochformat | [820 × 1180 CSS-Pixel](final/home-portrait.png) |
| Bearbeitungsmodus | [Verschiedene Kartengrößen](final/editor.png) |
| Echte andere Uhrzeit | [11:22 mit unverändertem Foto](final/clock-alternate-time.png) |
| Erste Vergleichsrunde | [Musik](comparisons/music-iteration-1.png) · [Uhr](comparisons/clock-iteration-1.png) |
| Vollständige Pixel-Differenzen | [Musik](comparisons/music-difference-diagnostic.png) · [Uhr](comparisons/clock-difference-diagnostic.png) |

In der zweiten Runde wurden Materialfarbe, Titelbreite, Transportgeometrie, Leistenbreite und die Vorbereitung des Uhrfotos nach dem direkten Vergleich korrigiert. Die endgültigen großen Karten messen 344 × 344 CSS-Pixel. Sie belegen nur rund 44 % der bisherigen Musik-Kartenfläche.

Die Musik-Landmarken (Cover, Titel, Künstler und Leiste) liegen im finalen DOM auf 650 Pixel normiert bei unter 0,2 Pixel Abweichung. Das ist **kein Nachweis vollständiger Pixelidentität**. Die offenen Schrift- und eigenen Symbolgeometrien, Rasterung und aufbereitete Fotodaten erzeugen Restunterschiede. Die ungeschönten Pixel-Differenzen und Fehlermaße stehen in [comparisons/report.json](comparisons/report.json).

Die aufgezeichnete Uhr verwendet echte Textziffern mit der aktuellen lokalen Testzeit und ein separat importiertes transparentes Motiv. Eine zusätzliche Aufnahme mit 11:22 zeigt den tatsächlichen Zeitwechsel. Das Vergleichsfoto und ein Hintergrund wurden aus der bereitgestellten Referenz vorbereitet und über die reguläre lokale Datei-API importiert. Beschriftungsbereiche wurden bei der Medienvorbereitung entfernt; die unveränderten Referenzausschnitte bleiben erhalten. Die Audiodatei ist ein synthetischer, tatsächlich abspielbarer 153-Sekunden-PCM-Track. Gedruckte Titel und Künstler stammen aus der Nutzerreferenz, nicht aus einem privaten Konto. Kein kommerzieller Stream wird behauptet.

Die Fotos, Referenzen und Messdateien sind Test-/Dokumentationsmaterial und werden nicht als Standardmedien des PWA-Runtimes ausgeliefert. Vorbereitungs- und Aufnahmeskripte sind im Repository enthalten. EXIF wurde aus den Referenzdateien entfernt.

## Prüfung

67 Node-Tests und die lokalen Chromium-Suiten werden im [Validierungsbericht](validation-summary.json) mit ihren tatsächlichen Ergebnissen aufgeführt. Die neue Referenzaufnahme gehört ebenfalls zur Chromium-/WebKit-CI-Matrix. Lokal fehlt das passende WebKit-Browserpaket; der Versuch, den offiziellen Playwright-Container zu beziehen, scheiterte mit `Forbidden`. Das wird getrennt von den GitHub-Ergebnissen ausgewiesen.

## Performance

Verglichen wurden das separat aufbewahrte **PR-8-Paket** und Widget 2.1 mit demselben Benchmark. Jedes Szenario führt vier Größenwechsel aus, beobachtet mindestens 1,8 Sekunden und wartet auf das Ende aller begonnenen Effekte. Rohdaten: [PR #8](performance-before/report.json) · [Widget 2.1](performance-after/report.json).

| Szenario | Resize-P95 PR #8 → Widget 2.1 | DOM-Mutationen PR #8 → Widget 2.1 |
| --- | --- | --- |
| 1180×820, Standard | 150 → 16.7 ms | 228 → 23 |
| 820×1180, Standard | 99.9 → 16.8 ms | 188 → 18 |
| 1180×820, Reduzierte Transparenz | 16.7 → 16.8 ms | 23 → 23 |
| 1180×820, reduzierte Bewegung | 33.3 → 16.7 ms | 111 → 23 |

Im abschließenden nacheinander ausgeführten Vergleich sank der Standard-P95 von 150 auf 16,7 ms im Querformat und von 99,9 auf 16,8 ms im Hochformat. Alle vier Größenaktionen wurden in jedem Szenario ausgeführt; nach dem Settlen blieben keine laufenden Widget-Effekte zurück. Die Display-Karten benötigen keine Wallpaper-Reprojektion mehr. Ein zusätzlicher Lauf unter paralleler Testlast erreichte 66,6 bzw. 99,9 ms: die Streuung ist erheblich. Kurze Headless-Stichproben sind keine statistische Geräteabnahme und keine Garantie für stabile 60 FPS; eine echte iPad-/Safari-Abnahme bleibt erforderlich.
