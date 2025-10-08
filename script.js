// ========================================
// 🎮 DURAK MINI APP - GAME LOGIC
// ========================================

// Donald Trump quotes - loaded via script tags

// Durak Mini App: 1v1 + targeted defense selection

// ========================================
// 📱 TELEGRAM MINI APP INTEGRATION
// ========================================

// Initialize Telegram WebApp
let tg = null;
let isTelegram = false;

// Check if running in Telegram
if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
  tg = window.Telegram.WebApp;
  isTelegram = true;
  
  // Configure Telegram WebApp
  tg.ready();
  tg.expand();
  
  // Set theme colors
  tg.setHeaderColor('#1a1a2e');
  tg.setBackgroundColor('#0a0a0a');
  
  // Enable closing confirmation
  tg.enableClosingConfirmation();
  
  console.log('🎮 Telegram Mini App initialized');
  console.log('👤 User:', tg.initDataUnsafe?.user);
  console.log('🌍 Language:', tg.initDataUnsafe?.user?.language_code);
} else {
  console.log('🌐 Running in browser mode');
}

const SUITS = ["♣","♦","♥","♠"];
const RANKS = ["6","7","8","9","10","J","Q","K","A"];
const RANK_VALUE = Object.fromEntries(RANKS.map((r,i)=>[r,i]));

// Проверяем поддержку WebP формата
const supportsWebP = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const result = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  console.log(`🖼️ WebP support detected: ${result}`);
  return result;
})();

function createDeck36(){
  const deck=[];
  for (const s of SUITS) for (const r of RANKS) deck.push({suit:s, rank:r, id:`${s}-${r}`});
  return deck;
}
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]] } return a; }
function beats(defCard, attCard, trumpSuit){
  console.log(`🔍 === BEATS FUNCTION DEBUG ===`);
  console.log(`🔍 beats() called: defCard=${text(defCard)}, attCard=${text(attCard)}, trumpSuit=${trumpSuit}`);
  console.log(`🔍 beats() state.trumpSuit=${state.trumpSuit}, passed trumpSuit=${trumpSuit}`);
  console.log(`🔍 beats() trumpSuit === state.trumpSuit? ${trumpSuit === state.trumpSuit}`);
  console.log(`🔍 beats() state.trumpCard=`, state.trumpCard);
  console.log(`🔍 beats() state.trumpSuit=`, state.trumpSuit);
  console.log(`🔍 beats() trumpSuit passed=`, trumpSuit);
  console.log(`🔍 beats() trumpSuit === state.trumpSuit? ${trumpSuit === state.trumpSuit}`);
  console.log(`🔍 === END BEATS FUNCTION DEBUG ===`);
  
  if (defCard.suit === attCard.suit) return RANK_VALUE[defCard.rank] > RANK_VALUE[attCard.rank];
  if (defCard.suit !== attCard.suit && defCard.suit === trumpSuit) return attCard.suit !== trumpSuit;
  return false;
}
function text(card){ return `${card.rank}${card.suit}`; }
function cardImagePath(card){
  // Универсальная функция для получения пути к карте
  // Приоритет: WebP -> SVG (fallback)

  // УНИФИЦИРОВАННЫЙ МАППИНГ для всех тем (теперь все используют casino формат)
  const suitMap = { '♣':'clubs', '♦':'diamonds', '♥':'hearts', '♠':'spades' };
  const rankMap = { 'J':'jack', 'Q':'queen', 'K':'king', 'A':'ace' };
  const suit = suitMap[card.suit];
  let rank = card.rank;
  if (rankMap[rank]) rank = rankMap[rank];
  
  // КРИТИЧЕСКАЯ ОТЛАДОЧНАЯ ИНФОРМАЦИЯ - проверка маппинга мастей
  console.log(`🔍 === CARD IMAGE PATH DEBUG ===`);
  console.log(`🔍 Original card: ${text(card)}`);
  console.log(`🔍 Original suit: ${card.suit}`);
  console.log(`🔍 Mapped suit: ${suit}`);
  console.log(`🔍 Original rank: ${card.rank}`);
  console.log(`🔍 Mapped rank: ${rank}`);
  console.log(`🔍 Suit mapping: ${card.suit} -> ${suit}`);
  console.log(`🔍 === END CARD IMAGE PATH DEBUG ===`);
  
  console.log(`🃏 cardImagePath: card=${text(card)}, theme=${state.theme}, supportsWebP=${supportsWebP}`);

  // Если WebP поддерживается, используем WebP карты (теперь все темы используют casino формат)
  if (supportsWebP) {
    const webpPath = `./themes/${state.theme}/cards/WEBP_cards/${rank}_of_${suit}.webp`;
    console.log(`🖼️ Loading WebP card: ${webpPath}`);
    return webpPath;
  }

  // Fallback на SVG карты
  const cardSetPaths = {
    'classic': 'SVG-cards-1.3',
    'modern': 'SVG-cards-1.3',
    'vintage': 'SVG-cards-1.3', 
    'minimal': 'SVG-cards-1.3',
    'luxury': 'SVG-cards-1.3'
  };
  
  const cardSetPath = cardSetPaths[state.cardSet] || cardSetPaths['classic'];
  const svgPath = `./themes/${state.theme}/cards/${cardSetPath}/${String(rank).toLowerCase()}_of_${suit}.svg`;
  console.log(`🖼️ Loading SVG card: ${svgPath}`);
  return svgPath;
}

// ========================================
// 📊 STATISTICS SYSTEM
// ========================================

// API клиент для работы со статистикой
const StatsAPI = {
  baseUrl: '/api/stats',
  
  async loadStats() {
    const userId = getTelegramUserId();
    if (!userId) {
      // Fallback на localStorage
      return this.loadFromLocalStorage();
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/load/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Статистика загружена с сервера:', data);
      return data;
    } catch (error) {
      console.error('Ошибка загрузки статистики с сервера, используем localStorage:', error);
      return this.loadFromLocalStorage();
    }
  },
  
  async saveStats(stats) {
    const userId = getTelegramUserId();
    if (!userId) {
      // Fallback на localStorage
      return this.saveToLocalStorage(stats);
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, stats })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('📊 Статистика сохранена на сервере');
      // Также сохраняем локально как backup
      this.saveToLocalStorage(stats);
      return true;
    } catch (error) {
      console.error('Ошибка сохранения статистики на сервере, используем localStorage:', error);
      return this.saveToLocalStorage(stats);
    }
  },
  
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('playerStats');
      if (saved) {
        const stats = JSON.parse(saved);
        console.log('📊 Загружена статистика из localStorage:', stats);
        return stats;
      }
    } catch (e) {
      console.error('Ошибка загрузки из localStorage:', e);
    }
    
    // Возвращаем дефолтные значения
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastResult: null
    };
  },
  
  saveToLocalStorage(stats) {
    try {
      localStorage.setItem('playerStats', JSON.stringify(stats));
      console.log('📊 Статистика сохранена в localStorage');
      return true;
    } catch (e) {
      console.error('Ошибка сохранения в localStorage:', e);
      return false;
    }
  }
};

// Функции для работы со статистикой
function updatePlayerStats(result) {
  state.playerStats.totalGames++;
  
  if (result === 'win') {
    state.playerStats.wins++;
    if (state.playerStats.lastResult === 'win') {
      state.playerStats.currentStreak++;
    } else {
      state.playerStats.currentStreak = 1;
    }
    state.playerStats.bestStreak = Math.max(state.playerStats.bestStreak, state.playerStats.currentStreak);
  } else if (result === 'loss') {
    state.playerStats.losses++;
    state.playerStats.currentStreak = 0;
  }
  
  state.playerStats.lastResult = result;
  
  // Сохраняем статистику
  StatsAPI.saveStats(state.playerStats);
  
  console.log('📊 Статистика обновлена:', state.playerStats);
}

function loadPlayerStats() {
  StatsAPI.loadStats().then(stats => {
    state.playerStats = { ...state.playerStats, ...stats };
    console.log('📊 Статистика загружена:', state.playerStats);
  });
}

function showStatsModal() {
  const modal = document.getElementById('statsModal');
  if (!modal) return;
  
  // Обновляем значения в модальном окне
  document.getElementById('totalGames').textContent = state.playerStats.totalGames;
  document.getElementById('wins').textContent = state.playerStats.wins;
  document.getElementById('losses').textContent = state.playerStats.losses;
  
  const winRate = state.playerStats.totalGames > 0 
    ? Math.round((state.playerStats.wins / state.playerStats.totalGames) * 100)
    : 0;
  document.getElementById('winRate').textContent = `${winRate}%`;
  
  document.getElementById('currentStreak').textContent = state.playerStats.currentStreak;
  document.getElementById('bestStreak').textContent = state.playerStats.bestStreak;
  
  // Показываем модальное окно
  modal.style.display = 'flex';
}

function hideStatsModal() {
  const modal = document.getElementById('statsModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// ========================================
// 🎵 SOUND SYSTEM
// ========================================

class SoundManager {
  constructor() {
    this.soundEffectsMuted = false;
    this.backgroundMusicMuted = false;
    this.currentTheme = 'casino';
    this.backgroundMusic = null;
    this.sounds = {
      cardOnTable: null,
      cardDisappear: null
    };
    this.init();
  }

  init() {
    // Create audio elements
    this.backgroundMusic = new Audio();
    this.sounds.cardOnTable = new Audio();
    this.sounds.cardDisappear = new Audio();
    
    // Set initial volume
    this.backgroundMusic.volume = 0.3;
    this.sounds.cardOnTable.volume = 0.7;
    this.sounds.cardDisappear.volume = 0.7;
    
    // Set loop for background music
    this.backgroundMusic.loop = true;
    
    // Load sounds for current theme
    this.loadSoundsForTheme(this.currentTheme);
  }

  loadSoundsForTheme(theme) {
    this.currentTheme = theme;
    
    // Load background music
    this.backgroundMusic.src = `./sounds/${theme}/background_music.mp3`;
    
    // Load sound effects
    this.sounds.cardOnTable.src = `./sounds/${theme}/card_on_table.mp3`;
    this.sounds.cardDisappear.src = `./sounds/${theme}/card_disappear.mp3`;
    
    // Preload sounds
    this.sounds.cardOnTable.load();
    this.sounds.cardDisappear.load();
    this.backgroundMusic.load();
    
    // Add error handling for background music
    this.backgroundMusic.addEventListener('error', (e) => {
      console.log('Background music load error:', e);
    });
    
    this.backgroundMusic.addEventListener('canplaythrough', () => {
      console.log('Background music loaded successfully');
    });
  }

  toggleSoundEffects() {
    this.soundEffectsMuted = !this.soundEffectsMuted;
    
    this.sounds.cardOnTable.muted = this.soundEffectsMuted;
    this.sounds.cardDisappear.muted = this.soundEffectsMuted;
    
    this.updateSoundEffectsButton();
  }

  toggleBackgroundMusic() {
    this.backgroundMusicMuted = !this.backgroundMusicMuted;
    
    if (this.backgroundMusicMuted) {
      this.backgroundMusic.pause();
    } else {
      console.log('Starting background music via toggle...');
      console.log('Music source:', this.backgroundMusic.src);
      console.log('Music ready state:', this.backgroundMusic.readyState);
      this.backgroundMusic.play().catch(e => console.log('Background music play failed:', e));
    }
    
    this.updateBackgroundMusicButton();
  }

  updateSoundEffectsButton() {
    const soundEffectsButton = document.getElementById('soundEffectsButton');
    if (soundEffectsButton) {
      soundEffectsButton.textContent = this.soundEffectsMuted ? '🔇' : '🔊';
      soundEffectsButton.classList.toggle('muted', this.soundEffectsMuted);
    }
  }

  updateBackgroundMusicButton() {
    const backgroundMusicButton = document.getElementById('backgroundMusicButton');
    if (backgroundMusicButton) {
      backgroundMusicButton.textContent = this.backgroundMusicMuted ? '🎶' : '🎵';
      backgroundMusicButton.classList.toggle('muted', this.backgroundMusicMuted);
    }
  }

  playCardOnTable() {
    if (!this.soundEffectsMuted && this.sounds.cardOnTable) {
      this.sounds.cardOnTable.currentTime = 0;
      this.sounds.cardOnTable.play().catch(e => console.log('Card on table sound failed:', e));
    }
  }

  playCardDisappear() {
    if (!this.soundEffectsMuted && this.sounds.cardDisappear) {
      this.sounds.cardDisappear.currentTime = 0;
      this.sounds.cardDisappear.play().catch(e => console.log('Card disappear sound failed:', e));
    }
  }

  setTheme(theme) {
    if (theme !== this.currentTheme) {
      this.loadSoundsForTheme(theme);
    }
  }
}

// Initialize sound manager
const soundManager = new SoundManager();

// ========================================
// 🎯 GAME STATE & CONFIGURATION
// ========================================

const state = {
  players: [],            // [{id,name,isHuman,hand:Card[]}]
  deck: [],
  trumpCard: null,
  trumpSuit: null,
  table: { pairs: [] },   // [{attack:Card, defense?:Card}]
  attackerIndex: 0,
  defenderIndex: 1,
  phase: "attacking",     // attacking | defending | adding
  maxTableThisRound: 6,
  selectedAttackIndex: -1, // выбранная атакующая карта для точечной защиты
  isDefenderEnoughInProgress: false,
  // UI commentary
  lastCommentKey: "",
  commentary: "",
  theme: "casino",        // current theme
  cardSet: "classic",    // current card set
  userProfile: {         // user profile data
    nickname: "Игрок",
    avatar: "👤"
  },
  // Player statistics
  playerStats: {
    totalGames: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastResult: null // 'win' or 'loss'
  },
  opponentProfile: {     // AI opponent profile
    name: "Дональд",
    avatar: "🃏",
    personality: "aggressive"  // aggressive, defensive, balanced
  }
};

// ========================================
// 🎨 THEMES
// ========================================

// Get opponent name based on theme
function getOpponentName(theme) {
  const names = {
    casino: "Дональд",
    underground: "Товарищ Старшина", 
    tavern: "Белый Волк"
  };
  return names[theme] || names.casino;
}

// Get quotes based on theme
function getQuotesForTheme(theme) {
  if (theme === 'tavern') {
    return window.whiteWolfQuotes || {
      attacking: { human: ["Атакуешь, как настоящий воин!"], ai: (name) => [`${name} атакует с яростью!`] },
      defending: { human: ["Защищайся как лев!"], ai: (name) => [`${name} защищается!`] },
      adding: { human: (covered) => ["Подкидываешь карты!"], ai: ["Подкидывает карты!"] },
      taking: ["Берет карты..."]
    };
  } else if (theme === 'underground') {
    return window.sergeantQuotes || {
      attacking: { human: ["Атакуешь из подземелья!"], ai: (name) => [`${name} атакует из глубин!`] },
      defending: { human: ["Защищайся силой тьмы!"], ai: (name) => [`${name} защищается тьмой!`] },
      adding: { human: (covered) => ["Подкидываешь темные карты!"], ai: ["Подкидывает темные карты!"] },
      taking: ["Берет карты тьмы..."]
    };
  } else {
    // Default to Donald for casino theme
    return window.donaldQuotes || {
      attacking: { human: ["Атакуешь как профессионал!"], ai: (name) => [`${name} атакует как профессионал!`] },
      defending: { human: ["Защищайся как мастер!"], ai: (name) => [`${name} защищается мастерски!`] },
      adding: { human: (covered) => ["Подкидываешь карты!"], ai: ["Подкидывает карты!"] },
      taking: ["Берет карты..."]
    };
  }
}

// Theme switcher
function setTheme(themeName){
  if (!themeName) return;
  
  // Validate theme
  const validThemes = ['casino', 'underground', 'tavern'];
  if (!validThemes.includes(themeName)) {
    console.warn(`Invalid theme: ${themeName}. Using default theme: casino`);
    themeName = 'casino';
  }
  
  // Remove all theme classes
  document.body.classList.remove('theme-casino', 'theme-underground', 'theme-tavern');
  
  // Add new theme class
  document.body.classList.add(`theme-${themeName}`);
  
  state.theme = themeName;
  
  // Force CSS variables update
  document.body.style.setProperty('--theme-table', `url('./themes/${themeName}/textures/table.jpg')`);
  document.body.style.setProperty('--theme-wall', `url('./themes/${themeName}/textures/wall.jpg')`);
  document.body.style.setProperty('--theme-logo', `url('./themes/${themeName}/icons/logo/durak.png')`);
  
  // Force update table background directly
  const tableElement = document.querySelector('.table');
  if (tableElement) {
    tableElement.style.background = `url('./themes/${themeName}/textures/table.jpg') center/cover no-repeat, var(--secondary-bg)`;
  }
  
  // Update logo source
  const logoElement = document.getElementById('gameLogo');
  if (logoElement) {
    logoElement.src = `./themes/${themeName}/icons/logo/durak.png`;
  }
  
  // Update opponent name based on theme
  if (el.opponentName) {
    el.opponentName.textContent = getOpponentName(themeName);
  }
  
  // Reset commentary cache to force refresh with new theme quotes
  state.lastCommentKey = "";
  
  // Update sound theme
  soundManager.setTheme(themeName);
  
  // Update opponent avatar for new theme
  updateOpponentAvatar();
  
  // Предзагружаем карты для новой темы
  preloadThemeCards(themeName);
  
  // Force re-render to update card images
  render();
  
  // Debug: log the current theme
  console.log(`Theme switched to: ${themeName}`);
  console.log(`Table texture: ./themes/${themeName}/textures/table.jpg`);
  console.log(`Opponent name: ${getOpponentName(themeName)}`);
  
  // Update theme selection in settings
  updateThemeSelection();
  
  // Save to localStorage
  try {
    localStorage.setItem('theme', themeName);
  } catch(e) {}
}

function updateThemeSelection(){
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach(option => {
    option.classList.remove('selected');
    if (option.dataset.theme === state.theme) {
      option.classList.add('selected');
    }
  });
}

// Card set switcher
function setCardSet(cardSetName){
  if (!cardSetName) return;
  
  state.cardSet = cardSetName;
  
  // Update card set selection in settings
  updateCardSetSelection();
  
  // Save to localStorage
  try {
    localStorage.setItem('cardSet', cardSetName);
  } catch(e) {}
  
  // Re-render to update card images
  render();
}

function updateCardSetSelection(){
  const cardSetOptions = document.querySelectorAll('.card-set-option');
  cardSetOptions.forEach(option => {
    option.classList.remove('selected');
    if (option.dataset.cardSet === state.cardSet) {
      option.classList.add('selected');
    }
  });
}

function openSettings(){
  el.settingsMenu.classList.add('open');
  el.settingsOverlay.classList.add('open');
}

function closeSettings(){
  el.settingsMenu.classList.remove('open');
  el.settingsOverlay.classList.remove('open');
}

// ========================================
// 🔍 TELEGRAM DEBUG FUNCTIONS
// ========================================

function showDebugModal() {
  const debugModal = document.getElementById('debugModal');
  const debugInfo = document.getElementById('debugInfo');
  
  if (debugModal && debugInfo) {
    // Собираем всю информацию о Telegram
    let debugData = '🔍 TELEGRAM WEBAPP DEBUG INFO\n';
    debugData += '================================\n\n';
    
    // Initialize global debug info for server requests
    window.debugInfo = debugData;
    
    // Информация о версии приложения
    debugData += '📱 ИНФОРМАЦИЯ О ПРИЛОЖЕНИИ:\n';
    debugData += '  - Версия: v126 (script.js)\n';
    debugData += '  - Время сборки: ' + new Date().toLocaleString('ru-RU') + '\n';
    debugData += '  - User-Agent: ' + navigator.userAgent.substring(0, 50) + '...\n';
    debugData += '  - URL: ' + window.location.href.substring(0, 80) + '...\n\n';
    
    // Проверяем доступность Telegram
    debugData += '📱 Telegram WebApp доступен: ' + (!!window.Telegram?.WebApp) + '\n';
    debugData += '🌐 window.Telegram: ' + (!!window.Telegram) + '\n';
    debugData += '🔗 window.location.href: ' + window.location.href + '\n\n';
    
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      debugData += '📊 Telegram WebApp данные:\n';
      debugData += '  - version: ' + (tg.version || 'не указано') + '\n';
      debugData += '  - platform: ' + (tg.platform || 'не указано') + '\n';
      debugData += '  - colorScheme: ' + (tg.colorScheme || 'не указано') + '\n';
      debugData += '  - initData: ' + (tg.initData || 'не указано') + '\n';
      debugData += '  - initDataUnsafe: ' + JSON.stringify(tg.initDataUnsafe, null, 2) + '\n';
      debugData += '  - themeParams: ' + JSON.stringify(tg.themeParams, null, 2) + '\n\n';
      
      // Проверяем данные пользователя
      if (tg.initDataUnsafe?.user) {
        debugData += '👤 Данные пользователя:\n';
        debugData += '  - id: ' + tg.initDataUnsafe.user.id + '\n';
        debugData += '  - first_name: ' + (tg.initDataUnsafe.user.first_name || 'не указано') + '\n';
        debugData += '  - last_name: ' + (tg.initDataUnsafe.user.last_name || 'не указано') + '\n';
        debugData += '  - username: ' + (tg.initDataUnsafe.user.username || 'не указано') + '\n';
        debugData += '  - photo_url: ' + (tg.initDataUnsafe.user.photo_url || 'не указано') + '\n';
      } else {
        debugData += '❌ Данные пользователя недоступны\n';
      }
    } else {
      debugData += '❌ Telegram WebApp недоступен\n';
    }
    
    // Проверяем альтернативные способы доступа
    debugData += '\n🔄 Альтернативные способы доступа:\n';
    debugData += '  - window.parent.Telegram: ' + (!!(window.parent && window.parent.Telegram)) + '\n';
    debugData += '  - window.top.Telegram: ' + (!!(window.top && window.top.Telegram)) + '\n';
    debugData += '  - URL содержит t.me: ' + window.location.href.includes('t.me') + '\n';
    debugData += '  - URL содержит telegram: ' + window.location.href.includes('telegram') + '\n';
    
    // Проверяем URL параметры Telegram
    debugData += '\n📋 URL параметры Telegram:\n';
    debugData += '  - tgWebAppData: ' + (window.location.hash.includes('tgWebAppData=') ? 'ЕСТЬ' : 'НЕТ') + '\n';
    debugData += '  - tgWebAppVersion: ' + (window.location.hash.includes('tgWebAppVersion=') ? 'ЕСТЬ' : 'НЕТ') + '\n';
    debugData += '  - tgWebAppPlatform: ' + (window.location.hash.includes('tgWebAppPlatform=') ? 'ЕСТЬ' : 'НЕТ') + '\n';
    
    // Пытаемся извлечь данные пользователя из URL
    if (window.location.hash.includes('tgWebAppData=')) {
      try {
        const hash = window.location.hash;
        const tgWebAppData = hash.split('tgWebAppData=')[1].split('&')[0];
        const decodedData = decodeURIComponent(tgWebAppData);
        debugData += '\n🔍 Попытка парсинга URL данных:\n';
        debugData += '  - tgWebAppData найдено: ДА\n';
        debugData += '  - Длина данных: ' + tgWebAppData.length + ' символов\n';
        
        const userMatch = decodedData.match(/user%3D([^%26]+)/);
        if (userMatch) {
          const userData = decodeURIComponent(userMatch[1]);
          const user = JSON.parse(userData);
          debugData += '\n👤 Данные пользователя из URL:\n';
          debugData += '  - id: ' + user.id + '\n';
          debugData += '  - first_name: ' + (user.first_name || 'не указано') + '\n';
          debugData += '  - last_name: ' + (user.last_name || 'не указано') + '\n';
          debugData += '  - username: ' + (user.username || 'не указано') + '\n';
          debugData += '  - photo_url: ' + (user.photo_url || 'не указано') + '\n';
        } else {
          debugData += '\n❌ Паттерн user%3D не найден в данных\n';
          
          // Try alternative parsing
          const userDataMatch = hash.match(/user%3D%257B%2522id%2522%253A(\d+)%252C%2522first_name%2522%253A%2522([^%2522]+)%2522%252C%2522last_name%2522%253A%2522([^%2522]+)%2522%252C%2522username%2522%253A%2522([^%2522]+)%2522/);
          if (userDataMatch) {
            debugData += '\n👤 Данные пользователя (альтернативный парсинг):\n';
            debugData += '  - id: ' + userDataMatch[1] + '\n';
            debugData += '  - first_name: ' + userDataMatch[2] + '\n';
            debugData += '  - last_name: ' + userDataMatch[3] + '\n';
            debugData += '  - username: ' + userDataMatch[4] + '\n';
          } else {
            debugData += '\n❌ Альтернативный парсинг также не сработал\n';
          }
        }
        
    // Добавляем информацию о сервере
    debugData += '\n🖥️ ИНФОРМАЦИЯ О СЕРВЕРЕ:\n';
    debugData += '  - Сервер URL: https://durak-miniapp-production.up.railway.app/api/user-photo/USER_ID\n';
    debugData += '  - Статус: HTTPS (Railway сервер)\n';
    debugData += '  - Telegram Mini App: ' + (window.location.href.includes('t.me') ? 'ДА' : 'НЕТ') + '\n';
    debugData += '  - CORS: OK (оба сервиса на HTTPS)\n';
    debugData += '  - Примечание: Сервер развернут на Railway\n';
    
    // Добавляем информацию о серверных запросах
    debugData += '\n🔍 СЕРВЕРНЫЕ ЗАПРОСЫ:\n';
    debugData += '  - Статус: Запросы идут (видно в логах Railway)\n';
    debugData += '  - Последний запрос: GET /api/user-photo/280642403\n';
    debugData += '  - Статус ответа: 304 (Not Modified)\n';
    debugData += '  - Размер ответа: 809 байт\n';
    debugData += '  - Время ответа: ~200мс\n';
    debugData += '  - Проблема: Код не доходит до вызова сервера\n';
    debugData += '  - Решение: Нужно открыть профиль для активации кода\n';
    debugData += '\n🔍 USER PHOTO DEBUG:\n';
    debugData += '  - user object: ' + (typeof window.currentUser !== 'undefined' ? 'defined' : 'undefined') + '\n';
    debugData += '  - user.photo_url: ' + (typeof window.currentUser !== 'undefined' && window.currentUser?.photo_url || 'undefined') + '\n';
    debugData += '  - user.photo_url type: ' + (typeof window.currentUser !== 'undefined' ? typeof window.currentUser?.photo_url : 'user undefined') + '\n';
    debugData += '  - user.photo_url exists: ' + (typeof window.currentUser !== 'undefined' && !!window.currentUser?.photo_url) + '\n';
    debugData += '  - Проблема: ' + (typeof window.currentUser !== 'undefined' && window.currentUser?.photo_url ? 'user.photo_url существует, но код не выполняется' : 'user.photo_url не существует') + '\n';
      } catch (e) {
        debugData += '\n❌ Ошибка парсинга URL данных: ' + e.message + '\n';
      }
    }
    
    // Add global profile debug log if it exists
    if (window.PROFILE_DEBUG_LOG) {
      debugData += window.PROFILE_DEBUG_LOG;
    }
    
    // Update global debug info with any server request info
    if (window.debugInfo && window.debugInfo !== debugData) {
      debugData += window.debugInfo.substring(debugData.length);
    }
    
    debugInfo.textContent = debugData;
    debugModal.style.display = 'block';
  }
}

function hideDebugModal() {
  const debugModal = document.getElementById('debugModal');
  if (debugModal) {
    debugModal.style.display = 'none';
  }
}

function showVersionModal() {
  const versionModal = document.getElementById('versionModal');
  const versionInfo = document.getElementById('versionInfo');
  
  if (versionModal && versionInfo) {
    // Собираем информацию о версии
    let versionData = '📱 ИНФОРМАЦИЯ О ВЕРСИИ ПРИЛОЖЕНИЯ\n';
    versionData += '=====================================\n\n';
    
        versionData += '🔢 Версия приложения:\n';
        versionData += '  - script.js: v103\n';
        versionData += '  - style.css: v74\n';
        versionData += '  - index.html: v103\n\n';
    
    versionData += '⏰ Время сборки:\n';
    versionData += '  - Текущее время: ' + new Date().toLocaleString('ru-RU') + '\n';
    versionData += '  - Время загрузки: ' + new Date(document.lastModified).toLocaleString('ru-RU') + '\n\n';
    
    versionData += '🌐 Информация о браузере:\n';
    versionData += '  - User-Agent: ' + navigator.userAgent.substring(0, 60) + '...\n';
    versionData += '  - Язык: ' + navigator.language + '\n';
    versionData += '  - Платформа: ' + navigator.platform + '\n\n';
    
    versionData += '🔗 Информация о URL:\n';
    versionData += '  - Полный URL: ' + window.location.href + '\n';
    versionData += '  - Домен: ' + window.location.hostname + '\n';
    versionData += '  - Протокол: ' + window.location.protocol + '\n\n';
    
    versionData += '📊 Статистика загрузки:\n';
    versionData += '  - Время загрузки страницы: ' + (performance.now() / 1000).toFixed(2) + ' сек\n';
    versionData += '  - Размер DOM: ' + document.documentElement.outerHTML.length + ' символов\n';
    
    versionInfo.textContent = versionData;
    versionModal.style.display = 'block';
  }
}

function hideVersionModal() {
  const versionModal = document.getElementById('versionModal');
  if (versionModal) {
    versionModal.style.display = 'none';
  }
}

// Test function to manually parse Telegram data
function testTelegramDataParsing() {
  console.log('🧪 Testing Telegram data parsing...');
  
  const hash = window.location.hash;
  console.log('🔍 Full hash:', hash);
  
  if (hash.includes('tgWebAppData=')) {
    const tgWebAppData = hash.split('tgWebAppData=')[1].split('&')[0];
    console.log('🔍 tgWebAppData:', tgWebAppData);
    
    const decodedData = decodeURIComponent(tgWebAppData);
    console.log('🔍 Decoded data:', decodedData);
    
    // Try different parsing methods
    const userMatch1 = decodedData.match(/user%3D([^%26]+)/);
    console.log('🔍 Pattern 1 (user%3D):', userMatch1);
    
    const userMatch2 = decodedData.match(/user=([^&]+)/);
    console.log('🔍 Pattern 2 (user=):', userMatch2);
    
    const userMatch3 = hash.match(/user%3D%257B%2522id%2522%253A(\d+)%252C%2522first_name%2522%253A%2522([^%2522]+)%2522%252C%2522last_name%2522%253A%2522([^%2522]+)%2522%252C%2522username%2522%253A%2522([^%2522]+)%2522/);
    console.log('🔍 Pattern 3 (manual):', userMatch3);
    
    if (userMatch3) {
      const user = {
        id: parseInt(userMatch3[1]),
        first_name: userMatch3[2],
        last_name: userMatch3[3],
        username: userMatch3[4]
      };
      console.log('✅ Successfully parsed user:', user);
      return user;
    }
  }
  
  console.log('❌ No user data found');
  return null;
}

// ========================================
// 👤 USER PROFILE FUNCTIONS
// ========================================

// Profile modal functions
function openProfile(){
  console.log('🔍 ========================================');
  console.log('🔍 PROFILE OPENED - TIMESTAMP:', new Date().toISOString());
  console.log('🔍 ========================================');
  console.log('🔍 openProfile function called!');
  console.log('🔍 el.profileModal:', el.profileModal);
  console.log('🔍 el.profileOverlay:', el.profileOverlay);
  
  // CRITICAL: Make this function globally accessible for debugging
  window.PROFILE_OPENED_COUNT = (window.PROFILE_OPENED_COUNT || 0) + 1;
  console.log('🔍 Profile opened count:', window.PROFILE_OPENED_COUNT);
  
  // Initialize window.debugInfo if it doesn't exist
  if (!window.debugInfo) {
    window.debugInfo = '';
    console.log('🔍 Initialized window.debugInfo');
  }
  
  // Add debug info GLOBALLY so it persists
  if (!window.PROFILE_DEBUG_LOG) {
    window.PROFILE_DEBUG_LOG = '';
  }
  
  window.PROFILE_DEBUG_LOG += '\n🔍 PROFILE OPENED DEBUG:\n';
  window.PROFILE_DEBUG_LOG += '  - Status: Profile opened successfully\n';
  window.PROFILE_DEBUG_LOG += '  - Time: ' + new Date().toLocaleString('ru-RU') + '\n';
  window.PROFILE_DEBUG_LOG += '  - Function: openProfile() called\n';
  window.PROFILE_DEBUG_LOG += '  - Call count: ' + window.PROFILE_OPENED_COUNT + '\n';
  window.PROFILE_DEBUG_LOG += '  - Elements found: profileModal=' + !!el.profileModal + ', profileOverlay=' + !!el.profileOverlay + '\n';
  
  // Also add to window.debugInfo if it exists
  if (window.debugInfo) {
    window.debugInfo += window.PROFILE_DEBUG_LOG;
  }
  
  console.log('🔍 Added debug info to window.debugInfo');
  console.log('🔍 window.debugInfo length:', window.debugInfo.length);
  console.log('🔍 ========================================');
  
  // Make openProfile globally accessible for manual testing
  window.manualOpenProfile = openProfile;
  console.log('🔍 openProfile is now available as window.manualOpenProfile()');
  
  el.profileModal.classList.add('active');
  el.profileOverlay.classList.add('active');
  // Load current profile data
  el.userNickname.value = state.userProfile.nickname;
  el.userAvatar.textContent = state.userProfile.avatar;
  
  // Load Telegram data if available
  console.log('🔍 window.Telegram:', window.Telegram);
  console.log('🔍 window.Telegram?.WebApp:', window.Telegram?.WebApp);
  
  // Debug panel for Telegram data (based on cookbook)
  if (window.Telegram?.WebApp) {
    console.log('🔍 Telegram WebApp Debug Info:');
    console.log('  - initData:', window.Telegram.WebApp.initData);
    console.log('  - initDataUnsafe:', window.Telegram.WebApp.initDataUnsafe);
    console.log('  - version:', window.Telegram.WebApp.version);
    console.log('  - platform:', window.Telegram.WebApp.platform);
    console.log('  - colorScheme:', window.Telegram.WebApp.colorScheme);
    console.log('  - themeParams:', window.Telegram.WebApp.themeParams);
  }
  
  const tg = window.Telegram?.WebApp;
  console.log('🔍 Telegram WebApp available:', !!tg);
  console.log('🔍 Telegram initDataUnsafe:', tg?.initDataUnsafe);
  console.log('🔍 Telegram initData:', tg?.initData);
  
  // Try alternative Telegram SDK access
  const tgAlt = window.Telegram;
  console.log('🔍 Alternative Telegram access:', !!tgAlt);
  
  // Check if we're in Telegram environment
  const isInTelegram = window.Telegram || 
                      (window.parent && window.parent.Telegram) || 
                      (window.top && window.top.Telegram) ||
                      window.location.href.includes('t.me') ||
                      window.location.href.includes('telegram');
  console.log('🔍 Is in Telegram environment:', isInTelegram);
  
  // Get user ID for debugging (based on cookbook)
  let userId = null;
  if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    console.log('🔍 Telegram User ID:', userId);
  }
  
  // Try to get user data from alternative sources
  let user = null;
  if (tg && tg.initDataUnsafe?.user) {
    user = tg.initDataUnsafe.user;
    console.log('🔍 Using primary Telegram WebApp access');
  } else if (tgAlt && tgAlt.WebApp && tgAlt.WebApp.initDataUnsafe?.user) {
    user = tgAlt.WebApp.initDataUnsafe.user;
    console.log('🔍 Using alternative Telegram WebApp access');
  } else if (tgAlt && tgAlt.WebApp && tgAlt.WebApp.initData) {
    // Try to parse initData manually
    try {
      const initData = new URLSearchParams(tgAlt.WebApp.initData);
      const userParam = initData.get('user');
      if (userParam) {
        user = JSON.parse(decodeURIComponent(userParam));
        console.log('🔍 Parsed user from initData:', user);
      }
    } catch (e) {
      console.log('⚠️ Failed to parse initData:', e);
    }
  } else {
    // Try to get user data from URL parameters
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const userParam = urlParams.get('user');
      if (userParam) {
        user = JSON.parse(decodeURIComponent(userParam));
        console.log('🔍 Parsed user from URL params:', user);
      }
    } catch (e) {
      console.log('⚠️ Failed to parse URL params:', e);
    }
    
    // Try to parse Telegram WebApp data from URL hash
    if (!user) {
      try {
        const hash = window.location.hash;
        if (hash.includes('tgWebAppData=')) {
          const tgWebAppData = hash.split('tgWebAppData=')[1].split('&')[0];
          const decodedData = decodeURIComponent(tgWebAppData);
          console.log('🔍 Raw tgWebAppData:', decodedData);
          
          // Parse user data from tgWebAppData - try different patterns
          let userMatch = decodedData.match(/user%3D([^%26]+)/);
          if (!userMatch) {
            // Try alternative pattern
            userMatch = decodedData.match(/user=([^&]+)/);
          }
          if (!userMatch) {
            // Try direct JSON pattern
            userMatch = decodedData.match(/user%3D%257B([^%257D]+)%257D/);
            if (userMatch) {
              const userData = '{"' + userMatch[1].replace(/%2522/g, '"').replace(/%253A/g, ':').replace(/%252C/g, ',') + '}';
              user = JSON.parse(userData);
              console.log('🔍 Parsed user from alternative pattern:', user);
            }
          } else {
            const userData = decodeURIComponent(userMatch[1]);
            user = JSON.parse(userData);
            console.log('🔍 Parsed user from tgWebAppData:', user);
          }
          
          // If still no user, try manual parsing from your specific URL format
          if (!user) {
            try {
              // Extract user data from the specific URL format you showed
              const userDataMatch = hash.match(/user%3D%257B%2522id%2522%253A(\d+)%252C%2522first_name%2522%253A%2522([^%2522]+)%2522%252C%2522last_name%2522%253A%2522([^%2522]+)%2522%252C%2522username%2522%253A%2522([^%2522]+)%2522/);
              if (userDataMatch) {
                user = {
                  id: parseInt(userDataMatch[1]),
                  first_name: userDataMatch[2],
                  last_name: userDataMatch[3],
                  username: userDataMatch[4]
                };
                console.log('🔍 Parsed user from manual pattern:', user);
              }
            } catch (e) {
              console.log('⚠️ Failed manual parsing:', e);
            }
          }
        }
      } catch (e) {
        console.log('⚠️ Failed to parse tgWebAppData:', e);
      }
    }
    
    // Try to access Telegram from parent window
    if (!user && window.parent && window.parent.Telegram) {
      try {
        const parentTg = window.parent.Telegram.WebApp;
        if (parentTg && parentTg.initDataUnsafe?.user) {
          user = parentTg.initDataUnsafe.user;
          console.log('🔍 Using parent window Telegram access:', user);
        }
      } catch (e) {
        console.log('⚠️ Failed to access parent Telegram:', e);
      }
    }
    
    // Try to access Telegram from top window
    if (!user && window.top && window.top.Telegram) {
      try {
        const topTg = window.top.Telegram.WebApp;
        if (topTg && topTg.initDataUnsafe?.user) {
          user = topTg.initDataUnsafe.user;
          console.log('🔍 Using top window Telegram access:', user);
        }
      } catch (e) {
        console.log('⚠️ Failed to access top Telegram:', e);
      }
    }
  }
  
  if (user) {
    console.log('🔍 Telegram user data:', user);
    
    // Get references to Telegram input fields
    const telegramUsernameInput = document.getElementById('telegramUsername');
    const telegramFirstNameInput = document.getElementById('telegramFirstName');
    const telegramUserIdInput = document.getElementById('telegramUserId');
    
    console.log('🔍 Telegram input fields found:', {
      username: !!telegramUsernameInput,
      firstName: !!telegramFirstNameInput,
      userId: !!telegramUserIdInput
    });
    
    // Update Telegram username
    if (telegramUsernameInput) {
      const username = user.username ? `@${user.username}` : 'Не указан';
      telegramUsernameInput.value = username;
      console.log('✅ Set Telegram username:', username);
    }
    
    // Update Telegram first name
    if (telegramFirstNameInput) {
      let fullName = user.first_name || 'Не указано';
      if (user.last_name) {
        fullName += ` ${user.last_name}`;
      }
      telegramFirstNameInput.value = fullName;
      console.log('✅ Set Telegram first name:', fullName);
      
      // Also update the main nickname field with Telegram name
      if (el.userNickname) {
        el.userNickname.value = fullName;
        state.userProfile.nickname = fullName;
        console.log('✅ Updated main nickname with Telegram name:', fullName);
      }
    }
    
    // Update Telegram User ID
    if (telegramUserIdInput && user.id) {
      telegramUserIdInput.value = user.id.toString();
      console.log('✅ Set Telegram User ID:', user.id);
    }
    
    // Store user info globally for debug panel
    window.currentUser = user;
    console.log('🔍 STORED USER GLOBALLY:', user);
    
    // Update avatar with Telegram photo if available
    console.log('🔍 USER PHOTO CHECK - user.photo_url:', user.photo_url);
    console.log('🔍 USER PHOTO CHECK - typeof user.photo_url:', typeof user.photo_url);
    console.log('🔍 USER PHOTO CHECK - user.photo_url exists:', !!user.photo_url);
    
    // ALWAYS try to get photo through server API (regardless of user.photo_url)
    console.log('🔄 ALWAYS trying to get photo through server API...');
    console.log('🔍 User ID:', user.id);
    console.log('🔍 Server URL:', `https://durak-miniapp-production.up.railway.app/api/user-photo/${user.id}`);
    
    // Add debug info to the debug panel
    if (window.debugInfo) {
      window.debugInfo += '\n🔍 SERVER REQUEST DEBUG:\n';
      window.debugInfo += '  - User ID: ' + (user.id || 'undefined') + '\n';
      window.debugInfo += '  - User ID type: ' + (typeof user.id) + '\n';
      window.debugInfo += '  - Server URL: https://durak-miniapp-production.up.railway.app/api/user-photo/' + (user.id || 'undefined') + '\n';
      window.debugInfo += '  - Status: Making request...\n';
    }
    
    if (user.id) {
      fetch(`https://durak-miniapp-production.up.railway.app/api/user-photo/${user.id}`)
        .then(response => {
          console.log('📡 Server response status:', response.status);
          if (window.debugInfo) {
            window.debugInfo += '  - Response status: ' + response.status + '\n';
          }
          return response.json();
        })
        .then(data => {
          console.log('📋 Server response data:', data);
          if (window.debugInfo) {
            window.debugInfo += '  - Response data: ' + JSON.stringify(data).substring(0, 100) + '...\n';
          }
          if (data.success && data.hasPhoto && data.photoUrl) {
            console.log('✅ Got photo from server API:', data.photoUrl);
            if (window.debugInfo) {
              window.debugInfo += '  - Result: SUCCESS - Photo found!\n';
              window.debugInfo += '  - Photo URL: ' + data.photoUrl + '\n';
            }
            user.photo_url = data.photoUrl;
            // Continue with photo loading process
            loadUserPhoto(user, el);
          } else {
            console.log('⚠️ Server API returned no photo, using original URL');
            if (window.debugInfo) {
              window.debugInfo += '  - Result: NO PHOTO - Using original URL\n';
            }
            loadUserPhoto(user, el);
          }
        })
        .catch(error => {
          console.log('❌ Server API error:', error.message);
          if (window.debugInfo) {
            window.debugInfo += '  - Result: ERROR - ' + error.message + '\n';
          }
          loadUserPhoto(user, el);
        });
    } else {
      if (window.debugInfo) {
        window.debugInfo += '  - Result: NO USER ID - Skipping server request\n';
      }
      loadUserPhoto(user, el);
    }
    
    if (user.photo_url) {
      console.log('✅ Setting Telegram photo:', user.photo_url);
      console.log('🔍 Photo URL details:', {
        url: user.photo_url,
        length: user.photo_url.length,
        startsWith: user.photo_url.substring(0, 20),
        endsWith: user.photo_url.substring(user.photo_url.length - 20)
      });
      
      // Try to get photo through WebApp API first (if available)
      if (window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url) {
        const webAppPhotoUrl = window.Telegram.WebApp.initDataUnsafe.user.photo_url;
        if (webAppPhotoUrl && webAppPhotoUrl !== user.photo_url) {
          console.log('🔄 Found alternative photo URL from WebApp API:', webAppPhotoUrl);
          user.photo_url = webAppPhotoUrl;
        }
      }
      
      // Try to get photo through server API (if available)
      console.log('🔍 User object for server check:', user);
      console.log('🔍 User ID:', user.id);
      console.log('🔍 User ID type:', typeof user.id);
      
      // Add debug info to the debug panel
      console.log('🔍 DEBUG INFO CHECK - window.debugInfo:', !!window.debugInfo);
      
      if (window.debugInfo) {
        window.debugInfo += '\n🔍 SERVER REQUEST DEBUG:\n';
        window.debugInfo += '  - User ID: ' + (user.id || 'undefined') + '\n';
        window.debugInfo += '  - User ID type: ' + (typeof user.id) + '\n';
        window.debugInfo += '  - Server URL: https://durak-miniapp-production.up.railway.app/api/user-photo/' + (user.id || 'undefined') + '\n';
        console.log('🔍 Added debug info to window.debugInfo');
      } else {
        // Force debug info even if window.debugInfo is not set
        console.log('🔍 FORCING DEBUG INFO - window.debugInfo not set');
        // Initialize it manually
        window.debugInfo = '\n🔍 SERVER REQUEST DEBUG:\n';
        window.debugInfo += '  - User ID: ' + (user.id || 'undefined') + '\n';
        window.debugInfo += '  - User ID type: ' + (typeof user.id) + '\n';
        window.debugInfo += '  - Server URL: https://durak-miniapp-production.up.railway.app/api/user-photo/' + (user.id || 'undefined') + '\n';
      }
      
      if (user.id) {
        console.log('🔄 Trying to get photo through server API...');
        console.log('🔍 Server URL:', `https://durak-miniapp-production.up.railway.app/api/user-photo/${user.id}`);
        
        if (window.debugInfo) {
          window.debugInfo += '  - Status: Making request...\n';
        }
        
        fetch(`https://durak-miniapp-production.up.railway.app/api/user-photo/${user.id}`)
          .then(response => {
            console.log('📡 Server response status:', response.status);
            if (window.debugInfo) {
              window.debugInfo += '  - Response status: ' + response.status + '\n';
            }
            return response.json();
          })
          .then(data => {
            console.log('📋 Server response data:', data);
            if (window.debugInfo) {
              window.debugInfo += '  - Response data: ' + JSON.stringify(data).substring(0, 100) + '...\n';
            }
            if (data.success && data.hasPhoto && data.photoUrl) {
              console.log('✅ Got photo from server API:', data.photoUrl);
              if (window.debugInfo) {
                window.debugInfo += '  - Result: SUCCESS - Photo found!\n';
                window.debugInfo += '  - Photo URL: ' + data.photoUrl + '\n';
              }
              user.photo_url = data.photoUrl;
              // Continue with photo loading process
              loadUserPhoto(user, el);
            } else {
              console.log('⚠️ Server API returned no photo, using original URL');
              console.log('🔍 Server response:', data);
              if (window.debugInfo) {
                window.debugInfo += '  - Result: NO PHOTO - Using original URL\n';
              }
              loadUserPhoto(user, el);
            }
          })
          .catch(error => {
            console.log('❌ Server API error:', error.message);
            console.log('⚠️ Server API not available, using original URL');
            if (window.debugInfo) {
              window.debugInfo += '  - Result: ERROR - ' + error.message + '\n';
            }
            loadUserPhoto(user, el);
          });
      } else {
        if (window.debugInfo) {
          window.debugInfo += '  - Result: NO USER ID - Skipping server request\n';
        }
        loadUserPhoto(user, el);
      }
    } else {
      console.log('⚠️ No Telegram photo available');
      // Use initials as fallback
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';
      const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
      el.userAvatar.textContent = initials;
      el.userAvatar.style.backgroundImage = 'none';
      el.userAvatar.style.color = 'white';
      el.userAvatar.style.backgroundColor = 'var(--accent)';
      el.userAvatar.style.borderRadius = '50%';
    }
  } else {
    console.log('⚠️ Telegram data not available');
    
    // Check if we're in Telegram environment but data is not available
    const telegramUsernameInput = document.getElementById('telegramUsername');
    const telegramFirstNameInput = document.getElementById('telegramFirstName');
    
    if (isInTelegram) {
      if (telegramUsernameInput) {
        telegramUsernameInput.value = 'Telegram: данные недоступны';
      }
      if (telegramFirstNameInput) {
        telegramFirstNameInput.value = 'Telegram: данные недоступны';
      }
      console.log('🔍 In Telegram but user data not accessible');
    } else {
      if (telegramUsernameInput) {
        telegramUsernameInput.value = 'Не подключено к Telegram';
      }
      if (telegramFirstNameInput) {
        telegramFirstNameInput.value = 'Не подключено к Telegram';
      }
      console.log('🔍 Not in Telegram environment');
    }
  }
}

// Helper function to load user photo
function loadUserPhoto(user, el) {
  if (!user.photo_url) {
    console.log('⚠️ No photo URL available');
    // Use initials as fallback
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    el.userAvatar.textContent = initials;
    el.userAvatar.style.backgroundImage = 'none';
    el.userAvatar.style.color = 'white';
    el.userAvatar.style.backgroundColor = 'var(--accent)';
    el.userAvatar.style.borderRadius = '50%';
    return;
  }
      
  // Check if photo is accessible (not restricted by privacy settings)
  console.log('🔍 Checking photo accessibility...');
  console.log('📸 Photo URL analysis:', {
    url: user.photo_url,
    isTelegramCDN: user.photo_url.includes('t.me'),
    isUserpic: user.photo_url.includes('userpic'),
    protocol: user.photo_url.startsWith('https') ? 'HTTPS' : 'HTTP'
  });
  
  // First, try to fetch the photo with proper error handling
  const fetchPromise = fetch(user.photo_url, { 
    method: 'HEAD', // Only check if resource exists, don't download
    mode: 'cors',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; TelegramMiniApp/1.0)'
    }
  });
  
  // Add timeout to prevent hanging
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Photo check timeout')), 5000)
  );
  
  Promise.race([fetchPromise, timeoutPromise])
  .then(response => {
    console.log('📡 Photo fetch response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (response.ok) {
      console.log('✅ Photo is accessible, setting as background');
      el.userAvatar.style.backgroundImage = `url(${user.photo_url})`;
      el.userAvatar.style.backgroundSize = 'cover';
      el.userAvatar.style.backgroundPosition = 'center';
      el.userAvatar.style.backgroundRepeat = 'no-repeat';
      el.userAvatar.style.borderRadius = '50%';
      el.userAvatar.textContent = '';
      el.userAvatar.style.color = 'transparent';
    } else {
      throw new Error(`Photo not accessible: ${response.status} ${response.statusText}`);
    }
  })
  .catch(error => {
    console.log('❌ Photo not accessible due to privacy settings:', error.message);
    
    // Try alternative method with no-cors
    console.log('🔄 Trying alternative method...');
    const testImg = new Image();
    testImg.crossOrigin = 'anonymous';
    testImg.onload = function() {
      console.log('✅ Photo loaded via Image fallback');
      el.userAvatar.style.backgroundImage = `url(${user.photo_url})`;
      el.userAvatar.style.backgroundSize = 'cover';
      el.userAvatar.style.backgroundPosition = 'center';
      el.userAvatar.style.backgroundRepeat = 'no-repeat';
      el.userAvatar.style.borderRadius = '50%';
      el.userAvatar.textContent = '';
      el.userAvatar.style.color = 'transparent';
    };
    testImg.onerror = function() {
      console.log('❌ All methods failed, using initials fallback');
      // Fallback to initials when photo is restricted by privacy
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';
      const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
      el.userAvatar.textContent = initials;
      el.userAvatar.style.backgroundImage = 'none';
      el.userAvatar.style.color = 'white';
      el.userAvatar.style.backgroundColor = 'var(--accent)';
      el.userAvatar.style.borderRadius = '50%';
    };
    testImg.src = user.photo_url;
  });
}

function closeProfile(){
  el.profileModal.classList.remove('active');
  el.profileOverlay.classList.remove('active');
}

// Save profile data
function saveProfile(){
  const nickname = el.userNickname.value.trim();
  const avatar = el.userAvatar.textContent;
  
  if (nickname.length === 0) {
    alert('Введите никнейм');
    return;
  }
  
  if (nickname.length > 20) {
    alert('Никнейм не должен превышать 20 символов');
    return;
  }
  
  // Update state
  state.userProfile.nickname = nickname;
  state.userProfile.avatar = avatar;
  
  // Save to localStorage
  try {
    localStorage.setItem('userProfile', JSON.stringify(state.userProfile));
  } catch(e) {
    console.warn('Failed to save profile to localStorage');
  }
  
  // Update profile button with avatar
  if (el.profileButton) {
    el.profileButton.textContent = avatar;
  }
  
  closeProfile();
}

// Avatar selection (simple emoji picker)
function changeAvatar(){
  const avatars = ['👤', '🎮', '🃏', '👑', '🎯', '⭐', '🔥', '💎', '🎲', '🃏'];
  const currentIndex = avatars.indexOf(state.userProfile.avatar);
  const nextIndex = (currentIndex + 1) % avatars.length;
  const newAvatar = avatars[nextIndex];
  
  state.userProfile.avatar = newAvatar;
  el.userAvatar.textContent = newAvatar;
}

// ========================================
// 🖥️ DOM ELEMENTS & UI STATE
// ========================================

const el = {
  opponents: null,
  attackRow: null,
  defenseRow: null,
  playerHand: null,
  btnAdd: null,
  btnTake: null,
  btnEnough: null,
  tableSide: null,
  trumpCard: null,
  deckCard: null,
  trumpLabel: null,
  deckLabel: null,
  table: null,
  toggleLang: null,
  // Opponent elements
  opponentComment: null,
  opponentHint: null,
  opponentAvatar: null,
  opponentName: null,
  // Settings elements
  settingsButton: null,
  settingsMenu: null,
  settingsOverlay: null,
  settingsClose: null,
  // Profile elements
  profileButton: null,
  profileModal: null,
  profileOverlay: null,
  profileClose: null,
  userAvatar: null,
  userNickname: null,
  avatarChangeBtn: null,
  profileSaveBtn: null,
  profileCancelBtn: null
};

const ui = { selected: new Set() };

// ========================================
// 🚀 INITIALIZATION & SETUP
// ========================================

function initDomRefs(){
  el.opponents = document.getElementById("opponents");
  el.attackRow = document.getElementById("attackRow");
  el.defenseRow = document.getElementById("defenseRow");
  el.playerHand = document.getElementById("playerHand");
  el.table = document.getElementById("table");
  el.btnAdd = document.getElementById("btnAdd");
  el.btnTake = document.getElementById("btnTake");
  el.btnEnough = document.getElementById("btnEnough");
  el.statsButton = document.getElementById("statsButton");
  el.tableSide = document.getElementById("tableSide");
  el.trumpCard = document.getElementById("trumpCard");
  el.deckCard = document.getElementById("deckCard");
  el.trumpLabel = document.getElementById("trumpLabel");
  el.deckLabel = document.getElementById("deckLabel");
  // Opponent elements
  el.opponentComment = document.getElementById("opponentComment");
  el.opponentHint = document.getElementById("opponentHint");
  el.opponentAvatar = document.getElementById("opponentAvatar");
  el.opponentName = document.getElementById("opponentName");
  el.opponentCards = document.getElementById("opponentCards");
  
  // Debug: Check if opponent elements are found
  if (!el.opponentAvatar) console.log("❌ opponentAvatar not found");
  if (!el.opponentComment) console.log("❌ opponentComment not found");
  if (!el.opponentCards) console.log("❌ opponentCards not found");
  // Settings elements
  el.settingsButton = document.getElementById("settingsButton");
  el.settingsMenu = document.getElementById("settingsMenu");
  el.settingsOverlay = document.getElementById("settingsOverlay");
  el.settingsClose = document.getElementById("settingsClose");
  // Profile elements
  el.profileButton = document.getElementById("profileButton");
  el.profileModal = document.getElementById("profileModal");
  el.profileOverlay = document.getElementById("profileOverlay");
  el.profileClose = document.getElementById("profileClose");
  el.userAvatar = document.getElementById("userAvatar");
  el.userNickname = document.getElementById("userNickname");
  el.avatarChangeBtn = document.getElementById("avatarChangeBtn");
  el.profileSaveBtn = document.getElementById("profileSaveBtn");
  el.profileCancelBtn = document.getElementById("profileCancelBtn");
}

function initPlayers(numOpp=1){
  state.players = [{ id:"P0", name:"You", isHuman:true, hand:[] }];
  for (let i=1;i<=numOpp;i++) state.players.push({ id:`AI${i}`, name:"Дональд", isHuman:false, hand:[] });
}

function dealInitial(){
  console.log('🎲 dealInitial called');
  state.deck = shuffle(createDeck36());
  console.log('🃏 Deck created, length:', state.deck.length);
  console.log('🃏 Deck before dealing (first 5):', state.deck.slice(0, 5).map(c => text(c)));
  
  for (let r=0;r<6;r++){
    for (const p of state.players) p.hand.push(state.deck.pop());
  }
  
  // Козырь - это последняя карта в колоде (которая остается после раздачи)
  // В классическом Дураке козырь определяется после раздачи
  state.trumpCard = state.deck[state.deck.length - 1];
  state.trumpSuit = state.trumpCard.suit;
  
  console.log('👥 Players after dealing:');
  state.players.forEach((p, i) => {
    console.log(`  Player ${i}: ${p.name}, hand: ${p.hand.length} cards`);
  });
  
  // МАКСИМАЛЬНАЯ ОТЛАДОЧНАЯ ИНФОРМАЦИЯ
  console.log('🔍 === TRUMP DEBUG INFO ===');
  console.log('🃏 Trump card:', state.trumpCard, 'Suit:', state.trumpSuit);
  console.log('🃏 Deck length after dealing:', state.deck.length);
  console.log('🃏 Last card in deck:', state.deck[state.deck.length - 1]);
  console.log('🃏 Trump suit set to:', state.trumpSuit);
  console.log('🃏 Remaining deck (last 5):', state.deck.slice(-5).map(c => text(c)));
  console.log('🃏 Trump card should be:', state.deck[state.deck.length - 1]);
  console.log('🃏 Trump suit should be:', state.deck[state.deck.length - 1].suit);
  console.log('🃏 Trump card === last card?', state.trumpCard === state.deck[state.deck.length - 1]);
  console.log('🃏 Trump suit === last card suit?', state.trumpSuit === state.deck[state.deck.length - 1].suit);
  console.log('🃏 Full deck after dealing:', state.deck.map(c => text(c)));
  console.log('🔍 === END TRUMP DEBUG ===');
  
  // Проверяем, что козырь действительно последняя карта
  console.log('🃏 Deck before dealing (first 5):', state.deck.slice(0, 5).map(c => text(c)));
  console.log('🃏 Deck after dealing (last 5):', state.deck.slice(-5).map(c => text(c)));
  console.log('🃏 Trump card is last card:', state.trumpCard === state.deck[state.deck.length - 1]);

  const lowestTrump = hand =>
    hand.filter(c => c.suit === state.trumpSuit)
        .sort((a,b)=>RANK_VALUE[a.rank]-RANK_VALUE[b.rank])[0];

  let bestIdx = -1, bestRank = 999;
  state.players.forEach((p,idx)=>{
    const lt = lowestTrump(p.hand);
    if (lt && RANK_VALUE[lt.rank] < bestRank){ bestRank = RANK_VALUE[lt.rank]; bestIdx = idx; }
  });
  state.attackerIndex = bestIdx >= 0 ? bestIdx : 0;
  state.defenderIndex = (state.attackerIndex + 1) % state.players.length;

  const defender = state.players[state.defenderIndex];
  state.maxTableThisRound = Math.min(6, defender.hand.length);
  state.table.pairs = [];
  state.phase = "attacking";
  state.selectedAttackIndex = -1;
  
  // Сбрасываем кэш комментариев для принудительного обновления
  state.lastCommentKey = "";
  state.isTakingCards = false; // Сбрасываем флаг взятия карт
}

// ========================================
// 🎨 UI RENDERING & DISPLAY
// ========================================


function applyUILabels(){
  // Обновляем только статические лейблы
  if (el.btnTake) el.btnTake.innerHTML = `<span class="icon"></span> Взять карты`;
  if (el.btnEnough) el.btnEnough.innerHTML = `<span class="icon"></span> Бито`;
  if (el.trumpLabel) el.trumpLabel.textContent = "Козырь";
  if (el.deckLabel) el.deckLabel.textContent = "Колода";
}


function renderHeader(){
  // Header now shows game logo instead of trump/deck info
  // Logo is static and doesn't need updates
}

function updateOpponentPanel(){
  // Update opponent name based on current theme
  if (el.opponentName) {
    el.opponentName.textContent = getOpponentName(state.theme);
  }
  
  // Update avatar based on game situation
  updateOpponentAvatar();
  
  // Update opponent commentary
  updateCommentaryIfNeeded();
  if (el.opponentComment) {
    el.opponentComment.textContent = state.commentary || "";
  }
  
  // Update hint for player
  if (el.opponentHint) {
    let hint = "";
    if (state.phase === "defending" && state.defenderIndex === 0) {
      const openAttacks = state.table.pairs.filter(p => !p.defense).length;
      if (openAttacks > 1) {
        hint = "";
      } else if (state.selectedAttackIndex >= 0) {
        hint = "Выберите карту для защиты выделенной атаки";
      }
    }
    el.opponentHint.textContent = hint;
  }
}

function updateOpponentAvatar(){
  if (!el.opponentAvatar) return;
  
  // Dynamic avatars based on game situation
  const avatars = {
    // Default states
    base: "base.jpg",
    happy: "happy.jpg", 
    sad: "sad.jpg",
    thinks: "thinks.jpg"
  };
  
  let avatarFile = avatars.base; // default
  
  // Determine avatar based on game state
  const aiPlayer = state.players.find(p => !p.isHuman);
  const humanPlayer = state.players[0];
  
  if (aiPlayer && humanPlayer) {
    // Special situations
    if (state.isTakingCards && state.defenderIndex !== 0) {
      // Противник берет карты - грустный (только если защищается ИИ)
      avatarFile = avatars.sad;
    } else if (state.isTakingCards && state.defenderIndex === 0) {
      // Игрок берет карты - противник счастливый
      avatarFile = avatars.happy;
    } else if (state.phase === "defending" && state.defenderIndex !== 0) {
      // Противник защищается - думает
      avatarFile = avatars.thinks;
    } else if (state.phase === "attacking" && state.attackerIndex !== 0) {
      // Противник атакует - счастливый
      avatarFile = avatars.happy;
    } else if (state.phase === "adding" && state.attackerIndex !== 0) {
      // Противник подкидывает - думает
      avatarFile = avatars.thinks;
    } else if (aiPlayer.hand.length <= 2) {
      // У противника мало карт - счастливый
      avatarFile = avatars.happy;
    } else if (humanPlayer.hand.length <= 2) {
      // У игрока мало карт - счастливый
      avatarFile = avatars.happy;
    } else {
      // Обычное состояние
      avatarFile = avatars.base;
    }
  }
  
  // Update avatar with smooth transition
  const currentSrc = el.opponentAvatar.src;
  const newSrc = `./themes/${state.theme}/icons/person/${avatarFile}`;
  
  if (currentSrc !== newSrc) {
    console.log(`🎭 Changing avatar to: ${avatarFile}`);
    
    // Создаем временное изображение для crossfade
    const tempImg = new Image();
    tempImg.onload = () => {
      // Создаем клон текущего изображения
      const clone = el.opponentAvatar.cloneNode(true);
      clone.style.position = 'absolute';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.zIndex = '2';
      clone.style.transition = 'opacity 0.3s ease';
      
      // Добавляем клон в контейнер
      el.opponentAvatar.parentNode.style.position = 'relative';
      el.opponentAvatar.parentNode.appendChild(clone);
      
      // Меняем основное изображение
      el.opponentAvatar.src = newSrc;
      el.opponentAvatar.alt = `Opponent ${avatarFile.replace('.jpg', '')}`;
      el.opponentAvatar.style.opacity = '0';
      el.opponentAvatar.style.transition = 'opacity 0.3s ease';
      
      // Плавно показываем новое изображение
      setTimeout(() => {
        el.opponentAvatar.style.opacity = '1';
        clone.style.opacity = '0';
        
        // Удаляем клон после анимации
        setTimeout(() => {
          clone.remove();
        }, 300);
      }, 50);
    };
    
    tempImg.src = newSrc;
  }
}


// ---------- Commentary ----------
function updateCommentaryIfNeeded(){
  const covered = state.table.pairs.filter(p=>p.defense).length;
  const total = state.table.pairs.length;
  const key = `${state.phase}|${state.attackerIndex}|${state.defenderIndex}|${covered}/${total}`;
  if (key === state.lastCommentKey) return;
  state.lastCommentKey = key;

  const attacker = state.players[state.attackerIndex];
  const defender = state.players[state.defenderIndex];
  const isHumanAtt = !!attacker.isHuman;
  const isHumanDef = !!defender.isHuman;

  const pick = arr => arr[(Math.random()*arr.length)|0];
  const L = getQuotesForTheme(state.theme);

  let msg = "";
  
  // Получаем игроков
  const humanPlayer = state.players[0];
  const aiPlayer = state.players.find(p => !p.isHuman);
  
  if (aiPlayer && humanPlayer) {
    // Проверяем специальные ситуации
    const isManyCards = total >= 6; // Много карт на столе
    const isPlayerFewCards = humanPlayer.hand.length <= 2;
    const isAiFewCards = aiPlayer.hand.length <= 2;
    const isEmptyDeck = state.deck.length === 0;
    
    // Проверяем козыри
    const lastCard = state.table.pairs[state.table.pairs.length - 1];
    const trumpSuit = state.trumpSuit;
    const isPlayerTrump = lastCard && lastCard.attack && lastCard.attack.suit === trumpSuit;
    const isAiTrump = lastCard && lastCard.defense && lastCard.defense && lastCard.defense.suit === trumpSuit;
    
    // Специальные комментарии для особых ситуаций
    if (isManyCards && L.special && L.special.manyCards) {
      msg = pick(L.special.manyCards);
    }
    else if (isPlayerFewCards && L.special && L.special.playerFewCards) {
      msg = pick(L.special.playerFewCards);
    }
    else if (isAiFewCards && L.special && L.special.aiFewCards) {
      msg = pick(L.special.aiFewCards);
    }
    else if (isEmptyDeck && L.special && L.special.emptyDeck) {
      msg = pick(L.special.emptyDeck);
    }
    else if (isPlayerTrump && L.special && L.special.playerTrump) {
      msg = pick(L.special.playerTrump);
    }
    else if (isAiTrump && L.special && L.special.aiTrump) {
      msg = pick(L.special.aiTrump);
    }
    // Обычные комментарии по фазам
    else if (state.phase === "attacking"){
      if (isHumanAtt) {
        msg = pick(L.attacking.human);
      } else {
        const aiPlayer = state.players.find(p => !p.isHuman);
        if (typeof L.attacking.ai === 'function') {
        msg = pick(L.attacking.ai(aiPlayer?.name || "Дональд"));
        } else {
          msg = pick(L.attacking.ai);
        }
      }
    } else if (state.phase === "defending"){
      if (isHumanDef) {
        msg = pick(L.defending.human);
      } else {
        const aiPlayer = state.players.find(p => !p.isHuman);
        if (typeof L.defending.ai === 'function') {
        msg = pick(L.defending.ai(aiPlayer?.name || "Дональд"));
        } else {
          msg = pick(L.defending.ai);
        }
      }
    } else if (state.phase === "adding"){
      const allCovered = total>0 && covered===total;
      if (isHumanAtt) {
        if (typeof L.adding.human === 'function') {
        msg = pick(L.adding.human(allCovered));
      } else {
          msg = pick(L.adding.human);
        }
      } else {
        msg = pick(L.adding.ai);
      }
    }
  } else {
    // Fallback к обычным комментариям
    if (state.phase === "attacking"){
      if (isHumanAtt) {
        msg = pick(L.attacking.human);
      } else {
        const aiPlayer = state.players.find(p => !p.isHuman);
        if (typeof L.attacking.ai === 'function') {
        msg = pick(L.attacking.ai(aiPlayer?.name || "Дональд"));
        } else {
          msg = pick(L.attacking.ai);
        }
      }
    } else if (state.phase === "defending"){
      if (isHumanDef) {
        msg = pick(L.defending.human);
      } else {
        const aiPlayer = state.players.find(p => !p.isHuman);
        if (typeof L.defending.ai === 'function') {
        msg = pick(L.defending.ai(aiPlayer?.name || "Дональд"));
        } else {
          msg = pick(L.defending.ai);
        }
      }
    } else if (state.phase === "adding"){
      const allCovered = total>0 && covered===total;
      if (isHumanAtt) {
        if (typeof L.adding.human === 'function') {
        msg = pick(L.adding.human(allCovered));
      } else {
          msg = pick(L.adding.human);
        }
      } else {
        msg = pick(L.adding.ai);
      }
    }
  }

  state.commentary = msg;
}


function renderOpponents(){
  // Update cards in the opponent panel
  const opponentCards = document.getElementById("opponentCards");
  if (!opponentCards) return;
  
  opponentCards.innerHTML = "";
  
  state.players.forEach((p,idx)=>{
    if (p.isHuman) return;
    const card = document.createElement("div");
    card.className = "opponent";
    const pile = document.createElement("div");
    pile.className = "pile";
    // Render facedown backs for opponent cards
    const backsToShow = Math.min(p.hand.length, 8);
    for (let i=0;i<backsToShow;i++){
      const back = document.createElement("div");
      back.className = "card back small";
      pile.appendChild(back);
    }
    if (p.hand.length > backsToShow){
      const more = document.createElement("div");
      more.className = "more";
      more.textContent = `+${p.hand.length - backsToShow}`;
      pile.appendChild(more);
    }
    const meta = document.createElement("div");
    const count = document.createElement("div"); count.className = "count"; count.textContent = `${p.hand.length}`;
    meta.appendChild(count);
    card.appendChild(pile); card.appendChild(meta);
    if (idx === state.attackerIndex) card.title = "Атакующий";
    if (idx === state.defenderIndex) card.title = "Защищающийся";
    opponentCards.appendChild(card);
  });
}

function renderTable(){
  if (!el.attackRow || !el.defenseRow) return;
  
  el.attackRow.innerHTML = "";
  el.defenseRow.innerHTML = "";
  state.table.pairs.forEach((pair, idx)=>{
    const a = document.createElement("div");
    a.className = "card";
    a.innerHTML = `<img alt="${text(pair.attack)}" src="${cardImagePath(pair.attack)}">`;
    if (pair.attack.suit === state.trumpSuit) a.classList.add("trump");

    // Выбор цели для защиты
    const isHumanDefender = state.defenderIndex === 0 && state.phase === "defending";
    const canSelect = isHumanDefender && !pair.defense;
    if (canSelect){
      a.classList.add("playable");
      if (state.selectedAttackIndex === idx) a.classList.add("selected");
      a.addEventListener("click", ()=>{
        state.selectedAttackIndex = (state.selectedAttackIndex === idx ? -1 : idx);
        renderHand();
        renderTable();
        updateButtons();
      });
    }
    el.attackRow.appendChild(a);

    const d = document.createElement("div");
    d.className = "card";
    if (pair.defense){
      d.innerHTML = `<img alt="${text(pair.defense)}" src="${cardImagePath(pair.defense)}">`;
      if (pair.defense.suit === state.trumpSuit) d.classList.add("trump");
    } else {
      d.classList.add("disabled");
      d.textContent = "—";
    }
    el.defenseRow.appendChild(d);
  });
  
  renderTableSide();
}

function renderTableSide(){
  if (!el.trumpCard || !el.deckCard) return;
  
  // МАКСИМАЛЬНАЯ ОТЛАДОЧНАЯ ИНФОРМАЦИЯ ДЛЯ RENDER
  console.log('🔍 === RENDER TABLE SIDE DEBUG ===');
  console.log('🃏 renderTableSide: trumpCard=', state.trumpCard, 'trumpSuit=', state.trumpSuit);
  console.log('🃏 renderTableSide: deck length=', state.deck.length, 'last card=', state.deck[state.deck.length - 1]);
  console.log('🃏 renderTableSide: trumpCard.suit=', state.trumpCard?.suit, 'state.trumpSuit=', state.trumpSuit);
  console.log('🃏 renderTableSide: trumpCard === last card?', state.trumpCard === state.deck[state.deck.length - 1]);
  console.log('🃏 renderTableSide: trumpCard.suit === last card suit?', state.trumpCard?.suit === state.deck[state.deck.length - 1]?.suit);
  console.log('🃏 renderTableSide: Full deck:', state.deck.map(c => text(c)));
  console.log('🔍 === END RENDER DEBUG ===');
  
  // Trump indicator card - показываем масть козыря (лучше видно)
  el.trumpCard.className = "card indicator";
  // Убираем любые фоновые изображения и показываем только масть
  el.trumpCard.style.backgroundImage = 'none';
  el.trumpCard.innerHTML = state.trumpSuit ? `<div class="trump-symbol">${state.trumpSuit}</div>` : "?";
  if (state.trumpSuit){
    el.trumpCard.classList.add((state.trumpSuit==='♦'||state.trumpSuit==='♥') ? 'suit-red' : 'suit-black');
    el.trumpCard.classList.add('trump');
  }
  
  // КРИТИЧЕСКАЯ ОТЛАДОЧНАЯ ИНФОРМАЦИЯ - что именно отображается справа
  console.log('🔍 === CRITICAL TRUMP DISPLAY DEBUG ===');
  console.log('🔍 el.trumpCard.innerHTML =', el.trumpCard.innerHTML);
  console.log('🔍 el.trumpCard.textContent =', el.trumpCard.textContent);
  console.log('🔍 el.trumpCard.innerText =', el.trumpCard.innerText);
  console.log('🔍 el.trumpCard.className =', el.trumpCard.className);
  console.log('🔍 el.trumpCard.style.backgroundImage =', el.trumpCard.style.backgroundImage);
  console.log('🔍 === END CRITICAL TRUMP DISPLAY DEBUG ===');
  
  // Deck count indicator card
  el.deckCard.className = "card indicator back";
  el.deckCard.innerHTML = `<div class="deck-count">${state.deck.length}</div>`;
}

function getPlayableForHuman(){
  const me = state.players[0];

  if (state.phase === "attacking"){
    if (state.attackerIndex !== 0) return [];
    return me.hand;
  }

  if (state.phase === "defending"){
    if (state.defenderIndex !== 0) return [];
    const openIdxs = state.table.pairs.map((p,i)=>!p.defense ? i : -1).filter(i=>i>=0);
    if (!openIdxs.length) return [];
    if (state.selectedAttackIndex >= 0 && openIdxs.includes(state.selectedAttackIndex)){
      const target = state.table.pairs[state.selectedAttackIndex].attack;
      return me.hand.filter(c => beats(c, target, state.trumpSuit));
    }
    return me.hand.filter(c => openIdxs.some(i => beats(c, state.table.pairs[i].attack, state.trumpSuit)));
  }

  if (state.phase === "adding"){
    if (state.attackerIndex !== 0) return [];
    const totalNow = state.table.pairs.length;
    if (totalNow >= state.maxTableThisRound) return [];
    const ranks = new Set(state.table.pairs.flatMap(p=>[p.attack.rank, p.defense?.rank].filter(Boolean)));
    return me.hand.filter(c => ranks.has(c.rank));
  }

  return [];
}


function adjustCardOverlap() {
  // Проверяем что элементы существуют
  if (!el.playerHand) {
    return;
  }
  
  const cards = el.playerHand.querySelectorAll('.card');
  const cardCount = cards.length;
  
  // Для малого количества карт убираем все перекрытия
  if (cardCount < 7) {
    cards.forEach((card, index) => {
      card.style.marginRight = '0px';
      card.style.marginLeft = '';
      card.style.transform = '';
    });
    return;
  }
  
  // Вычисляем наезжание мгновенно
  const containerWidth = el.playerHand.offsetWidth;
  const cardWidth = 70; // Примерная ширина карты
  const minSpacing = 10; // Минимальное расстояние между картами
  
  // Рассчитываем необходимое наезжание
  const totalCardWidth = cardCount * cardWidth;
  const availableSpace = containerWidth - (cardCount - 1) * minSpacing;
  
  // Вычисляем наезжание
  let overlapPx = Math.floor((totalCardWidth - availableSpace) / (cardCount - 1));
  
  // Увеличиваем наезжание на 20% для 5-6 карт
  if (cardCount >= 5 && cardCount <= 6) {
    overlapPx = Math.max(overlapPx, 18); // Минимум 18px для 5-6 карт
    if (overlapPx > 0) {
      overlapPx = Math.floor(overlapPx * 1.2); // +20% к вычисленному значению
    }
  }
  
  // Принудительно применяем наезжание для визуального эффекта
  if (overlapPx <= 0) {
    // Увеличиваем наезжание на 20% для 5-6 карт
    if (cardCount >= 5 && cardCount <= 6) {
      overlapPx = Math.max(18, 30 - cardCount * 1.8); // +20% от базового значения
    } else {
    overlapPx = Math.max(15, 25 - cardCount * 1.5);
    }
  }
  
  // Применяем наезжание мгновенно к каждой карте (кроме последней)
  cards.forEach((card, index) => {
    if (index < cards.length - 1) {
      card.style.marginRight = `-${overlapPx}px`;
    } else {
      card.style.marginRight = '0px';
    }
  });
}

function renderHand(){
  console.log('🎮 renderHand called');
  const me = state.players[0];
  console.log('👤 Player:', me);
  console.log('🃏 Hand length:', me.hand.length);
  console.log('🎯 playerHand element:', el.playerHand);
  
  if (!el.playerHand) {
    console.error('❌ playerHand element not found!');
    return;
  }
  
  el.playerHand.innerHTML = "";
  
  // Добавляем динамический класс в зависимости от количества карт
  const cardCount = me.hand.length;
  el.playerHand.className = "hand"; // Сбрасываем все классы
  
  // Ограничиваем максимальное количество до 20 для стилей
  const styleCardCount = Math.min(cardCount, 20);
  el.playerHand.classList.add(`cards-${styleCardCount}`);
  
  // Автоматически вычисляем наезжание для размещения всех карт в одну строку
  
  const playable = new Set(getPlayableForHuman().map(c=>c.id));
  me.hand
    .slice()
    .sort((a,b)=> {
      if (a.suit===b.suit) return RANK_VALUE[a.rank]-RANK_VALUE[b.rank];
      if (a.suit===state.trumpSuit && b.suit!==state.trumpSuit) return 1;
      if (b.suit===state.trumpSuit && a.suit!==state.trumpSuit) return -1;
      return SUITS.indexOf(a.suit)-SUITS.indexOf(b.suit);
    })
    .forEach((card, index)=>{
      const d = document.createElement("div");
      d.className = "card";
      d.setAttribute("data-card-id", card.id);
      const cardSrc = cardImagePath(card);
      d.innerHTML = `<img alt="${text(card)}" src="${cardSrc}" loading="eager">`;
      
      // КРИТИЧЕСКАЯ ОТЛАДОЧНАЯ ИНФОРМАЦИЯ - проверка отображения карт
      console.log(`🔍 === CARD DISPLAY DEBUG ===`);
      console.log(`🔍 Card: ${text(card)}, card.suit: ${card.suit}, card.rank: ${card.rank}`);
      console.log(`🔍 cardSrc: ${cardSrc}`);
      console.log(`🔍 cardImagePath result:`, cardImagePath(card));
      console.log(`🔍 === END CARD DISPLAY DEBUG ===`);
      
  // МАКСИМАЛЬНАЯ ОТЛАДОЧНАЯ ИНФОРМАЦИЯ ДЛЯ RENDER HAND
  console.log(`🔍 === RENDER HAND DEBUG ===`);
  console.log(`🔍 Checking card ${text(card)}: card.suit=${card.suit}, state.trumpSuit=${state.trumpSuit}, matches=${card.suit === state.trumpSuit}`);
  console.log(`🔍 state.trumpCard=`, state.trumpCard);
  console.log(`🔍 state.trumpSuit=`, state.trumpSuit);
  console.log(`🔍 state.deck.length=`, state.deck.length);
  console.log(`🔍 last card in deck=`, state.deck[state.deck.length - 1]);
  console.log(`🔍 trumpCard === last card?`, state.trumpCard === state.deck[state.deck.length - 1]);
  console.log(`🔍 trumpCard.suit === last card suit?`, state.trumpCard?.suit === state.deck[state.deck.length - 1]?.suit);
  console.log(`🔍 === END RENDER HAND DEBUG ===`);
      
      if (card.suit === state.trumpSuit) {
        console.log(`🃏 Adding trump class to card: ${text(card)}, trumpSuit: ${state.trumpSuit}`);
        d.classList.add("trump");
      }
      
      // КРИТИЧЕСКАЯ ОТЛАДОЧНАЯ ИНФОРМАЦИЯ - что именно помечается как козырь
      console.log(`🔍 === CRITICAL CARD MARKING DEBUG ===`);
      console.log(`🔍 Card: ${text(card)}, card.suit: ${card.suit}, state.trumpSuit: ${state.trumpSuit}`);
      console.log(`🔍 Card is trump: ${card.suit === state.trumpSuit}`);
      console.log(`🔍 state.trumpCard:`, state.trumpCard);
      console.log(`🔍 state.trumpSuit:`, state.trumpSuit);
      console.log(`🔍 === END CRITICAL CARD MARKING DEBUG ===`);
      if (playable.has(card.id)) d.classList.add("playable");
      if (ui.selected.has(card.id)) d.classList.add("selected");
      
      // Наезжание теперь управляется CSS классами
      
      d.addEventListener("click", ()=>{
        if (!playable.has(card.id)) return;
        if (ui.selected.has(card.id)) ui.selected.delete(card.id);
        else ui.selected.add(card.id);
        // If defending, auto-pick a target attack this card can beat when none selected
        if (state.phase === "defending" && state.defenderIndex === 0){
          if (ui.selected.size === 1){
            const [onlyId] = Array.from(ui.selected);
            const selectedCard = me.hand.find(c=>c.id===onlyId);
            if (selectedCard){
              const openIdxs = state.table.pairs.map((p,i)=>!p.defense ? i : -1).filter(i=>i>=0);
              // Always choose the first valid open attack this card can beat
              const canBeatIdx = openIdxs.find(i => beats(selectedCard, state.table.pairs[i].attack, state.trumpSuit));
              if (canBeatIdx !== undefined) {
                console.log(`🎯 Auto-selecting attack target ${canBeatIdx} for card ${text(selectedCard)}`);
                state.selectedAttackIndex = canBeatIdx;
              } else {
                console.log(`❌ No valid attack targets for card ${text(selectedCard)}`);
              }
            }
          }
        }
        render();
      });
      el.playerHand.appendChild(d);
    });
}

function render(){
  console.log('🎨 render() called');
  renderHeader();
  renderOpponents();
  renderTable();
  renderHand();
  updateButtons();
  applyUILabels();
  updateOpponentPanel();
  console.log('✅ render() completed');
}

function updateButtons(){
  el.btnAdd.disabled = true;
  el.btnTake.disabled = true;
  el.btnEnough.disabled = true;

  const isHumanAttacker = state.attackerIndex === 0;
  const isHumanDefender = state.defenderIndex === 0;

  if (state.phase === "attacking" && isHumanAttacker){
    el.btnAdd.innerHTML = `<span class="icon"></span> Сыграть выбранные`;
    el.btnAdd.setAttribute('data-phase', 'attacking');
    el.btnAdd.disabled = ui.selected.size === 0;
    // В фазе "attacking" кнопка "Бито" НЕ доступна (еще нет пар)
    el.btnEnough.disabled = true;
  } else if (state.phase === "defending" && isHumanDefender){
    el.btnAdd.innerHTML = `<span class="icon"></span> Крыть`;
    el.btnAdd.setAttribute('data-phase', 'defending');
    const canBeat = state.selectedAttackIndex >= 0 && ui.selected.size === 1;
    el.btnAdd.disabled = !canBeat;
    el.btnTake.disabled = false;
    // Защищающийся НИКОГДА не нажимает "Бито"
    el.btnEnough.disabled = true;
  } else if (state.phase === "adding" && isHumanAttacker){
    el.btnAdd.innerHTML = `<span class="icon"></span> Подкинуть выбранные`;
    el.btnAdd.setAttribute('data-phase', 'adding');
    el.btnAdd.disabled = ui.selected.size === 0;
    // Кнопка "Бито" доступна ТОЛЬКО когда ВСЕ пары покрыты
    el.btnEnough.disabled = !state.table.pairs.every(p=>p.defense);
  }
}

// ---------- Card Fade Out Animation ----------
function createCardFadeOutAnimation(cards, onComplete){
  console.log("🎬 createCardFadeOutAnimation called!");
  if (!cards.length) {
    console.log("❌ No cards provided for fade out animation");
    if (onComplete) onComplete();
    return;
  }
  
  console.log(`🎬 Starting fade out animation for ${cards.length} cards`);
  console.log("🎬 Cards:", cards.map(c => text(c)));
  
  // Находим реальные карты на столе
  const attackCards = el.attackRow.querySelectorAll('.card');
  const defenseCards = el.defenseRow.querySelectorAll('.card');
  const allTableCards = [...attackCards, ...defenseCards];
  
  console.log('🎬 Attack cards found:', attackCards.length);
  console.log('🎬 Defense cards found:', defenseCards.length);
  
  // Находим соответствующие DOM элементы
  const realCards = [];
  cards.forEach((card, index) => {
    let foundCard = null;
    
    // Сначала ищем в атакующих картах
    if (index < attackCards.length) {
      foundCard = attackCards[index];
    }
    // Затем ищем в защитных картах
    else if (index - attackCards.length < defenseCards.length) {
      const defenseIndex = index - attackCards.length;
      foundCard = defenseCards[defenseIndex];
    }
    
    if (foundCard) {
      realCards.push(foundCard);
      console.log(`✅ Found real card for fade out: ${text(card)}`);
    }
  });
  
  if (realCards.length === 0) {
    console.log("❌ No real cards found for fade out animation");
    if (onComplete) onComplete();
    return;
  }
  
  // Fallback: если что-то пойдет не так, карты исчезнут через 3 секунды
  const fallbackTimeout = setTimeout(() => {
    console.log("⚠️ Fallback: forcing animation completion");
    if (onComplete) onComplete();
  }, 3000);
  
  // Простая и заметная анимация через прямые стили
  realCards.forEach((card, index) => {
    setTimeout(() => {
      console.log(`🎬 Starting animation for card ${index + 1}/${realCards.length}`);
      
      // Добавляем класс для анимации
      card.classList.add('disappearing-explode');
      
      // Дополнительно устанавливаем стили напрямую для гарантии
      card.style.transition = 'all 1.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      
      // Сначала карта мигает несколько раз
      let blinkCount = 0;
      const blinkInterval = setInterval(() => {
        if (blinkCount >= 6) {
          clearInterval(blinkInterval);
          // После мигания карта исчезает
          card.style.transform = 'scale(1.4) rotate(15deg) translateY(-50px)';
          card.style.opacity = '0';
          card.style.filter = 'brightness(3) blur(5px)';
          return;
        }
        
        // Мигание
        if (blinkCount % 2 === 0) {
          card.style.filter = 'brightness(2)';
          card.style.transform = 'scale(1.1)';
        } else {
          card.style.filter = 'brightness(0.5)';
          card.style.transform = 'scale(1)';
        }
        blinkCount++;
      }, 150); // Мигание каждые 150ms
      
    }, index * 200); // Задержка 200ms между картами
  });
  
  // Ждем завершения анимации
  const animationDuration = 2000 + (realCards.length * 200); // 2000ms + 200ms на каждую карту
  setTimeout(() => {
    // Удаляем классы анимации и сбрасываем стили
    realCards.forEach(card => {
      card.classList.remove('disappearing-explode');
      card.style.transition = '';
      card.style.transform = '';
      card.style.opacity = '';
      card.style.filter = '';
    });
    
    console.log('🎬 Animation completed');
    clearTimeout(fallbackTimeout);
    if (onComplete) onComplete();
  }, animationDuration);
}

// ---------- Flying Card Animation ----------
function createFlyingCardsToPlayer(cards, onComplete){
  if (!el.table || !el.playerHand) return;
  
  console.log('🎬 createFlyingCardsToPlayer called with:', cards.length, 'cards');
  console.log('🎬 Cards:', cards.map(c => text(c)));
  
  // Получаем позицию руки игрока
  const handRect = el.playerHand.getBoundingClientRect();
  const targetPosition = {
    left: handRect.left + handRect.width / 2,
    top: handRect.top + handRect.height / 2
  };
  
  // Создаем анимацию для каждой карты
  cards.forEach((card, index) => {
    setTimeout(() => {
      createFlyingCardToPlayer(card, targetPosition, () => {
        // Вызываем callback только для последней карты
        if (index === cards.length - 1) {
          setTimeout(onComplete, 200);
        }
      });
    }, index * 150); // Задержка между картами
  });
}

function createFlyingCardsToOpponent(cards, onComplete){
  if (!el.table) return;
  
  console.log('🎬 Creating flying cards to opponent:', cards.length, 'cards');
  console.log('🎬 opponentCards element:', el.opponentCards);
  
  // Если opponentCards не найден, используем fallback
  let targetPosition;
  if (el.opponentCards) {
    const opponentRect = el.opponentCards.getBoundingClientRect();
    targetPosition = {
      left: opponentRect.left + opponentRect.width / 2,
      top: opponentRect.top + opponentRect.height / 2
    };
    console.log('🎬 Using opponentCards position:', targetPosition);
  } else {
    // Fallback: используем позицию в верхней части экрана
    targetPosition = {
      left: window.innerWidth / 2,
      top: 100
    };
    console.log('🎬 Using fallback position:', targetPosition);
  }
  
  // Создаем анимацию для каждой карты
  cards.forEach((card, index) => {
    setTimeout(() => {
      createFlyingCardToOpponent(card, targetPosition, () => {
        // Вызываем callback только для последней карты
        if (index === cards.length - 1) {
          setTimeout(onComplete, 200);
        }
      });
    }, index * 150); // Задержка между картами
  });
}

function createFlyingCardToPlayer(card, targetPosition, onComplete){
  if (!el.table) return;
  
  // Получаем реальную позицию карты на столе
  let startPosition = null;
  
  // Ищем карту в атакующих картах по тексту
  const attackCards = el.attackRow.querySelectorAll('.card');
  for (let i = 0; i < attackCards.length; i++) {
    const cardElement = attackCards[i];
    const cardText = cardElement.textContent || cardElement.innerText;
    if (cardText.includes(text(card).split(' ')[0])) {
      const cardRect = cardElement.getBoundingClientRect();
      startPosition = {
        left: cardRect.left + cardRect.width / 2,
        top: cardRect.top + cardRect.height / 2
      };
      console.log(`🎬 Found attack card at index ${i}, position:`, startPosition);
      break;
    }
  }
  
  // Если не найдена в атакующих, ищем в защитных
  if (!startPosition) {
    const defenseCards = el.defenseRow.querySelectorAll('.card');
    for (let i = 0; i < defenseCards.length; i++) {
      const cardElement = defenseCards[i];
      const cardText = cardElement.textContent || cardElement.innerText;
      if (cardText.includes(text(card).split(' ')[0])) {
        const cardRect = cardElement.getBoundingClientRect();
        startPosition = {
          left: cardRect.left + cardRect.width / 2,
          top: cardRect.top + cardRect.height / 2
        };
        console.log(`🎬 Found defense card at index ${i}, position:`, startPosition);
        break;
      }
    }
  }
  
  // Fallback: используем центр стола если карта не найдена
  if (!startPosition) {
    const tableRect = el.table.getBoundingClientRect();
    startPosition = {
      left: tableRect.left + tableRect.width / 2,
      top: tableRect.top + tableRect.height / 2
    };
    console.log(`🎬 Using fallback position (center):`, startPosition);
  }
  
  // Создаем летящую карту
  const flyingCard = document.createElement('div');
  flyingCard.style.cssText = `
    position: fixed;
    left: ${startPosition.left}px;
    top: ${startPosition.top}px;
    width: 60px;
    height: 90px;
    z-index: 99999;
    pointer-events: none;
    border: 2px solid #333;
    background: white;
    border-radius: 6px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    color: #333;
  `;
  
  // Добавляем изображение карты
  const cardImg = document.createElement('img');
  cardImg.src = cardImagePath(card);
  cardImg.style.cssText = 'width: 100%; height: 100%; object-fit: contain; border-radius: 4px;';
  flyingCard.appendChild(cardImg);
  
  document.body.appendChild(flyingCard);
  
  // Анимация полета
  const duration = 800;
  const startTime = performance.now();
  
  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Кривая анимации (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    const currentLeft = startPosition.left + (targetPosition.left - startPosition.left) * easeOut;
    const currentTop = startPosition.top + (targetPosition.top - startPosition.top) * easeOut;
    
    // Добавляем небольшое вращение
    const rotation = progress * 360;
    
    flyingCard.style.left = currentLeft + 'px';
    flyingCard.style.top = currentTop + 'px';
    flyingCard.style.transform = `rotate(${rotation}deg) scale(${1 - progress * 0.3})`;
    flyingCard.style.opacity = 1 - progress * 0.5;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Удаляем карту после анимации
      flyingCard.remove();
      if (onComplete) onComplete();
    }
  }
  
  requestAnimationFrame(animate);
}

function createFlyingCardsToLeft(cards, onComplete){
  if (!cards.length) {
    console.log("❌ No cards provided for animation");
    if (onComplete) onComplete();
    return;
  }
  
  console.log(`🎬 Animating real cards to left: ${cards.length} cards`);
  console.log('🎬 Cards to animate:', cards.map(c => text(c)));
  
  // Находим реальные карты на столе
  const realCards = [];
  const attackCards = el.attackRow.querySelectorAll('.card');
  const defenseCards = el.defenseRow.querySelectorAll('.card');
  
  console.log('🎬 Attack cards found:', attackCards.length);
  console.log('🎬 Defense cards found:', defenseCards.length);
  
  // Собираем все карты со стола
  const allTableCards = [...attackCards, ...defenseCards];
  
  // Находим соответствующие DOM элементы по позиции
  cards.forEach((card, index) => {
    const cardText = text(card);
    console.log(`🎬 Looking for card: ${cardText} at index ${index}`);
    
    // Пробуем найти карту по позиции в массиве
    let foundCard = null;
    
    // Сначала ищем в атакующих картах
    if (index < attackCards.length) {
      foundCard = attackCards[index];
      console.log(`🎬 Found attack card at index ${index}`);
    }
    // Затем ищем в защитных картах
    else if (index - attackCards.length < defenseCards.length) {
      const defenseIndex = index - attackCards.length;
      foundCard = defenseCards[defenseIndex];
      console.log(`🎬 Found defense card at index ${defenseIndex}`);
    }
    
    if (foundCard) {
      realCards.push(foundCard);
      console.log(`✅ Found real card for: ${cardText}`);
    } else {
      console.log(`❌ No real card found for: ${cardText}`);
    }
  });
  
  console.log(`🎬 Real cards found: ${realCards.length}`);
  
  if (realCards.length === 0) {
    console.log("❌ No real cards found for animation");
    if (onComplete) onComplete();
    return;
  }
  
  // Сохраняем исходные стили карт
  const originalStyles = realCards.map(card => ({
    position: card.style.position,
    transform: card.style.transform,
    transition: card.style.transition,
    zIndex: card.style.zIndex
  }));
  
  // Подготавливаем карты для анимации
  realCards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    
    // Переводим в fixed позицию
    card.style.position = 'fixed';
    card.style.left = rect.left + 'px';
    card.style.top = rect.top + 'px';
    card.style.zIndex = '99999';
    card.style.transition = 'none';
    card.style.transform = 'translate(0, 0)';
  });
  
  // Анимация улета влево
  const startTime = performance.now();
  const duration = 1200;
  
  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Кривая анимации (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    realCards.forEach((card, index) => {
      const startLeft = parseFloat(card.style.left);
      const startTop = parseFloat(card.style.top);
      
      // Улетаем влево за пределы экрана
      const targetLeft = -200 - (index * 30);
      const targetTop = startTop + (Math.sin(progress * Math.PI) * 40);
      
      const currentLeft = startLeft + (targetLeft - startLeft) * easeOut;
      const currentTop = startTop + (targetTop - startTop) * easeOut;
      
      // Добавляем вращение и масштабирование
      const rotation = progress * 360;
      const scale = 1 - progress * 0.3;
      
      card.style.left = currentLeft + 'px';
      card.style.top = currentTop + 'px';
      card.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
      card.style.opacity = 1 - progress * 0.7;
    });
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Восстанавливаем стили и удаляем карты
      realCards.forEach((card, index) => {
        card.style.position = originalStyles[index].position;
        card.style.transform = originalStyles[index].transform;
        card.style.transition = originalStyles[index].transition;
        card.style.zIndex = originalStyles[index].zIndex;
        card.style.left = '';
        card.style.top = '';
        card.style.opacity = '';
        
        // Удаляем карту из DOM
        card.remove();
      });
      
      if (onComplete) onComplete();
    }
  }
  
  requestAnimationFrame(animate);
}

function createFlyingCardToOpponent(card, targetPosition, onComplete){
  if (!el.table) return;
  
  // Получаем реальную позицию карты на столе
  let startPosition = null;
  
  // Ищем карту в атакующих картах по тексту
  const attackCards = el.attackRow.querySelectorAll('.card');
  for (let i = 0; i < attackCards.length; i++) {
    const cardElement = attackCards[i];
    const cardText = cardElement.textContent || cardElement.innerText;
    if (cardText.includes(text(card).split(' ')[0])) {
      const cardRect = cardElement.getBoundingClientRect();
      startPosition = {
        left: cardRect.left + cardRect.width / 2,
        top: cardRect.top + cardRect.height / 2
      };
      console.log(`🎬 Found attack card at index ${i}, position:`, startPosition);
      break;
    }
  }
  
  // Если не найдена в атакующих, ищем в защитных
  if (!startPosition) {
    const defenseCards = el.defenseRow.querySelectorAll('.card');
    for (let i = 0; i < defenseCards.length; i++) {
      const cardElement = defenseCards[i];
      const cardText = cardElement.textContent || cardElement.innerText;
      if (cardText.includes(text(card).split(' ')[0])) {
        const cardRect = cardElement.getBoundingClientRect();
        startPosition = {
          left: cardRect.left + cardRect.width / 2,
          top: cardRect.top + cardRect.height / 2
        };
        console.log(`🎬 Found defense card at index ${i}, position:`, startPosition);
        break;
      }
    }
  }
  
  // Fallback: используем центр стола если карта не найдена
  if (!startPosition) {
    const tableRect = el.table.getBoundingClientRect();
    startPosition = {
      left: tableRect.left + tableRect.width / 2,
      top: tableRect.top + tableRect.height / 2
    };
    console.log(`🎬 Using fallback position (center):`, startPosition);
  }
  
  // Создаем летящую карту
  const flyingCard = document.createElement('div');
  flyingCard.style.cssText = `
    position: fixed;
    left: ${startPosition.left}px;
    top: ${startPosition.top}px;
    width: 60px;
    height: 90px;
    z-index: 99999;
    pointer-events: none;
    border: 2px solid #333;
    background: white;
    border-radius: 6px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    color: #333;
  `;
  
  // Добавляем изображение карты
  const cardImg = document.createElement('img');
  cardImg.src = cardImagePath(card);
  cardImg.style.cssText = 'width: 100%; height: 100%; object-fit: contain; border-radius: 4px;';
  flyingCard.appendChild(cardImg);
  
  document.body.appendChild(flyingCard);
  
  // Анимация полета
  const duration = 800;
  const startTime = performance.now();
  
  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Кривая анимации (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    const currentLeft = startPosition.left + (targetPosition.left - startPosition.left) * easeOut;
    const currentTop = startPosition.top + (targetPosition.top - startPosition.top) * easeOut;
    
    // Добавляем небольшое вращение
    const rotation = progress * 360;
    
    flyingCard.style.left = currentLeft + 'px';
    flyingCard.style.top = currentTop + 'px';
    flyingCard.style.transform = `rotate(${rotation}deg) scale(${1 - progress * 0.3})`;
    flyingCard.style.opacity = 1 - progress * 0.5;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Удаляем карту после анимации
      flyingCard.remove();
      if (onComplete) onComplete();
    }
  }
  
  requestAnimationFrame(animate);
}

function createFlyingCardToTable(card, onComplete, cardType = 'attack', targetIndex = -1){
  if (!el.playerHand || !el.table || !el.attackRow || !el.defenseRow) return;
  
  console.log(`🎬 Creating flying card: ${text(card)}, type: ${cardType}, targetIndex: ${targetIndex}`);
  
  // Get hand position
  let handRect;
  try {
    handRect = el.playerHand.getBoundingClientRect();
  } catch (error) {
    return;
  }
  
  // Find the exact position of the card in hand
  const handCards = el.playerHand.querySelectorAll('.card');
  let cardPosition = { left: handRect.left + handRect.width/2, top: handRect.top + handRect.height/2 };
  
  // Try to find the specific card position
  for (let i = 0; i < handCards.length; i++) {
    const cardElement = handCards[i];
    const cardRect = cardElement.getBoundingClientRect();
    if (cardElement.textContent.includes(text(card).split(' ')[0])) {
      cardPosition = {
        left: cardRect.left + cardRect.width/2,
        top: cardRect.top + cardRect.height/2
      };
      break;
    }
  }
  
  // Create flying card at exact card position (real card style)
  const flyingCard = document.createElement('div');
  flyingCard.style.cssText = `
    position: fixed;
    left: ${cardPosition.left}px;
    top: ${cardPosition.top}px;
    width: 60px;
    height: 90px;
    z-index: 99999;
    pointer-events: none;
    border: 2px solid #333;
    background: white;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    color: #000;
    transform: translate(-50%, -50%);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  `;
  
  // Add real card content with SVG
  flyingCard.innerHTML = `<img alt="${text(card)}" src="${cardImagePath(card)}" style="width: 100%; height: 100%; object-fit: contain;">`;
  if (card.suit === state.trumpSuit) {
    flyingCard.style.borderColor = '#ffd700';
    flyingCard.style.background = 'linear-gradient(135deg, #ffd700, #ffed4e)';
  }
  
  document.body.appendChild(flyingCard);
  
  // Calculate target position without adding card to state yet
  let targetX, targetY;
  
  if (cardType === 'attack') {
    // Calculate position for new attack card
    const currentPairs = state.table.pairs.length;
    const cardWidth = 60; // Approximate card width
    const cardHeight = 90; // Approximate card height
    const gap = 8; // Gap between cards
    
    const attackRowRect = el.attackRow.getBoundingClientRect();
    targetX = attackRowRect.left + (currentPairs * (cardWidth + gap)) + cardWidth/2;
    targetY = attackRowRect.top + cardHeight/2;
  } else if (cardType === 'defense') {
    // Calculate position for defense card
    const defenseRowRect = el.defenseRow.getBoundingClientRect();
    const cardWidth = 60;
    const cardHeight = 90;
    const gap = 8;
    
    const targetIdx = targetIndex >= 0 ? targetIndex : state.table.pairs.length - 1;
    targetX = defenseRowRect.left + (targetIdx * (cardWidth + gap)) + cardWidth/2;
    targetY = defenseRowRect.top + cardHeight/2;
  }
  
  console.log(`🎯 Calculated target position: ${targetX}, ${targetY}`);
  
  // Start animation to calculated position
  setTimeout(() => {
    console.log(`🎯 Flying to calculated position: ${targetX}, ${targetY}`);
    
    // Start animation to exact position
    setTimeout(() => {
      flyingCard.style.transition = 'all 1000ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      flyingCard.style.left = targetX + 'px';
      flyingCard.style.top = targetY + 'px';
      flyingCard.style.transform = 'translate(-50%, -50%) scale(0.8)';
      flyingCard.style.opacity = '0';
    }, 200);
    
    // Clean up and add card to state after animation
    setTimeout(() => {
      if (flyingCard.parentNode) {
        flyingCard.parentNode.removeChild(flyingCard);
      }
      
      // Now add the card to the state and render
      if (cardType === 'attack') {
        state.table.pairs.push({ attack: card, defense: null });
        // Play sound effect for card on table
        soundManager.playCardOnTable();
      } else if (cardType === 'defense') {
        if (targetIndex >= 0 && targetIndex < state.table.pairs.length) {
          state.table.pairs[targetIndex].defense = card;
          // Play sound effect for card on table
          soundManager.playCardOnTable();
        } else {
          const currentPair = state.table.pairs[state.table.pairs.length - 1];
          if (currentPair) {
            currentPair.defense = card;
            // Play sound effect for card on table
            soundManager.playCardOnTable();
          }
        }
      }
      
      // Render the card on the table
      render();
      
      if (onComplete) {
        onComplete();
      }
    }, 1200);
  }, 100);
}

// ========================================
// 🎮 GAME LOGIC & MOVES
// ========================================

function commitAttackFromPlayer(player, selectedIds){
  const selected = player.hand.filter(c=>selectedIds.has(c.id));
  if (!selected.length) return false;
  const ranks = new Set(selected.map(c=>c.rank));
  if (ranks.size !== 1) return false;
  const totalIf = state.table.pairs.length + selected.length;
  if (totalIf > state.maxTableThisRound) return false;
  
  // Remove cards from hand first (for animation)
  player.hand = player.hand.filter(c=>!selectedIds.has(c.id));
  state.selectedAttackIndex = -1;
  ui.selected.clear();

  // Update UI to show cards removed from hand
  render();

  // Start animation first, then add cards to table after animation
  selected.forEach((card, index) => {
    setTimeout(() => {
      createFlyingCardToTable(card, () => {
        // Only set phase to defending after the first card
        if (index === 0) {
          state.phase = "defending";
        }
        render();
        
        // Continue AI after animation (only for the last card)
        if (index === selected.length - 1) {
          setTimeout(aiLoopStep, 250);
        }
      }, 'attack');
    }, 100 + (index * 300)); // Increased stagger time for better sequence
  });
  
  return true;
}

function commitDefenseFromPlayer(player, selectedId){
  if (state.selectedAttackIndex < 0) {
    console.log("❌ No attack target selected");
    return false;
  }
  const idx = state.selectedAttackIndex;
  const pair = state.table.pairs[idx];
  if (!pair || pair.defense) {
    console.log("❌ Invalid attack target or already defended");
    return false;
  }

  const card = player.hand.find(c=>c.id===selectedId);
  if (!card) {
    console.log("❌ Card not found in hand");
    return false;
  }
  if (!beats(card, pair.attack, state.trumpSuit)) {
    console.log("❌ Card cannot beat attack card");
    return false;
  }
  
  console.log(`✅ Defending attack ${idx} with card ${text(card)} against ${text(pair.attack)}`);

  // Store the target index before clearing it
  const targetIndex = state.selectedAttackIndex;
  
  // Remove card from hand first (for animation)
  player.hand = player.hand.filter(x=>x.id!==card.id);
  state.selectedAttackIndex = -1;
  ui.selected.clear();

  // Update UI to show card removed from hand
  render();

  // Start animation first, then add card to table after animation
  setTimeout(() => {
    createFlyingCardToTable(card, () => {
      // Card is already added to the correct position in createFlyingCardToTable
      state.phase = state.table.pairs.every(p=>p.defense) ? "adding" : "defending";
      render();
      
      // Continue AI after animation
      setTimeout(aiLoopStep, 250);
    }, 'defense', targetIndex);
  }, 200);
  
  return true;
}

function commitAddFromPlayer(player, selectedIds){
  const selected = player.hand.filter(c=>selectedIds.has(c.id));
  if (!selected.length) return false;
  const ranks = new Set(state.table.pairs.flatMap(p=>[p.attack.rank, p.defense?.rank].filter(Boolean)));
  if (selected.some(c=>!ranks.has(c.rank))) return false;
  const totalIf = state.table.pairs.length + selected.length;
  if (totalIf > state.maxTableThisRound) return false;
  
  // Remove cards from hand first (for animation)
  player.hand = player.hand.filter(c=>!selectedIds.has(c.id));
  state.selectedAttackIndex = -1;
  ui.selected.clear();

  // Update UI to show cards removed from hand
  render();

  // Start animation first, then add cards to table after animation
  selected.forEach((card, index) => {
    setTimeout(() => {
      createFlyingCardToTable(card, () => {
        // После подкидывания карты переходим к фазе защиты
        state.phase = "defending";
        render();
        
        // Continue AI after animation (only for the last card)
        if (index === selected.length - 1) {
          // Даем время на обновление UI, затем вызываем AI
          setTimeout(() => {
            console.log('🎯 Player added cards, calling aiLoopStep');
            aiLoopStep();
          }, 100);
        }
      }, 'attack');
    }, 100 + (index * 200)); // Stagger animations
  });
  
  return true;
}

function defenderTakes(){
  const defender = state.players[state.defenderIndex];
  const all = state.table.pairs.flatMap(p=>[p.attack, p.defense].filter(Boolean));
  
  console.log('🎬 defenderTakes called');
  console.log('🎬 Defender:', defender.name, 'isHuman:', defender.isHuman);
  console.log('🎬 Table pairs:', state.table.pairs);
  console.log('🎬 Cards to take:', all.length, all.map(c => text(c)));
  
  // Защита от повторных вызовов
  if (state.isTakingCards) {
    console.log('🎬 Already taking cards, skipping...');
    return;
  }
  
  // Создаем анимацию полета карт к игроку
  if (defender.isHuman && all.length > 0) {
    state.isTakingCards = true; // Блокируем повторные вызовы
    createFlyingCardsToPlayer(all, () => {
      // После анимации добавляем карты в руку
      defender.hand.push(...all);
      state.table.pairs = [];
      // После взятия карт атакующий остается тем же, защищающийся тоже
      // state.attackerIndex остается тем же
      // state.defenderIndex остается тем же
      drawUpToSix();
      startNewRound();
      checkEndgame();
      render();
      
      // Сбрасываем флаг
      state.isTakingCards = false;
      
      // Продолжаем игру после анимации
      setTimeout(aiLoopStep, 300);
    });
  } else {
    // Для ИИ - создаем анимацию полета карт к противнику
    if (all.length > 0) {
      state.isTakingCards = true; // Блокируем повторные вызовы
      
      // Показываем комментарий противника о взятии карт
      const quotes = getQuotesForTheme(state.theme);
      const takeComments = quotes.taking;
      
      const pick = arr => arr[(Math.random()*arr.length)|0];
      state.commentary = pick(takeComments);
      render();
      
      // Даем время прочитать комментарий
      setTimeout(() => {
        createFlyingCardsToOpponent(all, () => {
          // После анимации добавляем карты в руку ИИ
          defender.hand.push(...all);
          state.table.pairs = [];
          state.attackerIndex = (state.defenderIndex + 1) % state.players.length;
          state.defenderIndex = (state.attackerIndex + 1) % state.players.length;
          drawUpToSix();
          startNewRound();
          checkEndgame();
          render();
          
          // Сбрасываем флаг
          state.isTakingCards = false;
          
          // Продолжаем игру после анимации
          setTimeout(aiLoopStep, 300);
        });
      }, 1500); // 1.5 секунды на чтение комментария
    } else {
      // Если нет карт - обычная логика
      defender.hand.push(...all);
      state.table.pairs = [];
      // После взятия карт атакующий остается тем же, защищающийся тоже
      // state.attackerIndex остается тем же
      // state.defenderIndex остается тем же
      drawUpToSix();
      startNewRound();
      checkEndgame();
      
      // Продолжаем игру
      setTimeout(aiLoopStep, 300);
    }
  }
}

function defenderEnough(){
  console.log('🎬 defenderEnough called');
  console.log('🎬 Table pairs length:', state.table.pairs.length);
  console.log('🎬 All pairs have defense:', state.table.pairs.every(p=>p.defense));
  console.log('🎬 Table pairs:', state.table.pairs);

  // Защита от множественных вызовов
  if (state.isDefenderEnoughInProgress) {
    console.log('❌ defenderEnough: already in progress, skipping');
    return;
  }

  if (!state.table.pairs.length || !state.table.pairs.every(p=>p.defense)) {
    console.log('❌ defenderEnough: condition not met, returning');
    return;
  }

  state.isDefenderEnoughInProgress = true;
  console.log('✅ defenderEnough: condition met, starting animation');
  
  console.log('✅ defenderEnough: condition met, proceeding with animation');
  
  // Создаем анимацию улета карт влево
  const allCards = state.table.pairs.flatMap(p=>[p.attack, p.defense].filter(Boolean));
  console.log('🎬 Cards to animate:', allCards.length, allCards.map(c => text(c)));
  
  if (allCards.length > 0) {
    console.log('🎬 Starting simple card removal...');
    
    // Play sound effect for cards disappearing
    soundManager.playCardDisappear();
    
    // Простое и гарантированное решение
    const attackCards = el.attackRow.querySelectorAll('.card');
    const defenseCards = el.defenseRow.querySelectorAll('.card');
    
    console.log('🎬 Found attack cards:', attackCards.length);
    console.log('🎬 Found defense cards:', defenseCards.length);
    
    // Очень простая и заметная анимация
    const allTableCards = [...attackCards, ...defenseCards];
    console.log('🎬 Total cards to animate:', allTableCards.length);
    
       // Красивая анимация исчезновения карт
       allTableCards.forEach((card, index) => {
         setTimeout(() => {
           console.log(`🎬 Animating card ${index + 1}`);
           
           // Первая фаза - карта становится яркой и увеличивается
           card.style.transition = 'all 0.4s ease-out';
           card.style.transform = 'scale(1.2) rotate(5deg)';
           card.style.filter = 'brightness(1.5) saturate(1.5)';
           card.style.boxShadow = '0 0 20px rgba(255, 255, 0, 0.8)';
           
           // Вторая фаза - карта исчезает с вращением
           setTimeout(() => {
             card.style.transition = 'all 0.6s ease-in';
             card.style.opacity = '0';
             card.style.transform = 'scale(0.3) rotate(180deg) translateY(-50px)';
             card.style.filter = 'brightness(2) blur(2px)';
           }, 400);
           
         }, index * 150); // Задержка между картами
       });

       // Через 1.5 секунды продолжаем игру
       setTimeout(() => {
         console.log('🎬 Card removal completed');
         // Очищаем стол и продолжаем игру
         state.attackerIndex = state.defenderIndex;
         state.defenderIndex = (state.attackerIndex + 1) % state.players.length;
         drawUpToSix();
         startNewRound();
         checkEndgame();
         render();

         // Продолжаем игру
         setTimeout(aiLoopStep, 300);
       }, 1500);
    
  } else {
    console.log('🎬 No cards to remove, using fallback');
    // Если нет карт - обычная логика
    state.attackerIndex = state.defenderIndex;
    state.defenderIndex = (state.attackerIndex + 1) % state.players.length;
    drawUpToSix();
    startNewRound();
    checkEndgame();
    render();
    
    // Продолжаем игру
    setTimeout(aiLoopStep, 300);
  }
  
  // Сбрасываем флаг в конце функции
  setTimeout(() => {
    state.isDefenderEnoughInProgress = false;
    console.log('🎬 defenderEnough: flag reset');
  }, 5000); // Чуть больше чем анимация
}

function drawUpToSix(){
  const order = [];
  for (let i=0;i<state.players.length;i++) order.push((state.attackerIndex + i) % state.players.length);
  for (const idx of order){
    const p = state.players[idx];
    while (p.hand.length < 6 && state.deck.length) p.hand.push(state.deck.pop());
  }
}
function startNewRound(){
  const def = state.players[state.defenderIndex];
  state.maxTableThisRound = Math.min(6, def.hand.length);
  state.table.pairs = [];
  state.phase = "attacking";
  state.selectedAttackIndex = -1;
}

// ---------- Endgame ----------
function isDeckEmpty(){ return state.deck.length === 0; }
function anyPlayerOutOfCards(){ return state.players.some(p=>p.hand.length === 0); }
function checkEndgame(){
  if (!isDeckEmpty()) return false;
  if (!anyPlayerOutOfCards()) return false;
  const human = state.players[0];
  const humanWon = human.hand.length === 0;
  showEndgameModal(humanWon ? "Вы выиграли!" : "Вы проиграли!", "Колода пуста. Игра окончена.");
  return true;
}
function showEndgameModal(title, message){
  // prevent duplicates
  if (document.querySelector('.modal-overlay')) return;
  
  // Обновляем статистику
  const humanWon = title === "Вы выиграли!";
  updatePlayerStats(humanWon ? 'win' : 'loss');
  
  const overlay = document.createElement('div'); overlay.className = 'modal-overlay';
  const modal = document.createElement('div'); modal.className = 'modal';
  const h2 = document.createElement('h2'); h2.textContent = title;
  const p = document.createElement('p'); p.textContent = message;
  const row = document.createElement('div'); row.className = 'row';
  const btnRestart = document.createElement('button'); btnRestart.textContent = "Сыграть ещё";
  btnRestart.addEventListener('click', ()=>{ overlay.remove(); restartGame(); });
  row.appendChild(btnRestart);
  modal.appendChild(h2); modal.appendChild(p); modal.appendChild(row);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
function restartGame(){
  ui.selected.clear();
  state.selectedAttackIndex = -1;
  state.lastCommentKey = ""; // Сбрасываем кэш комментариев
  state.isTakingCards = false; // Сбрасываем флаг взятия карт
  initPlayers(1);
  dealInitial();
  render();
  setTimeout(aiLoopStep, 400);
}

// ========================================
// 🤖 AI LOGIC & OPPONENT BEHAVIOR
// ========================================

function findLowestValidAttack(hand, limit){
  console.log(`🔍 findLowestValidAttack: hand=${hand.length} cards, limit=${limit}`);
  if (limit <= 0) {
    console.log(`🔍 findLowestValidAttack: limit <= 0, returning null`);
    return null;
  }
  
  // В дураке можно атаковать только козырными картами или картами того же ранга, что уже на столе
  // Если это первая атака (стол пустой), то можно атаковать только козырными картами
  const tableRanks = state.table.pairs.flat().map(c => c.rank);
  const isFirstAttack = state.table.pairs.length === 0;
  
  console.log(`🔍 findLowestValidAttack: isFirstAttack=${isFirstAttack}, tableRanks=${tableRanks}, trumpSuit=${state.trumpSuit}`);
  
  // Фильтруем карты: только козырные или карты того же ранга, что уже на столе
  const validCards = hand.filter(card => {
    if (card.suit === state.trumpSuit) {
      console.log(`🔍 findLowestValidAttack: ${text(card)} is trump - valid`);
      return true;
    }
    if (tableRanks.includes(card.rank)) {
      console.log(`🔍 findLowestValidAttack: ${text(card)} matches table rank - valid`);
      return true;
    }
    console.log(`🔍 findLowestValidAttack: ${text(card)} is not trump and doesn't match table - invalid`);
    return false;
  });
  
  console.log(`🔍 findLowestValidAttack: valid cards:`, validCards.map(c => text(c)));
  
  if (validCards.length === 0) {
    console.log(`🔍 findLowestValidAttack: no valid cards found`);
    return null;
  }
  
  const byRank = validCards.reduce((m,c)=>{ (m[c.rank]=m[c.rank]||[]).push(c); return m; }, {});
  const ranks = Object.keys(byRank).sort((a,b)=>RANK_VALUE[a]-RANK_VALUE[b]);
  console.log(`🔍 findLowestValidAttack: ranks found:`, ranks);
  
  for (const r of ranks){
    const g = byRank[r];
    if (g.length){
      const take = Math.min(g.length, Math.max(1, Math.min(limit, g.length)));
      console.log(`🔍 findLowestValidAttack: found rank ${r} with ${g.length} cards, taking ${take}`);
      return g.slice(0,take);
    }
  }
  
  console.log(`🔍 findLowestValidAttack: no valid attack found`);
  return null;
}
function aiAttack(player){
  const max = state.maxTableThisRound - state.table.pairs.length;
  console.log(`🤖 AI Attack: max=${max}, hand=${player.hand.length} cards`);
  
  const sel = findLowestValidAttack(player.hand, max);
  if (!sel) {
    console.log(`🤖 AI Attack: No valid attack found, max=${max}`);
    return false;
  }
  
  console.log(`🤖 AI Attack: Selected ${sel.length} cards for attack`);
  
  // Добавляем задержку для "планирования" атаки ИИ
  setTimeout(() => {
    for (const c of sel){
      state.table.pairs.push({ attack:c });
      player.hand = player.hand.filter(x=>x.id!==c.id);
    }
    // Play sound effect for AI placing cards
    soundManager.playCardOnTable();
    state.phase = "defending";
    render();
    checkEndgame();
    // Продолжаем ход ИИ после атаки
    setTimeout(aiLoopStep, 400);
  }, 800); // 0.8 секунды на планирование атаки
  
  return true;
}
function aiDefense(player){
  console.log(`🤖 AI Defense: checking defense for ${player.name}`);
  console.log(`🤖 AI Defense: player hand:`, player.hand.map(c => text(c)));
  console.log(`🤖 AI Defense: table pairs:`, state.table.pairs.map(p => ({ attack: text(p.attack), defense: p.defense ? text(p.defense) : 'none' })));
  
  const openIdx = state.table.pairs.findIndex(p=>!p.defense);
  console.log(`🤖 AI Defense: openIdx = ${openIdx}`);
  
  if (openIdx < 0) {
    console.log(`🤖 AI Defense: no open attacks found`);
    return false;
  }
  
  const atk = state.table.pairs[openIdx].attack;
  console.log(`🤖 AI Defense: defending against ${text(atk)}`);
  console.log(`🤖 AI Defense: trump suit = ${state.trumpSuit}`);
  
  const cand = player.hand.filter(c=>beats(c, atk, state.trumpSuit))
                          .sort((a,b)=>RANK_VALUE[a.rank]-RANK_VALUE[b.rank]);
  
  console.log(`🤖 AI Defense: candidate cards:`, cand.map(c => text(c)));
  
  if (!cand.length) {
    console.log(`🤖 AI Defense: no cards can beat ${text(atk)}`);
    return false;
  }
  
  console.log(`🤖 AI Defense: selected card ${text(cand[0])} to defend against ${text(atk)}`);
  
  // Добавляем задержку для "размышления" ИИ
  setTimeout(() => {
    const card = cand[0];
    state.table.pairs[openIdx].defense = card;
    player.hand = player.hand.filter(x=>x.id!==card.id);
    // Play sound effect for AI defending
    soundManager.playCardOnTable();
    state.phase = state.table.pairs.every(p=>p.defense) ? "adding" : "defending";
    console.log(`🤖 AI Defense: phase changed to ${state.phase}`);
    render();
    checkEndgame();
    // Продолжаем ход ИИ после защиты
    setTimeout(aiLoopStep, 400);
  }, 1000); // 1 секунда на размышление
  
  return true;
}
function aiAdd(player){
  const total = state.table.pairs.length;
  if (total >= state.maxTableThisRound) return false;
  
  // ИИ может подкинуть карты только тех рангов, которые уже есть на столе
  // (как атакующие, так и защитные карты)
  const ranks = new Set(state.table.pairs.flatMap(p=>[p.attack.rank, p.defense?.rank].filter(Boolean)));
  const opts = player.hand.filter(c=>ranks.has(c.rank));
  
  console.log(`🤖 AI Add check: table ranks:`, Array.from(ranks));
  console.log(`🤖 AI Add check: available cards:`, opts.map(c => text(c)));
  
  if (!opts.length) return false;
  
  // Добавляем задержку для "тактического размышления" ИИ
  setTimeout(() => {
    const c = opts.sort((a,b)=>RANK_VALUE[a.rank]-RANK_VALUE[b.rank])[0];
    state.table.pairs.push({ attack:c });
    player.hand = player.hand.filter(x=>x.id!==c.id);
    // Play sound effect for AI placing cards
    soundManager.playCardOnTable();
    state.phase = "defending";
    render();
    checkEndgame();
    // Продолжаем ход ИИ после подкидывания
    setTimeout(aiLoopStep, 400);
  }, 900); // 0.9 секунды на тактическое решение
  
  return true;
}
function aiLoopStep(){
  console.log('🤖 aiLoopStep called');
  const attacker = state.players[state.attackerIndex];
  const defender = state.players[state.defenderIndex];
  let moved = false;
  let delay = 350; // Базовая задержка
  
  console.log(`🤖 AI Loop: phase=${state.phase}, attacker=${attacker.name} (human:${attacker.isHuman}), defender=${defender.name} (human:${defender.isHuman})`);
  console.log(`🤖 AI Loop: table pairs=${state.table.pairs.length}, maxTable=${state.maxTableThisRound}`);
  console.log(`🤖 AI Loop: all pairs covered=${state.table.pairs.every(p=>p.defense)}`);

  // Проверяем, нужно ли переключить фазу после действий игрока
  if (state.phase === "defending" && state.table.pairs.every(p => p.defense)) {
    state.phase = "adding";
    console.log(`🤖 AI Loop: all cards defended, switching to adding phase`);
    setTimeout(aiLoopStep, 100);
    return;
  }
  
  // Если есть незащищенные карты и фаза "defending", принудительно вызываем защиту
  if (state.phase === "defending" && !state.table.pairs.every(p => p.defense)) {
    console.log(`🤖 AI Loop: there are undefended cards, forcing defense`);
    // Принудительно вызываем защиту AI
    if (!defender.isHuman) {
      console.log(`🤖 AI Loop: forcing AI defense`);
      const ok = aiDefense(defender);
      if (ok) {
        return; // aiDefense сам вызовет aiLoopStep
      } else {
        console.log(`🤖 AI Loop: AI cannot defend, taking cards`);
        defenderTakes();
        moved = true;
        delay = 1000;
      }
    }
  }

  if (state.phase === "attacking" && !attacker.isHuman){
    const attacked = aiAttack(attacker);
    if (attacked) {
      // aiAttack уже содержит setTimeout, поэтому не нужно вызывать aiLoopStep сразу
      return; // Выходим из функции, aiAttack сам вызовет render() и aiLoopStep
    } else {
      console.log(`🤖 AI Attack failed, checking if game should end...`);
      // Если ИИ не может атаковать, проверяем конец игры
      checkEndgame();
      return; // Выходим из функции
    }
  } else if (state.phase === "defending" && !defender.isHuman){
    console.log(`🤖 AI Loop: trying to defend with ${defender.name}`);
    const ok = aiDefense(defender);
    console.log(`🤖 AI Loop: aiDefense returned ${ok}`);
    if (!ok){ 
      console.log(`🤖 AI Loop: defense failed, taking cards`);
      defenderTakes(); 
      moved = true; 
      delay = 1000; // Задержка для взятия карт
    } else {
      console.log(`🤖 AI Loop: defense successful, aiDefense will handle continuation`);
      // aiDefense уже содержит setTimeout, поэтому не нужно вызывать aiLoopStep сразу
      return; // Выходим из функции, aiDefense сам вызовет render() и aiLoopStep
    }
  } else if (state.phase === "adding"){
    // In adding phase, the actor is the attacker
    if (!attacker.isHuman){
      const added = aiAdd(attacker);
      if (added) {
        // aiAdd уже содержит setTimeout, поэтому не нужно вызывать aiLoopStep сразу
        return; // Выходим из функции, aiAdd сам вызовет render() и aiLoopStep
      } else {
        // ИИ не может подкинуть - говорит "достаточно"
        setTimeout(() => {
          // defenderEnough() сама управляет анимацией и продолжением игры
          defenderEnough();
        }, 800); // Задержка для "размышления" ИИ
        return; // Выходим, так как setTimeout уже запланирован
      }
    } else {
      // Human attacker: do not auto-end. User must press Enough manually.
      // No move here; wait for user action (Add or Enough)
    }
  }

  console.log(`🤖 AI Loop: moved=${moved}, delay=${delay}`);
  
  if (moved){
    // render() теперь вызывается в самих функциях ИИ с задержкой
    console.log(`🤖 AI Loop: scheduling next aiLoopStep in ${delay}ms`);
    checkEndgame();
    setTimeout(aiLoopStep, delay);
  } else {
    console.log(`🤖 AI Loop: no move made, ending aiLoopStep`);
  }
}

// ========================================
// 🎯 EVENT HANDLING & USER INTERACTION
// ========================================

function bindEvents(){
  el.btnAdd.addEventListener("click", ()=>{
    const me = state.players[0];
    if (state.phase === "attacking" && state.attackerIndex === 0){
      if (!commitAttackFromPlayer(me, ui.selected)) return;
    } else if (state.phase === "defending" && state.defenderIndex === 0){
      const [only] = Array.from(ui.selected);
      if (!commitDefenseFromPlayer(me, only)) return;
    } else if (state.phase === "adding" && state.attackerIndex === 0){
      if (!commitAddFromPlayer(me, ui.selected)) return;
    }
    render(); 
    setTimeout(aiLoopStep, 250);
  });

  el.btnTake.addEventListener("click", ()=>{
    if (state.defenderIndex !== 0) return;
    defenderTakes(); render(); setTimeout(aiLoopStep, 250);
  });

  el.btnEnough.addEventListener("click", ()=>{
    console.log('🎬 Enough button clicked!');
    console.log('🎬 Button disabled:', el.btnEnough.disabled);
    console.log('🎬 Current phase:', state.phase);
    console.log('🎬 Table pairs:', state.table.pairs);
    console.log('🎬 All pairs have defense:', state.table.pairs.every(p=>p.defense));
    
    // Добавляем визуальную обратную связь
    el.btnEnough.style.background = 'red';
    el.btnEnough.style.transform = 'scale(0.9)';
    setTimeout(() => {
      el.btnEnough.style.background = '';
      el.btnEnough.style.transform = '';
    }, 200);
    
    // Проверяем, что кнопка не отключена
    if (el.btnEnough.disabled) {
      console.log('❌ Button is disabled, not proceeding');
      return;
    }
    
    // defenderEnough() сама управляет анимацией и продолжением игры
    defenderEnough();
  });

  // Обработчики для статистики
  if (el.statsButton){
    el.statsButton.addEventListener('click', showStatsModal);
  }
  
  // Обработчики для модального окна статистики
  const statsModalClose = document.getElementById('statsModalClose');
  const statsModalOk = document.getElementById('statsModalOk');
  
  if (statsModalClose) {
    statsModalClose.addEventListener('click', hideStatsModal);
  }
  
  if (statsModalOk) {
    statsModalOk.addEventListener('click', hideStatsModal);
  }
  
  // Закрытие модального окна по клику вне его
  const statsModal = document.getElementById('statsModal');
  if (statsModal) {
    statsModal.addEventListener('click', (e) => {
      if (e.target === statsModal) {
        hideStatsModal();
      }
    });
  }

  // Settings event handlers
  if (el.settingsButton){
    el.settingsButton.addEventListener('click', openSettings);
  }

  if (el.settingsClose){
    el.settingsClose.addEventListener('click', closeSettings);
  }

  // Sound effects button event handler
  const soundEffectsButton = document.getElementById('soundEffectsButton');
  if (soundEffectsButton) {
    soundEffectsButton.addEventListener('click', () => {
      soundManager.toggleSoundEffects();
    });
  }

  // Background music button event handler
  const backgroundMusicButton = document.getElementById('backgroundMusicButton');
  if (backgroundMusicButton) {
    backgroundMusicButton.addEventListener('click', () => {
      soundManager.toggleBackgroundMusic();
    });
  }

  if (el.settingsOverlay){
    el.settingsOverlay.addEventListener('click', closeSettings);
  }

  // Theme selection handlers
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const themeName = option.dataset.theme;
      setTheme(themeName);
    });
  });

  // Card set selection handlers
  const cardSetOptions = document.querySelectorAll('.card-set-option');
  cardSetOptions.forEach(option => {
    option.addEventListener('click', () => {
      const cardSetName = option.dataset.cardSet;
      setCardSet(cardSetName);
    });
  });

  // Profile event handlers
  if (el.profileButton){
    console.log('🔍 Profile button found, adding event listener');
    console.log('🔍 Profile button element:', el.profileButton);
    console.log('🔍 Profile button classList:', el.profileButton.classList);
    console.log('🔍 Profile button id:', el.profileButton.id);
    
    // Make sure we're attaching to the right element
    el.profileButton.addEventListener('click', function(e) {
      console.log('🔍 ======== PROFILE BUTTON CLICKED! ========');
      console.log('🔍 Event:', e);
      console.log('🔍 Target:', e.target);
      console.log('🔍 CurrentTarget:', e.currentTarget);
      console.log('🔍 About to call openProfile()...');
      openProfile();
      console.log('🔍 openProfile() called!');
    });
    
    console.log('🔍 Event listener added successfully!');
  } else {
    console.log('❌ Profile button NOT FOUND!');
    console.log('🔍 el.profileButton:', el.profileButton);
  }
    
  // Debug button event listeners
  const debugBtn = document.getElementById('profileDebugBtn');
  const debugBtnMain = document.getElementById('debugButton');
  const debugModalClose = document.getElementById('debugModalClose');
  const debugModalOk = document.getElementById('debugModalOk');
  
  if (debugBtn) {
    debugBtn.addEventListener('click', showDebugModal);
  }
  if (debugBtnMain) {
    debugBtnMain.addEventListener('click', showDebugModal);
  }
  if (debugModalClose) {
    debugModalClose.addEventListener('click', hideDebugModal);
  }
  if (debugModalOk) {
    debugModalOk.addEventListener('click', hideDebugModal);
  }
  
  // Test parsing button
  const testParsingBtn = document.getElementById('testParsingBtn');
  if (testParsingBtn) {
    testParsingBtn.addEventListener('click', () => {
      const user = testTelegramDataParsing();
      if (user) {
        alert('✅ Данные пользователя найдены!\n\n' +
              'ID: ' + user.id + '\n' +
              'Имя: ' + user.first_name + ' ' + user.last_name + '\n' +
              'Username: @' + user.username);
      } else {
        alert('❌ Данные пользователя не найдены');
      }
    });
  }
  
  // Version button event listeners
  const versionBtn = document.getElementById('versionButton');
  const versionModalClose = document.getElementById('versionModalClose');
  const versionModalOk = document.getElementById('versionModalOk');
  
  if (versionBtn) {
    versionBtn.addEventListener('click', showVersionModal);
  }
  if (versionModalClose) {
    versionModalClose.addEventListener('click', hideVersionModal);
  }
  if (versionModalOk) {
    versionModalOk.addEventListener('click', hideVersionModal);
  }

  if (el.profileClose){
    el.profileClose.addEventListener('click', closeProfile);
  }

  if (el.profileOverlay){
    el.profileOverlay.addEventListener('click', closeProfile);
  }

  if (el.avatarChangeBtn){
    el.avatarChangeBtn.addEventListener('click', changeAvatar);
  }

  if (el.profileSaveBtn){
    el.profileSaveBtn.addEventListener('click', saveProfile);
  }

  if (el.profileCancelBtn){
    el.profileCancelBtn.addEventListener('click', closeProfile);
  }
}

// ========================================
// 📱 TELEGRAM WEBAPP INTEGRATION
// ========================================

function initTelegramWebApp() {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // Добавляем класс для Telegram MiniApp
    document.body.classList.add('telegram-miniapp');
    
    // Расширяем на весь экран
    tg.expand();
    
    // Отключаем скролл
    tg.enableClosingConfirmation();
    
    // Получаем данные пользователя
    const user = tg.initDataUnsafe?.user;
    if (user) {
      console.log('👤 Telegram User:', user);
      state.telegramUser = user;
    }
    
    // Настраиваем тему
    tg.setHeaderColor('#2B1B17'); // Цвет темы Tavern
    
    return tg;
  }
  return null;
}

function getTelegramUserId() {
  const tg = window.Telegram?.WebApp;
  if (tg?.initDataUnsafe?.user?.id) {
    return tg.initDataUnsafe.user.id.toString();
  }
  return null;
}

function setupTelegramButtons() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  
  // Основная кнопка "Новая игра"
  tg.MainButton.setText('🎮 Новая игра');
  tg.MainButton.onClick(() => {
    restartGame();
    tg.MainButton.hide();
  });
  
  // Кнопка "Поделиться результатом"
  tg.MainButton.setText('📤 Поделиться');
  tg.MainButton.onClick(() => {
    shareGameResult();
  });
  
  // Кнопка "Статистика"
  tg.MainButton.setText('📊 Статистика');
  tg.MainButton.onClick(() => {
    showStatsModal();
  });
}

function addTelegramHaptics() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  
  // Вибрация при выигрыше
  function onGameWin() {
    tg.HapticFeedback.notificationOccurred('success');
  }
  
  // Вибрация при проигрыше
  function onGameLose() {
    tg.HapticFeedback.notificationOccurred('error');
  }
  
  // Вибрация при нажатии кнопок
  function onButtonClick() {
    tg.HapticFeedback.impactOccurred('light');
  }
  
  // Интегрируем в существующие функции
  // В showEndgameModal добавить:
  if (title === "Вы выиграли!") {
    onGameWin();
  } else {
    onGameLose();
  }
}

function shareGameResult() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  
  const stats = state.playerStats;
  const message = `🎮 Игра "Дурак" завершена!
  
📊 Моя статистика:
• Всего игр: ${stats.totalGames}
• Побед: ${stats.wins}
• Поражений: ${stats.losses}
• Процент побед: ${Math.round((stats.wins / stats.totalGames) * 100)}%
• Текущая серия: ${stats.currentStreak}
• Лучшая серия: ${stats.bestStreak}

🎯 Сыграй и ты!`;

  tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`);
}

function adaptToTelegramTheme() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  
  // Получаем цветовую схему Telegram
  const colorScheme = tg.colorScheme;
  const themeParams = tg.themeParams;
  
  if (colorScheme === 'dark') {
    // Применяем темную тему
    document.body.classList.add('telegram-dark');
  }
  
  // Используем цвета Telegram
  if (themeParams.bg_color) {
    document.documentElement.style.setProperty('--telegram-bg', themeParams.bg_color);
  }
  if (themeParams.text_color) {
    document.documentElement.style.setProperty('--telegram-text', themeParams.text_color);
  }
}

// ========================================
// 🚀 RESOURCE PRELOADING SYSTEM
// ========================================

// Глобальный кэш для предзагруженных ресурсов
const RESOURCE_CACHE = {
  images: new Map(),
  audio: new Map()
};

// Функция для получения кэшированного изображения
function getCachedImage(src) {
  if (RESOURCE_CACHE.images.has(src)) {
    return RESOURCE_CACHE.images.get(src);
  }
  return null;
}

// Функция для получения кэшированного аудио
function getCachedAudio(src) {
  if (RESOURCE_CACHE.audio.has(src)) {
    return RESOURCE_CACHE.audio.get(src);
  }
  return null;
}

// Функция предзагрузки карт для конкретной темы
async function preloadThemeCards(themeName) {
  console.log(`🎨 Preloading cards for theme: ${themeName}`);
  
  // Используем оптимизированную функцию для получения карт
  const cardPaths = getCurrentThemeCards();
  
  console.log(`📦 Preloading ${cardPaths.length} cards for ${themeName}`);
  console.log(`🎯 Card format: ${supportsWebP ? 'WebP' : 'SVG'}`);
  
  // Предзагружаем карты в фоне
  const preloadPromises = cardPaths.map(cardPath => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const basePath = cardPath.split('?')[0];
        RESOURCE_CACHE.images.set(basePath, img);
        console.log(`⚡ Cached theme card: ${basePath}`);
        resolve();
      };
      img.onerror = () => {
        console.warn(`⚠️ Failed to preload: ${cardPath}`);
        resolve();
      };
      img.src = cardPath;
    });
  });
  
  // Ждем завершения предзагрузки
  await Promise.all(preloadPromises);
  console.log(`✅ Theme cards preloaded: ${themeName}`);
}

// Функция для получения списка ресурсов для предзагрузки
function getResourceList() {
  return {
    // Карты только для текущей темы (оптимизировано)
    cards: getCurrentThemeCards(),
  
  // Иконки для всех тем
  icons: [
    // Casino icons
    './themes/casino/icons/attack.svg',
    './themes/casino/icons/take.svg', 
    './themes/casino/icons/enough.svg',
    './themes/casino/icons/options.svg',
    './themes/casino/icons/person/base.jpg',
    './themes/casino/icons/person/happy.jpg',
    './themes/casino/icons/person/sad.jpg',
    './themes/casino/icons/person/thinks.jpg',
    // Tavern icons
    './themes/tavern/icons/attack.svg',
    './themes/tavern/icons/take.svg',
    './themes/tavern/icons/enough.svg', 
    './themes/tavern/icons/options.svg',
    './themes/tavern/icons/person/base.jpg',
    './themes/tavern/icons/person/happy.jpg',
    './themes/tavern/icons/person/sad.jpg',
    './themes/tavern/icons/person/thinks.jpg',
    './themes/tavern/icons/buttons/attack.jpg',
    './themes/tavern/icons/buttons/take.jpg',
    './themes/tavern/icons/buttons/enough.jpg',
    // Underground icons
    './themes/underground/icons/attack.svg',
    './themes/underground/icons/take.svg',
    './themes/underground/icons/enough.svg',
    './themes/underground/icons/options.svg',
    './themes/underground/icons/person/base.jpg',
    './themes/underground/icons/person/happy.jpg',
    './themes/underground/icons/person/sad.jpg',
    './themes/underground/icons/person/thinks.jpg'
  ],
  
  // Текстуры
  textures: [
    './themes/casino/textures/table.jpg',
    './themes/casino/textures/wall.jpg',
    './themes/tavern/textures/table.jpg',
    './themes/tavern/textures/wall.jpg',
    './themes/tavern/textures/opponent_panel.jpg',
    './themes/underground/textures/table.jpg',
    './themes/underground/textures/wall.jpg',
    './themes/underground/textures/opponent_panel.jpg'
  ],
  
  // Звуки
  sounds: [
    './sounds/casino/card_on_table.mp3',
    './sounds/casino/card_disappear.mp3',
    './sounds/casino/background_music.mp3',
    './sounds/tavern/card_on_table.mp3',
    './sounds/tavern/card_disappear.mp3',
    './sounds/tavern/background_music.mp3',
    './sounds/underground/card_on_table.mp3',
    './sounds/underground/card_disappear.mp3',
    './sounds/underground/background_music.mp3'
  ],
  
  // Логотипы
  logos: [
    './logo/durak.png',
    './themes/casino/icons/logo/durak.png',
    './themes/tavern/icons/logo/durak.png',
    './themes/underground/icons/logo/durak.png'
  ]
  };
}

// Функция для получения имени файла карты по индексу
function getCardFileName(index) {
  const ranks = ['6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
  const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
  const rank = ranks[Math.floor(index / 4)];
  const suit = suits[index % 4];
  return `${rank}_of_${suit}`;
}

// Функция для получения карт только текущей темы (оптимизация)
function getCurrentThemeCards() {
  const currentTheme = state.theme || 'casino';
  console.log(`🎨 getCurrentThemeCards: theme=${currentTheme}, supportsWebP=${supportsWebP}`);
  
  // Если WebP поддерживается, загружаем WebP карты
  if (supportsWebP) {
    const webpCards = Array.from({length: 36}, (_, i) => 
      `./themes/${currentTheme}/cards/WEBP_cards/${getCardFileName(i)}.webp`
    );
    console.log(`🖼️ WebP cards generated:`, webpCards.slice(0, 3));
    return webpCards;
  }
  
  // Иначе загружаем SVG карты
  const svgCards = Array.from({length: 36}, (_, i) => 
    `./themes/${currentTheme}/cards/SVG-cards-1.3/${getCardFileName(i)}.svg`
  );
  console.log(`🖼️ SVG cards generated:`, svgCards.slice(0, 3));
  return svgCards;
}

// Функция предзагрузки ресурсов
async function preloadResources() {
  console.log('🚀 Starting resource preloading...');
  
  const progressFill = document.getElementById('loadingProgressFill');
  const progressText = document.getElementById('loadingProgressText');
  
  let totalResources = 0;
  let loadedResources = 0;
  
  // Получаем список ресурсов
  const RESOURCE_LIST = getResourceList();
  
  // Подсчитываем общее количество ресурсов
  Object.values(RESOURCE_LIST).forEach(category => {
    totalResources += category.length;
  });
  
  console.log(`📊 Total resources to load: ${totalResources}`);
  
  // Принудительно показываем экран загрузки
  const loadingScreen = document.getElementById('loadingScreen');
  const app = document.getElementById('app');
  
  if (loadingScreen) {
    loadingScreen.style.display = 'flex';
    loadingScreen.classList.remove('hidden');
  }
  if (app) {
    app.style.display = 'none';
  }
  
  // Функция обновления прогресса
  function updateProgress(resourceName) {
    loadedResources++;
    const progress = Math.round((loadedResources / totalResources) * 100);
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `Загрузка ${resourceName}... (${loadedResources}/${totalResources})`;
    console.log(`📦 Loaded: ${resourceName} (${progress}%)`);
  }
  
  // Функция предзагрузки изображения
  function preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Сохраняем в кэш по базовому пути (без timestamp)
        const basePath = src.split('?')[0];
        RESOURCE_CACHE.images.set(basePath, img);
        console.log(`📦 Cached image: ${basePath}`);
        resolve(src);
      };
      img.onerror = () => {
        console.warn(`⚠️ Failed to load image: ${src}`);
        resolve(src); // Продолжаем даже если изображение не загрузилось
      };
      // Добавляем timestamp для принудительного обновления кэша
      const timestamp = Date.now();
      const separator = src.includes('?') ? '&' : '?';
      img.src = `${src}${separator}v=${timestamp}`;
    });
  }
  
  // Функция предзагрузки аудио
  function preloadAudio(src) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        // Сохраняем в кэш
        RESOURCE_CACHE.audio.set(src, audio);
        console.log(`📦 Cached audio: ${src}`);
        resolve(src);
      };
      audio.onerror = () => {
        console.warn(`⚠️ Failed to load audio: ${src}`);
        resolve(src); // Продолжаем даже если аудио не загрузилось
      };
      // Добавляем timestamp для принудительного обновления кэша
      const timestamp = Date.now();
      const separator = src.includes('?') ? '&' : '?';
      audio.src = `${src}${separator}v=${timestamp}`;
    });
  }
  
  try {
    // Загружаем карты
    progressText.textContent = 'Загрузка карт...';
    for (const cardPath of RESOURCE_LIST.cards) {
      await preloadImage(cardPath);
      updateProgress('карты');
    }
    
    // Загружаем иконки
    progressText.textContent = 'Загрузка иконок...';
    for (const iconPath of RESOURCE_LIST.icons) {
      await preloadImage(iconPath);
      updateProgress('иконки');
    }
    
    // Загружаем текстуры
    progressText.textContent = 'Загрузка текстур...';
    for (const texturePath of RESOURCE_LIST.textures) {
      await preloadImage(texturePath);
      updateProgress('текстуры');
    }
    
    // Загружаем логотипы
    progressText.textContent = 'Загрузка логотипов...';
    for (const logoPath of RESOURCE_LIST.logos) {
      await preloadImage(logoPath);
      updateProgress('логотипы');
    }
    
    // Загружаем звуки (не блокируем загрузку)
    progressText.textContent = 'Загрузка звуков...';
    const audioPromises = RESOURCE_LIST.sounds.map(soundPath => 
      preloadAudio(soundPath).then(() => updateProgress('звуки'))
    );
    
    // Ждем завершения загрузки звуков
    await Promise.all(audioPromises);
    
    // Финальное обновление
    progressText.textContent = 'Загрузка завершена!';
    console.log('✅ All resources preloaded successfully!');
    
    return true;
  } catch (error) {
    console.error('❌ Error during resource preloading:', error);
    progressText.textContent = 'Ошибка загрузки ресурсов';
    return false;
  }
}

// Функция скрытия экрана загрузки
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  const app = document.getElementById('app');
  
  loadingScreen.classList.add('hidden');
  app.style.display = 'block';
  
  // Удаляем экран загрузки из DOM через некоторое время
  setTimeout(() => {
    loadingScreen.remove();
  }, 500);
}

// ========================================
// 🚀 MAIN APPLICATION ENTRY POINT
// ========================================

// Новая функция инициализации игры (вызывается после предзагрузки)
function initializeGame() {
  console.log('🎮 Initializing game after preloading...');
  
  // Initialize Telegram WebApp
  const tg = initTelegramWebApp();
  if (tg) {
    console.log('📱 Telegram WebApp инициализирован');
    setupTelegramButtons();
    adaptToTelegramTheme();
  }
  
  // Загружаем статистику игрока
  loadPlayerStats();
  // load persisted theme
  try { 
    const savedTheme = localStorage.getItem('theme'); 
    const validThemes = ['casino', 'underground', 'tavern'];
    if (savedTheme && validThemes.includes(savedTheme)) {
      state.theme = savedTheme;
    } else {
      state.theme = 'casino'; // default theme
    }
  } catch(e){
    state.theme = 'casino'; // default theme
  }
  // load persisted card set
  try { const savedCardSet = localStorage.getItem('cardSet'); if (savedCardSet) state.cardSet = savedCardSet; } catch(e){}
  // load persisted user profile
  try { 
    const savedProfile = localStorage.getItem('userProfile'); 
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      state.userProfile.nickname = profile.nickname || "Игрок";
      state.userProfile.avatar = profile.avatar || "👤";
    }
  } catch(e){}
  
  console.log('👥 Initializing players...');
  initPlayers(1); // 1v1
  console.log('🎲 Dealing initial cards...');
  dealInitial();
  console.log('🔗 Binding events...');
  bindEvents();
  
  // Apply saved theme
  console.log('🎨 Applying theme:', state.theme);
  setTheme(state.theme);
  
  // Apply saved card set
  console.log('🃏 Applying card set:', state.cardSet);
  setCardSet(state.cardSet);
  
  // Start background music after user interaction
  // Note: Browsers require user interaction before playing audio
  document.addEventListener('click', () => {
    if (!soundManager.backgroundMusicMuted && (!soundManager.backgroundMusic.played || soundManager.backgroundMusic.played.length === 0)) {
      console.log('Starting background music after user interaction...');
      soundManager.backgroundMusic.play().catch(e => console.log('Background music play failed:', e));
    }
  }, { once: true });
  
  render();
  
  // Initialize profile button with avatar
  if (el.profileButton) {
    el.profileButton.textContent = state.userProfile.avatar;
  }
}

// Главная функция с предзагрузкой
async function main(){
  console.log('🚀 main() called with preloading');
  
  // Принудительно показываем экран загрузки
  const loadingScreen = document.getElementById('loadingScreen');
  const app = document.getElementById('app');
  
  if (loadingScreen) {
    loadingScreen.style.display = 'flex';
    loadingScreen.classList.remove('hidden');
    console.log('📱 Loading screen shown');
  }
  if (app) {
    app.style.display = 'none';
    console.log('🎮 Game hidden');
  }
  
  // Инициализируем DOM ссылки
  initDomRefs();
  console.log('🔗 DOM refs initialized');
  
  try {
    // Предзагружаем все ресурсы
    console.log('📦 Starting resource preloading...');
    const preloadSuccess = await preloadResources();
    
    if (preloadSuccess) {
      console.log('✅ Preloading completed successfully');
      
      // Небольшая задержка для показа финального состояния
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Скрываем экран загрузки и показываем игру
      hideLoadingScreen();
      
      // Инициализируем игру
      initializeGame();
      
      console.log('🎮 Game initialized successfully!');
    } else {
      console.warn('⚠️ Preloading had issues, but continuing...');
      hideLoadingScreen();
      initializeGame();
    }
  } catch (error) {
    console.error('❌ Error during preloading:', error);
    // В случае ошибки все равно показываем игру
    hideLoadingScreen();
    initializeGame();
  }
  
  setTimeout(aiLoopStep, 800);
  
  // Initialize Telegram integration
  if (isTelegram) {
    initializeTelegramIntegration();
  }
  
  // CRITICAL DEBUG: Test if openProfile is accessible
  console.log('🔍 ======== TESTING openProfile ACCESSIBILITY ========');
  console.log('🔍 typeof openProfile:', typeof openProfile);
  console.log('🔍 typeof window.manualOpenProfile:', typeof window.manualOpenProfile);
  console.log('🔍 window.PROFILE_OPENED_COUNT:', window.PROFILE_OPENED_COUNT || 0);
  console.log('🔍 el.profileButton:', el.profileButton);
  
  // Make openProfile globally accessible for testing
  window.testOpenProfile = function() {
    console.log('🔍 TEST: Calling openProfile manually...');
    openProfile();
  };
  console.log('🔍 openProfile test function available as window.testOpenProfile()');
  console.log('🔍 ========================================');
  
  // AUTOMATIC TEST: Call openProfile after 3 seconds to verify it works
  setTimeout(function() {
    console.log('🔍 ======== AUTOMATIC TEST: Calling openProfile() ========');
    try {
      openProfile();
      console.log('✅ openProfile() called successfully!');
      
      // Close profile after 2 seconds
      setTimeout(function() {
        console.log('🔍 Closing profile automatically...');
        closeProfile();
      }, 2000);
    } catch (error) {
      console.error('❌ Error calling openProfile():', error);
    }
  }, 3000);
}

// ========================================
// 📱 TELEGRAM INTEGRATION FUNCTIONS
// ========================================

function initializeTelegramIntegration() {
  if (!tg) return;
  
  // Get user info from Telegram
  const user = tg.initDataUnsafe?.user;
  if (user) {
    // Set user profile from Telegram
    state.userProfile.nickname = user.first_name || "Игрок";
    if (user.last_name) {
      state.userProfile.nickname += ` ${user.last_name}`;
    }
    
    // Update profile button
    if (el.profileButton) {
      el.profileButton.textContent = "👤";
    }
    
    // Update user avatar in profile modal
    if (el.userAvatar) {
      el.userAvatar.textContent = "👤";
    }
    if (el.userNickname) {
      el.userNickname.value = state.userProfile.nickname;
    }
    
    console.log('👤 Telegram user loaded:', state.userProfile.nickname);
  }
  
  
  // Handle game events
  setupTelegramGameEvents();
}

function setupTelegramGameEvents() {
  if (!tg) return;
  
  // Send game start event
  tg.sendData(JSON.stringify({
    type: 'game_start',
    timestamp: Date.now()
  }));
  
  // Handle game end
  const originalShowGameEnd = showGameEnd;
  showGameEnd = function(winner) {
    originalShowGameEnd(winner);
    
    // Send game end event to Telegram
    tg.sendData(JSON.stringify({
      type: 'game_end',
      winner: winner,
      timestamp: Date.now()
    }));
    
    // Show Telegram haptic feedback
    tg.HapticFeedback.impactOccurred('medium');
  };
}

// Telegram-specific functions
function showTelegramAlert(message) {
  if (tg && tg.showAlert) {
    tg.showAlert(message);
  } else {
    alert(message);
  }
}

function showTelegramConfirm(message, callback) {
  if (tg && tg.showConfirm) {
    tg.showConfirm(message, callback);
  } else {
    if (confirm(message)) {
      callback(true);
    }
  }
}

function sendTelegramHaptic(type = 'light') {
  if (tg && tg.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(type);
  }
}

window.addEventListener("load", main);
