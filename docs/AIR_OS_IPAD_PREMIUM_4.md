# Air-OS iPad Premium 4 – Implementierung und visuelle Abnahme

Stand: 6. November 2026. Entwicklungsbranch: `feat/air-os-ipad-premium-4`.

**Produktcommit:** `07666db83bc821441c57a03b01a10715de8d88f2`.
**Exakte Ausgangsbasis:** `75d5263f7597263d14632d6da471ca6718571c72`.
**Vorheriger geprüfter Produktcommit:** `9825478143f4fdc853ce5f3b558a85bb9b94d8be`.

Der zuvor bereits vollständig geprüfte Zwischenstand `bb9a25728b08d2765c711931336195111a33d2a8` bleibt über [CI 42252410799](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42252410799) nachvollziehbar; der oben genannte endgültige Produktcommit ergänzt die letzte WebKit-Korrektur.

Es wurde Code implementiert und auf einem neuen Entwicklungsbranch gepusht. Eine 10/10-Bewertung wird nicht behauptet. Die Screenshots belegen die Änderungen; die verbliebenen Unterschiede zu nativen Referenzen und zur Geräteabnahme sind unten ausdrücklich benannt.

## Was sich sichtbar geändert hat

- **Fenster und Apps:** einheitliches helles Chrome, neutrale Seitenleisten, flache Werkzeugleisten und gemeinsame Text-/Abstandshierarchie. Die vorhandenen App-Controller bleiben erhalten.
- **Finder:** Navigation links, zusammengeführte Werkzeuge und Ansichtsauswahl, Spaltenkopf, wachsende Dateiliste und Objektstatus. Export einer ausgewählten Datei steht jetzt oben bei ihren Werkzeugen.
- **Notes/AirWrite:** Ordnernavigation, Dokumentliste und Schreibbereich; die zusätzliche Navigationsspalte entfällt bei schmalen Fenstern. Bestehende Titel-/Textfelder, Save, Konfliktprüfung und Import/Export bleiben dieselben Elemente und Handler.
- **Musik:** Mediathek-Titel, zurückgenommene Importaktionen, zusammenhängender Cover-/Metadaten-/Transportbereich und sortierbare Titelliste. Es gibt weiterhin genau ein Audioelement und eine Musikbibliothek.
- **Kalender:** Monat mit Tageshierarchie, markiertem heutigen Tag und echten gespeicherten Terminen in Tageszellen. Die Monatsansicht aktualisiert sich bei Datenänderungen; Listener werden beim Schließen freigegeben. Das vorhandene Terminformular bleibt maßgeblich.
- **Settings:** zusammengehörige Steuerungen stehen in beschrifteten Zeilen; Daten-/Backup-/Updateaktionen haben konsistente Symbole und erhalten ihre ursprünglichen zugänglichen Namen.
- **Kontrollzentrum:** eigenständige pillenförmige MacShell-artige Flächen statt eines großen äußeren Formularpanels. Netzwerkstatus, Fokus, tatsächliche Mediensteuerung, App-Lautstärke und bestehende Appverknüpfungen bleiben funktionsfähig. Keine vorgetäuschten WLAN-, Bluetooth- oder Display-Systemrechte.
- **Island/MacLock:** gerundete erweiterte Island-Fläche, ruhigere Art-/Metadaten-/Transporthierarchie und abgestimmte Sperransicht. Diese bleibt eine lokale Air-OS-Ansicht, keine iPadOS-Authentifizierung.
- **Launcher:** Kategorien-/All-Apps-Umschalter unten über dem sichtbaren Dock, eigener scrollbarer Appbereich, einheitlich gerahmte eigene Symbole mit unterscheidbaren Motiven statt mehrfacher generischer Globus-Symbole. Alle 25 Einträge und ihre Local/Web-Kennzeichnung bleiben erhalten.
- **Wallpaper:** die vom Nutzer während der Umsetzung gelieferte Datei `Yosemite-Tal im warmen Morgenlicht.png` wird byteidentisch als `ipad/assets/yosemite-morning.png` eingebunden. Kein generiertes Ersatzbild und keine lokale Pixelbearbeitung. Der Material-Fallback verwendet nun das tatsächliche Bildseitenverhältnis statt fest 16:10.

## Quellen und Provenienz

| Referenz | Geprüfter Originalstand | Konkreter Bezug und Grenze |
| --- | --- | --- |
| [InfinityOS](https://github.com/Infinity-Systems-UA/InfinityOS/tree/a6584135cbcad837d57484211119451bbb2d8fb2) | `a6584135cbcad837d57484211119451bbb2d8fb2`, `script.js::openMenu`, `styles.css::winOpen` | Bestehende AGPL-Registry-/Motion-Adaption bleibt erhalten. Kategorienkarten und Browser-Lifecycle sind Air-OS-Integration. |
| ester-Nutzerbilder | `IMG_0044.jpeg`, `IMG_0045.jpeg`, aus dem referenzierten Chat wieder zugänglich | Kategorien mit 2×2-Icons, Umschalter unten, sichtbares Dock und zentrale Datei-Bestätigung. Visuelle Vorlagen, keine Behauptung, dass ester-Code aus InfinityOS stammt. Die Screenshotdateien werden nicht weiterveröffentlicht. |
| [MacShell](https://github.com/0-ss/MacShell/tree/1bdb51870b621100fd2709f66c8f8e00ab17b9c4) | `1bdb51870b621100fd2709f66c8f8e00ab17b9c4`, `MacShell/MacBar.qml` (`CCTile`, 34px Radius, 66px Zellrhythmus); vorhandene GlassSlab-/Dock-/Motion-Ports | Unabhängige Kontrollflächen und Medienhierarchie in Browser-CSS. Bestehender Shader-/GPU-Owner bleibt erhalten. Qt-/Wayland-Systemrechte werden nicht nachgebildet. |
| [MacTahoe GTK](https://github.com/vinceliuice/MacTahoe-gtk-theme/blob/1e45e19f510edb8cde18fa84d6cd5319f60b086b/src/sass/gtk/_common-4.0.scss) | `1e45e19f510edb8cde18fa84d6cd5319f60b086b`, `%side_style_left`, `%side_headerbar_left/right`, `%headerbar_buttons_flat` | Neutrale helle Seitenleisten mit 6px Randverlauf und flache Toolbar-Konstruktion. Die App-DOM-Komposition ist eigene Integration, kein GTK-Laufzeitport. |

Die Originalbilder aus dem MacShell-README wurden direkt betrachtet: [Desktop](https://github.com/user-attachments/assets/600f75bc-b4d1-442d-bec5-41ee7dfa5023), [Control Center](https://github.com/user-attachments/assets/cb6c5708-5786-4328-89bd-24737d39e482), [MacLock mit Medien](https://github.com/user-attachments/assets/0d15dc6f-8def-47dc-8e42-fa2959e7e5eb). Die Bergtal-Komposition, selbstständigen Kontrollflächen und Art-/Transportanordnung sind die konkreten Vergleichspunkte.

Provenienz und ausgewählte Originalauszüge: [`ipad/vendor/premium4-provenance.json`](../ipad/vendor/premium4-provenance.json), [`premium4-source-excerpts.txt`](../ipad/vendor/premium4-source-excerpts.txt). Bestehende MIT-/GPL-/AGPL-/OFL-/LGPL-Hinweise bleiben in `ipad/NOTICE`, `ipad/licenses/` und `ipad/icons/` erhalten. Die kombinierte PWA behält das sichtbare AGPL-Quellcodeangebot samt aktuellem `source/source.zip` und Inhaltsmanifest.

Für das neue Nutzer-Wallpaper wird keine fremde Urheberschaft oder unabhängig geprüfte öffentliche Lizenz erfunden. Herkunft, Maße, unveränderte Bytes und SHA-256 stehen in [`yosemite-morning.metadata.json`](../ipad/assets/yosemite-morning.metadata.json). Es ist als separat bereitgestelltes Nutzer-Asset gekennzeichnet. Das zwischenzeitlich geprüfte Wikimedia-Yosemite-Foto und das verworfene KDE-Altai-Bild sind nicht neue Runtimeassets.

## Echte visuelle Iterationen

1. **Exakte Vorher-Basis:** lokaler Branchkopf mit dem genannten Abschlusscommit verglichen; ursprünglichen Bericht und CI-Artefakt heruntergeladen. Dessen `BUILD-INFO.json` bestätigt Produktcommit `9825478…`, 125 Assets und private Paketkennung. Alle nicht generierten Runtimebytes stimmen mit dem Abschlusscommit überein; keine ungeprüfte Vergleichsbasis.
2. **Erste Umsetzungsrunde:** echte Chromium-Bilder der neuen App-Komposition und Kontrollflächen. Korrigiert wurden doppelte Notes-Überschrift, zu hoher Musikbereich und eine abgeschnittene letzte Kalenderwoche.
3. **Referenz-/Wallpaper-Runde:** zunächst ein belegtes Yosemite-Foto geprüft; nach Nutzerlieferung das exakte gewünschte Bild eingebunden. Eigene Icons erhalten unterscheidbare Motive. WebKit bestätigte die neue App-Komposition und Live-Aktualisierung des Monats.
4. **Interaktions- und Schlussrunde:** reale Tests deckten einen vom Dock verdeckten Datei-Export, eine schrumpfende Dateiliste unter dem Texteditor sowie veränderte zugängliche Settings-Namen auf. Produktkorrekturen verschieben den Export nach oben, verhindern das Schrumpfen der Dateiliste und erhalten die Aktionsnamen. All Apps hat einen eigenen Scrollbereich oberhalb des Umschalters; Island ist vollständig gerundet. Die betroffenen Klickprüfungen wurden nicht mit `force` durch die überdeckenden Flächen umgangen.

5. **Letzte WebKit-Runde:** die finalen Vergleichsbilder zeigten noch native kantige Select-Rahmen in WebKit. Gezieltes `appearance: none` entfernt nur die ruhende Browserdarstellung in Toolbar, Sidebar, Settings und Launcher; native zugängliche Select-Elemente und Picker bleiben erhalten. Lokale WebKit-Bild-/Bedienprüfung: 37/37. Auch der endgültige Produktstand hat den erneuten vollständigen CI-Lauf mit 704/704 Browserprüfungen bestanden.

Alle Abnahmebilder sind unveränderte Browser-PNGs mit synthetischen lokalen Daten und festem Szenenzeitpunkt. Sie sind keine Mockups und keine Aufnahmen der privaten Installation. Die CI nimmt die Vorher-Szenen aus `75d5263…` mit dessen eigener Szenensuite erneut auf.

## CI und Browserabnahme

[Vollständiger Lauf für den Produktcommit](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42254786645) · [Build und vollständige Browserartefakte](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42254786645#artifacts).

**Abgeschlossen: 42/42 Node-Regressionen und 704 echte Browserprüfungen bestanden.** Beide Browserjobs und die Evidenzsicherung sind erfolgreich.

| Gate | Chromium | WebKit |
| --- | ---: | ---: |
| System-3-Vorher-Szenen | 34 | 34 |
| Neues Produkt / visuell / Bedienung | 37 | 37 |
| DPR2 / visuell / Bedienung | 37 | 37 |
| Material / GPU-Guard / Lifecycle | 11 | 11 |
| Apps / Daten / Touch / Offline am Root | 112 | 111 |
| Derselbe Ablauf unter `/Air-OS/` | 112 | 111 |
| Geschützte Updates / Recovery | 10 | 10 |
| **Gesamt** | **353** | **351** |

Der Unterschied von zwei Prüfungen betrifft die vorhandenen nativen CDP-Touch-Drag-/Touchcancel-Prüfungen in Chromium. WebKit führt seinen tatsächlichen Touch-Tap aus; gleiche Treiber- oder iPad-Hardwareabdeckung wird nicht behauptet. Sechs Viewports: 1024×768, 1180×820, 1366×1024, 834×1194, 820×1180 und 390×600. Je Engine 32 Vorher-, 32 Nachher- und 32 zusätzliche DPR2-Szenen.

Evidenzcommit: `93819f160706d40562720ef8c0409801de5f7a11`. Der nachfolgende Bericht ergänzt die zuvor nur im vollständigen Artefakt enthaltenen WebKit-Szenen byteidentisch aus dem anhand seines SHA-256 geprüften Artefakt. Produkt-/Buildcommit bleibt `07666db…`.

## Vorher-/Nachher-Screenshots

Die folgenden Links zeigen direkt die unveränderten CI-PNGs. Alle zwölf geforderten Szenen liegen für beide Engines vor. Zusätzlich sind dieselben Szenen in DPR2 und die vollständigen Viewport-/Motion-/Offline-/Touchnachweise im Actions-Artefakt gesichert.

| Szene | Chromium vorher | Chromium nachher | WebKit vorher | WebKit nachher |
| --- | --- | --- | --- | --- |
| Desktop quer | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-chromium/desktop.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/desktop.png) | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-webkit/desktop.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-webkit/desktop.png) |
| Desktop hoch | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-chromium/desktop-portrait.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/desktop-portrait.png) | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-webkit/desktop-portrait.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-webkit/desktop-portrait.png) |
| Launcher Categories | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-chromium/launcher-categories.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/launcher-categories.png) | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-webkit/launcher-categories.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-webkit/launcher-categories.png) |
| Launcher All Apps | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-chromium/launcher-all-apps.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/launcher-all-apps.png) | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-webkit/launcher-all-apps.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-webkit/launcher-all-apps.png) |
| Control Center | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-chromium/control-center.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/control-center.png) | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-webkit/control-center.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-webkit/control-center.png) |
| Dynamic Island | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-chromium/island.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/island.png) | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-webkit/island.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-webkit/island.png) |
| MacLock | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-chromium/lockscreen.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/lockscreen.png) | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-webkit/lockscreen.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-webkit/lockscreen.png) |
| Finder | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-chromium/finder.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/finder.png) | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-webkit/finder.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-webkit/finder.png) |
| Musik | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-chromium/music.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/music.png) | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-webkit/music.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-webkit/music.png) |
| Notes | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-chromium/notes.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/notes.png) | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-webkit/notes.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-webkit/notes.png) |
| Kalender | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-chromium/calendar.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/calendar.png) | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-webkit/calendar.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-webkit/calendar.png) |
| Settings | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-chromium/settings.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/settings.png) | [Vorher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/before-webkit/settings.png) | [Nachher](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-webkit/settings.png) |

[DPR2 Chromium](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-dpr2-chromium/) · [DPR2 WebKit](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-dpr2-webkit/) · [vollständige maschinenlesbare Prüfergebnisse](visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/evidence.json).



Lokale ergänzende Nachweise: 42/42 Node-Regressionen; Audit der festgeschriebenen Browser-Testabhängigkeiten ohne gemeldete Schwachstellen; Paketprüfung mit 130 exakten lokalen Runtimeassets, CSP-/Scope-/Lizenzprüfung; Chromium-Datengate 112/112 bestanden. Die früheren fehlgeschlagenen lokalen Zwischenrunden sind oben dokumentiert und werden nicht mit dem finalen CI-Ergebnis vermischt. Der zusätzliche lokale Windows-WebKit-Gesamtlauf blieb unvollständig und wurde nach dem erfolgreichen vollständigen CI-Lauf beendet; er wird nicht als bestanden gezählt. Maßgeblich für den vollständigen Zwei-Engine-Abschluss ist der angeheftete Ubuntu-CI-Lauf.

## Daten, Offline und private Installation

Keine Änderung an IndexedDB-Name oder Schema (`air-os-ipad-tracks-v1`, Version 2), `storage.js`, `backup.js`, den Audio-/Kalender-Datenmodellen, Manifest-ID, Start-URL, Scope oder dem Service-Worker-Protokoll v5. Die App-Registry behält alle 25 IDs und Modi. Neue Darstellung verwendet vorhandene Felder und Aktionen.

Der bestehende Build erzeugt einen neuen vollständigen, inhaltsabhängigen Cache für die neuen Assets. Die bestehenden Offline-/Updateprüfungen testen Root und `/Air-OS/`, Altbestand, echte Blob-Bytes, Exporte, Backup/Restore, Cold Restart, Multitab-Schutz, ungespeicherte Entwürfe, laufendes Audio und kompatible Recovery. Das Recovery-Paket wird nur gebaut und geprüft.

**Kein Deployment, kein Merge, keine Installation und keine Änderung am privaten Windows-/Tailscale-Host oder an der bereits installierten PWA.** Keine Nutzerdaten aus dieser Installation wurden geöffnet oder kopiert.

## Performance und verbleibende Grenzen

Gemessene isolierte CI-Diagnose: Chromium 4 GL-Programme, 5 Texturen, 21356816 geschätzte Texturbytes; gemessene Paint-Walltime 1173 ms. WebKit: 4 Programme, 5 Texturen, 21356816 Bytes, 563 ms. Diese Software-/Runnerwerte schließen Transferkosten ein und sind ausdrücklich keine iPad-FPS- oder Akkuwerte. Der Standardpfad allokiert in beiden Engines null GL-Programme und null GL-Texturen.

- Standarddarstellung verwendet den bestehenden CSS-Fallback und legt im DPR2-Test keine GL-Programme oder Texturen an. Der normale High-Modus behält seine vorhandenen GPU-Guards. Reduced Motion und Reduced Transparency werden in echten Browserzuständen geprüft.
- Der isolierte Shader-Test prüft reale Pixeländerungen, ruhenden Draw-Zähler, Context Loss/Restore und Ressourcenfreigabe. Software-Diagnose ist kein Nachweis für iPad-GPU-Leistung, konstante 60 fps oder Batterieverbrauch. Die unabhängigen CSS-Kontrollflächen können auf älteren iPads weiterhin Compositor-Kosten verursachen.
- Die Materialquelle bleibt das gebündelte Wallpaper. Keine Aufnahme fremder Fenster; CSS-Blur ist keine native Qt-/Wayland-Refraction.
- Keine physische iPad-/Safari-Home-Screen-Abnahme, kein Hardware-GPU-, Pencil-, Tastatur-, Akku-/Thermal- oder Langzeit-Audio-/Suspend-Test. Automatisiertes WebKit ist kein echtes iPad.
- Die 13 übernommenen App-Icons und ergänzenden eigenen Linienicons sind besser abgestimmt, aber kein vollständig identisches natives Iconset. Die vorhandene lokale Schrift bleibt erhalten; es wird keine Apple-Systemschrift verteilt.
- Kleinere vorhandene Apps wurden nicht umfassend neu gestaltet. Browserformulare, Dateiauswahl und Texteditor bleiben Browserfunktionen; MacTahoe dient als Konstruktionsvorbild, nicht als Behauptung nativer Funktionsgleichheit.
- Screenshotvergleich und Quellbezug belegen konkrete Fortschritte. Es gibt keinen objektiven 10/10- oder Pixelähnlichkeitswert gegen die Referenzen.
