const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.logFile = path.join(this.logDir, 'debug.log');
    
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

  writeLog(level, component, message, data = null) {
    const logMessage = this.formatMessage(level, component, message, data);
    
    // Выводим в консоль
    console.log(logMessage);
    
    // Записываем в файл
    try {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    } catch (error) {
      console.error('❌ Error writing to log file:', error);
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

  // Специальные методы для мультиплеера
  gameCreated(gameId, hostId, inviteCode) {
    this.info('GAME', `Game created: ${gameId}`, {
      gameId,
      hostId,
      inviteCode,
      timestamp: new Date().toISOString()
    });
  }

  gameJoined(gameId, playerId, inviteCode) {
    this.info('GAME', `Player joined: ${playerId}`, {
      gameId,
      playerId,
      inviteCode,
      timestamp: new Date().toISOString()
    });
  }

  inviteCodeCheck(code, result) {
    this.debug('INVITE', `Code check: ${code}`, {
      code,
      found: result.rows.length,
      valid: result.rows.length > 0,
      timestamp: new Date().toISOString()
    });
  }

  serverError(component, error, requestData = null) {
    this.error('SERVER', `${component} error: ${error.message}`, {
      error: error.message,
      stack: error.stack,
      requestData,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new Logger();
