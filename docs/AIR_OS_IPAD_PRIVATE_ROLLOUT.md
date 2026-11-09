# Privater iPad-Rollout — vorbereitet, nicht ausgeführt

**Kein Merge, kein Branchwechsel am Windows-PC, keine Task-, Serve-, ACL-, Funnel- oder Pages-Änderung wurde ausgeführt.** Der verwendete Branch bleibt `feature/private-ipad-pwa`. Alle folgenden Schritte sind ein späterer, vom Eigentümer ausdrücklich freizugebender Vorgang.

## 1. Vorbereiten und sichern

1. Erfolgreichen Chromium- und WebKit-Lauf und dessen **Quell-SHA** prüfen; ZIP und SHA-256 aus genau diesem Actions-Lauf herunterladen. Einen separaten Arbeitsbaum/Ordner verwenden; noch nicht das von Tailscale bereitgestellte Verzeichnis ersetzen.
2. Auf dem realen iPad Musik pausieren, Kalenderentwürfe abschließen, alle geöffneten Air-OS-Fenster kontrollieren. Originalaudiodateien außerhalb des Browserstores zusätzlich behalten.
3. Die alte Vier-App-Version hat keinen vollständigen Bibliotheksbackup-Export. Dafür liegt ein **ReadOnly-Preflight-ZIP** bereit. Es bewahrt die ursprüngliche Oberfläche und öffnet die existierende Musikdatenbank **ohne Versionsargument, ohne Schreibtransaktion, ohne Schemaänderung**. Erst nach ausdrücklicher Freigabe kann dieses Übergangspaket am *gleichen* privaten Origin/Scope angeboten werden. Alte Clients vollständig schließen und neu öffnen, dann Einstellungen → „Vor Upgrade: vollständiges Backup exportieren“. Das heruntergeladene JSON außerhalb des Browserstores in Dateien sichern und überprüfen. Es enthält unverschlüsselte persönliche Inhalte und gehört nicht in ein öffentliches Repository oder einen öffentlichen Download. Der getestete Vorabexport enthält Musik, Cover, alten Kalender, Timer und Wiedergabeschlüssel.
4. Gesamt-JSON-Backups sind bewusst auf 64 MiB Binärdaten begrenzt, um ältere iPads nicht durch große Base64-Kopien zu überlasten. Bei Überschreitung wird **kein Teilbackup als vollständig ausgegeben**. Dann vor der Umstellung alle Originalaudiodateien separat sichern; eine große, segmentierte Bibliothekssicherung ist noch offen. Ohne nachgewiesene Sicherung keine Umstellung empfehlen.

## 2. Freigegebene Version wechseln

1. Erst nach erfolgreicher Datensicherung und ausdrücklicher Eigentümerfreigabe die bestehende Windows-Updateaufgabe vorübergehend anhalten. Sie folgt dem aktuell ausgecheckten Branch; deshalb nicht während laufender Entwicklung den Serve-Arbeitsbaum umschalten.
2. Nur den freigegebenen, geprüften Quellcommit verwenden. ZIP vollständig in ein separates Staging-Verzeichnis entpacken, Prüfsumme kontrollieren und vollständigen Dateibaum erhalten. Alternativ einen sauberen Git-Arbeitsbaum genau dieses Commits bereitstellen. Keine bestehenden Dateien blind löschen.
3. Die **bisherige private HTTPS-Adresse und deren Scope beibehalten**. Tailscale Serve nicht auf Funnel/Public ändern. Der Inhaltstausch im schon konfigurierten privaten Serve-Verzeichnis erfolgt als gesonderte freigegebene Operation; diese Sitzung hat ihn nicht vorgenommen.
4. Der erste v4→v5-Übergang wartet auf alte Clients. Alle Air-OS-Tabs/Home-Screen-Fenster nach beendetem Download und pausierter Musik schließen, dann die gleiche Adresse erneut öffnen. Der alte Client kennt den neuen Abstimmungsdialog noch nicht. Keinen Service-Worker-/Website-Daten-Reset als Installationsschritt verwenden.
5. Additives DB-v2-Upgrade abwarten, vorhandene Musik und Termine kontrollieren. Bei blockiertem Upgrade alte Browserfenster schließen; bei Fehlern nicht zurücksetzen. Danach neues Gesamtbackup erstellen, Offline-Neustart und die eigenen wichtigsten Arbeitsabläufe auf dem iPad prüfen.
6. Eine spätere Updateaufgabe erst nach bewusster Festlegung des freigegebenen Branches wieder aktivieren. Kein automatischer Merge dieses Entwicklungsbranches in den installierten Branch.

## 3. Sicherer Rückweg

- **Vor einem v2-Upgrade:** ursprünglicher Quellcommit und Vorabbackup bleiben verfügbar.
- **Nach einem v2-Upgrade:** unveränderter alter Code mit `indexedDB.open(...,1)` ist **nicht** kompatibel. Nicht einfach den alten Commit ausliefern und anschließend Datenbanken löschen.
- Das separat erzeugte **Compatible-Recovery-ZIP** nutzt die ursprüngliche Vier-App-Oberfläche mit dem aktuellen v2-fähigen Musik-/Kalenderadapter. Im tatsächlichen Browsertest bleiben Musikbytes und neue Notes/Dokumente erhalten; die Rückfalloberfläche kann alle Daten exportieren. Sie löscht die neuen Workspace-Datensätze nicht, zeigt aber nur die klassischen vier Apps. Auch dieser Wechsel verlangt Pause, Backup und Eigentümerfreigabe.
- Vorabbackup/Recovery sind keine automatische Notfallinstallation und kein Rollback fremder iPadOS-Apps. Keine der drei Varianten wurde privat oder öffentlich bereitgestellt.

## 4. Spätere normale Updates

Contenthash-basierte Worker laden die vollständige neue App-Shell. Aktivierung bestehender v5-Clients verlangt sichere Rückmeldungen aller geöffneten Appclients. Musik und ungespeicherte Notes-/Datei-/Handschriftentwürfe blockieren den Reload. Den Einstellungen-Button verwenden; keinen erzwungenen Cache-/Storage-Reset. Wenn ein alter oder schlafender Client nicht antwortet, alle Fenster nach Sicherung schließen und erneut öffnen.

Cache-Updates löschen keine IndexedDB-Daten. Andere Hostnamen, Ports oder Protokolle bilden andere Origins und haben getrennte Daten; **verschiedene Unterpfade desselben Origins teilen IndexedDB/LocalStorage**. Scope-getrennte Assetcaches sind keine Benutzertrennung. Keine Desktopprofile oder private Cloudzugänge wurden importiert.

## Offene native Freigabe

Physisches iPad/Safari, Home-Screen-Installation, Bildschirmtastatur, Pencil, native Dateiauswahl/Downloads, Audioausgabe, Suspend/Resume und das konkrete Tailscale-/Windows-Task-Verhalten müssen am eigenen Gerät geprüft werden. Automatisiertes Linux-WebKit ersetzt diese Abnahme nicht.
