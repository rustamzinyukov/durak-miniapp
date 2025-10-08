@echo off
echo Starting Telegram User Photo Server...
echo.

cd /d "%~dp0server"

if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

if not exist ".env" (
    echo Creating .env file...
    echo TELEGRAM_BOT_TOKEN=your_bot_token_here > .env
    echo PORT=3001 >> .env
    echo.
    echo ⚠️  Please edit .env file and add your bot token!
    echo.
)

echo Starting server...
npm start

pause
