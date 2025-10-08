# 🔧 Настройка сервера для фотографий

## ❌ Проблема: Фотографии не загружаются

### 1. Проверьте, что сервер запущен:
```bash
# Откройте новое окно командной строки
cd C:\Users\Public\durak-miniapp-clean\server
npm start
```

Должно появиться:
```
Server running on port 3001
Health check: http://localhost:3001/health
```

### 2. Настройте токен бота:

**Важно!** Нужен реальный токен бота, а не `your_bot_token_here`

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен (выглядит как `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
3. Отредактируйте файл `server/.env`:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
PORT=3001
```

### 3. Перезапустите сервер:
```bash
# Остановите сервер (Ctrl+C)
# Затем запустите снова:
npm start
```

### 4. Проверьте работу:
Откройте в браузере: http://localhost:3001/test

Должно показать:
```json
{
  "message": "Server is working!",
  "botToken": "Configured",
  "timestamp": "2025-01-08T..."
}
```

## 🔍 Отладка

### Откройте консоль браузера (F12) и посмотрите на сообщения:

✅ **Если сервер работает:**
- `🔄 Trying to get photo through server API...`
- `📡 Server response status: 200`
- `✅ Got photo from server API:`

❌ **Если сервер не работает:**
- `❌ Server API error: Failed to fetch`
- `⚠️ Server API not available`

### Проверьте в браузере:
- http://localhost:3001/health - статус сервера
- http://localhost:3001/test - тест сервера

## 🚨 Частые проблемы:

1. **"Cannot GET /test"** - сервер не перезапустился
2. **"Failed to fetch"** - сервер не запущен
3. **"Bot token not configured"** - не настроен токен
4. **"No profile photos found"** - у пользователя нет фото в профиле

## 💡 Решение:

Если ничего не помогает, приложение работает и без сервера - просто покажет инициалы вместо фото!
