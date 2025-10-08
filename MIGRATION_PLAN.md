# 📦 План миграции на новую структуру

## ⚠️ ВАЖНО: Прочитайте перед началом!

Эта миграция реорганизует проект для лучшей структуры. Все файлы будут сохранены, ничего не удаляется!

## 📋 Что будет сделано

### ✅ Production файлы → `src/`
- index.html, script.js, style.css, manifest.json
- themes/, sounds/, quotes/, icons/

### ✅ Документация → `docs/`
- Все MD файлы организованы по категориям
- Setup guides, Telegram integration, Development notes

### ✅ Утилиты → `tools/`
- Скрипты для работы с картами
- HTML конвертеры
- Тестовые страницы

### ✅ Старые файлы → `archive/`
- Старые карты
- ZIP архивы
- Неиспользуемые форматы

### ✅ Telegram Bot → `bot/`
- bot.py, requirements.txt
- Bot setup документация

---

## 🚀 ПОШАГОВАЯ МИГРАЦИЯ

### **ШАГ 1: Копирование Production файлов**

```powershell
# Основные файлы
Copy-Item index.html _new_structure/src/
Copy-Item script.js _new_structure/src/
Copy-Item style.css _new_structure/src/
Copy-Item manifest.json _new_structure/src/

# Директории ресурсов
Copy-Item -Recurse themes _new_structure/src/
Copy-Item -Recurse sounds _new_structure/src/
Copy-Item -Recurse quotes _new_structure/src/
Copy-Item -Recurse icons _new_structure/src/

# Server (как есть)
Copy-Item -Recurse server _new_structure/
```

### **ШАГ 2: Организация документации**

```powershell
# Setup guides
Copy-Item SERVER_SETUP.md _new_structure/docs/setup/
Copy-Item HEROKU_DEPLOY.md _new_structure/docs/setup/
Copy-Item GITHUB_SETUP_COMMANDS.txt _new_structure/docs/setup/
Copy-Item GITHUB_UPLOAD_GUIDE.md _new_structure/docs/setup/
Copy-Item github-setup.md _new_structure/docs/setup/
Copy-Item deploy-instructions.md _new_structure/docs/setup/

# Telegram integration
Copy-Item TELEGRAM_BOT_SETUP_GUIDE.md _new_structure/docs/telegram/
Copy-Item bot-setup.md _new_structure/docs/telegram/
Copy-Item TELEGRAM_INTEGRATION_COMPLETE.md _new_structure/docs/telegram/
Copy-Item TELEGRAM_MINIAPP_INTEGRATION_PLAN.md _new_structure/docs/telegram/

# Development - Themes
Copy-Item THEME_UPDATE_GUIDE.md _new_structure/docs/development/themes/
Copy-Item TAVERN_STYLE_UPDATE.md _new_structure/docs/development/themes/
Copy-Item TAVERN_FONTS_FIX.md _new_structure/docs/development/themes/
Copy-Item TAVERN_TABLE_TEXTURE_FIX.md _new_structure/docs/development/themes/
Copy-Item UNDERGROUND_DESIGN_UPDATE.md _new_structure/docs/development/themes/
Copy-Item TABLE_TEXTURE_DEBUG.md _new_structure/docs/development/themes/

# Development - Cards
Copy-Item CARD_LOADING_FIX.md _new_structure/docs/development/cards/
Copy-Item DEBUG_CARDS_ISSUE.md _new_structure/docs/development/cards/
Copy-Item WEBP_CONVERSION_INSTRUCTIONS.md _new_structure/docs/development/cards/
Copy-Item TAVERN_PNG_CARDS_UPDATE.md _new_structure/docs/development/cards/
Copy-Item UNDERGROUND_JPG_CARDS_UPDATE.md _new_structure/docs/development/cards/
Copy-Item FILES_TO_CONVERT.md _new_structure/docs/development/cards/

# Development - UI Fixes
Copy-Item BUTTON_ANIMATIONS.md _new_structure/docs/development/ui-fixes/
Copy-Item CARD_OVERLAP_UPDATE.md _new_structure/docs/development/ui-fixes/
Copy-Item HEADER_LAYOUT_DIAGRAM.md _new_structure/docs/development/ui-fixes/
Copy-Item OPPONENT_PANEL_FIX.md _new_structure/docs/development/ui-fixes/
Copy-Item OPPONENT_PANEL_FIX_V3.md _new_structure/docs/development/ui-fixes/
Copy-Item TAVERN_BUTTON_BACKGROUNDS.md _new_structure/docs/development/ui-fixes/
Copy-Item TAVERN_BUTTONS_UPDATE.md _new_structure/docs/development/ui-fixes/
Copy-Item TAVERN_OPPONENT_PANEL.md _new_structure/docs/development/ui-fixes/

# Development - Game Logic
Copy-Item AI_AND_COMMENTS_FIX.md _new_structure/docs/development/game-logic/
Copy-Item AI_AND_SOUND_FIXES.md _new_structure/docs/development/game-logic/
Copy-Item AI_RESPONSE_FIX.md _new_structure/docs/development/game-logic/
Copy-Item FINAL_AI_FIX.md _new_structure/docs/development/game-logic/
Copy-Item CRITICAL_BUGFIX.md _new_structure/docs/development/game-logic/
Copy-Item BUGFIXES_UPDATE.md _new_structure/docs/development/game-logic/

# Development - Features
Copy-Item QUOTES_SYSTEM_UPDATE.md _new_structure/docs/development/features/
Copy-Item QUOTES_SYSTEM_FIX.md _new_structure/docs/development/features/
Copy-Item QUOTES_SYSTEM_FIXES.md _new_structure/docs/development/features/
Copy-Item QUOTES_FIX_AND_ORGANIZATION.md _new_structure/docs/development/features/
Copy-Item THEME_QUOTES_UPDATE.md _new_structure/docs/development/features/
Copy-Item CHARACTER_NAMES_UPDATE.md _new_structure/docs/development/features/
Copy-Item SOUND_SYSTEM_README.md _new_structure/docs/development/features/
Copy-Item STATISTICS_SYSTEM_OVERVIEW.md _new_structure/docs/development/features/
Copy-Item LOCALIZATION_REMOVAL_AND_STATS_UPDATE.md _new_structure/docs/development/features/

# Development - Technical
Copy-Item CACHE_FIX.md _new_structure/docs/development/technical/
Copy-Item MINIMAL_FILES_LIST.txt _new_structure/docs/development/technical/

# Main docs
Copy-Item README.md _new_structure/docs/OLD_README.md
Copy-Item QUICK_START.md _new_structure/docs/
```

### **ШАГ 3: Утилиты**

```powershell
# Card management
Copy-Item clean_old_cards.js _new_structure/tools/card-management/
Copy-Item fix_remaining_cards.js _new_structure/tools/card-management/
Copy-Item rename_cards.js _new_structure/tools/card-management/
Copy-Item standardize_card_names.js _new_structure/tools/card-management/
Copy-Item replace_cards.js _new_structure/tools/card-management/
Copy-Item remove_duplicates.js _new_structure/tools/card-management/

# Converters
Copy-Item webp-cards-generator.html _new_structure/tools/converters/
Copy-Item auto-webp-distributor.html _new_structure/tools/converters/
Copy-Item auto-webp-organizer.html _new_structure/tools/converters/
Copy-Item webp-test.js _new_structure/tools/converters/

# Testing
Copy-Item test_cards.html _new_structure/tools/testing/
Copy-Item create_test_sound.html _new_structure/tools/testing/
Copy-Item copy_cards.html _new_structure/tools/testing/

# Scripts
Copy-Item copy_cards.ps1 _new_structure/tools/scripts/
Copy-Item rename-vintage-cards.ps1 _new_structure/tools/scripts/
Copy-Item start-server.bat _new_structure/tools/scripts/
Copy-Item start-server.sh _new_structure/tools/scripts/
```

### **ШАГ 4: Архив**

```powershell
# Old cards
Copy-Item -Recurse cards _new_structure/archive/old-cards/
Copy-Item -Recurse "сonverted_webp" _new_structure/archive/old-cards/

# Old builds
Copy-Item durak-game-fixed.zip _new_structure/archive/old-builds/
Copy-Item durak-game.zip _new_structure/archive/old-builds/
Copy-Item github-upload.zip _new_structure/archive/old-builds/

# Unused formats (PNG и JPG карты из тем)
# Это нужно делать ПОСЛЕ копирования themes в src/

# Unused assets
Copy-Item -Recurse table _new_structure/archive/unused-assets/
Copy-Item -Recurse wall _new_structure/archive/unused-assets/
Copy-Item -Recurse locales _new_structure/archive/unused-assets/
Copy-Item -Recurse api _new_structure/archive/unused-assets/
Copy-Item github-files-list.txt _new_structure/archive/
```

### **ШАГ 5: Telegram Bot**

```powershell
Copy-Item bot.py _new_structure/bot/
Copy-Item requirements.txt _new_structure/bot/
```

### **ШАГ 6: Обновление путей в коде**

После миграции нужно обновить пути в `src/script.js`:

**Было:**
```javascript
'./themes/casino/cards/...'
'./sounds/casino/...'
'./quotes/casino/...'
```

**Станет:**
```javascript
'./themes/casino/cards/...' // пути не меняются, т.к. всё в src/
```

**НО!** Нужно обновить GitHub Pages settings:
- Source: `main` branch
- Folder: `/src` (вместо `/`)

---

## ✅ Проверка после миграции

1. Открыть `src/index.html` локально
2. Проверить загрузку карт, звуков, тем
3. Проверить работу игры
4. Commit в отдельную ветку `restructure`
5. Обновить GitHub Pages settings
6. Протестировать на GitHub Pages
7. Merge в `main` после успешного теста

---

## 🎯 Результат

### **До:**
```
durak-miniapp-clean/ (500+ файлов вперемешку)
├── index.html
├── AI_FIX_1.md
├── clean_cards.js
├── test.html
├── old.zip
└── ...хаос...
```

### **После:**
```
durak-miniapp-clean/
├── src/          ← Чистый production код
├── server/       ← Backend отдельно
├── docs/         ← Вся документация структурирована
├── tools/        ← Все утилиты в одном месте
├── archive/      ← История сохранена
├── bot/          ← Telegram bot отдельно
├── README.md     ← Профессиональный overview
└── .gitignore    ← Правильная конфигурация
```

### **Преимущества:**
- ✅ Легко найти любой файл
- ✅ Понятно, что для чего
- ✅ Профессиональный вид
- ✅ Готово к Open Source
- ✅ Легко поддерживать

---

## 📝 Примечания

- Миграция **обратима** - все файлы сохраняются
- Можно делать **постепенно** (сначала одну категорию, потом другую)
- После миграции старые файлы можно удалить из корня
- Создать отдельную ветку `restructure` для безопасности

**Готов выполнить миграцию?** Скажи "го", и я начну! 🚀

