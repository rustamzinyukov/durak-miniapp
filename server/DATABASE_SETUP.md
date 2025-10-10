# 🗄️ Настройка PostgreSQL на Railway

## 📋 Пошаговая инструкция

### Шаг 1: Добавить PostgreSQL в Railway

1. Откройте [Railway Dashboard](https://railway.app/)
2. Откройте ваш проект `durak-miniapp`
3. Нажмите **"+ New Service"**
4. Выберите **"Database"** → **"PostgreSQL"**
5. Railway автоматически создаст базу данных

### Шаг 2: Проверить переменные окружения

После создания PostgreSQL, Railway автоматически создаст переменные:

```
DATABASE_URL=postgresql://user:password@host:5432/database
PGHOST=host.railway.app
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=railway
```

**Важно:** Переменная `DATABASE_URL` должна быть доступна в вашем основном сервисе (не только в PostgreSQL).

### Шаг 3: Связать PostgreSQL с вашим сервисом

1. В Railway Dashboard откройте ваш **основной сервис** (durak-miniapp)
2. Перейдите на вкладку **"Variables"**
3. Нажмите **"+ New Variable"** → **"Reference"**
4. Выберите:
   - **Service**: PostgreSQL
   - **Variable**: `DATABASE_URL`
5. Нажмите **"Add"**

Или добавьте вручную:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Шаг 4: Проверить деплой

После добавления переменной, Railway автоматически передеплоит ваш сервис.

Проверьте логи:
```
🔄 Initializing database...
🔍 DATABASE_URL: Set
🔌 Testing database connection...
✅ Database connection successful: [timestamp]
📄 Reading schema.sql...
📝 Executing schema...
✅ Database schema initialized successfully
```

### Шаг 5: Проверить работу API

Откройте в браузере:
```
https://durak-miniapp-production.up.railway.app/api/stats/summary
```

Должны увидеть:
```json
{
  "success": true,
  "data": {
    "total_players": 0,
    "total_games": 0,
    "total_wins": 0,
    "total_losses": 0,
    "avg_win_rate": 0
  }
}
```

---

## 🔍 Проверка подключения

### Вариант 1: Через Railway CLI

```bash
railway login
railway link
railway run psql $DATABASE_URL
```

### Вариант 2: Через Railway Dashboard

1. Откройте сервис **PostgreSQL**
2. Перейдите на вкладку **"Data"**
3. Откроется встроенный клиент PostgreSQL

### Вариант 3: Через админ-панель

После деплоя откройте:
```
https://durak-miniapp-production.up.railway.app/admin/admin.html
```

Если база данных работает, вы увидите статистику.

---

## ⚠️ Устранение проблем

### Проблема: `read ECONNRESET`

**Причины:**
1. База данных еще инициализируется (подождите 1-2 минуты)
2. Неправильная переменная `DATABASE_URL`
3. SSL конфигурация

**Решение:**
1. Проверьте, что переменная `DATABASE_URL` существует в основном сервисе
2. Проверьте формат: `postgresql://user:password@host:5432/database`
3. Убедитесь, что в коде включен SSL: `ssl: { rejectUnauthorized: false }`

### Проблема: База данных создана, но таблиц нет

**Решение:**
1. Проверьте логи Railway: `railway logs`
2. Если `schema.sql` не выполнился, выполните вручную:
   - Откройте Railway Dashboard → PostgreSQL → Data
   - Скопируйте содержимое `server/database/schema.sql`
   - Вставьте и выполните

### Проблема: Переменная DATABASE_URL не видна

**Решение:**
1. Railway Dashboard → Ваш сервис → Variables
2. Добавьте вручную:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```
3. Или скопируйте значение напрямую из PostgreSQL сервиса

---

## 📊 Альтернатива: Использовать Railway Database UI

Railway предоставляет встроенный интерфейс для работы с PostgreSQL:

1. Откройте сервис **PostgreSQL** в Railway
2. Перейдите на вкладку **"Data"**
3. Можете выполнять SQL запросы прямо там
4. Смотреть таблицы и данные

---

## 🔐 Настройка без PostgreSQL (опционально)

Если не хотите использовать PostgreSQL сейчас, можете использовать **только Telegram Cloud Storage**:

1. Закомментируйте вызов `initializeDatabase()` в `get-user-photo.js`
2. Клиентская часть будет работать без изменений
3. Админ-панель будет недоступна
4. Данные будут храниться только локально у каждого игрока

---

## 📞 Поддержка

Если проблемы продолжаются:

1. **Проверьте логи Railway:**
   ```bash
   railway logs
   ```

2. **Проверьте переменные:**
   ```bash
   railway variables
   ```

3. **Перезапустите сервис:**
   Railway Dashboard → Ваш сервис → Settings → "Restart"

