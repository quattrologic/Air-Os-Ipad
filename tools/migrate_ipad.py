#!/usr/bin/env python3
"""Pinned one-time extraction of the Air-OS iPad PWA from the existing monorepo."""
from pathlib import Path
import json
import shutil
import subprocess
import sys

SOURCE_SHA = "053a0a27fd51d883202bb89ebcc694b876245d27"
SOURCE_BRANCH = "feat/air-os-ipad-ultra-security-hardening"

def copy_file(src, dst):
    if src.is_symlink() or not src.is_file():
        raise ValueError("Unsafe or missing source: " + str(src))
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)

def copy_dir(src, dst):
    if not src.is_dir():
        raise FileNotFoundError(str(src))
    for item in src.rglob("*"):
        if item.is_symlink():
            raise ValueError("Source symlink refused: " + str(item))
        if item.is_file():
            copy_file(item, dst / item.relative_to(src))

def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: migrate_ipad.py SOURCE_REPO DEST_REPO")
    src, dst = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
    head = subprocess.check_output(["git", "-C", str(src), "rev-parse", "HEAD"], text=True).strip()
    if head != SOURCE_SHA:
        raise SystemExit("Source SHA mismatch: " + head + " != " + SOURCE_SHA)
    if not (src / "ipad/index.html").exists() or not (dst / ".git").exists():
        raise SystemExit("Unexpected source or destination directory.")
    copy_dir(src / "ipad", dst / "ipad")
    for item in (src / "scripts").rglob("*"):
        if item.is_file() and item.name not in ("check-catalina.cjs", "inspect-infinity-iso.py"):
            copy_file(item, dst / item.relative_to(src))
    for item in (src / "tests").glob("ipad*.test.cjs"):
        copy_file(item, dst / "tests" / item.name)
    copy_dir(src / "build/ipad-parity-tests", dst / "build/ipad-parity-tests")
    copy_file(src / "build/ipad-runtime-assets.json", dst / "build/ipad-runtime-assets.json")
    for item in (src / "docs").glob("AIR_OS_IPAD_*.md"):
        copy_file(item, dst / "docs" / item.name)
    for sub in ("docs/source-ports", "docs/reference/pro-notch"):
        copy_dir(src / sub, dst / sub)
    for sub in ("docs/security/protected-surfaces.json",
                "docs/security/source-references.json",
                "docs/validation/test-maclock-material.cjs"):
        copy_file(src / sub, dst / sub)
    for item in (src / ".github/workflows").glob("test-ipad-*.yml"):
        copy_file(item, dst / "docs/legacy-workflows" / item.name)
    for name in ("LICENSE", "SECURITY.md"):
        copy_file(src / name, dst / name)
    (dst / ".gitignore").write_text(
        "node_modules/\ndist/\ncoverage/\n.DS_Store\nThumbs.db\n*.log\n"
        ".env\n.env.*\n!.env.example\nbuild/ipad-parity-tests/node_modules/\n"
        "ipad/source/\n", encoding="utf8")
    pkg = {
        "name": "air-os-ipad", "version": "1.0.0", "private": True,
        "description": "Air-OS iPad PWA (no Electron)",
        "scripts": {
            "test": "node --test",
            "build": "node scripts/package-ipad-security.cjs",
            "check": "node scripts/check-ipad-parity-package.cjs",
            "test:browser": "node scripts/test-ipad-security.cjs"
        },
        "engines": {"node": ">=20"}
    }
    (dst / "package.json").write_text(json.dumps(pkg, indent=2) + "\n", encoding="utf8")
    readme = """# Air-OS iPad

Private, offlinefähige Air-OS-iPad-PWA mit MacShell-orientierter Oberfläche. **Kein bootfähiges Betriebssystem, keine native iPadOS-App und kein Electron.**

Quelle: https://github.com/quattrologic/Air-Os-Clean
Quellbranch: SOURCE_BRANCH_PLACEHOLDER
Exakter Quellcommit: SOURCE_SHA_PLACEHOLDER

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

Auf einem Windows-PC Git installieren und das private Repository klonen:
1. git clone https://github.com/quattrologic/Air-Os-Ipad.git
2. cd Air-Os-Ipad
3. In PowerShell nach Prüfung der Einstellungen: powershell -NoProfile -ExecutionPolicy Bypass -File .\\ipad\\setup-windows.ps1
4. Die private HTTPS-URL von Tailscale Serve auf dem iPad in Safari aufrufen und über Teilen zum Home-Bildschirm hinzufügen.

Tailscale Serve benutzen, **niemals Funnel oder öffentliche Pages**. Die Air-OS-Sperransicht ersetzt keinen Geräteschutz. Die genaue Anleitung steht in [ipad/README.md](ipad/README.md).

## Entwicklung (Node.js 20+)
- npm test: iPad-Modell- und Regressionstests
- npm run build: überprüftes Offline-PWA-Paket
- npm run check: Paketintegritätsprüfung
- Für Browsertests: npm ci --prefix build/ipad-parity-tests, anschließend Playwright-Browser installieren; npm run test:browser

Wichtige Verzeichnisse: ipad/ (App), scripts/ (iPad-Tools), tests/ (Tests), build/ipad-parity-tests/ (Test-Dependencies), docs/ (iPad-Dokumentation), .github/workflows/ (CI).

## Sicherheit, Privatsphäre, Lizenzen
Keine Spotify-Tokens, Passwörter, Zertifikate oder Gerätedaten in Git speichern. Daten in IndexedDB und auf dem bisher verbundenen iPad bleiben beim Anlegen dieses Repos unverändert. Vor einer späteren Umstellung Sicherungen erstellen und die neue Quelle testen. Siehe [SECURITY.md](SECURITY.md), [MIGRATION.md](MIGRATION.md), [ipad/NOTICE](ipad/NOTICE) und ipad/licenses/ für Open-Source-Pflichten.

Die Originale sehr großer, generierter Screenshot- und Test-Evidenzarchive verbleiben im bisherigen Repository. Sie sind nicht nötig, um die iPad-PWA zu bauen.
"""
    (dst / "README.md").write_text(
        readme.replace("SOURCE_BRANCH_PLACEHOLDER", SOURCE_BRANCH)
              .replace("SOURCE_SHA_PLACEHOLDER", SOURCE_SHA), encoding="utf8")
    (dst / "MIGRATION.md").write_text(
        "# Air-OS iPad – Migration\n\n"
        "- Source: https://github.com/quattrologic/Air-Os-Clean\n"
        "- Branch: " + SOURCE_BRANCH + "\n"
        "- Commit: " + SOURCE_SHA + "\n"
        "- Destination: quattrologic/Air-Os-Ipad, private\n"
        "- Included: complete ipad/ source and assets, iPad scripts and tests, iPad test dependencies, relevant iPad design and security docs, license/notice files, archived iPad CI definitions.\n"
        "- Excluded: Windows/macOS Electron files and tests, unrelated monorepo content, and multi-gigabyte generated visual evidence. The original repository retains that evidence.\n"
        "- Neither original repo nor existing Tailscale/Spotify/installed PWA were changed.\n",
        encoding="utf8")
    result = subprocess.check_output(["git", "-C", str(dst), "status", "--porcelain"], text=True)
    print(json.dumps({"source": head, "change_count": len(result.splitlines())}))

if __name__ == "__main__":
    main()
