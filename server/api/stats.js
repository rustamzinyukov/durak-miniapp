const express = require('express');
const router = express.Router();
const db = require('../database/db');

// POST /api/stats - Save or update player statistics
router.post('/stats', async (req, res) => {
  try {
    const {
      telegram_user_id,
      username,
      first_name,
      last_name,
      stats
    } = req.body;

    if (!telegram_user_id || !stats) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: telegram_user_id, stats'
      });
    }

    // Upsert player stats
    const query = `
      INSERT INTO player_stats (
        telegram_user_id,
        username,
        first_name,
        last_name,
        total_games,
        wins,
        losses,
        current_streak,
        best_streak,
        last_result,
        achievements,
        detailed_stats,
        last_game_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      ON CONFLICT (telegram_user_id) 
      DO UPDATE SET
        username = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        total_games = EXCLUDED.total_games,
        wins = EXCLUDED.wins,
        losses = EXCLUDED.losses,
        current_streak = EXCLUDED.current_streak,
        best_streak = EXCLUDED.best_streak,
        last_result = EXCLUDED.last_result,
        achievements = EXCLUDED.achievements,
        detailed_stats = EXCLUDED.detailed_stats,
        last_game_at = NOW(),
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      telegram_user_id,
      username || null,
      first_name || null,
      last_name || null,
      stats.totalGames || 0,
      stats.wins || 0,
      stats.losses || 0,
      stats.currentStreak || 0,
      stats.bestStreak || 0,
      stats.lastResult || null,
      JSON.stringify(stats.achievements || {}),
      JSON.stringify(stats.detailed || {}),
    ];

    const result = await db.query(query, values);

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error saving stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/stats/game - Save individual game to history
router.post('/stats/game', async (req, res) => {
  try {
    const {
      telegram_user_id,
      result,
      duration,
      cards_played,
      theme
    } = req.body;

    if (!telegram_user_id || !result) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: telegram_user_id, result'
      });
    }

    const query = `
      INSERT INTO game_history (
        telegram_user_id,
        result,
        duration,
        cards_played,
        theme
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [
      telegram_user_id,
      result,
      duration || null,
      cards_played || null,
      theme || null
    ];

    const queryResult = await db.query(query, values);

    res.json({
      success: true,
      data: queryResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Error saving game:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/stats/:telegram_user_id - Get player statistics
router.get('/stats/:telegram_user_id', async (req, res) => {
  try {
    const { telegram_user_id } = req.params;

    const query = `
      SELECT * FROM player_stats
      WHERE telegram_user_id = $1;
    `;

    const result = await db.query(query, [telegram_user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/stats/leaderboard - Get top players
router.get('/stats/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const query = `
      SELECT * FROM top_players
      LIMIT $1 OFFSET $2;
    `;

    const result = await db.query(query, [limit, offset]);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('❌ Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/stats/recent-games - Get recent games
router.get('/stats/recent-games', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const query = `
      SELECT * FROM recent_games
      LIMIT $1 OFFSET $2;
    `;

    const result = await db.query(query, [limit, offset]);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('❌ Error getting recent games:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/stats/summary - Get overall statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_players,
        SUM(total_games) as total_games,
        SUM(wins) as total_wins,
        SUM(losses) as total_losses,
        ROUND(AVG(CASE WHEN total_games > 0 THEN (wins::numeric / total_games * 100) ELSE 0 END), 2) as avg_win_rate
      FROM player_stats;
    `;

    const result = await db.query(query);

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error getting summary:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;

