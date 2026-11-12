# Air-OS iPad · Widget 2.0

Basis: PR #7, `feat/ocean-live-wallpaper`, Commit `fa79027f3aa436619bbeed8efcc0ca1345481e4d`. Dieser Branch baut auf Ocean Blue, Classic Genie und AIR FLOW auf. Kein Merge, kein Hosting und keine Änderung der privaten Tailscale-Konfiguration oder des PC-Repositories.

## Gestaltung und Bedienung

Die beiden vom Auftraggeber gelieferten Smart-Display-Bilder sind die visuelle Orientierung: quadratisches, dominantes Cover, großzügige Typografie, eine breite Zeitleiste, große Transporttasten und zusammenhängende, runde Karten. Die bestehenden Air-OS-Glasmaterialien und eigenen Icons bleiben erhalten. Die Musik-Karte besitzt einen aus dem validierten lokalen Cover abgeleiteten Farbton; eine kleine 8×8-Abtastung erfolgt nur bei geändertem Cover. Für nicht lokal abtastbare Cover bleibt das neutrale Material erhalten.

Abweichungen zur Referenz: Die Karten liegen im vorhandenen Desktop und passen in dessen Raster. Das Cover bleibt vollständig sichtbar; Titel und Steuerung liegen darunter. Kein Gerätegehäuse, keine fremden Cover, kein zusätzlicher Vollbildmodus, keine dekorativen AirPlay-/Lyrics-Tasten ohne Funktion. DiPlay wurde als öffentliche Informations-/Bedienreferenz gelesen; Android-/CarPlay-Code, Identitäten, Binärdateien und Assets wurden nicht übernommen.

Über **Widgets anpassen** lassen sich Karten am Griff ziehen oder mit den Pfeilen versetzen. **↔** wechselt Klein → Mittel → Groß → Klein. Die eingeblendete Größenbezeichnung zeigt den aktuellen Zustand. Tastaturbedienung ist über die normalen Buttons möglich. Im Querformat verwendet die Fläche vier Spalten, auf schmaleren iPads zwei; weitere Karten sind innerhalb der bestehenden Widget-Fläche scrollbar. Größen und Raster-Reihenfolge bestimmen die Position, keine festen Bildschirmkoordinaten. Der Bearbeitungsmodus erhält die tatsächlichen Kartengrößen.

## Daten und echte Funktionen

| Widget | Quelle und Funktionen |
| --- | --- |
| Musik | `airPlaybackMetadata` und der originale Air-Music-/Audio-Owner; Play/Pause, vor/zurück, Seek mit echten Zeitangaben, Favorit, Lautstärke und Bibliothek. Seek/Favorit setzen einen tatsächlich aktiven lokalen Titel voraus. Spotify bleibt die autorisierte, lesende Projektion mit echtem Link zur Spotify-App; keine erfundenen Remote-Steuerungen. |
| Uhr | Gerätezeit und Datum; stabile tabellarische Ziffern, minutengenau aktualisiert. |
| Kalender | Bestehende lokale `event`-Datensätze; Monatsraster, Markierung von Tagen mit Ereignissen, kommende Termine bei mittlerer/großer Karte, Öffnen der vorhandenen Kalender-App. |
| Erinnerungen | Originale `reminder`-Datensätze; Zahl offener Aufgaben, direkte Erledigung mit bestehender Revisions-/Konfliktprüfung. |
| Notizen | Gespeicherte `note`-Datensätze; Vorschau und Öffnen des genauen Eintrags im vorhandenen Editor. |
| Fotos | Lokal gespeicherte, nicht gelöschte PNG/JPEG/WebP/GIF-Dateien aus dem vorhandenen Dateisystem. Nächstes Foto mit endlichem Crossfade; keine externen Bilddienste. |
| Wetter | Es existiert keine angebundene Wetterquelle: ausdrücklich leerer Zustand, keine erfundenen Temperaturen. |
| Batterie | Nur `navigator.getBattery()`, falls verfügbar und erfolgreich. Ereignisbasierte Aktualisierung; ansonsten verständlicher leerer Zustand. Insbesondere iPad Safari stellt diese API üblicherweise nicht bereit. |

Keine Datenbankschemaänderung. `widget-layout-v1` wird ausschließlich gelesen, nicht überschrieben: `small` bleibt klein, `wide` wird mittel. Fehlende neue Widgets werden ergänzt, vorhandene Reihenfolge bleibt erhalten. Erst eine bewusste Layoutänderung schreibt den neuen Eintrag `widget-layout-v2`. Notizen, Musik, Termine und Aufgaben werden nicht migriert oder zurückgesetzt. Einstellungen werden seriell gespeichert, damit rasche Änderungen ihre Reihenfolge behalten.

## Motion, Lebenszyklus und Grenzen

AIR FLOW besitzt weiterhin die Animationen: FLIP ausschließlich für tatsächlich geänderte, sichtbare Karten bei Größen-/Reihenfolgeänderungen, vorhandene Artwork-Crossfades, finite Content-Übergänge und Touch Light. Die Fortschrittsfüllung verwendet `transform: scaleX` statt eines eigenen JS-Animationsloops. OS- und gespeicherte reduzierte Bewegung werden respektiert. Keine fortlaufend animierten Blur-Filter.

Musikansicht und Fotoansicht beobachten ihre Sichtbarkeit innerhalb der Widget-Fläche. Außerhalb werden Musikdarstellungs-Updates übersprungen und Foto-URLs freigegeben. Bei Sperre, ausgeblendeter Seite, App-Vollbild oder Seitenende werden Widget-Arbeiten pausiert bzw. Ressourcen bereinigt. Foto-Decode und alte Crossfade-URLs können nach einer Sperre keine veraltete Ansicht nachladen. Beim Größenwechsel bleiben die vorhandenen Kartennodes eingehängt. Auch beim Umordnen werden nur notwendige DOM-Bewegungen ausgeführt; unveränderte Karten erhalten keine Animation. Dateien werden nur bei Dateiänderungen erneut aus dem Store gelesen. Der verbleibende Widget-Timer ist an die nächste volle Minute ausgerichtet; Batterie und Musik erhalten vorhandene Datenereignisse.

Die existierenden Qualitätsstufen `Standard`/`Hochwertig`/`Reduzierte Transparenz` und AIR FLOW economy/full bleiben maßgeblich. Auf echten iPads ist weiterhin eine Geräteabnahme erforderlich. iOS kann Lautstärke über die Hardware steuern und programmgesteuerte Lautstärkeänderungen beschränken. Foto-Wechsel erfolgt bewusst über die Taste statt eines permanenten Diashow-Timers. Widget-Stapel sind nicht implementiert; sie waren optional. Eine Live-Wetteranbindung ist weiterhin offen.

## Reproduzierbare Prüfung

```sh
npm test
npm run build
npm run check
AIR_PAD_CHROMIUM=/usr/bin/chromium npm run test:widgets
AIR_PAD_CHROMIUM=/usr/bin/chromium WIDGETS_CAPTURE=1 npm run test:widgets
AIR_PAD_CHROMIUM=/usr/bin/chromium npm run measure:widgets
```

Für WebKit: `AIR_PAD_ENGINE=webkit npm run test:widgets` mit dem zum Playwright-Lock passenden Browserpaket. Die bestehende Chromium-/WebKit-CI-Matrix enthält die neue Suite. Der lokale WebKit-Start wurde versucht und scheiterte am fehlenden `webkit-2336/pw_run.sh`. Das ist kein WebKit- oder Safari-Pass. Kein physisches iPad war angeschlossen.

Die neue Browser-Suite prüft die echte paketierte PWA, echte synthetische Audio-Blobs, Seek/Transport/Favorit, beide Batterie-Verfügbarkeitsfälle, Fotos, Notiz-Schnellzugriff, Erinnerungen, gespeichertes Layout, Altformat-Übernahme, Pointer Capture, echte Chromium-Toucheingabe und Abbruch, reduzierte Bewegung, fünf iPad-Auflösungen, Sperren und Service-Worker-Offlineneustart. Regressionsprüfungen für AIR FLOW/Genie/Dock/Notch/Ocean/Sicherheit bleiben separat.

Die Sicherheits-Bildpaarprüfung wählt über die vorhandene API Yosemite, damit beide Vergleichsstände denselben statischen Hintergrund besitzen. Die Forderung nach identischen aufeinanderfolgenden Vollbildern wäre mit dem neuen laufenden Ocean-Video nicht sinnvoll. Die Notch-Suite verwendet ebenfalls das feste, geprüfte Paket über den vorhandenen Secure-Server statt parallel veränderbarer Quelldateien. Keine Pixelprüfung wurde entfernt; Ocean-Wiedergabe und Offline-Bytebereiche werden durch die eigene Wallpaper-Suite geprüft.

Neue Runtime-Dateien stehen in der bestehenden Allowlist; Build, SRI, Offline-Inventar und entsprechendes Quellcodeangebot werden unverändert vom bestehenden Builder erzeugt. Root-`.gitattributes` ergänzt LF für `.cjs` und bleibt außerhalb des PWA-Runtimes.

## Echte Screenshots und Ergebnisse

Alle Aufnahmen stammen aus Chromium und der tatsächlich gerenderten Anwendung mit synthetischen Musik-/Kalender-/Notiz-/Aufgabendaten. Das Testcover wird deterministisch im Test erzeugt und als echter Track importiert. Foto-Fixtures importieren ausschließlich die bereits öffentlichen Landschaftsassets des Repositories, keine privaten Bilder. Die Battery API ist im Aufnahmeprofil absichtlich als nicht verfügbar definiert; Verfügbarkeit und Live-Ereignisse werden separat mit synthetischen API-Daten geprüft. Screenshots sind keine Mockups.

Siehe [Prüfprotokoll und Bilder](testing/widgets-2/README.md), Browser-Report und Performance-Report in diesem Verzeichnis. Messungen sind Laborwerte aus Headless Chromium mit Ocean Blue, ein diagnostischer Vergleich der ersten Widget-2-Implementierung mit ihrer Layout-Optimierung und keine 60-FPS-Garantie. Ein Vergleich mit PR #7 wurde nicht gemessen.

## Geänderte Dateien

| Bereich | Dateien |
| --- | --- |
| Widget-Runtime | `ipad/widgets.js`, `ipad/widgets-2.css`, `ipad/core/widget-layout.js` |
| Einbindung/Offline | `ipad/index.html` (nur Head), generierte `ipad/sw.js`/`ipad/version.json`, `build/ipad-runtime-assets.json` |
| Tests/Messung | `tests/ipad-widgets-2.test.cjs`, `scripts/lib/widget-fixture.cjs`, `scripts/test-ipad-widgets-2.cjs`, `scripts/measure-ipad-widgets-2.cjs`; bestehende AIR-FLOW-, Notch- und Sicherheits-Testharnesses |
| Werkzeug/Quellcode | `package.json`, `scripts/write-ipad-source.cjs`, `.gitattributes`, `.github/workflows/ipad-security-browser.yml` |
| Dokumentation/Belege | Dieses Dokument und `docs/testing/widgets-2/` mit sieben Screenshots, Browser-, Performance- und Validierungsberichten |
