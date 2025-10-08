// Server endpoint для получения фотографии профиля пользователя
// Использует Telegram Bot API метод getUserProfilePhotos

require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Telegram Bot Token (должен быть в переменных окружения)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7659067094:AAGpYUIE5TTC49_0Srd562k-3Ax1ZgbHRoo';

// Debug: Log environment variables
console.log('Environment variables:');
console.log('PORT:', PORT);
console.log('BOT_TOKEN:', BOT_TOKEN ? 'Set (length: ' + BOT_TOKEN.length + ')' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Middleware для CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.json());

// Endpoint для получения фотографии профиля
app.get('/api/user-photo/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!BOT_TOKEN) {
      return res.status(500).json({ 
        error: 'Bot token not configured' 
      });
    }

    // Вызываем Telegram Bot API
    const response = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getUserProfilePhotos`,
      {
        params: {
          user_id: userId,
          limit: 1 // Получаем только последнюю фотографию
        }
      }
    );

    const data = response.data;
    
    if (!data.ok || !data.result.photos || data.result.photos.length === 0) {
      return res.json({ 
        success: false, 
        message: 'No profile photos found',
        hasPhoto: false 
      });
    }

    // Получаем фотографию с максимальным размером
    const photos = data.result.photos[0]; // Берем последнюю фотографию
    const largestPhoto = photos.reduce((max, current) => 
      current.width > max.width ? current : max
    );

    // Получаем file_path для фотографии
    const fileResponse = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile`,
      {
        params: {
          file_id: largestPhoto.file_id
        }
      }
    );

    if (!fileResponse.data.ok) {
      return res.json({ 
        success: false, 
        message: 'Failed to get file path',
        hasPhoto: false 
      });
    }

    const filePath = fileResponse.data.result.file_path;
    const photoUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    res.json({
      success: true,
      hasPhoto: true,
      photoUrl: photoUrl,
      fileId: largestPhoto.file_id,
      width: largestPhoto.width,
      height: largestPhoto.height,
      fileSize: largestPhoto.file_size
    });

  } catch (error) {
    console.error('Error getting user photo:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      hasPhoto: false 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    botTokenConfigured: !!BOT_TOKEN && BOT_TOKEN !== 'your_bot_token_here'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  const isTokenConfigured = BOT_TOKEN && BOT_TOKEN.trim() && BOT_TOKEN !== 'your_bot_token_here';
  res.json({ 
    message: 'Server is working!',
    botToken: isTokenConfigured ? 'Configured' : 'Not configured',
    tokenLength: BOT_TOKEN ? BOT_TOKEN.length : 0,
    tokenPreview: BOT_TOKEN ? BOT_TOKEN.substring(0, 10) + '...' : 'none',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`User photo endpoint: http://localhost:${PORT}/api/user-photo/:userId`);
});

module.exports = app;
