// API endpoint для загрузки статистики
// В реальном приложении это будет серверный endpoint

// Получаем userId из URL параметров
const urlParts = request.url.split('/');
const userId = urlParts[urlParts.length - 1];

if (!userId) {
  response.writeHead(400, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ error: 'Missing userId' }));
  return;
}

const defaultStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastResult: null
};

// В реальном приложении здесь будет загрузка из базы данных
// Например: const stats = await db.collection('userStats').findOne({ userId });

// Для демонстрации возвращаем дефолтную статистику
const stats = { ...defaultStats };

response.writeHead(200, { 'Content-Type': 'application/json' });
response.end(JSON.stringify({ 
  success: true, 
  userId,
  stats 
}));
