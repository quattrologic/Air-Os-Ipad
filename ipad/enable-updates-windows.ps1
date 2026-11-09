# Optional: create a Windows task that checks the currently active Git branch every 30 minutes.
$ErrorActionPreference = 'Stop'
$scriptFile = Join-Path $PSScriptRoot 'update-windows.ps1'
if (-not (Test-Path $scriptFile)) { throw "Datei fehlt: $scriptFile" }
$task = 'Air-OS-iPad-Updates'
$action = New-ScheduledTaskAction -Execute "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -Argument ('-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "' + $scriptFile + '"')
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(2) -RepetitionInterval (New-TimeSpan -Minutes 30)
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 5) -StartWhenAvailable
Register-ScheduledTask -TaskName $task -Action $action -Trigger $trigger -Settings $settings -Description 'Private Air-OS iPad PWA: neue GitHub-Commits laden' -Force | Out-Null
Write-Host "Automatische Git-Pruefung eingerichtet: $task (alle 30 Minuten, wenn Windows aktiv ist)." -ForegroundColor Green
