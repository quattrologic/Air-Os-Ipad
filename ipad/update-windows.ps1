# Pull only fast-forward updates from the currently checked-out GitHub branch.
# Safe for scheduled execution; does not publish any service or change Tailscale settings.
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$git = (Get-Command git.exe -ErrorAction SilentlyContinue).Source
if (-not $git) { throw 'Git for Windows fehlt. https://git-scm.com/downloads/win' }
$branch = (& $git -C "$repo" branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or -not $branch) { throw 'Kein Git-Branch ausgewaehlt.' }
$dirty = & $git -C "$repo" status --porcelain --untracked-files=no
if ($dirty) { Write-Warning 'Lokale Aenderungen entdeckt. Update uebersprungen.'; exit 0 }
& $git -C "$repo" pull --ff-only origin "$branch"
if ($LASTEXITCODE -ne 0) { throw 'Git-Pull fehlgeschlagen. Bitte Internet und Branch pruefen.' }
Write-Host "Air-OS iPad aktualisiert ($branch). Die installierte iPad-PWA uebernimmt neue Dateien beim naechsten erfolgreichen Online-Update."
