# Air-OS iPad

Offlinefähige Air-OS-iPad-PWA mit MacShell-orientierter Oberfläche. Der Quellcode kann öffentlich sein, während die eigene Web-App über Tailscale privat betrieben wird. **Kein bootfähiges Betriebssystem, keine native iPadOS-App und kein Electron.**

Quelle: https://github.com/quattrologic/Air-Os-Clean
Quellbranch: feat/air-os-ipad-ultra-security-hardening
Exakter Quellcommit: 053a0a27fd51d883202bb89ebcc694b876245d27

## Funktionen
- Air-OS-Desktop, Fensterverwaltung, Dock, Touch und Apps
- MacLock, Pro Notch, Liquid Glass und Wallpaper
- Spotify OAuth/PKCE, Musikmetadaten und lokale Wiedergabe
- Offline-PWA, Service Worker und lokale Speicherung
- iPad-spezifische Sicherheits-, UI-, Offline- und Regressionstests

Der vollständige App-Quellcode einschließlich Assets, Fonts, Lizenzhinweisen und Icons ist im Ordner [ipad](ipad/).
Weitere Informationen: [iPad-README](ipad/README.md), [Drittanbieterhinweise](ipad/NOTICE).

## Private Installation über Tailscale Serve
Diese Repository-Migration veröffentlicht **keine** neue Web-App und ändert die bisher installierte iPad-PWA nicht.

Auf einem Windows-PC Git installieren und das Repository klonen:
1. git clone https://github.com/quattrologic/Air-Os-Ipad.git
2. cd Air-Os-Ipad
3. In PowerShell nach Prüfung der Einstellungen: powershell -NoProfile -ExecutionPolicy Bypass -File .\ipad\setup-windows.ps1
4. Die private HTTPS-URL von Tailscale Serve auf dem iPad in Safari aufrufen und über Teilen zum Home-Bildschirm hinzufügen.

Tailscale Serve benutzen, **niemals Funnel oder öffentliche Pages**. Die Air-OS-Sperransicht ersetzt keinen Geräteschutz. Die genaue Anleitung steht in [ipad/README.md](ipad/README.md).

## Entwicklung (Node.js 20+)
- npm test: iPad-Modell- und Regressionstests
- npm run build: überprüftes Offline-PWA-Paket
- npm run check: Paketintegritätsprüfung
- Die [eigenständige Sicherheitsprüfung](docs/security/standalone-verification.md) beschreibt die Chromium- und WebKit-Regressionen und die historischen Testdaten.

Wichtige Verzeichnisse: ipad/ (App), scripts/ (iPad-Tools), tests/ (Tests), build/ipad-parity-tests/ (Test-Dependencies), docs/ (iPad-Dokumentation), .github/workflows/ (CI).


## Öffentliche Quellcode-Freigabe

Die Sicherheitsübernahme ist in `main` integriert. Die Veröffentlichung des Quellcodes wird getrennt von der iPad-Web-App verwaltet. Den tatsächlichen öffentlichen/privaten Status bestimmt allein die GitHub-Repository-Einstellung, nicht diese README. Siehe [PUBLIC_RELEASE.md](PUBLIC_RELEASE.md) und `npm run audit:public` für die Prüfung von Dateien und erreichbarer Git-Historie.

**Lizenzhinweis:** Die kombinierte Browser-PWA wird gemäß [ipad/NOTICE](ipad/NOTICE) unter **AGPL-3.0** weitergegeben und enthält Komponenten unter GPL-3.0, MIT, LGPL-3.0 und OFL-1.1. [LICENSE](LICENSE) erklärt den Geltungsbereich; die vollständigen Drittanbieterhinweise gelten weiterhin.

Der Repository-Inhaber hat am 10.11.2026 bestätigt, dass das bereitgestellte Yosemite-Wallpaper **mit KI erstellt** wurde und die Veröffentlichung von Air-OS iPad gewünscht ist. Eine unabhängige Prüfung der Nutzungsbedingungen des Bildgenerators ist damit nicht ersetzt; [ergänzende KI-Provenienz](docs/AI_WALLPAPER_PROVENANCE.md). Ein öffentliches Repository veröffentlicht nicht automatisch die Tailscale-gehostete App.

## Sicherheit, Privatsphäre, Lizenzen
Keine Spotify-Tokens, Passwörter, Zertifikate oder Gerätedaten in Git speichern. Daten in IndexedDB und auf dem bisher verbundenen iPad bleiben beim Anlegen dieses Repos unverändert. Vor einer späteren Umstellung Sicherungen erstellen und die neue Quelle testen. Siehe [SECURITY.md](SECURITY.md), [MIGRATION.md](MIGRATION.md), [ipad/NOTICE](ipad/NOTICE) und ipad/licenses/ für Open-Source-Pflichten.

Die Originale sehr großer, generierter Screenshot- und Test-Evidenzarchive verbleiben im bisherigen Repository. Sie sind nicht nötig, um die iPad-PWA zu bauen.
