# Widget 2.1 · echte Referenzvergleiche

Alle Anwendungsbilder sind echte Playwright-Screenshots der laufenden, paketierten PWA. Die Referenzausschnitte sind aus den ursprünglichen Nutzerbildern erhalten. Keine KI-generierten Oberflächen oder Mockups. Die finalen Aufnahmen verwenden **DPR 2**, die erste Iteration DPR 1. Die Vergleichspanels skalieren nur zur gemeinsamen Darstellung auf 650 Pixel.

## Aktueller kompakter Stand

Musik und Foto-Uhr messen **220 × 220 CSS-Pixel**, kleine Widgets 106 × 106, mittlere 220 × 106 Pixel. Die große Kartenfläche sinkt gegenüber 344 × 344 um rund 59 %. Rasterabstand: 8 Pixel. Vorherige Bilder und Messungen bleiben als historische Belege erhalten. Alle sichtbaren Musikaktionen besitzen weiterhin mindestens 44 × 44 Pixel große, voneinander getrennte Touchziele; Die große Karte behält alle fünf unteren Musiksymbole; kleine Karten bieten Zusatzaktionen im vorhandenen Musikmenü.

| Neue Aufnahme | Datei |
| --- | --- |
| Kleines Musik-Widget | [220 Pixel](compact-220/music.png) |
| Kleine Foto-Uhr | [220 Pixel](compact-220/clock.png) |
| Gesamter Homescreen | [Querformat](compact-220/home-landscape.png) · [Hochformat](compact-220/home-portrait.png) |
| Bearbeitungsmodus | [Drei Größen](compact-220/editor.png) |
| Referenzen | [Musik](comparisons/music-compact-220.png) · [Uhr](comparisons/clock-compact-220.png) |
| Größenkorrektur | [344 → 220 Pixel](comparisons/size-before-after.png) |

Die neue Widget-Suite läuft in der offiziellen Linux-CI unter WebKit/GTK mit Xvfb und unveränderten Wiedergabe-Assertions. Der intermittierende WPE-Headless-Decoderfehler beim Wiederverwenden langer PCM-Testdateien ist als Portgrenze dokumentiert; Referenzaufnahme und weitere WebKit-Suiten bleiben headless. Kein physischer iPad-Pass wird behauptet.

## Vorheriger 344-Pixel-Stand

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

In der zweiten Runde wurden Materialfarbe, Titelbreite, Transportgeometrie, Leistenbreite und die Vorbereitung des Uhrfotos nach dem direkten Vergleich korrigiert. Die vorherigen großen Karten maßen 344 × 344 CSS-Pixel. Sie belegen nur rund 44 % der bisherigen Musik-Kartenfläche.

Die Musik-Landmarken (Cover, Titel, Künstler und Leiste) liegen im finalen DOM auf 650 Pixel normiert bei unter 0,2 Pixel Abweichung. Das ist **kein Nachweis vollständiger Pixelidentität**. Die offenen Schrift- und eigenen Symbolgeometrien, Rasterung und aufbereitete Fotodaten erzeugen Restunterschiede. Die ungeschönten Pixel-Differenzen und Fehlermaße stehen in [comparisons/report.json](comparisons/report.json).

Die aufgezeichnete Uhr verwendet echte Textziffern mit der aktuellen lokalen Testzeit und ein separat importiertes transparentes Motiv. Eine zusätzliche Aufnahme mit 11:22 zeigt den tatsächlichen Zeitwechsel. Das Vergleichsfoto und ein Hintergrund wurden aus der bereitgestellten Referenz vorbereitet und über die reguläre lokale Datei-API importiert. Beschriftungsbereiche wurden bei der Medienvorbereitung entfernt; die unveränderten Referenzausschnitte bleiben erhalten. Die Audiodatei ist ein synthetischer, tatsächlich abspielbarer 153-Sekunden-PCM-Track. Gedruckte Titel und Künstler stammen aus der Nutzerreferenz, nicht aus einem privaten Konto. Kein kommerzieller Stream wird behauptet.

Die Fotos, Referenzen und Messdateien sind Test-/Dokumentationsmaterial und werden nicht als Standardmedien des PWA-Runtimes ausgeliefert. Vorbereitungs- und Aufnahmeskripte sind im Repository enthalten. EXIF wurde aus den Referenzdateien entfernt.

## Prüfung

69 Node-Tests und die lokalen Chromium-Suiten werden im [Validierungsbericht](validation-summary.json) mit ihren tatsächlichen Ergebnissen aufgeführt. Die neue Referenzaufnahme gehört ebenfalls zur Chromium-/WebKit-CI-Matrix. Lokal fehlt das passende WebKit-Browserpaket; der Versuch, den offiziellen Playwright-Container zu beziehen, scheiterte mit `Forbidden`. Das wird getrennt von den GitHub-Ergebnissen ausgewiesen.

## Performance

Verglichen wurden das separat aufbewahrte **PR-8-Paket** und Widget 2.1 mit demselben Benchmark. Jedes Szenario führt vier Größenwechsel aus, beobachtet mindestens 1,8 Sekunden und wartet auf das Ende aller begonnenen Effekte. Rohdaten: [PR #8](performance-before/report.json) · [Widget 2.1](performance-after/report.json).

| Szenario | Resize-P95 PR #8 → Widget 2.1 | DOM-Mutationen PR #8 → Widget 2.1 |
| --- | --- | --- |
| 1180×820, Standard | 133.3 → 16.7 ms | 277 → 23 |
| 820×1180, Standard | 83.4 → 16.8 ms | 163 → 18 |
| 1180×820, Reduzierte Transparenz | 16.8 → 16.7 ms | 23 → 23 |
| 1180×820, reduzierte Bewegung | 16.8 → 16.7 ms | 111 → 23 |

Die Wiederholungsmessung mit isolierten persistenten Profilen und echten Dateiimporten bestätigt die Verbesserung: Standard-P95 133,3 → 16,7 ms im Querformat und 83,4 → 16,8 ms im Hochformat. Die [vorherige Messung](performance-prior/before.json) und ihr [Ergebnis](performance-prior/after.json) bleiben erhalten. Alle vier Größenaktionen wurden in jedem Szenario ausgeführt; nach dem Settlen blieben keine laufenden Widget-Effekte zurück. Die Display-Karten benötigen keine Wallpaper-Reprojektion mehr. Ein Lauf unter paralleler Testlast erreichte 66,6 bzw. 99,9 ms: die Streuung ist erheblich. Kurze Headless-Stichproben sind keine Geräteabnahme und keine Garantie für stabile 60 FPS; eine echte iPad-/Safari-Abnahme bleibt erforderlich.

## Genie und Browsergrenzen

Die tatsächliche Fensterverformung wird in Chromium und in WebKit/GTK unter Xvfb erfasst. Die bestehende Economy-Stufe verwendet eine ausdrücklich ausgewiesene affine, beschnittene Streifenprojektion. Ihre Kontur folgt derselben Kurvenformel; die Textur ist innerhalb jedes Streifens eine günstigere Näherung. Der volle Modus bleibt projektiv. Beide Modi verwenden denselben AIR-FLOW-Besitzer, dieselben Ressourcenlimits und echte Fensterinhalte. Geprüft werden beide Konturkanten mit unveränderter 9-Pixel-Grenze, Umkehr, Dock-Ziel und Bereinigung. Die Tests halten native Effekte beim Start an, damit die Abtastung nicht vom Tempo der Touch-Auslieferung abhängt. Die Produktion pausiert diese Animationen nicht.

Der letzte CI-Status ist im bestehenden [PR #9](https://github.com/quattrologic/Air-Os-Ipad/pull/9) verlinkt; der lokale Bericht ersetzt keine erfolgreiche GitHub-Matrix.
