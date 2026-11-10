# Abschlussprüfung und sichere Übernahme der Security-Nachweise

Stand des eigenständigen Repositories: `a9ba6a2321a11f06dad2b87c0f056159ce235a57` auf `main`. Review ausschließlich auf `review/security-final-verification`; keine Änderung von `main`, installierter PWA oder privater Bereitstellung.

## Bereits enthalten — keine zweite Implementierung

Der Bytevergleich von 145 Dateien ist in [FINAL_SECURITY_SOURCE_COMPARISON.json](FINAL_SECURITY_SOURCE_COMPARISON.json) enthalten. Alle 138 geschützten Oberflächen-/Datenbesitzer sowie sieben Sicherheits-/Builddateien sind identisch mit dem final geprüften Entwicklungsstand in `quattrologic/Air-Os-Clean`. Dazu gehören:

- synchrones OAuth-Scrubbing und strenge PKCE-/State-/Redirect-/Grantprüfung;
- alleiniger vorhandener Spotify-Controller mit flüchtigen Tokens, minimalen Lesescopes und Trennungs-/Lifecycle-Schutz;
- CSP/SRI und unveränderte Appoberflächen;
- SHA-256-geprüfte vollständige Worker-Generationen, sichere Zustimmung und Cache-Reparatur;
- explizites Buildinventar und strikt auf Loopback beschränkter, nicht angeschlossener Header-Adapter.

Diese Dateien werden nicht erneut kopiert. Auch die neuere Root-README, das eigenständige `package.json`, die Migrationseinstellungen und die auf lokale Baseline-Fixtures angepassten Modelltests bleiben erhalten. Generierte `ipad/sw.js`/`version.json` werden nicht aus dem alten Repository übernommen; jeder Build erzeugt sie aus dem eigenen Quellstand.

## Tatsächlich noch fehlende QA-Ergänzungen

Der beigefügte Patch `patches/final-security-qa.patch` ist eine **Reviewvorlage**, keine bereits aktivierte zweite Sicherheitsimplementierung. Er ergänzt ausschließlich:

1. `scripts/test-ipad-updates.cjs`: echte Retirement-Prüfung der Legacy-Clients mit neutralem zweitem Loopback-Origin; kein erzwungenes `skipWaiting`, keine Datenlöschung, kein Schließen des letzten WebKit-Fensters.
2. `scripts/test-ipad-security.cjs`: gespeicherte öffentliche Spotify-Konfiguration, zulässige Metadaten und echte gecachte Bildbytes durch Upgrade/Backup/Restore/Rollback/Offline-Neustart prüfen; vorhandene MacLock-/Notch-Owner nach Update ausüben; vollständig erhaltene erste Frames und stabiler kontrollierter Aufnahmeablauf mit strenger Null-Pixelgrenze.
3. `scripts/lib/wait-for-async.cjs` und acht vorhandene Browser-Regressionsskripte: Aufgelöste asynchrone Ergebnisse tatsächlich pollen; Playwright 1.62 behandelt ein Promise sonst vor dessen booleschem Ergebnis als wahr. Ein begrenzter Timeout erfasst auch niemals aufgelöste Promises. Die neue Modellprüfung wird an die hier bereits angepasste Testdatei **angehängt**, deren lokale Baseline-Fixtures bleiben erhalten. `scripts/write-ipad-source.cjs` nimmt nur den neuen Testhelfer in das Sourceangebot auf.
4. `scripts/publish-ipad-security-evidence.cjs`: zusätzliche rohe Vollbild-Zwischenaufnahmen archivieren. Der bestehende Publisher bleibt auf den alten Repo-/Branchpfad beschränkt; vor einer Nutzung hier muss diese Zuordnung ausdrücklich passend geändert und geprüft werden.

## Wichtige Voraussetzung vor Anwendung des Testpatchs

Das neue Repository enthält die ursprüngliche Monorepo-Historie nicht: Der benötigte Legacy-Commit `0cc6f31d5f810d72cf695c5579b40eca7ec5e717` ist hier nachweislich kein gültiges Git-Objekt. Weitere Browserfixtures verwenden die alten `7de…`-/`732…`-Referenzen. Deshalb wäre ein blindes Übernehmen des alten Workflows falsch.

Sichere Reihenfolge für einen späteren QA-PR:

1. Aktuellen `main` erneut prüfen und den Patch mit `git apply --check` gegen genau diesen Stand kontrollieren.
2. Benötigte Legacy-Fixtures aus dem fest referenzierten alten Repository als separate, SHA-256-geprüfte **synthetische Testeingaben** bereitstellen oder dessen Historie in einem ausdrücklich isolierten read-only QA-Checkout nutzen. Keine ältere Laufzeitdatei über neue Produktdateien schreiben.
3. Nur den Test-Baseline-Lader auf diese Inputs anpassen; die bereits vorhandenen lokalen Modelltest-Fixtures erhalten. Den alten branchgebundenen Evidence-Publisher/Workflow hier nicht unverändert aktivieren.
4. Root-/Unterpfadtests mit tatsächlichem Chromium/WebKit und vollständigem Daten-/Offline-/Rollbackgate wieder ausführen; erst danach einen eigenen neuen Artefaktstand freigeben.

Dieser Review-Branch löst weder ein Deployment noch eine Installation aus. Er setzt die Browserprüfung des ursprünglichen Security-Branches nicht mit einer eigenständigen Browserabnahme dieses Repositories gleich.

## Eigenständige lokale Verifikation

Ein isolierter temporärer Worktree des genannten `main` bestand **52/52 Modellprüfungen**, `npm run build` und `npm run check` mit **142 Inventardateien**. Keine Kontoverbindung, keine Nutzerprofile und keine installierte PWA wurden verwendet. Die bestehenden 52 Prüfungen sind die eigenständige iPad-Auswahl; sie sind nicht die 70 Monorepo-Gruppen und werden nicht künstlich gleichgezählt. Die Browser-Abschlussbelege des ursprünglichen Repositories werden unten separat referenziert.

## Original-Repository: bestätigte Schlussabnahme

Quellstand `ccba678b53fd2936f621fc4c1422d29c01b2c3ec`, [CI 42772216350](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42772216350). Der Lauf ist mit tatsächlichem Endstatus **Success** abgeschlossen: 44/44 Berichte (40 Browser, vier native Qt/OpenGL-Referenzberichte), 1.714 ausgeführte Prüfassertionen, zusätzlich 71 Node-Modellgruppen. Chromium und WebKit bestehen jeweils Root- und Unterpfad-Security (50 pro Lauf), Legacy-/Backup-/Recovery-Kette (10 pro Lauf), Offline-/Rollback-/Datenprüfungen und strenge Null-Pixelvergleiche. Der Nachweiscommit ist `8246145f4926deec3fda9a0943d6501482bbfc70`; [vollständiger Originalbericht](https://github.com/quattrologic/Air-Os-Clean/blob/feat/air-os-ipad-ultra-security-hardening/docs/AIR_OS_IPAD_ULTRA_SECURITY_HARDENING.md). Diese Zahlen betreffen das Original-Repository, nicht einen hier noch ausstehenden Standalone-Browserlauf. Der Patch lässt sich gegen den oben genannten eigenständigen `main` mit `git apply --check docs/security/patches/final-security-qa.patch` erfolgreich prüfen, wird hier aber aus den genannten Fixture-/Publishergründen bewusst nicht blind angewandt.

## Anwendbarkeit des konkreten QA-Vorschlags

Der erweiterte Patch umfasst 13 Dateien und besteht `git apply --check` gegen den oben genannten iPad-Stand. Er wurde ausschließlich in einem separaten temporären Worktree angewandt: **53/53 Modelltests**, vollständiger Build und **142/142 Paketdateien** bestanden dort. Die 52 bisherigen eigenständigen Modellgruppen bleiben erhalten und werden um den Timeout-/Falsch-/Wahr-/Fehlernachweis ergänzt. Der Review-Branch selbst enthält weiterhin nur Dokumentation und den überprüfbaren Patch. Noch kein Standalone-Browsergate behauptet. Das finale ursprüngliche Gate ergänzt zudem Root- und Unterpfad-Legacy-Berichte und erwartet damit 44 Berichte; der branchgebundene alte Workflow wird hier weiterhin nicht blind aktiviert.

Der geprüfte Build liegt im erfolgreichen Original-CI als `Air-OS-iPad-Security-Build-ccba678b53fd2936f621fc4c1422d29c01b2c3ec` vor (30 Tage Aufbewahrung, eigener SHA-256-Sidecar). Kein Deployment. Der native Vergleich ist kein physischer iPad-/Safari-/Akku-Nachweis; eine echte Spotify-Kontoanmeldung und private Tailscale-Serverheader wurden nicht geprüft. `main` dieses Repositories blieb bei `a9ba6a2321a11f06dad2b87c0f056159ce235a57`.
