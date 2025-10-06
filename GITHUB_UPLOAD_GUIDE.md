# 🚀 Простая загрузка на GitHub Pages

## 📦 Что загружать:

### ✅ **Используйте готовый ZIP:** `github-upload.zip`
- Содержит только нужные файлы
- Размер: ~50-100 MB (вместо 500+ MB)
- Все ресурсы включены

## 🎯 **Пошаговая инструкция:**

### 1. **Создайте репозиторий:**
- **Название:** `durak-miniapp`
- **Публичный** (Public)
- **НЕ** добавляйте README, .gitignore, лицензию

### 2. **Загрузите файлы:**
- **Нажмите** "uploading an existing file"
- **Распакуйте** `github-upload.zip` в папку
- **Перетащите** ВСЕ файлы из папки в GitHub
- **Сообщение:** "Initial commit - Durak game"
- **Нажмите** "Commit changes"

### 3. **Включите GitHub Pages:**
- **Settings** → **Pages**
- **Source:** Deploy from a branch
- **Branch:** main
- **Folder:** / (root)
- **Save**

### 4. **Получите URL:**
- **URL:** `https://ВАШ_USERNAME.github.io/durak-miniapp`
- **Подождите** 5-10 минут

### 5. **Настройте Telegram:**
- **@BotFather** → `/newapp`
- **URL:** ваш GitHub Pages URL
- **Протестируйте!**

## 🎯 **Альтернативный способ - через Git:**

Если у вас установлен Git:

```bash
# 1. Распакуйте github-upload.zip
# 2. Откройте папку в терминале
# 3. Выполните команды:

git init
git add .
git commit -m "Initial commit - Durak game"
git branch -M main
git remote add origin https://github.com/ВАШ_USERNAME/durak-miniapp.git
git push -u origin main
```

## ✅ **Преимущества:**

- **Быстро:** 1 загрузка вместо 100+
- **Надежно:** все файлы в одном архиве
- **Просто:** не нужно выбирать файлы по одному
- **Безопасно:** только нужные файлы

## 🎮 **Результат:**

- ✅ Игра работает на GitHub Pages
- ✅ HTTPS URL для Telegram
- ✅ Все карты и звуки загружаются
- ✅ Готово к использованию в Telegram MiniApp

**Используйте `github-upload.zip` - это самый простой способ! 🚀**

