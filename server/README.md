# Telegram User Photo Server

Серверная часть для получения фотографий профиля пользователей Telegram через Bot API.

## 🚀 Установка и запуск

### 1. Установка зависимостей

```bash
cd server
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` в папке `server`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
PORT=3001
```

### 3. Запуск сервера

```bash
# Обычный запуск
npm start

# Запуск в режиме разработки (с автоперезагрузкой)
npm run dev
```

## 📡 API Endpoints

### GET `/api/user-photo/:userId`

Получает фотографию профиля пользователя по его ID.

**Параметры:**
- `userId` - ID пользователя Telegram

**Ответ при успехе:**
```json
{
  "success": true,
  "hasPhoto": true,
  "photoUrl": "https://api.telegram.org/file/bot<token>/<file_path>",
  "fileId": "AgACAgIAAxUAAWF9mWiRH4LUDnqk3v_ivfIu-olMAALVpzEb9I5UD4fMFih4no10AQADAgADYQADIQQ",
  "width": 640,
  "height": 640,
  "fileSize": 52226
}
```

**Ответ при отсутствии фото:**
```json
{
  "success": false,
  "message": "No profile photos found",
  "hasPhoto": false
}
```

### GET `/health`

Проверка состояния сервера.

## 🔧 Настройка клиентской части

В файле `script.js` уже настроена интеграция с сервером. Сервер должен быть доступен по адресу `/api/user-photo/`.

Если сервер запущен на другом порту или домене, измените URL в коде:

```javascript
fetch(`http://localhost:3001/api/user-photo/${user.id}`)
```

## 🛡️ Безопасность

⚠️ **Важно:** Не размещайте токен бота в клиентском коде! Используйте переменные окружения.

## 📝 Логи

Сервер выводит подробные логи в консоль:
- Успешные запросы к Bot API
- Ошибки получения фотографий
- Информацию о размерах и типах файлов

## 🔄 Интеграция с Mini App

Клиентский код автоматически:
1. Пытается получить фото через WebApp API
2. Если не получается, обращается к серверу
3. Если сервер недоступен, использует оригинальный URL
4. При неудаче показывает инициалы пользователя

## 🐛 Отладка

Для отладки откройте консоль браузера и посмотрите на сообщения:
- `🔄 Trying to get photo through server API...`
- `✅ Got photo from server API:`
- `⚠️ Server API not available:`
