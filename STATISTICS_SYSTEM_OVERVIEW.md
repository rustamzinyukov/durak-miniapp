# 📊 Система статистики - Обзор архитектуры

## 🏗️ Архитектура системы

### 📁 Структура файлов
```
durak-miniapp-clean/
├── script.js                    # Основная логика игры и статистики
├── index.html                   # HTML с модальным окном статистики
├── api/
│   └── stats/
│       └── load.js              # Mock API endpoint для загрузки
└── (localStorage)               # Локальное хранилище браузера
```

## 🗄️ Хранение данных

### 1. **Основное хранилище: Backend API**
- **URL**: `/api/stats/load` и `/api/stats/save`
- **Метод**: GET (загрузка) и POST (сохранение)
- **Формат**: JSON
- **Статус**: ❌ **НЕ РЕАЛИЗОВАН** (только mock файл)

### 2. **Fallback хранилище: localStorage**
- **Ключ**: `'playerStats'`
- **Формат**: JSON строка
- **Статус**: ✅ **РАБОТАЕТ** (основное хранилище)

### 3. **Временное хранилище: state.playerStats**
- **Расположение**: В памяти браузера
- **Обновление**: В реальном времени
- **Статус**: ✅ **РАБОТАЕТ**

## 🆔 Идентификация игрока

### ❌ **ПРОБЛЕМА: Нет уникального ID игрока**

**Текущая ситуация:**
- Статистика привязана к браузеру/устройству
- Нет авторизации или регистрации
- Нет связи с Telegram WebApp данными
- При смене браузера/устройства статистика теряется

**Возможные решения:**
1. **Telegram WebApp ID** - использовать `tg.initDataUnsafe.user.id`
2. **Локальный UUID** - генерировать при первом запуске
3. **Telegram username** - использовать `tg.initDataUnsafe.user.username`

## 📊 Структура данных статистики

### 🎯 **Объект playerStats:**
```javascript
{
  totalGames: 0,        // Общее количество игр
  wins: 0,              // Количество побед
  losses: 0,            // Количество поражений
  currentStreak: 0,     // Текущая серия побед
  bestStreak: 0,        // Лучшая серия побед
  lastResult: null      // Последний результат ('win'/'loss')
}
```

### 📈 **Расчетные поля:**
- **Процент побед**: `(wins / totalGames) * 100`
- **Процент поражений**: `(losses / totalGames) * 100`

## 🔄 Жизненный цикл статистики

### 1. **Загрузка при запуске**
```javascript
// В main() функции
loadPlayerStats(); // Загружает из API или localStorage
```

### 2. **Обновление после игры**
```javascript
// В showEndgameModal() функции
const humanWon = title === "Вы выиграли!";
updatePlayerStats(humanWon ? 'win' : 'loss');
```

### 3. **Сохранение после обновления**
```javascript
// В updatePlayerStats() функции
StatsAPI.saveStats(state.playerStats); // Сохраняет в API и localStorage
```

## 🎮 Точки обновления статистики

### ✅ **Реализовано:**
- **Конец игры** - когда колода пуста и у кого-то закончились карты
- **Победа игрока** - `totalGames++`, `wins++`, обновление серий
- **Поражение игрока** - `totalGames++`, `losses++`, сброс серии

### ❌ **НЕ реализовано:**
- **Сдача игры** - когда игрок нажимает "Взять"
- **Промежуточные результаты** - во время игры
- **Детальная статистика** - по темам, времени игры, сложности

## 🔧 API клиент (StatsAPI)

### 📤 **Загрузка статистики:**
```javascript
async loadStats() {
  try {
    // 1. Пытаемся загрузить с сервера
    const response = await fetch('/api/stats/load');
    if (response.ok) return await response.json();
  } catch (e) {
    // 2. Fallback на localStorage
    const saved = localStorage.getItem('playerStats');
    return saved ? JSON.parse(saved) : defaultStats;
  }
}
```

### 💾 **Сохранение статистики:**
```javascript
async saveStats(stats) {
  try {
    // 1. Пытаемся сохранить на сервер
    await fetch('/api/stats/save', {
      method: 'POST',
      body: JSON.stringify(stats)
    });
  } catch (e) {
    // 2. Fallback на localStorage
    localStorage.setItem('playerStats', JSON.stringify(stats));
  }
}
```

## 🎯 Модальное окно статистики

### 📱 **UI элементы:**
- **Всего игр**: `totalGames`
- **Победы**: `wins`
- **Поражения**: `losses`
- **Процент побед**: `(wins / totalGames) * 100`
- **Текущая серия**: `currentStreak`
- **Лучшая серия**: `bestStreak`

### 🎨 **Стили:**
- Grid layout для отображения
- Тематические цвета
- Адаптивный дизайн

## 🚨 Текущие проблемы

### 1. **Нет уникального ID игрока**
- Статистика привязана к браузеру
- При смене устройства теряется
- Нет связи с Telegram

### 2. **Mock API**
- Серверные endpoints не реализованы
- Только localStorage fallback
- Нет синхронизации между устройствами

### 3. **Ограниченная статистика**
- Только базовые метрики
- Нет детализации по темам
- Нет временных метрик

## 🔮 Возможные улучшения

### 1. **Telegram WebApp интеграция**
```javascript
// Получение ID пользователя из Telegram
const userId = tg.initDataUnsafe?.user?.id;
const username = tg.initDataUnsafe?.user?.username;
```

### 2. **Реальный backend API**
```javascript
// Серверные endpoints
POST /api/stats/save
GET /api/stats/load/:userId
PUT /api/stats/update/:userId
```

### 3. **Расширенная статистика**
```javascript
{
  // Базовые метрики
  totalGames: 0,
  wins: 0,
  losses: 0,
  
  // Детализация по темам
  themeStats: {
    casino: { games: 0, wins: 0 },
    tavern: { games: 0, wins: 0 },
    underground: { games: 0, wins: 0 }
  },
  
  // Временные метрики
  averageGameTime: 0,
  totalPlayTime: 0,
  
  // Достижения
  achievements: [],
  
  // Рейтинг
  rating: 1000,
  rank: 'Новичок'
}
```

## 📋 Резюме

### ✅ **Что работает:**
- Локальное хранение в localStorage
- Обновление статистики после игры
- Модальное окно с отображением
- Fallback система при ошибках API

### ❌ **Что не работает:**
- Серверные API endpoints
- Уникальная идентификация игрока
- Синхронизация между устройствами
- Детальная статистика

### 🎯 **Рекомендации:**
1. **Добавить Telegram WebApp ID** для идентификации
2. **Реализовать реальный backend API** для синхронизации
3. **Расширить метрики** для более детальной статистики
4. **Добавить достижения** для мотивации игроков

Текущая система работает локально, но не готова для продакшена без backend API и уникальной идентификации пользователей.


