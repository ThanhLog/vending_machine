# ============================================================
#  VENDING MACHINE - TEST SCRIPT
#  Khoi chay moi truong test
# ============================================================

param(
    [switch]$BackendOnly,
    [switch]$Esp32Only,
    [switch]$MobileOnly
)

$projectRoot = $PSScriptRoot
$allMode = -not ($BackendOnly -or $Esp32Only -or $MobileOnly)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  VENDING MACHINE - TEST ENVIRONMENT" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ---- Kiem tra IP may tinh (cho ESP32 ket noi) ----
$myIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*"
}).IPAddress | Select-Object -First 1

if ($myIp) {
    Write-Host "[INFO] IP may tinh cua ban: $myIp" -ForegroundColor Green
    Write-Host "[INFO] ESP32 se ket noi den: http://${myIp}:3000" -ForegroundColor Green
    Write-Host "[INFO] Hay cap nhat BACKEND_URL trong iot/src/config.h neu can!" -ForegroundColor Yellow
} else {
    Write-Host "[WARN] Khong the xac dinh IP may tinh." -ForegroundColor Yellow
}

Write-Host ""

# ---- Khoi dong Backend ----
if ($BackendOnly -or $allMode) {
    Write-Host "--------------------------------------------" -ForegroundColor Cyan
    Write-Host "  KHOI DONG BACKEND (Port 3000)" -ForegroundColor Cyan
    Write-Host "--------------------------------------------" -ForegroundColor Cyan

    Start-Process powershell -ArgumentList @"
-NoExit -Command `
    Write-Host '[BACKEND] Dang khoi dong server...' -ForegroundColor Cyan; `
    Set-Location '$projectRoot\be'; `
    npm run dev
"@

    Write-Host "  Backend da duoc khoi dong o cua so rieng." -ForegroundColor Green
    Write-Host "  API URL : http://localhost:3000" -ForegroundColor Green
    Write-Host "  Health  : http://localhost:3000/health" -ForegroundColor Green
    Write-Host "  Swagger : http://localhost:3000/api-docs" -ForegroundColor Green
    Write-Host ""
}

# ---- Build & Upload ESP32 ----
if ($Esp32Only -or $allMode) {
    Write-Host "--------------------------------------------" -ForegroundColor Cyan
    Write-Host "  BUILD & UPLOAD ESP32 (COM4)" -ForegroundColor Cyan
    Write-Host "--------------------------------------------" -ForegroundColor Cyan

    # Kiem tra PlatformIO
    $pioCheck = pio --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  PlatformIO chua duoc cai dat!" -ForegroundColor Red
        Write-Host "  Vui long chay '.\setup.ps1' truoc." -ForegroundColor Yellow
    } else {
        Write-Host "  Dang build firmware..." -ForegroundColor Yellow
        Set-Location "$projectRoot\iot"
        pio run
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Build thanh cong! Dang upload den COM4..." -ForegroundColor Green
            pio run --target upload --upload-port COM4
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Upload thanh cong! Dang mo Serial Monitor..." -ForegroundColor Green
                Start-Process powershell -ArgumentList @"
-NoExit -Command `
    Write-Host '[ESP32] Serial Monitor (COM4, 115200 baud)...' -ForegroundColor Cyan; `
    Set-Location '$projectRoot\iot'; `
    pio device monitor --port COM4 --baud 115200
"@
            } else {
                Write-Host "  Loi khi upload! Thu lai hoac kiem tra ket noi COM4." -ForegroundColor Red
            }
        } else {
            Write-Host "  Build that bai! Kiem tra loi o tren." -ForegroundColor Red
        }
        Set-Location $projectRoot
    }
    Write-Host ""
}

# ---- Khoi dong Flutter Mobile App ----
if ($MobileOnly -or $allMode) {
    Write-Host "--------------------------------------------" -ForegroundColor Cyan
    Write-Host "  KHOI DONG MOBILE APP (Flutter)" -ForegroundColor Cyan
    Write-Host "--------------------------------------------" -ForegroundColor Cyan

    # Kiem tra thiet bi ket noi
    $flutterDevices = flutter devices 2>&1
    Write-Host $flutterDevices

    Set-Location "$projectRoot\mobile"
    Write-Host "  Dang chay Flutter app..." -ForegroundColor Yellow
    flutter run
    Set-Location $projectRoot
    Write-Host ""
}

# ---- Huong dan test thu cong ----
if ($allMode) {
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  HUONG DAN TEST" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. ESP32 - Ket noi WiFi:" -ForegroundColor White
    Write-Host "   - Ket noi WiFi 'Vending_Setup' (mat khau: 12345678)" -ForegroundColor White
    Write-Host "   - Mo trinh duyet den 192.168.4.1" -ForegroundColor White
    Write-Host "   - Nhap thong tin WiFi cua ban" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Backend API - Test bang curl:" -ForegroundColor White
    Write-Host "   curl http://localhost:3000/health" -ForegroundColor White
    Write-Host "   curl http://localhost:3000/api/vending/machines" -ForegroundColor White
    Write-Host ""
    Write-Host "3. ESP32 - Test mua hang bang Serial:" -ForegroundColor White
    Write-Host "   - Mo Serial Monitor (115200 baud)" -ForegroundColor White
    Write-Host "   - Gui '1', '2', '3', hoac '4' de mua hang" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Mobile App - Test day du luong mua hang" -ForegroundColor White
    Write-Host ""
}

Write-Host "Nhan phim bat ky de thoat..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
