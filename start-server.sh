#!/bin/bash
echo "Starting Telegram User Photo Server..."
echo

cd "$(dirname "$0")/server"

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo
fi

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    echo "TELEGRAM_BOT_TOKEN=your_bot_token_here" > .env
    echo "PORT=3001" >> .env
    echo
    echo "⚠️  Please edit .env file and add your bot token!"
    echo
fi

echo "Starting server..."
npm start
