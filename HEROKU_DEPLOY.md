# 🚀 Развертывание сервера на Heroku

## Пошаговая инструкция:

### 1. Установите Heroku CLI
- Скачайте с [devcenter.heroku.com](https://devcenter.heroku.com/articles/heroku-cli)
- Или через npm: `npm install -g heroku`

### 2. Войдите в Heroku
```bash
heroku login
```

### 3. Создайте приложение
```bash
cd C:\Users\Public\durak-miniapp-clean\server
heroku create your-app-name
```
Замените `your-app-name` на уникальное имя (например: `durak-photo-server-123`)

### 4. Добавьте переменные окружения
```bash
heroku config:set TELEGRAM_BOT_TOKEN=7659067094:AAGpYUIE5TTC49_0Srd562k-3Ax1ZgbHRoo
```

### 5. Разверните приложение
```bash
git subtree push --prefix=server heroku main
```

### 6. Проверьте работу
```bash
heroku open
```

## 🔧 После развертывания:

1. **Получите URL приложения** (например: `https://your-app-name.herokuapp.com`)
2. **Обновите код** - замените `http://localhost:3001` на ваш Heroku URL
3. **Протестируйте** в Telegram Mini App

## 📝 Команды для управления:

```bash
# Посмотреть логи
heroku logs --tail

# Перезапустить приложение
heroku restart

# Посмотреть переменные
heroku config

# Открыть приложение
heroku open
```

## ⚠️ Важно:
- Heroku бесплатный план ограничен (750 часов в месяц)
- Приложение "засыпает" после 30 минут неактивности
- Для продакшена лучше использовать платный план
