const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../database/db');
const logger = require('../utils/logger');

const router = express.Router();

// Генерация кода приглашения
function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Создать новую игру
router.post('/games/create', async (req, res) => {
  try {
    const { 
      telegram_user_id, 
      username, 
      first_name, 
      theme = 'casino',
      time_limit = 10 
    } = req.body;

    if (!telegram_user_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'telegram_user_id is required' 
      });
    }

    const gameId = uuidv4();
    
    // Создаем игру
    await query(`
      INSERT INTO multiplayer_games (
        id, host_telegram_id, host_username, host_first_name, 
        theme, time_limit, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [gameId, telegram_user_id, username, first_name, theme, time_limit, 'waiting']);

    // Создаем код приглашения
    const inviteCode = generateInviteCode();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 минут (1 час)

    await query(`
      INSERT INTO game_invites (code, game_id, from_telegram_id, from_username, from_first_name, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [inviteCode, gameId, telegram_user_id, username, first_name, expiresAt]);

    // Логируем создание игры
    logger.gameCreated(gameId, telegram_user_id, inviteCode);

    res.json({
      success: true,
      data: {
        gameId,
        inviteCode,
        expiresAt: expiresAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create game' 
    });
  }
});

// Присоединиться к игре по коду
router.post('/games/join-by-code', async (req, res) => {
  try {
    const { 
      invite_code, 
      telegram_user_id, 
      username, 
      first_name 
    } = req.body;

    if (!invite_code || !telegram_user_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'invite_code and telegram_user_id are required' 
      });
    }

    // Проверяем код приглашения
    logger.debug('INVITE', `Checking invite code: ${invite_code}`);
    const inviteResult = await query(`
      SELECT gi.*, mg.id as game_id, mg.status, mg.host_telegram_id, mg.guest_telegram_id
      FROM game_invites gi
      JOIN multiplayer_games mg ON gi.game_id = mg.id
      WHERE gi.code = $1 AND gi.expires_at > NOW()
    `, [invite_code]);
    
    logger.inviteCodeCheck(invite_code, inviteResult);

    if (inviteResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invalid or expired invite code' 
      });
    }

    const invite = inviteResult.rows[0];

    // Разрешаем присоединение к своей игре (для тестирования)
    // if (invite.host_telegram_id === telegram_user_id) {
    //   return res.status(400).json({ 
    //     success: false, 
    //     error: 'Cannot join your own game' 
    //   });
    // }

    // Проверяем, не занята ли игра уже
    if (invite.guest_telegram_id) {
      logger.debug('GAME_FULL', `Game ${invite.game_id} already has guest ${invite.guest_telegram_id}`);
      return res.status(400).json({ 
        success: false, 
        error: 'Game is full (already has 2 players)' 
      });
    }

    // Проверяем статус игры
    if (invite.status !== 'waiting') {
      logger.debug('GAME_NOT_WAITING', `Game ${invite.game_id} status is ${invite.status}, not 'waiting'`);
      return res.status(400).json({ 
        success: false, 
        error: 'Game is not available for joining' 
      });
    }

    // Обновляем игру
    await query(`
      UPDATE multiplayer_games 
      SET guest_telegram_id = $1, guest_username = $2, guest_first_name = $3,
          status = 'playing', started_at = NOW(), updated_at = NOW()
      WHERE id = $4
    `, [telegram_user_id, username, first_name, invite.game_id]);

    // Отмечаем код как использованный
    await query(`
      UPDATE game_invites 
      SET used_at = NOW() 
      WHERE code = $1
    `, [invite_code]);

    // Логируем успешное присоединение
    logger.gameJoined(invite.game_id, telegram_user_id, invite_code);

    res.json({
      success: true,
      data: {
        gameId: invite.game_id,
        hostTelegramId: invite.host_telegram_id
      }
    });

  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to join game' 
    });
  }
});

// Найти доступные игры для лобби
router.get('/games/available', async (req, res) => {
  try {
    const { telegram_user_id } = req.query;

    if (!telegram_user_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'telegram_user_id is required' 
      });
    }

    // Получаем доступные игры (исключаем свои)
    const result = await query(`
      SELECT 
        id, host_telegram_id, host_username, host_first_name,
        theme, time_limit, created_at,
        EXTRACT(EPOCH FROM (NOW() - created_at)) as wait_time_seconds
      FROM multiplayer_games
      WHERE status = 'waiting' 
        AND host_telegram_id != $1
        AND guest_telegram_id IS NULL
        AND created_at > NOW() - INTERVAL '10 minutes'
      ORDER BY created_at ASC
      LIMIT 20
    `, [telegram_user_id]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error getting available games:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get available games' 
    });
  }
});

// Присоединиться к игре из лобби
router.post('/games/join/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { 
      telegram_user_id, 
      username, 
      first_name 
    } = req.body;

    if (!telegram_user_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'telegram_user_id is required' 
      });
    }

    // Проверяем игру
    const gameResult = await query(`
      SELECT id, host_telegram_id, status, guest_telegram_id
      FROM multiplayer_games
      WHERE id = $1
    `, [gameId]);

    if (gameResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Game not found' 
      });
    }

    const game = gameResult.rows[0];

    // Проверяем, что игрок не пытается присоединиться к своей игре
    if (game.host_telegram_id === telegram_user_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot join your own game' 
      });
    }

    // Проверяем статус игры
    if (game.status !== 'waiting' || game.guest_telegram_id !== null) {
      return res.status(400).json({ 
        success: false, 
        error: 'Game is not available for joining' 
      });
    }

    // Присоединяемся к игре
    await query(`
      UPDATE multiplayer_games 
      SET guest_telegram_id = $1, guest_username = $2, guest_first_name = $3,
          status = 'playing', started_at = NOW(), updated_at = NOW()
      WHERE id = $4
    `, [telegram_user_id, username, first_name, gameId]);

    res.json({
      success: true,
      data: {
        gameId,
        hostTelegramId: game.host_telegram_id
      }
    });

  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to join game' 
    });
  }
});

// Получить состояние игры
router.get('/games/:gameId/state', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { telegram_user_id } = req.query;

    if (!telegram_user_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'telegram_user_id is required' 
      });
    }

    // Получаем состояние игры
    const result = await query(`
      SELECT 
        id, host_telegram_id, guest_telegram_id,
        host_username, host_first_name, guest_username, guest_first_name,
        status, game_data, current_player_telegram_id, phase, time_left,
        last_action_at, time_limit, theme, created_at, started_at
      FROM multiplayer_games
      WHERE id = $1 AND (host_telegram_id = $2 OR guest_telegram_id = $2)
    `, [gameId, telegram_user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Game not found or access denied' 
      });
    }

    const game = result.rows[0];

    // Вычисляем оставшееся время
    let timeLeft = game.time_left;
    if (game.status === 'playing' && game.last_action_at) {
      const elapsed = Math.floor((Date.now() - new Date(game.last_action_at)) / 1000);
      timeLeft = Math.max(0, game.time_limit - elapsed);
    }

    res.json({
      success: true,
      data: {
        gameId: game.id,
        status: game.status,
        players: {
          host: {
            telegramId: game.host_telegram_id,
            username: game.host_username,
            firstName: game.host_first_name
          },
          guest: game.guest_telegram_id ? {
            telegramId: game.guest_telegram_id,
            username: game.guest_username,
            firstName: game.guest_first_name
          } : null
        },
        gameData: game.game_data,
        currentPlayer: game.current_player_telegram_id,
        phase: game.phase,
        timeLeft,
        timeLimit: game.time_limit,
        theme: game.theme,
        createdAt: game.created_at,
        startedAt: game.started_at
      }
    });

  } catch (error) {
    console.error('Error getting game state:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get game state' 
    });
  }
});

// Сделать ход в игре
router.post('/games/:gameId/move', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { 
      telegram_user_id, 
      action, 
      cards = [], 
      gameData 
    } = req.body;

    if (!telegram_user_id || !action) {
      return res.status(400).json({ 
        success: false, 
        error: 'telegram_user_id and action are required' 
      });
    }

    // Проверяем игру
    const gameResult = await query(`
      SELECT id, status, current_player_telegram_id, host_telegram_id, guest_telegram_id
      FROM multiplayer_games
      WHERE id = $1 AND (host_telegram_id = $2 OR guest_telegram_id = $2)
    `, [gameId, telegram_user_id]);

    if (gameResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Game not found or access denied' 
      });
    }

    const game = gameResult.rows[0];

    if (game.status !== 'playing') {
      return res.status(400).json({ 
        success: false, 
        error: 'Game is not in playing state' 
      });
    }

    if (game.current_player_telegram_id !== telegram_user_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Not your turn' 
      });
    }

    // Обновляем состояние игры
    const nextPlayer = game.current_player_telegram_id === game.host_telegram_id 
      ? game.guest_telegram_id 
      : game.host_telegram_id;

    await query(`
      UPDATE multiplayer_games 
      SET game_data = $1, current_player_telegram_id = $2, 
          last_action_at = NOW(), updated_at = NOW()
      WHERE id = $3
    `, [JSON.stringify(gameData), nextPlayer, gameId]);

    res.json({
      success: true,
      data: {
        gameId,
        nextPlayer,
        action,
        cards
      }
    });

  } catch (error) {
    console.error('Error making move:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to make move' 
    });
  }
});

// Завершить игру
router.post('/games/:gameId/finish', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { 
      telegram_user_id, 
      winner_telegram_id, 
      gameData 
    } = req.body;

    if (!telegram_user_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'telegram_user_id is required' 
      });
    }

    // Проверяем игру
    const gameResult = await query(`
      SELECT id, status, host_telegram_id, guest_telegram_id, started_at
      FROM multiplayer_games
      WHERE id = $1 AND (host_telegram_id = $2 OR guest_telegram_id = $2)
    `, [gameId, telegram_user_id]);

    if (gameResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Game not found or access denied' 
      });
    }

    const game = gameResult.rows[0];

    if (game.status !== 'playing') {
      return res.status(400).json({ 
        success: false, 
        error: 'Game is not in playing state' 
      });
    }

    // Завершаем игру
    await query(`
      UPDATE multiplayer_games 
      SET status = 'finished', finished_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [gameId]);

    // Записываем в историю
    const duration = game.started_at 
      ? Math.floor((Date.now() - new Date(game.started_at)) / 1000)
      : 0;

    const loserTelegramId = winner_telegram_id === game.host_telegram_id 
      ? game.guest_telegram_id 
      : game.host_telegram_id;

    await query(`
      INSERT INTO multiplayer_game_history (
        game_id, winner_telegram_id, loser_telegram_id, duration,
        host_telegram_id, guest_telegram_id, finished_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [gameId, winner_telegram_id, loserTelegramId, duration, 
        game.host_telegram_id, game.guest_telegram_id]);

    res.json({
      success: true,
      data: {
        gameId,
        winner: winner_telegram_id,
        duration
      }
    });

  } catch (error) {
    console.error('Error finishing game:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to finish game' 
    });
  }
});

// Получить статистику мультиплеера
router.get('/stats/multiplayer/:telegram_user_id', async (req, res) => {
  try {
    const { telegram_user_id } = req.params;

    const result = await query(`
      SELECT * FROM player_multiplayer_stats 
      WHERE telegram_user_id = $1
    `, [telegram_user_id]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          totalMultiplayerGames: 0,
          multiplayerWins: 0,
          multiplayerLosses: 0,
          multiplayerWinRate: 0,
          avgGameDuration: 0,
          lastMultiplayerGame: null
        }
      });
    }

    const stats = result.rows[0];
    res.json({
      success: true,
      data: {
        totalMultiplayerGames: parseInt(stats.total_multiplayer_games) || 0,
        multiplayerWins: parseInt(stats.multiplayer_wins) || 0,
        multiplayerLosses: parseInt(stats.multiplayer_losses) || 0,
        multiplayerWinRate: parseFloat(stats.multiplayer_win_rate) || 0,
        avgGameDuration: parseFloat(stats.avg_game_duration) || 0,
        lastMultiplayerGame: stats.last_multiplayer_game
      }
    });

  } catch (error) {
    console.error('Error getting multiplayer stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get multiplayer stats' 
    });
  }
});

// Endpoint для тестирования базы данных
router.get('/debug/db-test', async (req, res) => {
  try {
    const { query } = require('../../database/db');
    
    // Проверяем существование таблиц
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%multiplayer%' OR table_name LIKE '%game%')
    `);
    
    const foundTables = tables.rows.map(r => r.table_name);
    
    // Проверяем конкретные таблицы
    let multiplayerGamesExists = false;
    let gameInvitesExists = false;
    
    try {
      await query('SELECT 1 FROM multiplayer_games LIMIT 1');
      multiplayerGamesExists = true;
    } catch (error) {
      // Таблица не существует
    }
    
    try {
      await query('SELECT 1 FROM game_invites LIMIT 1');
      gameInvitesExists = true;
    } catch (error) {
      // Таблица не существует
    }
    
    res.json({
      success: true,
      foundTables,
      multiplayerGamesExists,
      gameInvitesExists,
      message: 'Database test completed'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint для просмотра логов (только для отладки)
router.get('/debug/logs', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const logFile = path.join(__dirname, '../logs/debug.log');
    
    if (fs.existsSync(logFile)) {
      const logs = fs.readFileSync(logFile, 'utf8');
      const recentLogs = logs.split('\n').slice(-50).join('\n'); // Последние 50 строк
      res.json({
        success: true,
        logs: recentLogs,
        totalLines: logs.split('\n').length
      });
    } else {
      res.json({
        success: true,
        logs: 'No logs found',
        totalLines: 0
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
