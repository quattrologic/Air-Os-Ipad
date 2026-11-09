# iPad Ultimate 2.0 — privater Rollout vorbereitet, nicht durchgeführt

Kein Livewechsel. Tailscale Serve, Windows-Aufgabe, HTTPS-Adresse und `feature/private-ipad-pwa@7de1635c0207b8604c5409ef62c466585b4d5f04` bleiben unverändert. Die [bestehenden Backup-/Recoveryregeln](AIR_OS_IPAD_PRIVATE_ROLLOUT.md) gelten weiter. Der Entwicklungsbranch ist `feat/air-os-ipad-ultimate-2`, Produkt `7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a`.

## Vor einem ausdrücklich freigegebenen Wechsel

1. Erfolgreichen **Chromium- und WebKit-Lauf** für genau den Produkt-SHA, PWA-ZIP und dessen beigefügte SHA-256 prüfen. Das Artefakt allein ist keine Hardwareabnahme. Noch keinen Windows-Branch/Task umschalten.
2. Musik pausieren, sämtliche Entwürfe speichern. Alte v1-Musik mit dem separat bereitgestellten **ReadOnly-Preflight-ZIP** am bestehenden Origin sichern, erst nach gesonderter Zustimmung zum Übergang. Vorabexport schreibt kein DB-Schema. Sicherung in Dateien außerhalb des Browserstores öffnen/validieren; Originalaudiodateien zusätzlich behalten. Bei Bibliotheken über 64 MiB keine vollständige JSON-Sicherung behaupten: große segmentierte Wiederherstellung ist noch nicht implementiert. Ohne überprüfte Sicherung keine Umstellung.
3. Synthetisch geprüften neuen Build zunächst separat entpacken, Assets und Lizenz-/Sourcebaum vollständig erhalten. Kombination unter AGPL-3.0: `NOTICE`, volle Lizenztexte, `vendor/infinityos/provenance.json` und **`source/source.zip`/`source-info.json`** auch auf privatem HTTPS mitliefern. Sourceangebot ist ohne Anmeldung erreichbar; es enthält ausschließlich Produktquellen und keine Nutzerdaten. Dafür ist keine öffentliche Website notwendig.
4. Tatsächliches iPad/Safari prüfen: gleiche HTTPS-Adresse, Installation/Start/Offline, Musik/Dateien, neue Workspaces/Gruppen, App-Vollbild samt sichtbarem Exit, Touch/Pencil/Trackpad und Bildschirmtastatur. WebKit-Simulation ersetzt diesen Schritt nicht.
5. Erst nach ausdrücklicher Eigentümerfreigabe bestehende Updateaufgabe bewusst pausieren und **den geprüften Commit** im separaten Staging bereitstellen. Kein automatischer Merge des Entwicklungsbranches. Keine Serve-/Funnel-/ACL-Neukonfiguration. Origin/Scope erhalten; verschiedene Unterpfade desselben Origins teilen IndexedDB/LocalStorage und sind keine getrennten Profile.
6. Contentversionierte Assets vollständig laden; Musik, Entwürfe und kurze Exportübergaben blockieren sichere Workeraktivierung. Alle alten Clients nach Sicherung schließen, erneut starten. Kein Website-/Cache-/IndexedDB-Reset. Musik-SHA/alte Termine/Timer kontrollieren, neues Backup und kalten Offline-Neustart prüfen.

## Rückweg

DB bleibt **v2**, neue Gruppen/Dockreferenzen/Präferenzen sind validierte Records derselben Datenbank. Keine Resetmigration. Der unveränderte v1-Client kann DBv2 nicht öffnen. Nach Upgrade ausschließlich das **Compatible-Recovery-ZIP** verwenden; dessen v2-fähige App-/Storage-/Backup-Dateien sind auf die geprüfte Paritybasis `a228d895939861bf5379917d6d69849aaadc2f84` eingefroren. Es bewahrt Musikbytes und neue lokale Records und kann exportieren; es bietet die alte reduzierte Oberfläche. Kein automatischer Rückfall oder Löschen neuer Records.

Der konkrete Windows-PC, automatische Aufgabe, Tailscale-Serverausfall und physische iPad-Installation wurden in dieser Umgebung nicht angefasst oder abgenommen. Die Entscheidung über einen späteren Wechsel bleibt beim Eigentümer. Browserdaten können gelöscht werden; kein Versprechen ewiger Speicherung oder zusätzlicher sicherer Browserauthentifizierung.
