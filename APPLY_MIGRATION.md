# 🔄 Применение новой структуры

## ✅ Миграция завершена!

Новая структура создана в `_new_structure/` и готова к использованию.

## 📊 Статистика

- **src/:** 364 файла (production код + ресурсы)
- **docs/:** 49 файлов (документация)
- **tools/:** 18 файлов (утилиты разработки)
- **archive/:** 131 файл (старые файлы)
- **server/:** 1075 файлов (включая node_modules)
- **TOTAL:** 1637 файлов

## ✅ Что проверено

1. ✅ index.html открылся в браузере
2. ✅ Все ресурсы (темы, звуки, карты) скопированы
3. ✅ Server директория скопирована полностью
4. ✅ Документация организована по категориям
5. ✅ Утилиты в отдельных папках
6. ✅ Архив сохранён

## 🚀 Применение новой структуры

### **Вариант A: Замена структуры (рекомендуется)**

```powershell
cd C:\Users\Public

# 1. Создать backup старой версии
Rename-Item durak-miniapp-clean durak-miniapp-OLD

# 2. Переименовать новую структуру
Rename-Item durak-miniapp-clean\_new_structure durak-miniapp-clean

# 3. Готово! Старая версия в durak-miniapp-OLD
```

### **Вариант B: Создать новый репозиторий**

```powershell
# 1. Скопировать _new_structure в отдельную папку
Copy-Item _new_structure C:\Users\Public\durak-miniapp-v2 -Recurse

# 2. Инициализировать новый git
cd C:\Users\Public\durak-miniapp-v2
git init
git add .
git commit -m "Initial commit with new structure"

# 3. Создать новый репозиторий на GitHub и push
```

## ⚙️ Обновление GitHub Pages

После применения новой структуры:

1. Зайдите в **GitHub → Settings → Pages**
2. Измените **Source folder** с `/` (root) на `/src`
3. Save
4. Подождите 2-3 минуты для пересборки
5. Проверьте, что сайт работает

## 🔍 Проверка работы

### **Локально:**
```bash
# Откройте в браузере
C:\Users\Public\durak-miniapp-clean\src\index.html
```

### **GitHub Pages:**
После обновления settings:
```
https://rustamzinyukov.github.io/durak-miniapp/
```

Должно автоматически найти `/src/index.html`

## 📝 Обновление Railway

Railway **НЕ требует изменений**, так как:
- Root directory уже указан `/server`
- Структура server/ не изменилась
- Всё будет работать как прежде

## ⚠️ Важные заметки

### **Что НЕ нужно менять:**
- ✅ Пути в `src/script.js` остаются относительными (`./themes/...`)
- ✅ Пути в `src/style.css` остаются относительными
- ✅ Railway settings не меняются

### **Что НУЖНО изменить:**
- ⚠️ **Только** GitHub Pages settings: folder `/` → `/src`

## 🧪 Чеклист перед применением

- [ ] Игра открывается в браузере (`src/index.html`)
- [ ] Карты загружаются правильно
- [ ] Темы переключаются
- [ ] Звуки работают
- [ ] Статистика сохраняется
- [ ] Профиль открывается

**Если всё ОК** → применяйте Вариант A!

## 🔙 Откат (если что-то пошло не так)

```powershell
# Вернуться к старой версии
cd C:\Users\Public
Remove-Item durak-miniapp-clean -Recurse -Force
Rename-Item durak-miniapp-OLD durak-miniapp-clean
```

## 📞 Помощь

Если что-то не работает - сообщите, и я помогу исправить!

---

**Готово к применению!** 🚀

