# ============================================================
#  VENDING MACHINE - SETUP SCRIPT
#  Cai dat moi truong test cho toan bo he thong
# ============================================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  VENDING MACHINE - SETUP MOI TRUONG TEST" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot

# ---- 1. Cai dat Python (neu can) ----
Write-Host "[1/4] Kiem tra Python..." -ForegroundColor Yellow
$pythonInstalled = $false
try {
    $pyVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Python: $pyVersion" -ForegroundColor Green
        $pythonInstalled = $true
    }
} catch {
    Write-Host "  Python chua duoc cai dat." -ForegroundColor Red
    Write-Host "  Dang cai dat Python tu Microsoft Store..." -ForegroundColor Yellow
    winget install Python.Python.3.12 --accept-source-agreements --accept-package-agreements
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Python da duoc cai dat. Vui long khoi dong lai PowerShell." -ForegroundColor Green
        $pythonInstalled = $true
    } else {
        Write-Host "  Khong the cai Python tu dong. Vui long cai dat thu cong:" -ForegroundColor Red
        Write-Host "  https://www.python.org/downloads/" -ForegroundColor Yellow
        Write-Host "  (Chon 'Add Python to PATH' khi cai dat)" -ForegroundColor Yellow
    }
}

# ---- 2. Cai dat PlatformIO ----
Write-Host ""
Write-Host "[2/4] Cai dat PlatformIO..." -ForegroundColor Yellow
if ($pythonInstalled) {
    pip install platformio
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  PlatformIO da duoc cai dat." -ForegroundColor Green
    } else {
        Write-Host "  Loi khi cai PlatformIO. Thu lai bang: pip install platformio" -ForegroundColor Red
    }
} else {
    Write-Host "  Bo qua (can Python truoc)." -ForegroundColor Yellow
}

# ---- 3. Cai dat backend dependencies ----
Write-Host ""
Write-Host "[3/4] Cai dat backend dependencies..." -ForegroundColor Yellow
Set-Location "$projectRoot\be"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Backend dependencies da duoc cai dat." -ForegroundColor Green
} else {
    Write-Host "  Loi khi cai backend dependencies." -ForegroundColor Red
}
Set-Location $projectRoot

# ---- 4. Cai dat Flutter dependencies ----
Write-Host ""
Write-Host "[4/4] Kiem tra Flutter dependencies..." -ForegroundColor Yellow
Set-Location "$projectRoot\mobile"
flutter pub get 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Flutter dependencies da duoc cai dat." -ForegroundColor Green
} else {
    Write-Host "  Loi khi cai Flutter dependencies." -ForegroundColor Red
}
Set-Location $projectRoot

# ---- Kiem tra ESP32 COM port ----
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Kiem tra ket noi ESP32" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
$ports = [System.IO.Ports.SerialPort]::GetPortNames()
$hasESP32 = $ports -contains "COM4"
if ($hasESP32) {
    Write-Host "  ESP32 phat hien o COM4 - san sang!" -ForegroundColor Green
} else {
    Write-Host "  ESP32 KHONG phat hien o COM4." -ForegroundColor Red
    Write-Host "  Cac cong hien co: $($ports -join ', ')" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SETUP HOAN TAT" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cac buoc tiep theo:" -ForegroundColor White
Write-Host "  1. Chay '.\test.ps1' de bat dau test he thong" -ForegroundColor White
Write-Host "  2. Hoac chay tung thanh phan thu cong:" -ForegroundColor White
Write-Host "     - ESP32 : cd iot; pio run --target upload --upload-port COM4" -ForegroundColor White
Write-Host "     - Backend: cd be; npm run dev" -ForegroundColor White
Write-Host "     - Mobile : cd mobile; flutter run" -ForegroundColor White
Write-Host ""
