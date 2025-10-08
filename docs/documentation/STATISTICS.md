# 📊 Система статистики

## 🎯 Обзор

Игра "Дурак" использует двухуровневую систему хранения статистики:
1. **Telegram Cloud Storage** (основной) - для пользователей в Telegram Mini App
2. **localStorage** (резервный) - для браузерной версии и backup

## 🔄 Архитектура

### Telegram Cloud Storage
- **API**: `window.Telegram.WebApp.CloudStorage`
- **Хранилище**: Облачное хранилище Telegram
- **Синхронизация**: Автоматическая между всеми устройствами
- **Привязка**: К Telegram User ID
- **Надежность**: Высокая (не теряется при очистке кэша)

### localStorage (Fallback)
- **API**: `localStorage`
- **Хранилище**: Локальное хранилище браузера
- **Синхронизация**: Нет
- **Привязка**: К устройству и браузеру
- **Надежность**: Средняя (теряется при очистке кэша)

## 📦 Структура данных

```javascript
{
  totalGames: 0,      // Общее количество игр
  wins: 0,            // Количество побед
  losses: 0,          // Количество поражений
  currentStreak: 0,   // Текущая серия побед/поражений
  bestStreak: 0,      // Лучшая серия побед
  lastResult: null    // Результат последней игры ('win' или 'loss')
}
```

## 🔧 API методы

### `StatsAPI.loadStats()`
Загружает статистику из хранилища.

**Алгоритм:**
1. Проверяет доступность Telegram Cloud Storage
2. Если доступен - загружает из Cloud
3. Если недоступен или ошибка - загружает из localStorage
4. Если нет данных - возвращает дефолтные значения

**Возвращает:** `Promise<Object>` - объект со статистикой

```javascript
const stats = await StatsAPI.loadStats();
console.log('Статистика:', stats);
```

### `StatsAPI.saveStats(stats)`
Сохраняет статистику в хранилище.

**Параметры:**
- `stats` (Object) - объект со статистикой

**Алгоритм:**
1. Проверяет доступность Telegram Cloud Storage
2. Если доступен - сохраняет в Cloud
3. Также сохраняет в localStorage как backup
4. Если Cloud недоступен - сохраняет только в localStorage

**Возвращает:** `Promise<Boolean>` - успешность операции

```javascript
await StatsAPI.saveStats(state.playerStats);
```

### `StatsAPI.clearStats()`
Очищает всю статистику.

**Алгоритм:**
1. Удаляет данные из Telegram Cloud (если доступен)
2. Удаляет данные из localStorage

**Возвращает:** `Promise<Boolean>` - успешность операции

```javascript
await StatsAPI.clearStats();
```

## 🎮 Использование в игре

### Загрузка статистики при старте

```javascript
async function main() {
  // ... инициализация игры
  
  // Загружаем статистику
  state.playerStats = await StatsAPI.loadStats();
  console.log('📊 Статистика загружена:', state.playerStats);
  
  // ... продолжение инициализации
}
```

### Обновление статистики после игры

```javascript
function updatePlayerStats(result) {
  state.playerStats.totalGames++;
  
  if (result === 'win') {
    state.playerStats.wins++;
    if (state.playerStats.lastResult === 'win') {
      state.playerStats.currentStreak++;
    } else {
      state.playerStats.currentStreak = 1;
    }
    state.playerStats.bestStreak = Math.max(
      state.playerStats.bestStreak, 
      state.playerStats.currentStreak
    );
  } else if (result === 'loss') {
    state.playerStats.losses++;
    state.playerStats.currentStreak = 0;
  }
  
  state.playerStats.lastResult = result;
  
  // Сохраняем обновленную статистику
  StatsAPI.saveStats(state.playerStats);
}
```

### Отображение статистики

```javascript
function showStatsModal() {
  const stats = state.playerStats;
  const winRate = stats.totalGames > 0 
    ? ((stats.wins / stats.totalGames) * 100).toFixed(1) 
    : 0;
  
  const statsText = `
    📊 Статистика игрока
    
    🎮 Всего игр: ${stats.totalGames}
    ✅ Побед: ${stats.wins}
    ❌ Поражений: ${stats.losses}
    📈 % побед: ${winRate}%
    🔥 Текущая серия: ${stats.currentStreak}
    🏆 Лучшая серия: ${stats.bestStreak}
  `;
  
  console.log(statsText);
}
```

## 🛠️ Отладка

### Глобальные функции для консоли

```javascript
// Показать текущую статистику
window.showStats()

// Очистить статистику
await window.clearStats()
```

### Проверка доступности Telegram Cloud

```javascript
if (window.Telegram?.WebApp?.CloudStorage) {
  console.log('✅ Telegram Cloud Storage доступен');
} else {
  console.log('❌ Telegram Cloud Storage недоступен');
}
```

### Логирование операций

Все операции со статистикой логируются в консоль:
- `📊` - загрузка данных
- `💾` - сохранение данных
- `✅` - успешная операция
- `❌` - ошибка операции
- `📱` - fallback на localStorage

## 🔒 Безопасность

### Telegram Cloud Storage
- Данные хранятся на серверах Telegram
- Доступ только через Telegram WebApp API
- Автоматическая привязка к User ID
- Нет доступа из других приложений

### localStorage
- Данные хранятся локально в браузере
- Доступ только из того же домена
- Не передаются на сервер
- Могут быть очищены пользователем

## 📈 Расширение системы

### Добавление новых метрик

```javascript
// 1. Добавить в структуру данных
const stats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastResult: null,
  // Новая метрика
  fastestWin: null  // время самой быстрой победы
};

// 2. Обновить методы Cloud Storage
async loadFromTelegramCloud() {
  const keys = [
    'totalGames', 'wins', 'losses', 
    'currentStreak', 'bestStreak', 'lastResult',
    'fastestWin'  // добавить новый ключ
  ];
  // ...
}

async saveToTelegramCloud(stats) {
  const data = {
    // ... существующие поля
    fastestWin: String(stats.fastestWin || '')
  };
  // ...
}
```

### Добавление глобальной статистики

Для глобального рейтинга потребуется серверная часть:

```javascript
// Server-side (Railway)
// POST /api/stats/global
{
  userId: '12345',
  stats: { ... }
}

// GET /api/stats/leaderboard?limit=10
[
  { userId: '12345', wins: 100, ... },
  { userId: '67890', wins: 95, ... },
  // ...
]
```

## 🚀 Производительность

### Telegram Cloud Storage
- **Запись**: ~100-200ms
- **Чтение**: ~50-100ms
- **Лимиты**: 1024 символа на ключ, до 1024 ключей

### localStorage
- **Запись**: ~1-5ms
- **Чтение**: ~1-5ms
- **Лимиты**: ~5-10MB в зависимости от браузера

### Оптимизация
- Сохранение происходит асинхронно (не блокирует UI)
- localStorage используется как кэш и backup
- Batching для множественных изменений (можно добавить)

## 📝 Примеры использования

### Сброс статистики пользователя

```javascript
// В консоли или через UI
await window.clearStats();
state.playerStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastResult: null
};
```

### Миграция со старой системы

```javascript
// Если была старая система хранения
async function migrateOldStats() {
  const oldStats = localStorage.getItem('oldStatsKey');
  if (oldStats) {
    const stats = JSON.parse(oldStats);
    await StatsAPI.saveStats(stats);
    localStorage.removeItem('oldStatsKey');
    console.log('✅ Статистика мигрирована');
  }
}
```

### Экспорт статистики

```javascript
function exportStats() {
  const stats = state.playerStats;
  const json = JSON.stringify(stats, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'durak-stats.json';
  a.click();
}
```

---

*Документация актуальна на момент внедрения Telegram Cloud Storage*
