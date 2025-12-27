@echo off
echo Starting Study Room Server...
echo ============================
echo Node Path: C:\Program Files\nodejs\node.exe
echo ============================

SET "PATH=%PATH%;C:\Program Files\nodejs"

echo Installing dependencies (if needed)...
call "C:\Program Files\nodejs\npm.cmd" install

echo.
echo Starting Server...
call "C:\Program Files\nodejs\npm.cmd" run dev

pause
