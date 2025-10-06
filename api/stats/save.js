// API endpoint для сохранения статистики
// В реальном приложении это будет серверный endpoint

// Получаем данные из запроса
const requestData = JSON.parse(request.body || '{}');
const { userId, stats } = requestData;

if (!userId || !stats) {
  response.writeHead(400, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ error: 'Missing userId or stats' }));
  return;
}

// В реальном приложении здесь будет сохранение в базу данных
// Например: await db.collection('userStats').updateOne({ userId }, { $set: { stats } }, { upsert: true });

// Для демонстрации просто возвращаем успех
response.writeHead(200, { 'Content-Type': 'application/json' });
response.end(JSON.stringify({ 
  success: true, 
  message: 'Stats saved successfully',
  userId,
  stats 
}));


