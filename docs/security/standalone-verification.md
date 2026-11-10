# Eigenständige iPad-Sicherheitsprüfung

Die ursprüngliche PWA-Übernahme aus Air-Os-Clean basierte auf
`053a0a27fd51d883202bb89ebcc694b876245d27`. Der abschließende Quellbranch
`feat/air-os-ipad-ultra-security-hardening` steht bei
`ad6fdc9843c65a374b296e62768616315c231a9a`. Seine
[Schlussprüfung](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42772216350)
lief erfolgreich für Chromium, WebKit und die native Qt-Referenz auf
`ccba678b53fd2936f621fc4c1422d29c01b2c3ec`. Die beiden anschließenden
Quellcommits ergänzten Nachweise und Dokumentation.

Der Vergleich mit `a9ba6a2321a11f06dad2b87c0f056159ce235a57` auf
Air-Os-Ipad `main` ergab, dass die geschützten UI- und Datenmodule sowie die
Sicherheitslogik bereits übereinstimmen. Der Abgleich ergänzt die abschließenden
Browser- und Modellprüfungen, einschließlich der tatsächlichen Legacy-Worker-Übergabe,
der erhaltenen Spotify-Metadaten und Bildbytes, der Wiederherstellung und der
strikten Vollbildvergleiche. Die lokalen Baseline-Fixtures für die Modelltests
bleiben erhalten. Der Build erzeugt die Worker-Version und das Paket aus
diesem Repository.

## Tests und Testdaten

`npm test` prüft die eigenständigen iPad-Modelle. `npm run build` und
`npm run check` erstellen und prüfen das Offline-Paket. Die
[Browser-CI](../../.github/workflows/ipad-security-browser.yml) führt die
Chromium- und WebKit-Regressionen aus und stellt die JSON-Berichte im
jeweiligen GitHub-Actions-Lauf bereit. Das Gate prüft unter anderem Stamm-
und Unterpfad, Legacy-Übergabe, Backup und Recovery, Offlinebetrieb, Dock,
MacLock, Pro Notch sowie Spotify mit simulierten Kontodaten.

Für lokale Browserläufe die vier im Workflow fest referenzierten Commits
in ein separates Git-Repository laden und dessen absoluten Pfad als
`AIR_PAD_TEST_HISTORY` setzen. Git verifiziert die referenzierten Objekte.
Die historischen Dateien dienen nur als isolierte Browser-Testdaten.
Die Testskripte lesen sie aus dem separaten Repository und erzeugen
Testprofile und Testpakete lokal. Die Laufzeitdateien des aktuellen Branches
werden aus dem aktuellen Checkout gebaut.

Nach `npm ci --prefix build/ipad-parity-tests` und der Installation der
Playwright-Engines kann man mit `npm run test:browser` die Security-Suite
starten und mit `node scripts/test-ipad-updates.cjs` die Legacy-Übergabe
prüfen. `AIR_PAD_ENGINE` wählt `chromium` oder `webkit`. Für die
Unterpfadprüfung `AIR_SECURITY_PREFIX` beziehungsweise `AIR_PAD_PREFIX`
auf `/Air-OS/` setzen. Node.js 24 und Python 3 entsprechen der CI-Umgebung.
Die Browser-CI hat Lesezugriff auf das Repository und testet auf Loopback
mit synthetischen Profilen. Eine Abnahme auf einem physischen iPad bleibt separat.
