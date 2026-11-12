# Widget 2.0 · echte Browser-Aufnahmen

Alle PNGs sind Playwright-Screenshots der laufenden, paketierten Air-OS-iPad-PWA mit Ocean Blue. Ausschließlich synthetische lokale Inhalte; kein Konto und keine privaten Gerätedaten. Vollständige Bildschirme werden unverändert gespeichert; Bild 02 ist der direkt gerenderte Ausschnitt des Musik-Widgets.

| Aufnahme | Inhalt |
| --- | --- |
| [01 · Homescreen](01-homescreen-landscape.png) | Vorhandener Desktop und Dock, großes Musik-Widget sowie Uhr, Kalender, Wetter, Batterie, Notizen und Erinnerungen; 1366×1024. |
| [02 · Musik](02-large-music.png) | Quadratisches synthetisches Cover, echte lokale Audio-Zeit und Transportsteuerung. |
| [03 · Informationen](03-clock-calendar-weather.png) | Alternative gespeicherte Anordnung mit großem Kalender und lokalen Testterminen, Uhr und ehrlichem Wetter-Leerzustand. |
| [04 · Hochformat](04-ipad-portrait.png) | 820×1180; zwei Spalten und scrollbar erreichbare weitere Widgets. |
| [05 · Querformat](05-ipad-landscape.png) | 1180×820; vier Spalten. |
| [06 · Bearbeitung](06-widget-editor.png) | Gewählte kleine, mittlere und große Karten sowie Griff, Reihenfolge- und Größentasten. |
| [07 · Gespeicherte Inhalte](07-notes-reminders-photos.png) | Lokaler Fotoimport, Notizen und interaktive Erinnerungen nach Scrollen. |

Erzeugung: `AIR_PAD_CHROMIUM=/usr/bin/chromium WIDGETS_CAPTURE=1 npm run test:widgets`. Ein separater isolierter Browserkontext prüft die Batterie-Ereignisse; die Screenshot-Kontexte zeigen bewusst den nicht verfügbaren Zustand. Datum/Uhr sind für die Inhalte auf 12.11.2026, 10:09 UTC fixiert; Native-Animationen laufen tatsächlich im Browser.

Die Aufnahmefläche ist die bestehende Widget-Fläche. Es gibt keinen zusätzlichen Vollbild-Displaymodus. Einige Widgets liegen je nach Ausrichtung unterhalb des sichtbaren Scrollausschnitts.

## Prüfergebnisse

66 Node-Tests bestanden. Chromium: 35 Widget-, 32 AIR-FLOW-, 54 Genie-, 55 Dock-Prüfungen (DPR 2), 71 Notch- und 50 Sicherheitsprüfungen bestanden, dazu die Ocean-Wallpaper-Suite. Build/Integritätsprüfung: 151 inventarisierte Runtime-Dateien. Audit der gelockten Testabhängigkeiten: 0 Schwachstellen. Einzelheiten und Screenshot-Hashes: [validation-summary.json](validation-summary.json), [Widget-Browserbericht](browser-report.json).

Lokal fehlt das Playwright-WebKit-Browserpaket (`webkit-2336/pw_run.sh`). Der Startversuch ist fehlgeschlagen; keine Safari-/WebKit-Abnahme wird behauptet. Die bestehende CI-Matrix enthält die Widget-Suite für Chromium und WebKit.

## Performance-Messung

Headless Chromium, Ocean Blue, vier programmatisch ausgelöste Größenwechsel je 1,8-Sekunden-Intervall. Der Benchmark erzeugt selbst einen rAF-Sampler; die Anwendung erhält keinen zusätzlichen Animationsloop. Einzelmessungen mit kurzen Stichproben, keine statistische Geräteabnahme. Die Daten vergleichen die erste Widget-2-Implementierung mit der anschließenden DOM-/FLIP-Optimierung, **nicht PR #7 mit diesem PR**.

| Szenario | Resize-Median vorher → nachher | Resize-P95 vorher → nachher | DOM-Mutationen vorher → nachher |
| --- | --- | --- | --- |
| 1180×820, Standard | 33.4 → 33.3 ms | 133.3 → 266.7 ms | 314 → 226 |
| 820×1180, Standard | 33.2 → 49.9 ms | 166.7 → 116.6 ms | 253 → 258 |
| 1180×820, Reduzierte Transparenz | 16.7 → 16.7 ms | 16.8 → 16.7 ms | 172 → 23 |
| 1180×820, reduzierte Bewegung | 16.7 → 16.7 ms | 16.8 → 16.7 ms | 260 → 111 |

Der Größenwechsel hängt keine unveränderten Kartennodes mehr neu ein; eine Browser-Regression prüft dies explizit. Auch unveränderte sichtbare Karten erhalten keine FLIP-Animation. Bei reduzierter Transparenz sinken die beobachteten DOM-Mutationen von 172 auf 23. Die Bildratenmessung im Standardmodus zeigt weiterhin deutliche Ausreißer und keinen allgemeinen FPS-Gewinn: P95 bis 266,7 ms, im Querformat sogar höher als im ersten Lauf. Eine stabile 60-FPS-Behauptung wäre damit nicht belegt. Weitere Optimierung großer Glasflächen und eine echte iPad-Abnahme bleiben offen.

Im finalen Idle-Intervall: Median 16,7 ms, keine verbleibende Widget-Animation und keine Long Tasks; normalerweise 0 Widget-Mutationen. Im Lauf mit reduzierter Bewegung traf das Messfenster eine reguläre Minutenaktualisierung (16 Mutationen). Reduzierte Transparenz und reduzierte Bewegung hatten beim Größenwechsel P95 von jeweils 16,7 ms. Diese Laborwerte sind keine Garantie für iPads.

Rohdaten: [vor Layout-Optimierung](performance-before-report.json), [nach Layout-Optimierung](performance-report.json). Der bestehende sparsame Materialmodus ist unter Einstellungen → Darstellung verfügbar. Widget-Stapel und eine externe Wetterquelle sind weiterhin offen.
