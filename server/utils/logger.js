const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.logFile = path.join(this.logDir, 'debug.log');
    this.gameLogFile = path.join(this.logDir, 'games.log');
    
    // Создаем директорию логов если не существует
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, component, message, data = null) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] [${component}] ${message}`;
    
    if (data) {
      logMessage += `\n  Data: ${JSON.stringify(data, null, 2)}`;
    }
    
    return logMessage;
  }

  writeLog(level, component, message, data = null, writeToGameLog = false) {
    const logMessage = this.formatMessage(level, component, message, data);
    
    // Выводим в консоль
    console.log(logMessage);
    
    // Записываем в основной лог
    try {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    } catch (error) {
      console.error('❌ Error writing to log file:', error);
    }
    
    // Записываем в игровой лог (если указано)
    if (writeToGameLog) {
      try {
        fs.appendFileSync(this.gameLogFile, logMessage + '\n');
      } catch (error) {
        console.error('❌ Error writing to game log file:', error);
      }
    }
  }

  info(component, message, data = null) {
    this.writeLog('INFO', component, message, data);
  }

  error(component, message, data = null) {
    this.writeLog('ERROR', component, message, data);
  }

  warn(component, message, data = null) {
    this.writeLog('WARN', component, message, data);
  }

  debug(component, message, data = null) {
    this.writeLog('DEBUG', component, message, data);
  }

  // ========================================
  // ДЕТАЛЬНЫЕ МЕТОДЫ ДЛЯ МУЛЬТИПЛЕЕРА
  // ========================================

  // Инициализация игры
  gameInitialized(gameId, hostId, guestId, gameData) {
    this.info('GAME_INIT', `Game initialized: ${gameId}`, {
      gameId,
      hostId,
      guestId,
      trumpSuit: gameData.trumpSuit,
      trumpCard: gameData.trumpCard,
      attackerIndex: gameData.attackerIndex,
      defenderIndex: gameData.defenderIndex,
      hostCards: gameData.players[0].hand.map(c => `${c.suit}${c.rank}`).slice(0, 3),
      guestCards: gameData.players[1].hand.map(c => `${c.suit}${c.rank}`).slice(0, 3),
      hostCardCount: gameData.players[0].hand.length,
      guestCardCount: gameData.players[1].hand.length
    }, true);
  }

  // Создание игры
  gameCreated(gameId, hostId, inviteCode) {
    this.info('GAME_CREATE', `Game created: ${gameId}`, {
      gameId,
      hostId,
      inviteCode,
      timestamp: new Date().toISOString()
    }, true);
  }

  // Присоединение к игре
  gameJoined(gameId, playerId, inviteCode) {
    this.info('GAME_JOIN', `Player joined: ${playerId}`, {
      gameId,
      playerId,
      inviteCode,
      timestamp: new Date().toISOString()
    }, true);
  }

  // Ход игрока
  playerMove(gameId, playerId, action, cards, gameData) {
    this.info('PLAYER_MOVE', `Player ${playerId} made move: ${action}`, {
      gameId,
      playerId,
      action,
      cards: cards.map(c => `${c.suit}${c.rank}`),
      tablePairs: gameData.table.pairs.map(p => ({
        attack: `${p.attack.suit}${p.attack.rank}`,
        defense: p.defense ? `${p.defense.suit}${p.defense.rank}` : null
      })),
      phase: gameData.phase,
      attackerIndex: gameData.attackerIndex,
      defenderIndex: gameData.defenderIndex,
      hostCardCount: gameData.players[0].hand.length,
      guestCardCount: gameData.players[1].hand.length
    }, true);
  }

  // Обновление состояния игры
  gameStateUpdated(gameId, action, updatedData) {
    this.debug('GAME_STATE_UPDATE', `Game state updated after ${action}`, {
      gameId,
      action,
      newPhase: updatedData.phase,
      newAttackerIndex: updatedData.attackerIndex,
      newDefenderIndex: updatedData.defenderIndex,
      tablePairs: updatedData.table.pairs.length,
      hostCardCount: updatedData.players[0].hand.length,
      guestCardCount: updatedData.players[1].hand.length
    }, true);
  }

  // Переключение хода
  turnSwitched(gameId, fromPlayer, toPlayer) {
    this.info('TURN_SWITCH', `Turn switched from ${fromPlayer} to ${toPlayer}`, {
      gameId,
      fromPlayer,
      toPlayer,
      timestamp: new Date().toISOString()
    }, true);
  }

  // Запрос состояния игры
  gameStateRequested(gameId, playerId) {
    this.debug('STATE_REQUEST', `Player ${playerId} requested game state`, {
      gameId,
      playerId,
      timestamp: new Date().toISOString()
    });
  }

  // Отправка состояния игры
  gameStateSent(gameId, playerId, gameData) {
    this.debug('STATE_SENT', `Game state sent to player ${playerId}`, {
      gameId,
      playerId,
      phase: gameData.phase,
      currentPlayer: gameData.currentPlayer,
      tablePairs: gameData.table.pairs.length,
      hostCardCount: gameData.players[0].hand.length,
      guestCardCount: gameData.players[1].hand.length
    });
  }

  // Проверка кода приглашения
  inviteCodeCheck(code, result) {
    this.debug('INVITE_CHECK', `Code check: ${code}`, {
      code,
      found: result.rows.length,
      valid: result.rows.length > 0,
      timestamp: new Date().toISOString()
    });
  }

  // Ошибки
  serverError(component, error, requestData = null) {
    this.error('SERVER_ERROR', `${component} error: ${error.message}`, {
      error: error.message,
      stack: error.stack,
      requestData,
      timestamp: new Date().toISOString()
    });
  }

  // Валидация хода
  moveValidation(gameId, playerId, action, validationResult) {
    this.debug('MOVE_VALIDATION', `Move validation for player ${playerId}`, {
      gameId,
      playerId,
      action,
      valid: validationResult.valid,
      reason: validationResult.reason
    }, true);
  }

  // Очистка стола
  tableCleared(gameId, reason) {
    this.info('TABLE_CLEAR', `Table cleared: ${reason}`, {
      gameId,
      reason,
      timestamp: new Date().toISOString()
    }, true);
  }

  // Раздача карт
  cardsDealt(gameId, playerId, cardCount) {
    this.debug('CARDS_DEALT', `Cards dealt to player ${playerId}`, {
      gameId,
      playerId,
      cardCount,
      timestamp: new Date().toISOString()
    }, true);
  }
}

module.exports = new Logger();
