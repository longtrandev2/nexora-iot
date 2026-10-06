@echo off
title Mosquitto Broker - Bai 2 (port 2005)
echo === MOSQUITTO BROKER BAI 2 - dang chay, GIU CUA SO NAY ===
echo === Log tin nhan di qua broker se hien tai day ===
echo.
REM %~dp0 = thu muc chua file bat nay, tu dong tim mosquitto.conf canh ben
REM LUU Y: mosquitto.exe khong doc duoc duong dan co dau tieng Viet —
REM copy ca folder nay vao thu muc khong dau (vd D:\Project\IOT\iot-bai2-mqtt) roi chay tu do.
"C:\Program Files\mosquitto\mosquitto.exe" -c "%~dp0mosquitto.conf" -v
pause
