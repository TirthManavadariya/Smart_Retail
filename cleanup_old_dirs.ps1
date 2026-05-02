# ShelfIQ — Final Cleanup Script (Step 2 of restructure)
# Run AFTER the new backend/core/ files have been verified working.
# This deletes the old root-level Python packages and copies the SQLite DB.
#
# Usage: powershell -ExecutionPolicy Bypass -File cleanup_old_dirs.ps1

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "`n===== ShelfIQ Cleanup: Removing old root-level dirs =====" -ForegroundColor Cyan

# Old Python packages now replaced by backend/core/
$toDelete = @("alerts","config","data","database","forecasting","models","optimization","pipeline","planogram","tests",".streamlit","stitch")
foreach ($d in $toDelete) {
    $p = Join-Path $root $d
    if (Test-Path $p) {
        Remove-Item -Recurse -Force $p
        Write-Host "  Deleted: /$d" -ForegroundColor DarkRed
    } else {
        Write-Host "  Already gone: /$d" -ForegroundColor DarkYellow
    }
}

# Move root requirements.txt if still there
$req = Join-Path $root "requirements.txt"
if (Test-Path $req) {
    Remove-Item -Force $req
    Write-Host "  Deleted: /requirements.txt (backend/requirements.txt is authoritative)" -ForegroundColor DarkRed
}

# Copy existing SQLite DB to new location if not already there
$oldDb  = Join-Path $root "database\retail_shelf.db"
$newDb  = Join-Path $root "backend\core\database\retail_shelf.db"
if ((Test-Path $oldDb) -and -not (Test-Path $newDb)) {
    Copy-Item $oldDb $newDb
    Write-Host "  Copied: database/retail_shelf.db -> backend/core/database/retail_shelf.db" -ForegroundColor Green
}

Write-Host "`n===== Final Structure =====" -ForegroundColor Cyan
Get-ChildItem -Path $root -Depth 0 | Format-Table Name, Attributes -AutoSize

Write-Host "`n===== Done! Start server: cd backend && py app.py =====" -ForegroundColor Green
