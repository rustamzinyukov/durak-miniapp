# 🚀 План интеграции с Telegram MiniApp

## 📋 Текущее состояние

### ✅ **Что уже есть:**
- Полнофункциональная игра "Дурак"
- Система тем (Casino, Tavern, Underground)
- Звуковая система
- Система статистики (локальная)
- Адаптивный дизайн
- Модальные окна

### ❌ **Что нужно добавить:**
- Telegram WebApp SDK интеграция
- Уникальная идентификация пользователей
- Серверная синхронизация статистики
- Telegram-специфичные функции
- Обработка Telegram событий

## 🎯 Этапы интеграции

### 📱 **Этап 1: Базовая интеграция Telegram WebApp**

#### 1.1 Настройка Telegram WebApp SDK
```javascript
// В index.html уже подключен SDK
<script src="https://cdn.jsdelivr.net/npm/@twa-dev/sdk@latest"></script>
```

#### 1.2 Инициализация WebApp
```javascript
// В script.js добавить
function initTelegramWebApp() {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // Расширяем на весь экран
    tg.expand();
    
    // Отключаем скролл
    tg.enableClosingConfirmation();
    
    // Получаем данные пользователя
    const user = tg.initDataUnsafe?.user;
    if (user) {
      console.log('👤 Telegram User:', user);
      state.telegramUser = user;
    }
    
    // Настраиваем тему
    tg.setHeaderColor('#2B1B17'); // Цвет темы Tavern
    
    return tg;
  }
  return null;
}
```

#### 1.3 Интеграция в main()
```javascript
function main() {
  // ... существующий код ...
  
  // Инициализируем Telegram WebApp
  const tg = initTelegramWebApp();
  if (tg) {
    console.log('📱 Telegram WebApp инициализирован');
  }
  
  // ... остальной код ...
}
```

### 🆔 **Этап 2: Уникальная идентификация пользователей**

#### 2.1 Получение Telegram ID
```javascript
function getTelegramUserId() {
  const tg = window.Telegram?.WebApp;
  if (tg?.initDataUnsafe?.user?.id) {
    return tg.initDataUnsafe.user.id.toString();
  }
  return null;
}
```

#### 2.2 Обновление системы статистики
```javascript
// Обновляем StatsAPI для работы с Telegram ID
const StatsAPI = {
  baseUrl: '/api/stats',
  
  async loadStats() {
    const userId = getTelegramUserId();
    if (!userId) {
      // Fallback на localStorage
      return this.loadFromLocalStorage();
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/load/${userId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.log('Ошибка загрузки с сервера, используем localStorage');
    }
    
    return this.loadFromLocalStorage();
  },
  
  async saveStats(stats) {
    const userId = getTelegramUserId();
    if (!userId) {
      // Fallback на localStorage
      return this.saveToLocalStorage(stats);
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, stats })
      });
      
      if (response.ok) {
        // Также сохраняем локально как backup
        this.saveToLocalStorage(stats);
        return true;
      }
    } catch (e) {
      console.log('Ошибка сохранения на сервер, используем localStorage');
    }
    
    return this.saveToLocalStorage(stats);
  },
  
  loadFromLocalStorage() {
    const saved = localStorage.getItem('playerStats');
    return saved ? JSON.parse(saved) : defaultStats;
  },
  
  saveToLocalStorage(stats) {
    localStorage.setItem('playerStats', JSON.stringify(stats));
    return true;
  }
};
```

### 🎨 **Этап 3: Telegram-специфичные функции**

#### 3.1 Кнопки Telegram
```javascript
function setupTelegramButtons() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  
  // Основная кнопка "Новая игра"
  tg.MainButton.setText('🎮 Новая игра');
  tg.MainButton.onClick(() => {
    restartGame();
    tg.MainButton.hide();
  });
  
  // Кнопка "Поделиться результатом"
  tg.MainButton.setText('📤 Поделиться');
  tg.MainButton.onClick(() => {
    shareGameResult();
  });
  
  // Кнопка "Статистика"
  tg.MainButton.setText('📊 Статистика');
  tg.MainButton.onClick(() => {
    showStatsModal();
  });
}
```

#### 3.2 Вибрация и уведомления
```javascript
function addTelegramHaptics() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  
  // Вибрация при выигрыше
  function onGameWin() {
    tg.HapticFeedback.notificationOccurred('success');
  }
  
  // Вибрация при проигрыше
  function onGameLose() {
    tg.HapticFeedback.notificationOccurred('error');
  }
  
  // Вибрация при нажатии кнопок
  function onButtonClick() {
    tg.HapticFeedback.impactOccurred('light');
  }
  
  // Интегрируем в существующие функции
  // В showEndgameModal добавить:
  if (title === "Вы выиграли!") {
    onGameWin();
  } else {
    onGameLose();
  }
}
```

#### 3.3 Поделиться результатом
```javascript
function shareGameResult() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  
  const stats = state.playerStats;
  const message = `🎮 Игра "Дурак" завершена!
  
📊 Моя статистика:
• Всего игр: ${stats.totalGames}
• Побед: ${stats.wins}
• Поражений: ${stats.losses}
• Процент побед: ${Math.round((stats.wins / stats.totalGames) * 100)}%
• Текущая серия: ${stats.currentStreak}
• Лучшая серия: ${stats.bestStreak}

🎯 Сыграй и ты!`;

  tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`);
}
```

### 🎨 **Этап 4: Адаптация под Telegram**

#### 4.1 Темная тема Telegram
```javascript
function adaptToTelegramTheme() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  
  // Получаем цветовую схему Telegram
  const colorScheme = tg.colorScheme;
  const themeParams = tg.themeParams;
  
  if (colorScheme === 'dark') {
    // Применяем темную тему
    document.body.classList.add('telegram-dark');
  }
  
  // Используем цвета Telegram
  if (themeParams.bg_color) {
    document.documentElement.style.setProperty('--telegram-bg', themeParams.bg_color);
  }
  if (themeParams.text_color) {
    document.documentElement.style.setProperty('--telegram-text', themeParams.text_color);
  }
}
```

#### 4.2 Адаптация интерфейса
```css
/* Telegram-специфичные стили */
.telegram-dark {
  --bg-color: var(--telegram-bg, #2B1B17);
  --text-color: var(--telegram-text, #D4B08C);
}

/* Скрываем элементы, не нужные в Telegram */
.telegram-miniapp .header-left .stats-button {
  display: none; /* Скрываем кнопку статистики, используем Telegram кнопку */
}

/* Адаптируем модальные окна под Telegram */
.telegram-miniapp .modal {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### 🔧 **Этап 5: Серверная интеграция**

#### 5.1 Backend API endpoints
```javascript
// Создать файлы:
// api/stats/load.js - загрузка статистики
// api/stats/save.js - сохранение статистики
// api/stats/leaderboard.js - таблица лидеров
```

#### 5.2 Структура API
```javascript
// GET /api/stats/load/:userId
{
  "success": true,
  "data": {
    "userId": "123456789",
    "stats": {
      "totalGames": 10,
      "wins": 7,
      "losses": 3,
      "currentStreak": 2,
      "bestStreak": 4,
      "lastResult": "win"
    }
  }
}

// POST /api/stats/save
{
  "userId": "123456789",
  "stats": {
    "totalGames": 11,
    "wins": 8,
    "losses": 3,
    "currentStreak": 3,
    "bestStreak": 4,
    "lastResult": "win"
  }
}
```

### 🎯 **Этап 6: Дополнительные функции**

#### 6.1 Таблица лидеров
```javascript
function showLeaderboard() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  
  // Загружаем данные лидеров
  fetch('/api/stats/leaderboard')
    .then(response => response.json())
    .then(data => {
      const message = `🏆 Таблица лидеров:
      
1. ${data[0].username} - ${data[0].wins} побед
2. ${data[1].username} - ${data[1].wins} побед
3. ${data[2].username} - ${data[2].wins} побед

Твоя позиция: ${data.findIndex(u => u.userId === getTelegramUserId()) + 1}`;
      
      tg.showAlert(message);
    });
}
```

#### 6.2 Достижения
```javascript
function checkAchievements() {
  const stats = state.playerStats;
  const achievements = [];
  
  if (stats.wins >= 10) achievements.push('🎯 Первые 10 побед');
  if (stats.currentStreak >= 5) achievements.push('🔥 Серия из 5 побед');
  if (stats.totalGames >= 50) achievements.push('🎮 50 игр сыграно');
  
  if (achievements.length > 0) {
    const tg = window.Telegram?.WebApp;
    tg.showAlert(`🏆 Новое достижение!\n\n${achievements.join('\n')}`);
  }
}
```

## 📁 Структура файлов после интеграции

```
durak-miniapp-clean/
├── index.html                    # ✅ Обновлен для Telegram
├── script.js                     # ✅ Добавлена Telegram интеграция
├── style.css                     # ✅ Добавлены Telegram стили
├── manifest.json                 # ✅ Обновлен для MiniApp
├── api/
│   └── stats/
│       ├── load.js              # ✅ Реальный API endpoint
│       ├── save.js              # ✅ Реальный API endpoint
│       └── leaderboard.js       # 🆕 Таблица лидеров
├── sounds/                      # ✅ Существующие звуки
├── themes/                      # ✅ Существующие темы
├── quotes/                      # ✅ Существующие цитаты
└── telegram/
    ├── webapp.js               # 🆕 Telegram WebApp логика
    ├── haptics.js              # 🆕 Вибрация и уведомления
    └── sharing.js              # 🆕 Поделиться результатом
```

## 🚀 Пошаговый план реализации

### **День 1: Базовая интеграция**
1. ✅ Добавить инициализацию Telegram WebApp
2. ✅ Настроить уникальную идентификацию пользователей
3. ✅ Обновить систему статистики для работы с Telegram ID

### **День 2: Telegram функции**
1. ✅ Добавить кнопки Telegram
2. ✅ Интегрировать вибрацию и уведомления
3. ✅ Реализовать поделиться результатом

### **День 3: Адаптация интерфейса**
1. ✅ Адаптировать под темную тему Telegram
2. ✅ Обновить CSS для MiniApp
3. ✅ Скрыть ненужные элементы

### **День 4: Серверная интеграция**
1. ✅ Создать реальные API endpoints
2. ✅ Реализовать синхронизацию статистики
3. ✅ Добавить таблицу лидеров

### **День 5: Дополнительные функции**
1. ✅ Добавить достижения
2. ✅ Реализовать таблицу лидеров
3. ✅ Тестирование и отладка

## 🎯 Ожидаемый результат

После интеграции у нас будет:
- ✅ Полнофункциональная Telegram MiniApp
- ✅ Уникальная идентификация пользователей
- ✅ Синхронизация статистики между устройствами
- ✅ Telegram-специфичные функции (вибрация, кнопки, поделиться)
- ✅ Адаптивный дизайн под Telegram
- ✅ Серверная синхронизация данных

Готов начать реализацию? С какого этапа начнем? 🚀


