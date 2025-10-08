# 🎮 Дурак - Telegram Mini App

Классическая русская карточная игра "Дурак" в формате Telegram Mini App с тремя уникальными темами и агрессивным ИИ.

![Version](https://img.shields.io/badge/version-1.28.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Telegram](https://img.shields.io/badge/Telegram-Mini%20App-blue?logo=telegram)

## 🎯 Особенности

- 🎰 **3 уникальные темы:** Casino, Tavern, Underground
- 🤖 **Агрессивный ИИ** с уникальными репликами для каждой темы
- 📱 **Telegram интеграция:** загрузка имени и фото пользователя
- 🎵 **Динамическая музыка** и звуковые эффекты
- 📊 **Статистика игр** с сохранением
- 🎨 **Адаптивный дизайн** для мобильных устройств
- ⚡ **WebP карты** для быстрой загрузки

## 📁 Структура проекта

```
durak-miniapp-clean/
├── src/              # Production код (GitHub Pages)
├── server/           # Backend сервер (Railway)
├── docs/             # Документация
├── tools/            # Утилиты для разработки
├── archive/          # Старые файлы
└── bot/              # Telegram Bot (опционально)
```

## 🚀 Быстрый старт

### Для игроков:
Откройте бота в Telegram и нажмите "Играть" → [ссылка на вашего бота]

### Для разработчиков:

1. **Клонировать репозиторий:**
```bash
git clone https://github.com/rustamzinyukov/durak-miniapp.git
cd durak-miniapp
```

2. **Открыть локально:**
- Открыть `src/index.html` в браузере
- Или использовать Live Server

3. **Запустить сервер (для фото из Telegram):**
```bash
cd server
npm install
npm start
```

См. подробности в [QUICK_START.md](docs/QUICK_START.md)

## 🖥️ Технологии

- **Frontend:** Vanilla JavaScript, CSS3, HTML5
- **Backend:** Node.js, Express
- **Deployment:** 
  - Frontend: GitHub Pages
  - Backend: Railway
- **Integration:** Telegram Bot API, Telegram Mini Apps SDK

## 📚 Документация

- [📖 Quick Start Guide](docs/QUICK_START.md)
- [🖥️ Server Setup](docs/setup/SERVER_SETUP.md)
- [🤖 Telegram Bot Setup](docs/telegram/TELEGRAM_BOT_SETUP_GUIDE.md)
- [🎨 Theme Development](docs/development/themes/THEME_UPDATE_GUIDE.md)
- [🔧 Development Tools](tools/README.md)

## 🎮 Правила игры

Классический "Дурак" 1v1:
- Цель: избавиться от всех карт
- Козырная масть бьёт любую другую
- Защищающийся может взять карты или отбиться
- Проигравший = "дурак" (у кого остались карты)

## 🌟 Темы

### 🎰 Casino
Роскошное казино с Дональдом Трампом в роли противника

### 🍺 Tavern
Уютная средневековая таверна с Геральтом из Ривии

### 🕳️ Underground
Подпольное казино с Сержантом Хартманом

## 👥 Автор

**Rustam Zinyukov** ([@zinyukov](https://t.me/zinyukov))

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE) для деталей

## 🙏 Благодарности

- Telegram за Mini Apps SDK
- Сообщество разработчиков Telegram Mini Apps
- Все, кто тестировал и давал фидбэк

---

**Сделано с ❤️ для сообщества Telegram**

