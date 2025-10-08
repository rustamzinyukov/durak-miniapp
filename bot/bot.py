#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import telebot
from telebot import types
import json

# Ваш токен бота
BOT_TOKEN = "8315517112:AAFwwuGjMMPijtfBUePU_11hH0ijrFAn_V8"

# Создаем экземпляр бота
bot = telebot.TeleBot(BOT_TOKEN)

# URL вашей игры (пока локальный, потом замените на GitHub Pages)
GAME_URL = "http://localhost:8000"

@bot.message_handler(commands=['start'])
def send_welcome(message):
    """Обработчик команды /start"""
    markup = types.InlineKeyboardMarkup()
    
    # Кнопка для запуска игры
    markup.add(types.InlineKeyboardButton(
        "🎮 Играть в Дурак", 
        web_app=types.WebAppInfo(url=GAME_URL)
    ))
    
    # Кнопка помощи
    markup.add(types.InlineKeyboardButton("❓ Помощь", callback_data="help"))
    
    welcome_text = """
🎮 Добро пожаловать в игру 'Дурак'!

Классическая карточная игра с ИИ противником.

🎯 Особенности:
• 3 темы оформления (Casino, Tavern, Underground)
• Звуковые эффекты и фоновая музыка
• Система статистики
• Адаптивный ИИ

Нажмите кнопку ниже, чтобы начать игру! 🃏
    """
    
    bot.reply_to(message, welcome_text, reply_markup=markup)

@bot.message_handler(commands=['help'])
def send_help(message):
    """Обработчик команды /help"""
    help_text = """
🎮 Игра 'Дурак' - Классическая карточная игра

📋 Команды:
/start - Начать игру
/help - Помощь
/stats - Статистика

🎯 Как играть:
1. Выберите карту для атаки
2. Защищайтесь от атак противника
3. Старайтесь избавиться от всех карт
4. Побеждает тот, кто первым избавится от карт

🎨 Темы оформления:
• Casino - Профессиональный стиль
• Tavern - Средневековый стиль  
• Underground - Мрачный стиль

🔊 Звуки:
• Звуки выкладывания карт
• Звуки исчезновения карт
• Фоновая музыка по темам

📊 Статистика:
• Общее количество игр
• Количество побед/поражений
• Текущая серия побед
• Лучшая серия побед

Удачи в игре! 🍀
    """
    bot.reply_to(message, help_text)

@bot.message_handler(commands=['stats'])
def send_stats(message):
    """Обработчик команды /stats"""
    stats_text = """
📊 Статистика игры

Ваша статистика сохраняется локально в игре.

🎯 Для просмотра статистики:
1. Запустите игру
2. Нажмите кнопку статистики (📊)
3. Посмотрите свои результаты

📈 Отслеживаемые метрики:
• Всего игр
• Побед
• Поражений
• Процент побед
• Текущая серия
• Лучшая серия

Статистика синхронизируется между устройствами! 🔄
    """
    bot.reply_to(message, stats_text)

@bot.callback_query_handler(func=lambda call: call.data == "help")
def handle_help_callback(call):
    """Обработчик нажатия кнопки помощи"""
    send_help(call.message)
    bot.answer_callback_query(call.id)

@bot.message_handler(func=lambda message: True)
def handle_all_messages(message):
    """Обработчик всех остальных сообщений"""
    bot.reply_to(message, "Используйте /start для начала игры! 🎮")

if __name__ == '__main__':
    print("🤖 Бот запущен!")
    print(f"🎮 URL игры: {GAME_URL}")
    print("📱 Найдите бота в Telegram и отправьте /start")
    
    try:
        bot.polling(none_stop=True)
    except Exception as e:
        print(f"❌ Ошибка: {e}")


