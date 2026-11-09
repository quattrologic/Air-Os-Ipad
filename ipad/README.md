# Air-OS für iPad (private PWA)

Diese separate, kostenlose **Air-OS-iPad-Web-App** läuft nach der ersten Installation so weit wie möglich offline. Sie ist **keine native iPadOS-App** und verwendet nicht Electron. Sie bietet eine eigenständige Air-OS-Oberfläche mit Lockscreen-Musik, Notch, lokaler Musikbibliothek, Timer und lokalem Kalender. Die Desktop-Apps und Desktop-Konten werden nicht automatisch übernommen.

**Sicherheit:** Der Bereitstellungsserver ist ausschließlich über **Tailscale Serve** erreichbar. **Nie** Tailscale Funnel, GitHub Pages oder einen öffentlichen Webhost verwenden. Dieses iPad-Repository ist privat. Die per Tailscale ausgelieferte Web-App ist ebenfalls nicht öffentlich erreichbar, solange ausschließlich Tailscale Serve mit passenden ACLs verwendet wird. Die rein optische Air-OS-Sperransicht stellt **keine zusätzliche Authentifizierung** dar; das iPad muss mit Gerätecode/Face ID geschützt werden. Konten in einem freigegebenen Tailnet können gemäß Zugriffsrichtlinien den Webserver erreichen. Verwende deshalb ein persönliches Tailnet mit restriktiven Zugriffsregeln.

## 1. Windows-PC vorbereiten (einmalig)

Voraussetzungen: Tailscale auf Windows und iPad mit demselben Konto verbunden, [Git for Windows](https://git-scm.com/downloads/win), iPad Safari.

Für eine **neue, ausdrücklich freigegebene Installation** in **PowerShell**:

```powershell
cd $HOME
git clone https://github.com/quattrologic/Air-Os-Ipad.git
cd Air-Os-Ipad
```

Für die bereits installierte iPad-PWA ist **keine Migration erforderlich**. Die bisherige Tailscale-Installation bleibt unverändert.

**PowerShell als Administrator** öffnen, zum Projektordner navigieren (bei Standardinstallation `cd "$HOME\Air-Os-Ipad"`) und ausführen:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\ipad\setup-windows.ps1
```

Falls Tailscale die HTTPS-Berechtigung anfordert, bestätige sie im Admin-Panel. Dafür sind MagicDNS und HTTPS-Zertifikate nötig. Tailscale schreibt den Gerätenamen des Zertifikats in öffentliche Certificate-Transparency-Protokolle. Wähle daher keinen Gerätenamen mit vertraulichen Angaben.

In der Ausgabe von `tailscale serve status` steht eine **HTTPS-Adresse** etwa `https://dein-pc.dein-tailnet.ts.net`. Dies ist eine private Tailnet-Adresse; nicht mit `http://100.x.y.z` installieren, da eine PWA einen sicheren HTTPS-Kontext benötigt.

## 2. Installation auf dem iPad (einmalig)

1. Tailscale auf dem iPad einschalten.
2. Die **private HTTPS-Adresse** aus Schritt 1 in **Safari** öffnen.
3. Einmal vollständig laden lassen und **Air-OS öffnen**, Musik/Kalender testen.
4. In Safari **Teilen → Zum Home-Bildschirm → Als Web-App öffnen → Hinzufügen**.
5. Die Air-OS-App vom Home-Bildschirm starten. Mit ausgeschaltetem WLAN/Mobilfunk testen, während das iPad einen Gerätecode hat. Musikdateien müssen vorher **innerhalb von Air-OS importiert** worden sein.

Das Offline-Verhalten verwendet einen Service Worker, der die App-Dateien speichert. Musik wird in IndexedDB auf dem iPad gespeichert. Für echte vollständige Offline-Nutzung muss die Installation einmal erfolgreich bei privater HTTPS-Verbindung stattfinden. iPadOS kann App-Daten/Browser-Speicher bei Platzmangel oder durch Löschen der Websitedaten entfernen: Bitte Original-Musik und Termine anderweitig sichern.

## 3. Updates aus GitHub

Updates laufen zweistufig ab:

1. GitHub-Änderungen in denselben Branch mergen, den Windows derzeit ausgecheckt hat. Beim Ändern von `ipad/index.html`, `ipad/styles.css`, `ipad/app.js`, `ipad/manifest.webmanifest` oder `ipad/icon.svg` **immer** `CACHE_VERSION` in `ipad/sw.js` ändern. Nur dann erkennt der Service Worker die neue Offline-App zuverlässig.
2. Windows lädt mit `git pull --ff-only` die neuen Dateien. Danach kann die iPad-PWA die aktualisierten Dateien über Tailscale herunterladen, wenn **PC an + Internet + Tailscale verbunden** sind. Die PWA prüft beim Öffnen/Zurückkehren/alle 15 Minuten sowie unter Einstellungen → Auf Updates prüfen. Bei einem Update wird sie automatisch neu geladen, außer während Musik läuft (dann anschließend).

Update **einmal** manuell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\ipad\update-windows.ps1
```

Oder auf Windows **alle 30 Minuten** als Aufgabe einrichten (einmal, PowerShell als Administrator):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\ipad\enable-updates-windows.ps1
```

Diese Windows-Aufgabe braucht Git, Netzverbindung und einen sauberen lokalen Branch. Bei ausgeschaltetem PC erhält das iPad **keine neuen Updates**, kann aber die **bereits zwischengespeicherte** App offline öffnen.

Für das neue Repository wird der Branch `main` verwendet. Nach einer ausdrücklich freigegebenen Umstellung kann Windows neue Quellen so abrufen:

```powershell
git fetch origin
git switch main
git pull --ff-only origin main
```

Die Windows-Aufgabe zieht anschließend Updates aus dem aktuell ausgecheckten Branch. Bei Privatisierung des GitHub-Repositories funktioniert Git weiterhin mit deinem authentifizierten Git-Konto.

## 4. Wichtige Grenzen

- **Kein öffentliches Hosting:** Verwendet Tailscale Serve. Die Daten werden nicht an GitHub übertragen; Musik verbleibt im iPad-Browser-Speicher.
- **Keine echte iPadOS-Notch oder System-Lockscreen-Integration:** Beides sind Oberflächen **innerhalb der Web-App**.
- **Kein automatischer Import der Windows-Musikdaten:** iPad und Windows haben getrennte Browser-/App-Speicher.
- **Kein vollwertiger Zugriffsschutz durch die Air-OS-Sperransicht:** iPad-Gerätesperre und Tailscale-Konto/ACL schützen den Zugriff. Lokale Daten werden nicht nochmals mit einem eigenen Passwort verschlüsselt.
- **Offline nicht unbegrenzt garantiert:** Browser-/iPadOS-Speicher kann bereinigt werden. Offline-Updates funktionieren nicht, sondern erst wieder bei Verbindung.
- **Bildschirmsperre/Background-Audio:** Safari/iPadOS können Wiedergabe und Timer im Hintergrund unterbrechen; der Timer berechnet beim nächsten Öffnen aus der tatsächlichen Endzeit.
- **Audioformate:** Werden durch Safari/iPadOS bestimmt, typischerweise MP3/M4A/WAV. Eine separate Spotify-Verbindung zeigt mit Erlaubnis Wiedergabemetadaten; keine systemweite Apple-Music-Steuerung und kein eigenes DRM-Streaming.

## 5. Service deaktivieren

Auf Windows PowerShell als Administrator:

```powershell
tailscale serve off
```

Die lokale Air-OS-Web-App auf dem iPad bleibt nach erfolgreicher Installation und vorhandenem Cache offline nutzbar. Zum vollständigen Entfernen die App und ggf. die Safari-Websitedaten löschen.

## Safari-Fehler „Response served by service worker has redirections“

Das tritt auf, wenn ein statischer Dateiserver `index.html` nach `/` umleitet und Safari die umgeleitete Antwort aus dem Service-Worker-Cache als Navigation erhält. Die Korrektur ist ab `air-os-ipad-v2-safari-redirect-fix` enthalten: Die App speichert die echte Startseite unter `./` und erstellt neue, nicht-umgeleitete `Response`-Objekte vor einer Navigation.

**Für bereits betroffene iPads:**

1. Auf Windows nur nach einer freigegebenen Umstellung auf dieses neue Repository: `git pull --ff-only origin main`. Für die bereits installierte PWA nichts an der bisherigen Quelle ändern, bevor ein geprüfter Build und ein Backup vorliegen.
2. Auf dem iPad die Safari-Seitendaten **nur** für die private `.ts.net`-Adresse löschen: **Einstellungen → Apps → Safari → Erweitert → Website-Daten** und den betreffenden Domain-Eintrag suchen. Je nach iPadOS-Version ist Safari direkt in den Einstellungen. **Achtung:** Dadurch können lokal importierte Musikdateien, Termine und App-Einstellungen unter dieser Domain verloren gehen. Vorher sichern!
3. Safari neu öffnen, Tailscale einschalten und die private `https://…ts.net/`-Adresse aufrufen, anschließend erst zum Home-Bildschirm hinzufügen.
4. Wenn die Seite weiterhin fehlschlägt, zunächst in Safari ohne vorhandene Home-Bildschirm-Verknüpfung öffnen und prüfen, ob die richtige Branch-Version auf Windows liegt (`git branch --show-current`).

Die direkte URL `/index.html` vermeiden, da manche statischen Dateiserver diese absichtlich nach `/` umleiten. Nutze die Root-Adresse mit abschließendem Schrägstrich.


## App-Symbol

Als App-Symbol wird die vom Projektinhaber bereitgestellte schwarz-weiße, geometrische Air-OS-Bildmarke verwendet (`air-os-official.png`). Safari nutzt sie über `apple-touch-icon` und das PWA-Manifest. Nach einem Update muss die bereits installierte Home-Bildschirm-Verknüpfung ggf. entfernt und erneut hinzugefügt werden; Safari kann das alte Symbol zwischenspeichern. Dabei die Safari-Website-Daten möglichst nicht löschen, um lokale Musik und Termine zu erhalten.
