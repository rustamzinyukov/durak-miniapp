# 📊 Настройка системы сбора статистики

## 🎯 Обзор

Система собирает статистику игроков в PostgreSQL базу данных и предоставляет API для доступа к данным.

## 📁 Структура файлов

```
server/
├── database/
│   ├── schema.sql          # SQL схема базы данных
│   └── db.js               # Подключение к PostgreSQL
├── api/
│   └── stats.js            # API endpoints для статистики
├── public/
│   └── admin.html          # Админ-панель для просмотра статистики
├── get-user-photo.js       # Главный файл сервера
└── package.json
```

## 🔧 Настройка

### 1. Установка зависимостей

```bash
cd server
npm install
```

### 2. Настройка PostgreSQL на Railway

1. Войдите в Railway Dashboard
2. Откройте ваш проект `durak-miniapp`
3. Добавьте PostgreSQL:
   - Click "+ New Service"
   - Select "Database" → "PostgreSQL"
4. Railway автоматически создаст переменную окружения `DATABASE_URL`

### 3. Инициализация базы данных

При первом запуске сервер автоматически:
- Создаст все необходимые таблицы
- Создаст индексы
- Создаст представления (views) для аналитики

### 4. Запуск сервера

Локально:
```bash
npm run dev
```

На Railway:
- Сервер запустится автоматически после деплоя

## 📡 API Endpoints

### Сохранить статистику игрока

```http
POST /api/stats
Content-Type: application/json

{
  "telegram_user_id": 123456789,
  "username": "player123",
  "first_name": "John",
  "last_name": "Doe",
  "stats": {
    "totalGames": 50,
    "wins": 30,
    "losses": 20,
    "currentStreak": 3,
    "bestStreak": 5,
    "lastResult": "win",
    "achievements": {...},
    "detailed": {...}
  }
}
```

### Сохранить запись об игре

```http
POST /api/stats/game
Content-Type: application/json

{
  "telegram_user_id": 123456789,
  "result": "win",
  "duration": 180,
  "cards_played": 15,
  "theme": "casino"
}
```

### Получить статистику игрока

```http
GET /api/stats/:telegram_user_id
```

### Получить таблицу лидеров

```http
GET /api/stats/leaderboard?limit=100&offset=0
```

### Получить последние игры

```http
GET /api/stats/recent-games?limit=100&offset=0
```

### Получить общую статистику

```http
GET /api/stats/summary
```

## 🖥️ Админ-панель

После деплоя откройте:
```
https://durak-miniapp-production.up.railway.app/admin/admin.html
```

Админ-панель показывает:
- ✅ Общую статистику (игроки, игры, победы)
- ✅ Таблицу лидеров (топ-50 игроков)
- ✅ Последние игры (последние 50 игр)

## 🔍 Проверка работы

### 1. Проверить подключение к БД

```bash
curl https://durak-miniapp-production.up.railway.app/health
```

### 2. Проверить API статистики

```bash
curl https://durak-miniapp-production.up.railway.app/api/stats/summary
```

### 3. Отправить тестовую статистику

```bash
curl -X POST https://durak-miniapp-production.up.railway.app/api/stats \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_user_id": 999999,
    "username": "test_user",
    "first_name": "Test",
    "stats": {
      "totalGames": 1,
      "wins": 1,
      "losses": 0,
      "currentStreak": 1,
      "bestStreak": 1,
      "lastResult": "win"
    }
  }'
```

## 📊 База данных

### Таблицы

**player_stats** - Статистика игроков
- Поля: id, telegram_user_id, username, first_name, total_games, wins, losses, etc.
- Индексы: telegram_user_id (unique), updated_at, total_games

**game_history** - История игр
- Поля: id, telegram_user_id, result, duration, cards_played, theme, played_at
- Индексы: telegram_user_id, played_at

### Представления (Views)

**top_players** - Топ игроков по победам
**recent_games** - Последние игры с информацией об игроках

## 🔐 Безопасность

В продакшене рекомендуется:
1. Добавить аутентификацию для админ-панели
2. Валидировать telegram_user_id через Telegram Bot API
3. Добавить rate limiting для API endpoints

## 🐛 Отладка

Проверить логи на Railway:
```
railway logs
```

Проверить подключение к БД локально:
```javascript
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res);
  pool.end();
});
```

## 📝 Примечания

- Статистика отправляется на сервер **асинхронно** - не блокирует игру
- При ошибке отправки игра продолжается нормально
- Данные дублируются в Telegram Cloud Storage (резерв)
- База данных автоматически создает индексы для быстрых запросов

