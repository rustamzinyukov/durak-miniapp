# 🚀 Быстрый запуск Telegram Mini App

## 1. Создайте бота (5 минут)

1. **Откройте Telegram** и найдите **@BotFather**
2. **Отправьте:** `/newbot`
3. **Введите имя:** `Дурак - Карточная игра`
4. **Введите username:** `durak_game_bot` (должен заканчиваться на `_bot`)
5. **Скопируйте токен** (выглядит как `123456789:ABCdef...`)

## 2. Настройте Mini App

1. **Отправьте @BotFather:** `/newapp`
2. **Выберите вашего бота**
3. **Название:** `Дурак - Классическая карточная игра`
4. **Описание:** `Играйте в классическую карточную игру Дурак с агрессивным ИИ Джокером!`
5. **Иконка:** Загрузите файл `logo/durak.png`
6. **URL приложения:** `https://ваш-домен.com/durak-miniapp-clean/`
7. **URL для открытия:** `https://ваш-домен.com/durak-miniapp-clean/`

## 3. Запустите локальный сервер

### Вариант A: Python (если установлен)
```bash
cd C:\Users\Public\durak-miniapp-clean
python -m http.server 8085
```

### Вариант B: Node.js (если установлен)
```bash
cd C:\Users\Public\durak-miniapp-clean
npx http-server -p 8085
```

### Вариант C: Live Server (VS Code)
1. Откройте папку в VS Code
2. Установите расширение "Live Server"
3. Правый клик на `index.html` → "Open with Live Server"

## 4. Создайте туннель (для внешнего доступа)

### Установите ngrok:
1. Скачайте с https://ngrok.com/
2. Распакуйте в папку проекта
3. Запустите:
```bash
ngrok http 8085
```
4. Скопируйте HTTPS URL (например: `https://abc123.ngrok.io`)

## 5. Обновите URL в боте

1. **Отправьте @BotFather:** `/mybots`
2. **Выберите вашего бота**
3. **Bot Settings** → **Mini App**
4. **Измените URL** на ваш ngrok URL + `/durak-miniapp-clean/`

## 6. Тестируйте!

1. **Найдите бота** в Telegram по username
2. **Отправьте:** `/start`
3. **Нажмите кнопку** "🎮 Играть"
4. **Mini App откроется** в Telegram!

## 7. Готовый бот (опционально)

Если хотите создать полноценного бота:

```bash
# Установите зависимости
npm install

# Отредактируйте bot.js - вставьте ваш токен
# Запустите бота
npm start
```

## 🔧 Полезные команды

- `/mybots` - Управление ботами
- `/setcommands` - Настройка команд
- `/setdescription` - Описание бота
- `/setuserpic` - Аватар бота

## 📱 Готово!

Теперь ваш Mini App работает в Telegram! 🎮✨







