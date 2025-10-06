# 🤖 Настройка Telegram бота для Mini App

## 1. Создание бота

### Шаг 1: Создайте бота через @BotFather
1. Откройте Telegram и найдите **@BotFather**
2. Отправьте команду `/newbot`
3. Введите имя бота: `Дурак - Карточная игра`
4. Введите username бота: `durak_card_game_bot` (должен заканчиваться на `_bot`)
5. Скопируйте **токен бота** (выглядит как `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Шаг 2: Настройте Mini App
1. Отправьте боту @BotFather команду `/newapp`
2. Выберите вашего бота из списка
3. Введите название приложения: `Дурак - Классическая карточная игра`
4. Введите описание: `Играйте в классическую карточную игру Дурак с агрессивным ИИ Джокером!`
5. Загрузите иконку (используйте файл `logo/durak.png`)
6. Введите URL приложения: `https://ваш-домен.com/durak-miniapp-clean/`
7. Введите URL для открытия: `https://ваш-домен.com/durak-miniapp-clean/`

## 2. Настройка веб-сервера

### Для локального тестирования:
```bash
# Установите ngrok для туннелирования
npm install -g ngrok

# Запустите ваш локальный сервер
python -m http.server 8085

# В другом терминале запустите ngrok
ngrok http 8085
```

### Для продакшена:
Загрузите файлы на любой хостинг (GitHub Pages, Netlify, Vercel, etc.)

## 3. Создание простого бота (опционально)

Создайте файл `bot.js`:

```javascript
const { Telegraf } = require('telegraf');
const bot = new Telegraf('YOUR_BOT_TOKEN');

// Команда /start
bot.start((ctx) => {
  ctx.reply('🎮 Добро пожаловать в игру Дурак!', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎮 Играть', web_app: { url: 'https://ваш-домен.com/durak-miniapp-clean/' } }]
      ]
    }
  });
});

// Команда /help
bot.help((ctx) => {
  ctx.reply('🎮 Дурак - Классическая карточная игра\n\n' +
    'Играйте против агрессивного ИИ Джокера!\n\n' +
    'Команды:\n' +
    '/start - Начать игру\n' +
    '/help - Помощь');
});

bot.launch();
console.log('🤖 Бот запущен!');
```

## 4. Тестирование

1. Найдите вашего бота в Telegram по username
2. Отправьте `/start`
3. Нажмите кнопку "🎮 Играть"
4. Mini App должен открыться в Telegram

## 5. Полезные команды для @BotFather

- `/mybots` - Управление вашими ботами
- `/setmenubutton` - Настройка кнопки меню
- `/setcommands` - Настройка команд бота
- `/setdescription` - Описание бота
- `/setabouttext` - О боте
- `/setuserpic` - Аватар бота

## 6. Команды для настройки бота

```
/setcommands
start - Начать игру в Дурак
help - Помощь по игре
```

## 7. Готовые ссылки для тестирования

Если у вас есть ngrok:
```
https://ваш-ngrok-url.ngrok.io/durak-miniapp-clean/
```

Если у вас есть хостинг:
```
https://ваш-домен.com/durak-miniapp-clean/
```

