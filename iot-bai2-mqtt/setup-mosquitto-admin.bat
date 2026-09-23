@echo off
title Setup Mosquitto - IoT Bai 2

REM Kiem tra quyen Admin
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo [LOI] Phai chay voi quyen Admin: chuot phai file nay ^> Run as administrator
  pause
  exit /b 1
)

echo === SETUP MOSQUITTO BAI 2 ===
echo.

REM 1) Them cau hinh listener 1888 neu chua co
findstr /C:"listener 1888" "C:\Program Files\mosquitto\mosquitto.conf" >nul 2>&1
if %errorlevel% neq 0 (
  >>"C:\Program Files\mosquitto\mosquitto.conf" echo listener 1888
  >>"C:\Program Files\mosquitto\mosquitto.conf" echo allow_anonymous false
  >>"C:\Program Files\mosquitto\mosquitto.conf" echo password_file C:\Program Files\mosquitto\pwfile
  echo [OK] Da them cau hinh vao mosquitto.conf
) else (
  echo [SKIP] Cau hinh listener 1888 da co san
)

REM 2) Dat lai tai khoan: iotuser / 123456
"C:\Program Files\mosquitto\mosquitto_passwd.exe" -b -c "C:\Program Files\mosquitto\pwfile" iotuser 123456
echo [OK] Tai khoan broker: iotuser / 123456

REM 3) Restart service de nap cau hinh moi
net stop mosquitto
net start mosquitto

REM 4) Firewall (chay lai khong sao)
netsh advfirewall firewall add rule name="Mosquitto 1888" dir=in action=allow protocol=TCP localport=1888 >nul 2>&1
echo [OK] Firewall rule port 1888

echo.
echo === XONG! Quay lai bao Claude de kiem tra ===
pause
