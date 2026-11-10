# Öffentliche GitHub-Freigabe von Air-OS iPad

**Status:** Vorbereitet, aber bis zur Rechteprüfung weiterhin **privat**. Die Veröffentlichung des Quellcodes ist etwas anderes als die Bereitstellung der iPad-Web-App.

## Technische Vorabkontrolle

- `npm test`, `npm run build`, `npm run check` und Chromium-/WebKit-Browser-CI müssen auf dem finalen Commit erfolgreich sein.
- `npm run audit:public` scannt alle erfassten Textdateien **und die erreichbare Git-Historie** auf bekannte Schlüssel-/Tokenformate, persönliche Rechnerpfade und konkrete private Tailscale-Hostnamen. Treffer werden nur mit Dateinamen und Kategorie ausgegeben, niemals mit dem gefundenen Wert.
- Das Audit ersetzt **keine** vollständige Geheimnis-, Datenschutz- oder Lizenzprüfung. Auch frühere Actions-Artefakte, Screenshots, Releases und Logs müssen vor dem Umschalten kontrolliert werden.
- Niemals Passwörter, Zugriffstokens, OAuth-Client-Secrets, private Zertifikate, Spotify-Token oder echte Kontodaten in Git übertragen. Eine öffentlich sichtbare Spotify **Client-ID** ist hingegen üblicherweise keine geheime Berechtigung.
- Ein fehlgeschlagenes Audit muss vor der Freigabe bereinigt werden. Bereits veröffentlichte Secrets müssen unabhängig von Git-History-Änderungen rotiert werden.

## Lizenzgrenzen

Der **kombinierte iPad-PWA-Code** ist laut [ipad/NOTICE](ipad/NOTICE) unter **AGPL-3.0** herausgegeben. Darin werden zudem adaptierte GPL-3.0-Komponenten und einzelne MIT-, LGPL-3.0- sowie OFL-1.1-Bestandteile genannt. Die MIT-Lizenz unter [LICENSE](LICENSE) gilt nicht pauschal für sämtliche integrierten Fremdkomponenten. Die jeweiligen Attributionen und vollständigen Texte stehen in [ipad/NOTICE](ipad/NOTICE), [ipad/licenses](ipad/licenses/) und [ipad/icons/NOTICE](ipad/icons/NOTICE).

Bei einer öffentlichen Quellcode- oder Binärfreigabe müssen die jeweiligen Lizenzbedingungen einschließlich der Bereitstellung des korrespondierenden Quellcodes eingehalten werden. Die konkrete Vereinbarkeit und etwaige Pflichten für die gesamte Verteilung sollten vor der Freigabe geprüft werden.

### Noch erforderliche Entscheidung: bereitgestelltes Wallpaper

[ipad/NOTICE](ipad/NOTICE) bezeichnet `ipad/assets/yosemite-morning.png` als vom Nutzer bereitgestelltes Bild, **ohne bestätigte öffentliche Verbreitungslizenz**. Der Besitz einer Bilddatei oder eine private Chat-Übermittlung beweisen nicht automatisch, dass das Bild auf GitHub an alle weitergegeben werden darf.

Vor einer öffentlichen Umstellung muss der Rechteinhaber die **Weiterverbreitung dieses Bildes** gestatten, oder das Bild durch eine nachweislich veröffentlichbare Alternative ersetzt werden. Bei einer Ersatzdatei ist zu beachten, dass frühere Git-Commits dieselbe PNG weiter enthalten können: Ein einfaches Löschen im letzten Commit reicht für die öffentliche Freigabe nicht aus. Eine historische Bereinigung muss separat und mit besonderer Vorsicht erfolgen.

Zusätzlich verwendete Referenzvideos, Screenshots und Marken sollten darauf geprüft werden, ob sie im öffentlichen Repository enthalten sind und unter welchen Bedingungen sie gezeigt werden dürfen. Original-Apple-Systemdateien sind nicht Teil der eigenen Browserimplementierung.

## Privater Betrieb bleibt getrennt

Ein öffentliches Quellcode-Repository bedeutet **nicht**, dass die per Tailscale Serve betriebene PWA öffentlich erreichbar wird. GitHub Pages, Funnel und sonstiges öffentliches Hosting werden nicht aktiviert. Die installierte iPad-PWA, ihre IndexedDB-/Musikdaten, Spotify-Verbindung und die bisherige Tailscale-Konfiguration bleiben unverändert.

Die Anleitung zur privaten Installation im **Root-README** ist maßgeblich. `ipad/README.md` stammt aus dem ursprünglichen Monorepo und dokumentiert deshalb noch historische Branch- und Clone-Befehle; diesen veralteten Stand nicht blind ausführen.

## Freigabe erst nach

1. Sicherheits-/Historien-Audit ohne ungeklärte Treffer
2. Lizenz- und Wallpaper-Rechteprüfung
3. Vollständigen CI-Prüfungen auf dem endgültigen Commit
4. Expliziter Entscheidung des Repository-Inhabers zur öffentlichen Sichtbarkeit

Der GitHub-Repository-Status wird durch diese Datei **nicht** geändert.
