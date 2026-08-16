# ShelfIQ — Two-Tier Architecture Restructure Script
# Run from the project root: Bug404-main/
# Usage: powershell -ExecutionPolicy Bypass -File restructure.ps1

$root  = Split-Path -Parent $MyInvocation.MyCommand.Path
$back  = Join-Path $root "backend"
$core  = Join-Path $back "core"
$front = Join-Path $root "frontend"

Write-Host "`n===== ShelfIQ Restructure: Starting =====" -ForegroundColor Cyan

# ─────────────────────────────────────────────
# STEP 1 — Create backend/core/
# ─────────────────────────────────────────────
New-Item -ItemType Directory -Force -Path $core | Out-Null
Write-Host "[1/5] Created backend/core/" -ForegroundColor Green

# ─────────────────────────────────────────────
# STEP 2 — Move root Python packages → backend/core/
# ─────────────────────────────────────────────
$modules = @("alerts","config","data","database","forecasting","models","optimization","pipeline","planogram")
foreach ($m in $modules) {
    $src = Join-Path $root $m
    $dst = Join-Path $core $m
    if (Test-Path $src) {
        Move-Item -Path $src -Destination $dst -Force
        Write-Host "    Moved: /$m  →  backend/core/$m" -ForegroundColor DarkGreen
    } else {
        Write-Host "    Skip (not found): /$m" -ForegroundColor DarkYellow
    }
}
Write-Host "[2/5] All core modules moved." -ForegroundColor Green

# ─────────────────────────────────────────────
# STEP 3 — Move /tests → backend/tests/
# ─────────────────────────────────────────────
$testsSrc = Join-Path $root "tests"
$testsDst = Join-Path $back "tests"
if (Test-Path $testsSrc) {
    Move-Item -Path $testsSrc -Destination $testsDst -Force
    Write-Host "[3/5] Moved: /tests  →  backend/tests/" -ForegroundColor Green
} else {
    Write-Host "[3/5] /tests not found, skipping." -ForegroundColor DarkYellow
}

# ─────────────────────────────────────────────
# STEP 4 — Move /requirements.txt → backend/requirements.txt
# ─────────────────────────────────────────────
$reqSrc = Join-Path $root "requirements.txt"
$reqDst = Join-Path $back "requirements.txt"
if (Test-Path $reqSrc) {
    Move-Item -Path $reqSrc -Destination $reqDst -Force
    Write-Host "[4/5] Moved: requirements.txt  →  backend/requirements.txt" -ForegroundColor Green
} else {
    Write-Host "[4/5] requirements.txt not found (may already be moved), skipping." -ForegroundColor DarkYellow
}

# ─────────────────────────────────────────────
# STEP 5 — Delete leftover junk dirs
# ─────────────────────────────────────────────
foreach ($junk in @(".streamlit","stitch")) {
    $p = Join-Path $root $junk
    if (Test-Path $p) {
        Remove-Item -Recurse -Force $p
        Write-Host "[5/5] Deleted: /$junk" -ForegroundColor DarkRed
    }
}

Write-Host "`n===== File Moves Done. Now patching Python paths... =====" -ForegroundColor Cyan

# ─────────────────────────────────────────────
# PATH PATCH HELPER
# ─────────────────────────────────────────────
function Patch-File {
    param([string]$FilePath, [string]$Old, [string]$New)
    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath -Raw
        if ($content -match [regex]::Escape($Old)) {
            $content = $content -replace [regex]::Escape($Old), $New
            Set-Content -Path $FilePath -Value $content -NoNewline
            Write-Host "    Patched: $FilePath" -ForegroundColor DarkGreen
        }
    }
}

# ─────────────────────────────────────────────
# PATCH 1 — backend/app.py
#   PROJECT_ROOT was: Path(__file__).resolve().parent.parent   (backend/ → root)
#   Now must be:      Path(__file__).resolve().parent          (backend/ is root of back-end)
#   FRONTEND_DIR was: PROJECT_ROOT / "frontend"
#   Now must be:      Path(__file__).resolve().parent.parent / "frontend"
# ─────────────────────────────────────────────
$appFile = Join-Path $back "app.py"
Patch-File $appFile `
    'PROJECT_ROOT = Path(__file__).resolve().parent.parent' `
    'PROJECT_ROOT = Path(__file__).resolve().parent'

Patch-File $appFile `
    'FRONTEND_DIR = PROJECT_ROOT / "frontend"' `
    'FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"'

Write-Host "[P1] backend/app.py patched." -ForegroundColor Green

# ─────────────────────────────────────────────
# PATCH 2 — backend/api/detection.py
#   PROJECT_ROOT was: .parent.parent.parent   (api/ → backend/ → root)
#   Now must be:      .parent.parent          (api/ → backend/)
# ─────────────────────────────────────────────
$detFile = Join-Path $back "api\detection.py"
Patch-File $detFile `
    'PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent' `
    'PROJECT_ROOT = Path(__file__).resolve().parent.parent'

# Also fix data_dir reference: backend/ now contains core/data
Patch-File $detFile `
    'data_dir = PROJECT_ROOT / "data"' `
    'data_dir = PROJECT_ROOT / "core" / "data"'

Write-Host "[P2] backend/api/detection.py patched." -ForegroundColor Green

# ─────────────────────────────────────────────
# PATCH 3 — backend/core/config/settings.py
#   BASE_DIR was: .parent.parent   (config/ → root)
#   Now must be:  .parent.parent.parent (config/ → core/ → backend/ ... but data still lives at backend/core/data)
#   Actually simpler: keep BASE_DIR pointing at "backend/" by going 3 levels up:
#   config/ → core/ → backend/ so .parent.parent.parent would be repo root — wrong.
#   We want BASE_DIR = backend/core/ parent = backend/.
#   Path: backend/core/config/settings.py → .parent = core/config → .parent = core → .parent = backend
#   So .parent.parent.parent = backend/  ✓  but paths like DATA_DIR must be core/data inside backend
# ─────────────────────────────────────────────
$settingsFile = Join-Path $core "config\settings.py"
Patch-File $settingsFile `
    'BASE_DIR = Path(__file__).resolve().parent.parent' `
    'BASE_DIR = Path(__file__).resolve().parent.parent.parent'

# DATA_DIR, DB_DIR, MODELS_DIR etc. now live under core/ inside backend
# Replace sub-paths that use BASE_DIR directly
Patch-File $settingsFile `
    'DATA_DIR = BASE_DIR / "data"' `
    'DATA_DIR = BASE_DIR / "core" / "data"'

Patch-File $settingsFile `
    'MODELS_DIR = BASE_DIR / "models"' `
    'MODELS_DIR = BASE_DIR / "core" / "models"'

Patch-File $settingsFile `
    'DB_DIR = BASE_DIR / "database"' `
    'DB_DIR = BASE_DIR / "core" / "database"'

# Custom weights path
Patch-File $settingsFile `
    '_CUSTOM_WEIGHTS = BASE_DIR / "weights" / "shelfiq_best.pt"' `
    '_CUSTOM_WEIGHTS = BASE_DIR / "core" / "models" / "weights" / "shelfiq_best.pt"'

Write-Host "[P3] backend/core/config/settings.py patched." -ForegroundColor Green

# ─────────────────────────────────────────────
# PATCH 4 — All backend/core/**/*.py sys.path.insert
#   These files do: sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
#   Previously that resolved to the repo root (so `import config` etc. worked).
#   Now they live at backend/core/<module>/*.py:
#     .parent = backend/core/<module>/
#     .parent.parent = backend/core/
#     .parent.parent.parent = backend/    ← this is what we want on sys.path
#   So change parent.parent → parent.parent.parent for all core modules.
# ─────────────────────────────────────────────
$coreFiles = Get-ChildItem -Path $core -Recurse -Filter "*.py" | Where-Object {
    (Get-Content $_.FullName -Raw) -match 'sys\.path\.insert\(0, str\(Path\(__file__\)\.resolve\(\)\.parent\.parent\)\)'
}
foreach ($f in $coreFiles) {
    Patch-File $f.FullName `
        'sys.path.insert(0, str(Path(__file__).resolve().parent.parent))' `
        'sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))'
}
Write-Host "[P4] Patched sys.path.insert in $($coreFiles.Count) core module files." -ForegroundColor Green

# ─────────────────────────────────────────────
# PATCH 5 — data/generators/*.py (were 3 levels deep, still 3 levels deep from core)
#   backend/core/data/generators/*.py:
#     .parent = generators → .parent = data → .parent = core → .parent = backend
#   They need backend/ on sys.path, so .parent.parent.parent.parent
#   Previously they had .parent.parent.parent (root)
# ─────────────────────────────────────────────
$genFiles = Get-ChildItem -Path (Join-Path $core "data\generators") -Filter "*.py" -ErrorAction SilentlyContinue
foreach ($f in $genFiles) {
    Patch-File $f.FullName `
        'sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))' `
        'sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))'
}
Write-Host "[P5] Patched data/generators files." -ForegroundColor Green

# ─────────────────────────────────────────────
# PATCH 6 — backend/tests/*.py
#   Were at root/tests/ → .parent.parent = root.
#   Now at backend/tests/ → .parent.parent = backend/ ✓  (no depth change needed!)
# ─────────────────────────────────────────────
Write-Host "[P6] backend/tests/ — sys.path depth unchanged (already correct)." -ForegroundColor Green

# ─────────────────────────────────────────────
# PATCH 7 — backend/requirements.txt: remove streamlit & plotly
# ─────────────────────────────────────────────
$reqFile = Join-Path $back "requirements.txt"
if (Test-Path $reqFile) {
    $reqContent = Get-Content $reqFile -Raw
    $reqContent = $reqContent -replace "(?m)^streamlit.*\r?\n", ""
    $reqContent = $reqContent -replace "(?m)^plotly.*\r?\n", ""
    $reqContent = $reqContent -replace "(?m)^# Dashboard\r?\n", ""
    # Add Flask deps
    if ($reqContent -notmatch "flask") {
        $reqContent = $reqContent.TrimEnd() + "`nflask>=3.0.0`nflask-cors>=4.0.0`n"
    }
    Set-Content -Path $reqFile -Value $reqContent -NoNewline
    Write-Host "[P7] backend/requirements.txt cleaned (removed streamlit/plotly, added flask)." -ForegroundColor Green
}

# ─────────────────────────────────────────────
# VERIFY — Print final structure
# ─────────────────────────────────────────────
Write-Host "`n===== Final Root Structure =====" -ForegroundColor Cyan
Get-ChildItem -Path $root -Depth 0 | Format-Table Name, Attributes -AutoSize

Write-Host "`n===== backend/ =====" -ForegroundColor Cyan
Get-ChildItem -Path $back -Depth 0 | Format-Table Name, Attributes -AutoSize

Write-Host "`n===== backend/core/ =====" -ForegroundColor Cyan
Get-ChildItem -Path $core -Depth 0 | Format-Table Name, Attributes -AutoSize

Write-Host "`n===== DONE! =====" -ForegroundColor Green
Write-Host "Start server:  cd backend  ;  py app.py" -ForegroundColor White
