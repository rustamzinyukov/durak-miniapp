# 🏗️ Архитектура проекта "Дурак Mini App"

## 📊 Общая схема

```
┌─────────────────────────────────────────────────────────────┐
│                    TELEGRAM USER                             │
│                         ↓                                    │
│              Открывает Mini App в боте                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              GITHUB PAGES (Frontend)                         │
│  https://rustamzinyukov.github.io/durak-miniapp/            │
│                                                              │
│  • index.html - UI структура                                │
│  • script.js - игровая логика (4400+ строк)                 │
│  • style.css - стили и темы                                 │
│  • themes/ - визуальные ресурсы                             │
│  • sounds/ - аудио файлы                                    │
│  • quotes/ - реплики персонажей                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
              Парсинг tgWebAppData из URL
                          ↓
┌─────────────────────────────────────────────────────────────┐
│         User Data: id, first_name, last_name, username       │
└─────────────────────────────────────────────────────────────┘
                          ↓
              Запрос фото пользователя
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              RAILWAY SERVER (Backend Proxy)                  │
│  https://durak-miniapp-production.up.railway.app/           │
│                                                              │
│  Endpoint: /api/user-photo/:userId                          │
│                                                              │
│  1. Получает userId от клиента                              │
│  2. Вызывает Telegram Bot API:                              │
│     getUserProfilePhotos(userId)                            │
│  3. Загружает фото с Telegram CDN                           │
│  4. Возвращает изображение напрямую (JPEG)                  │
│                                                              │
│  ✅ Решает проблему CORS                                    │
│  ✅ Обходит privacy настройки Telegram                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              TELEGRAM BOT API                                │
│  https://api.telegram.org/bot<TOKEN>/                       │
│                                                              │
│  • getUserProfilePhotos - получение фото                    │
│  • getFile - получение пути к файлу                         │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Безопасность

### **Разделение ответственности:**
- **Frontend (GitHub Pages):** Публичный код, без секретов
- **Backend (Railway):** Хранит BOT_TOKEN в переменных окружения
- **Telegram:** Валидация через signature и hash

### **CORS решение:**
```
Frontend (HTTPS) → Server (HTTPS) → Telegram API (HTTPS)
        ✅              ✅                  ✅
```

## 📦 Компоненты системы

### **1. Game Engine (script.js)**

#### **Основные модули:**
- **Card Management:** создание колоды, раздача, сортировка
- **Game Logic:** фазы игры (attacking, defending, adding)
- **AI System:** логика ИИ с тремя уровнями сложности
- **UI Rendering:** отрисовка карт, стола, руки игрока
- **Animation System:** полёт карт, исчезновение, эффекты
- **Sound Manager:** фоновая музыка, звуковые эффекты
- **Theme System:** переключение тем, загрузка ресурсов
- **Statistics:** отслеживание побед/поражений
- **Profile System:** управление профилем пользователя
- **Telegram Integration:** парсинг данных, загрузка фото

#### **Структура кода:**
```javascript
// 1. Константы и глобальные переменные (строки 1-460)
// 2. Утилиты (функции для карт, тем, статистики)
// 3. Игровая логика (раздача, ходы, проверки)
// 4. UI рендеринг (отрисовка всех элементов)
// 5. Анимации (полёт карт, эффекты)
// 6. AI система (атака, защита, подкидывание)
// 7. Event handlers (клики, выбор карт)
// 8. Telegram интеграция
// 9. Инициализация (main, preloading)
```

### **2. Theme System**

Каждая тема содержит:
```
theme/
├── cards/
│   ├── WEBP_cards/ (36 карт) - приоритет
│   └── SVG-cards-1.3/ (36 карт) - fallback
├── icons/
│   ├── person/ (4 эмоции персонажа)
│   └── logo/durak.png
└── textures/
    ├── table.jpg
    └── wall.jpg
```

### **3. Sound System**

```javascript
class SoundManager {
  - backgroundMusic (тематическая музыка)
  - soundEffects (card_on_table, card_disappear)
  - setTheme(themeName) - переключение темы
  - mute/unmute controls
}
```

### **4. Server API**

```javascript
// Endpoint: GET /api/user-photo/:userId
// Response: image/jpeg (прямое изображение)

Flow:
1. Client → Server: userId
2. Server → Telegram API: getUserProfilePhotos(userId)
3. Telegram API → Server: file_id, file_path
4. Server → Telegram CDN: download photo
5. Server → Client: JPEG image (with CORS headers)
```

## 🔄 Жизненный цикл игры

```
1. Загрузка (Preloading)
   ├── Карты (36 × 3 темы)
   ├── Иконки
   ├── Текстуры
   ├── Звуки
   └── Логотипы

2. Инициализация
   ├── initDomRefs() - ссылки на DOM элементы
   ├── initPlayers() - создание игроков
   ├── dealInitial() - раздача карт
   ├── bindEvents() - обработчики событий
   └── Telegram integration (если в Telegram)

3. Игровой цикл
   ├── Фаза атаки (attacking)
   ├── Фаза защиты (defending)
   ├── Фаза подкидывания (adding)
   └── Конец раунда (bito или взятие)

4. AI Loop
   ├── aiAttack() - ИИ атакует
   ├── aiDefense() - ИИ защищается
   ├── aiAdd() - ИИ подкидывает
   └── Комментарии и эмоции

5. Конец игры
   ├── checkEndgame() - проверка условий
   ├── updatePlayerStats() - обновление статистики
   └── showEndgameModal() - показ результата
```

## 🎨 Система тем

### **Персонажи:**
- **Casino:** Donald Trump (цитаты про победы и deals)
- **Tavern:** Geralt of Rivia (цитаты из Ведьмака)
- **Underground:** Sergeant Hartman (армейские цитаты)

### **Контексты цитат:**
- attacking (атака)
- defending (защита)
- taking (взятие карт)
- winning (победа)
- special (особые ситуации: мало карт, козыри и т.д.)

## 📱 Telegram Integration

### **Методы получения данных:**

1. **window.Telegram.WebApp.initDataUnsafe** (приоритет)
2. **window.Telegram.WebApp.initData** (парсинг)
3. **URL hash parsing** (fallback для некоторых платформ)
4. **window.parent.Telegram** (iframe)
5. **window.top.Telegram** (nested iframe)

### **Получаемые данные:**
```javascript
{
  id: 280642403,
  first_name: "Rustam",
  last_name: "Zinyukov",
  username: "zinyukov",
  language_code: "ru",
  photo_url: "..." // через server API
}
```

## 🔧 Технические детали

### **Performance:**
- WebP карты (~50% меньше SVG)
- Resource caching
- Lazy loading звуков
- Preloading критических ресурсов

### **Browser Support:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Telegram WebView

### **Telegram Mini App:**
- SDK версия: 9.1+
- Platforms: iOS, Android, Desktop
- Theme params: автоматическая адаптация

## 📈 Roadmap

- [ ] Мультиплеер (WebSocket)
- [ ] Больше тем
- [ ] Кастомные наборы карт
- [ ] Турниры и рейтинги
- [ ] Достижения (achievements)

## 🐛 Known Issues

- Нет (всё работает! 🎉)

## 📞 Контакты

- Telegram: [@zinyukov](https://t.me/zinyukov)
- GitHub: [@rustamzinyukov](https://github.com/rustamzinyukov)

---

**Версия:** 1.28.0 (October 2025)

