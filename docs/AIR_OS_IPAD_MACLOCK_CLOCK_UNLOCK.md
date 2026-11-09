# MacLock — kleinere Uhr und freie Entsperraktion

Branch `feat/air-os-ipad-liquid-glass-maclock`, Ausgangsstand `e03cd791ee6caaee8f5861b5f38e4ec028a7002f`. Gezielte Folgekorrektur anhand des vom Nutzer bereitgestellten ursprünglichen MacShell-Lockscreen-Screenshots.

Die Uhr verwendet wieder die frühere MacShell-Proportion `clamp(58px,8dvh,100px)`: etwa 75px statt 106px bei 1688×938. Schlichte weiße Regular-Schrift, Datum unmittelbar darüber, beide oben mittig. Die bisherige größere Variante und ihre Overrides für kurze Fenster sind entfernt. Keine Glas-/Shaderbehandlung der Uhr.

Das bestehende runde Avatar und der Benutzername bleiben erhalten. „Air-OS öffnen“ steht als freie Textaktion darunter: kein Hintergrund, Rahmen, Schatten, Verlauf oder Materiallayer. Die semantische Schaltfläche mit bestehender ID und bestehendem Handler bleibt für Barrierefreiheit erhalten; ihre unsichtbare Zielfläche misst 160×44px. Enter, Leertaste und Touch entsperren dieselbe lokale Sitzung. Ein 2px-Fokusrahmen erscheint ausschließlich bei Tastaturbedienung. Hover hellt nur den Text leicht auf, Druck senkt kurz dessen Deckkraft; Reduced Motion deaktiviert die Transition. Der zusätzliche Erklärungshinweis unter der Aktion entfällt.

`#unlock` ist aus der Auswahl des bestehenden Materialrenderers entfernt. Die Musik- und Benachrichtigungskarten verwenden unverändert ihre bisherigen Materialien. Keine zusätzliche Login- oder Audioengine, kein Passwortfeld, keine native iPadOS-Authentifizierung.

## Erhalten

Alle vier Pro-Notch-Dateien, Yosemite, Albumcover-/Musikpanelregeln, Benachrichtigungen, Musik-/Spotify-Metadatencontroller, Datenspeicher und 25 Apps bleiben unverändert. Nur Präsentations-CSS, Lock-Markup und die Materialzuordnung dieser einen Aktion ändern sich; der Build erneuert regulär die Service-Worker-Assetversion ohne Logik- oder Schemaänderung.

## Prüfungen und Aufnahmen

Lokal 52/52 bestehende Node-Tests und 39/39 gezielte Chromium-Prüfungen bestanden. Funktionale Fälle prüfen unsichtbare Touchfläche, tatsächliche Entsperrung per Enter/Leertaste/Pointer, Tastaturfokus, Musiktransport, letzte Metadaten, Backup/Restore, Offline-Neustart und sichere Updates; vorhandene Prüfungen für Notch, Dock und mehrere Viewports bleiben erhalten. Das geprüfte PWA-Paket enthält weiterhin 140 Runtime-Dateien.

Die Aufnahmehilfe wartet jetzt zusätzlich auf zwei Renderframes und den sichtbaren, vollständig eingeblendeten Lock-Vordergrund; nach Pause wartet sie auf den tatsächlich aktualisierten Medienzustand der Oberfläche. Keine versteckten UI-Elemente und keine nachträgliche Bildbearbeitung.

## Gesicherter Abschluss

Produktcommit `3c3d25dfe5a63c2ffb8c75c3bd7909577868784b`, Evidenzcommit `b84735c045179cff07bce863657ee91bab92084c`. [CI-Lauf 42457863494](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42457863494) vollständig erfolgreich: Audit, 52/52 Node-Tests in beiden Jobs und **1.112/1.112 Browserassertionen**. Die [24 unveränderten Browserreports](visual/ipad-liquid-maclock/3c3d25dfe5a63c2ffb8c75c3bd7909577868784b/evidence.json) enthalten vier gezielte MacLock-Läufe mit jeweils 39 Prüfungen, Chromium/WebKit normal und DPR2, sowie bestehende Notch-, Material-, App-, Root-/Unterpfad-, Offline-, Backup- und Update/Recovery-Prüfungen. Keine fehlgeschlagenen Reports.

Echte, unbeschnittene WebKit-Vollaufnahmen, jeweils 1688×938:

* [Lockscreen mit Musik](visual/ipad-liquid-maclock/3c3d25dfe5a63c2ffb8c75c3bd7909577868784b/liquid-webkit/polish-lockscreen-music.png).
* [Lockscreen ohne Musik](visual/ipad-liquid-maclock/3c3d25dfe5a63c2ffb8c75c3bd7909577868784b/liquid-webkit/lockscreen-empty.png).

Die komplette Galerie enthält zusätzlich Hochformat, Dock und Apps aus den bestehenden Prüfpfaden. Testuhr reproduzierbar 7. November 2026, 12:00; Cover und 8s-PCM-Musik sind ausdrücklich synthetische Testdateien im echten vorhandenen Audiotransport. Keine Collage, kein Ausschnitt, keine Nachbearbeitung. Die Sichtprüfung bestätigt die kleinere Uhr, die freie Textaktion und unveränderte Medienkarte; keine behauptete pixelidentische native Portierung.

Das [versionierte PWA-Artefakt](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42457863494#artifacts) heißt `Air-OS-iPad-Liquid-MacLock-Build-3c3d25dfe5a63c2ffb8c75c3bd7909577868784b` und enthält ZIP, SHA-256 sowie die bestehenden separaten Recovery-/Preflight-Pakete. `BUILD-INFO.json` nennt Produktcommit und Runtime-Hashinventur; Lizenz-/Sourcepaket bleiben enthalten.

Physisches iPad/Safari und Hardware-GPU bleiben offen. Keine private Installation, Tailscale-Adresse oder Windows-Serve-Datei verändert. Keine Zusammenführung in einen anderen Branch, kein Deployment.
