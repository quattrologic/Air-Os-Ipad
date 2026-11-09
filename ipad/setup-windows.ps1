# Run in an elevated Windows PowerShell after checking out the PWA branch.
$ErrorActionPreference = 'Stop'
$folder = $PSScriptRoot
$exe = (Get-Command tailscale.exe -ErrorAction SilentlyContinue).Source
if (-not $exe) { $exe = Join-Path $env:ProgramFiles 'Tailscale\tailscale.exe' }
if (-not (Test-Path $exe)) {
  throw 'Tailscale wurde nicht gefunden. Bitte Tailscale installieren und die Anmeldung pruefen.'
}
Write-Host "Bereite private Air-OS-iPad-Freigabe vor: $folder" -ForegroundColor Cyan
Write-Host 'Nur Tailscale Serve verwenden. NICHT tailscale funnel.' -ForegroundColor Yellow
& $exe serve --bg "$folder"
if ($LASTEXITCODE -ne 0) { throw 'Tailscale Serve konnte nicht gestartet werden. PowerShell als Administrator starten und HTTPS in Tailscale erlauben.' }
Write-Host 'Private URL (nur im eigenen Tailnet erreichbar):' -ForegroundColor Green
& $exe serve status
Write-Host 'Die HTTPS-Adresse aus der Ausgabe auf dem iPad in Safari oeffnen.'
