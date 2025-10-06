# 🚀 Размещение на GitHub Pages

## 1. Создайте репозиторий на GitHub:

1. **Перейдите** на https://github.com
2. **Нажмите** "New repository" (зеленая кнопка)
3. **Название:** `durak-miniapp` (или любое другое)
4. **Описание:** `Карточная игра Дурак для Telegram MiniApp`
5. **Публичный** репозиторий (Public)
6. **НЕ** добавляйте README, .gitignore, лицензию
7. **Нажмите** "Create repository"

## 2. Загрузите файлы:

### Способ A - Через веб-интерфейс:
1. **Нажмите** "uploading an existing file"
2. **Перетащите** все файлы из папки `durak-miniapp-clean`
3. **НЕ** загружайте папки:
   - `node_modules` (если есть)
   - `.git` (если есть)
   - Временные файлы
4. **Сообщение коммита:** "Initial commit - Durak game"
5. **Нажмите** "Commit changes"

### Способ B - Через Git (если установлен):
```bash
git init
git add .
git commit -m "Initial commit - Durak game"
git branch -M main
git remote add origin https://github.com/ВАШ_USERNAME/durak-miniapp.git
git push -u origin main
```

## 3. Включите GitHub Pages:

1. **Перейдите** в Settings репозитория
2. **Прокрутите** до "Pages" в левом меню
3. **Source:** Deploy from a branch
4. **Branch:** main
5. **Folder:** / (root)
6. **Нажмите** "Save"

## 4. Получите URL:

- **URL будет:** `https://ВАШ_USERNAME.github.io/durak-miniapp`
- **Подождите** 5-10 минут для деплоя
- **Проверьте** доступность по URL

## 5. Настройте Telegram MiniApp:

1. **Найдите** @BotFather в Telegram
2. **Отправьте** `/newapp`
3. **Выберите** вашего бота
4. **Название:** "Дурак"
5. **Описание:** "Классическая карточная игра"
6. **URL:** `https://ВАШ_USERNAME.github.io/durak-miniapp`
7. **Загрузите** иконку (512x512 PNG)

## 6. Протестируйте:

1. **Откройте** URL в браузере
2. **Проверьте** загрузку карт
3. **Протестируйте** в Telegram MiniApp
4. **Убедитесь** что все работает

## 🎯 Преимущества GitHub Pages:

- ✅ Бесплатный HTTPS
- ✅ Автоматический деплой
- ✅ Надежный хостинг
- ✅ Простое обновление
- ✅ Версионный контроль

## 🔧 Обновление игры:

1. **Измените** файлы локально
2. **Загрузите** изменения в GitHub
3. **GitHub Pages** автоматически обновится
4. **Игра** обновится в Telegram

