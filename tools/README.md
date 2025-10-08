# 🔧 Development Tools

Утилиты для разработки и поддержки проекта "Дурак Mini App".

## 📁 Структура

### `card-management/` - Работа с картами
- **clean_old_cards.js** - Удаление старых форматов карт
- **fix_remaining_cards.js** - Исправление оставшихся карт
- **rename_cards.js** - Переименование карт
- **standardize_card_names.js** - Унификация названий
- **replace_cards.js** - Замена карт
- **remove_duplicates.js** - Удаление дубликатов

### `converters/` - Конвертация форматов
- **webp-cards-generator.html** - Генератор WebP карт
- **auto-webp-distributor.html** - Автоматическое распределение WebP
- **auto-webp-organizer.html** - Организация WebP файлов
- **webp-test.js** - Тестирование WebP

### `testing/` - Тестовые страницы
- **test_cards.html** - Тест отображения карт
- **create_test_sound.html** - Создание тестовых звуков
- **copy_cards.html** - Копирование карт

### `scripts/` - PowerShell и Bash скрипты
- **copy_cards.ps1** - Копирование карт (Windows)
- **rename-vintage-cards.ps1** - Переименование винтажных карт
- **start-server.bat** - Запуск сервера (Windows)
- **start-server.sh** - Запуск сервера (Unix)

## 📝 Использование

### Конвертация карт в WebP:
```bash
# Откройте в браузере
tools/converters/webp-cards-generator.html
```

### Стандартизация названий:
```bash
node tools/card-management/standardize_card_names.js
```

### Запуск локального сервера:
```bash
# Windows
tools/scripts/start-server.bat

# Unix/Mac
bash tools/scripts/start-server.sh
```

## ⚠️ Внимание

Эти скрипты использовались во время разработки. Большинство из них **одноразовые** и больше не нужны для production.

Сохранены для истории и возможного повторного использования.

## 🔄 История

- **v1.0** - Первоначальная миграция карт
- **v1.1** - Унификация названий
- **v1.2** - Конвертация в WebP
- **v1.3** - Очистка дубликатов

