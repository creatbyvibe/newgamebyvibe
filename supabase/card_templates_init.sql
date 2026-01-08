-- Initialize Card Game Templates
-- Run this in Supabase SQL Editor after creating game_templates table and card category

-- Template 1: Card Battle (Intermediate)
INSERT INTO game_templates (
  category_id,
  name,
  name_en,
  description,
  description_en,
  difficulty,
  example_code,
  config,
  is_active,
  display_order
) 
SELECT 
  gc.id,
  '卡牌对战',
  'Card Battle',
  '经典的卡牌对战游戏，玩家通过出牌攻击对手，先击败对手者获胜',
  'Classic card battle game where players attack opponents by playing cards, first to defeat opponent wins',
  'intermediate',
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: Arial; color: white; }
    .game-container { max-width: 1200px; margin: 0 auto; }
    .player-area { background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin: 10px 0; }
    .hand { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 10px; }
    .card { width: 120px; height: 160px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 10px; cursor: pointer; position: relative; transition: transform 0.3s; border: 2px solid rgba(255,255,255,0.3); }
    .card:hover { transform: translateY(-10px) scale(1.05); }
    .card.played { opacity: 0.5; cursor: not-allowed; }
    .card-front { padding: 10px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
    .card-name { font-weight: bold; font-size: 14px; }
    .card-cost { position: absolute; top: 5px; right: 5px; background: gold; color: #000; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .card-attack { position: absolute; bottom: 5px; left: 5px; background: #ff4444; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .card-health { position: absolute; bottom: 5px; right: 5px; background: #44ff44; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .board { display: flex; gap: 10px; flex-wrap: wrap; min-height: 180px; background: rgba(0,0,0,0.2); border-radius: 10px; padding: 10px; }
    .stats { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .health { font-size: 24px; font-weight: bold; }
    .mana { font-size: 20px; }
    button { padding: 10px 20px; font-size: 16px; border: none; border-radius: 5px; background: #4CAF50; color: white; cursor: pointer; margin: 5px; }
    button:hover { background: #45a049; }
    button:disabled { background: #666; cursor: not-allowed; }
    #gameOver { text-align: center; font-size: 32px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="game-container">
    <h1 style="text-align: center;">🃏 卡牌对战</h1>
    
    <div class="player-area">
      <div class="stats">
        <div class="health">❤️ 对手生命: <span id="opponentHealth">30</span></div>
        <div class="mana">💎 法力: <span id="mana">3</span>/<span id="maxMana">3</span></div>
        <div class="health">❤️ 你的生命: <span id="playerHealth">30</span></div>
      </div>
      <div class="board" id="opponentBoard"></div>
    </div>
    
    <div class="player-area">
      <div class="board" id="playerBoard"></div>
      <div class="hand" id="playerHand"></div>
      <button onclick="endTurn()">结束回合</button>
      <button onclick="startGame()">重新开始</button>
    </div>
    
    <div id="gameOver"></div>
  </div>

  <script>
    let playerHealth = 30;
    let opponentHealth = 30;
    let mana = 3;
    let maxMana = 3;
    let playerTurn = true;
    let playerHand = [];
    let playerBoard = [];
    let opponentBoard = [];
    let deck = [];
    let gameState = 'playing';

    const cardTypes = [
      { name: '小火球', cost: 2, attack: 3, health: 0, type: 'spell' },
      { name: '战士', cost: 3, attack: 2, health: 3, type: 'creature' },
      { name: '法师', cost: 4, attack: 3, health: 2, type: 'creature' },
      { name: '治疗', cost: 1, attack: 0, health: 0, type: 'heal', heal: 5 },
      { name: '盾牌', cost: 2, attack: 0, health: 0, type: 'shield', block: 3 },
      { name: '巨龙', cost: 6, attack: 5, health: 5, type: 'creature' }
    ];

    function startGame() {
      playerHealth = 30;
      opponentHealth = 30;
      mana = 3;
      maxMana = 3;
      playerTurn = true;
      playerHand = [];
      playerBoard = [];
      opponentBoard = [];
      gameState = 'playing';
      
      // Create deck
      deck = [];
      for (let i = 0; i < 3; i++) {
        cardTypes.forEach(card => deck.push({...card, id: Math.random()}));
      }
      shuffle(deck);
      
      // Draw initial hand
      for (let i = 0; i < 5; i++) {
        drawCard();
      }
      
      updateDisplay();
      document.getElementById('gameOver').textContent = '';
    }

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    function drawCard() {
      if (deck.length > 0 && playerHand.length < 10) {
        playerHand.push(deck.shift());
      }
    }

    function playCard(cardIndex) {
      if (!playerTurn || gameState !== 'playing') return;
      
      const card = playerHand[cardIndex];
      if (!card || mana < card.cost) return;
      
      mana -= card.cost;
      playerHand.splice(cardIndex, 1);
      
      if (card.type === 'spell') {
        opponentHealth -= card.attack;
        if (opponentHealth <= 0) {
          gameState = 'won';
          document.getElementById('gameOver').textContent = '🎉 你赢了！';
        }
      } else if (card.type === 'heal') {
        playerHealth = Math.min(30, playerHealth + card.heal);
      } else if (card.type === 'creature') {
        playerBoard.push({...card, currentHealth: card.health});
      }
      
      updateDisplay();
    }

    function endTurn() {
      if (!playerTurn || gameState !== 'playing') return;
      
      // Opponent creatures attack
      opponentBoard.forEach(creature => {
        if (playerBoard.length > 0) {
          const target = playerBoard[0];
          target.currentHealth -= creature.attack;
          creature.currentHealth -= target.attack || 0;
          
          if (target.currentHealth <= 0) {
            playerBoard.shift();
          }
          if (creature.currentHealth <= 0) {
            opponentBoard = opponentBoard.filter(c => c !== creature);
          }
        } else {
          playerHealth -= creature.attack;
          if (playerHealth <= 0) {
            gameState = 'lost';
            document.getElementById('gameOver').textContent = '💀 你输了！';
          }
        }
      });
      
      // Opponent plays a card
      if (opponentBoard.length < 5 && Math.random() > 0.5) {
        const randomCard = {...cardTypes[Math.floor(Math.random() * cardTypes.length)], id: Math.random()};
        if (randomCard.type === 'creature') {
          opponentBoard.push({...randomCard, currentHealth: randomCard.health});
        } else if (randomCard.type === 'spell') {
          playerHealth -= randomCard.attack;
          if (playerHealth <= 0) {
            gameState = 'lost';
            document.getElementById('gameOver').textContent = '💀 你输了！';
          }
        }
      }
      
      // Start player turn
      playerTurn = true;
      maxMana = Math.min(10, maxMana + 1);
      mana = maxMana;
      drawCard();
      
      updateDisplay();
    }

    function updateDisplay() {
      document.getElementById('playerHealth').textContent = playerHealth;
      document.getElementById('opponentHealth').textContent = opponentHealth;
      document.getElementById('mana').textContent = mana;
      document.getElementById('maxMana').textContent = maxMana;
      
      const handEl = document.getElementById('playerHand');
      handEl.innerHTML = '';
      playerHand.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card' + (mana < card.cost ? ' played' : '');
        cardEl.innerHTML = `
          <div class="card-front">
            <div class="card-cost">${card.cost}</div>
            <div class="card-name">${card.name}</div>
            ${card.attack > 0 ? `<div class="card-attack">${card.attack}</div>` : ''}
            ${card.health > 0 ? `<div class="card-health">${card.health}</div>` : ''}
          </div>
        `;
        if (mana >= card.cost) {
          cardEl.onclick = () => playCard(index);
        }
        handEl.appendChild(cardEl);
      });
      
      const playerBoardEl = document.getElementById('playerBoard');
      playerBoardEl.innerHTML = '';
      playerBoard.forEach(creature => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.innerHTML = `
          <div class="card-front">
            <div class="card-name">${creature.name}</div>
            <div class="card-attack">${creature.attack}</div>
            <div class="card-health">${creature.currentHealth}</div>
          </div>
        `;
        playerBoardEl.appendChild(cardEl);
      });
      
      const opponentBoardEl = document.getElementById('opponentBoard');
      opponentBoardEl.innerHTML = '';
      opponentBoard.forEach(creature => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.innerHTML = `
          <div class="card-front">
            <div class="card-name">${creature.name}</div>
            <div class="card-attack">${creature.attack}</div>
            <div class="card-health">${creature.currentHealth}</div>
          </div>
        `;
        opponentBoardEl.appendChild(cardEl);
      });
    }

    startGame();
  </script>
</body>
</html>',
  '{"theme": "fantasy", "features": ["turn-based", "card-battle", "mana-system"]}'::jsonb,
  true,
  1
FROM game_categories gc
WHERE gc.name = '卡牌游戏'
LIMIT 1;

-- Template 2: Card Collection (Beginner)
INSERT INTO game_templates (
  category_id,
  name,
  name_en,
  description,
  description_en,
  difficulty,
  example_code,
  config,
  is_active,
  display_order
)
SELECT 
  gc.id,
  '卡牌收集',
  'Card Collection',
  '简单的卡牌收集游戏，通过点击收集不同类型的卡牌，完成收集目标',
  'Simple card collection game, collect different types of cards by clicking, complete collection goals',
  'beginner',
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: Arial; color: white; text-align: center; }
    .container { max-width: 1000px; margin: 0 auto; }
    h1 { font-size: 36px; margin-bottom: 20px; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; font-size: 20px; }
    .card-pool { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
    .card { width: 150px; height: 200px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 15px; cursor: pointer; transition: all 0.3s; border: 3px solid rgba(255,255,255,0.3); position: relative; }
    .card:hover { transform: scale(1.1) rotate(5deg); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .card.collected { opacity: 0.6; border-color: gold; }
    .card-front { padding: 15px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
    .card-name { font-weight: bold; font-size: 18px; }
    .card-type { font-size: 14px; opacity: 0.8; }
    .card-rarity { position: absolute; top: 10px; right: 10px; font-size: 24px; }
    .collection { margin-top: 30px; }
    .collection-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; margin-top: 20px; }
    button { padding: 15px 30px; font-size: 18px; border: none; border-radius: 10px; background: #4CAF50; color: white; cursor: pointer; margin: 10px; }
    button:hover { background: #45a049; }
    #victory { font-size: 32px; color: gold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🃏 卡牌收集</h1>
    <div class="stats">
      <div>已收集: <span id="collected">0</span>/<span id="total">12</span></div>
      <div>金币: <span id="coins">100</span></div>
    </div>
    
    <h2>卡牌池</h2>
    <div class="card-pool" id="cardPool"></div>
    
    <button onclick="buyPack()">购买卡包 (50金币)</button>
    <button onclick="startGame()">重新开始</button>
    
    <div class="collection">
      <h2>我的收藏</h2>
      <div class="collection-grid" id="collection"></div>
    </div>
    
    <div id="victory"></div>
  </div>

  <script>
    let coins = 100;
    let collectedCards = new Set();
    let allCards = [];
    
    const cardData = [
      { name: '火焰', type: '元素', rarity: '⭐', cost: 10 },
      { name: '水波', type: '元素', rarity: '⭐', cost: 10 },
      { name: '雷电', type: '元素', rarity: '⭐', cost: 10 },
      { name: '大地', type: '元素', rarity: '⭐', cost: 10 },
      { name: '风暴', type: '元素', rarity: '⭐⭐', cost: 20 },
      { name: '冰霜', type: '元素', rarity: '⭐⭐', cost: 20 },
      { name: '光明', type: '神圣', rarity: '⭐⭐', cost: 20 },
      { name: '黑暗', type: '神圣', rarity: '⭐⭐', cost: 20 },
      { name: '龙息', type: '传说', rarity: '⭐⭐⭐', cost: 50 },
      { name: '凤凰', type: '传说', rarity: '⭐⭐⭐', cost: 50 },
      { name: '独角兽', type: '传说', rarity: '⭐⭐⭐', cost: 50 },
      { name: '神龙', type: '传说', rarity: '⭐⭐⭐', cost: 50 }
    ];

    function startGame() {
      coins = 100;
      collectedCards.clear();
      allCards = [];
      updateDisplay();
      document.getElementById('victory').textContent = '';
    }

    function buyPack() {
      if (coins < 50) {
        alert('金币不足！');
        return;
      }
      
      coins -= 50;
      const randomCard = {...cardData[Math.floor(Math.random() * cardData.length)], id: Math.random()};
      allCards.push(randomCard);
      collectedCards.add(randomCard.name);
      
      if (collectedCards.size >= cardData.length) {
        document.getElementById('victory').textContent = '🎉 恭喜！你收集了所有卡牌！';
      }
      
      updateDisplay();
    }

    function collectCard(card) {
      if (collectedCards.has(card.name)) return;
      
      if (coins >= card.cost) {
        coins -= card.cost;
        collectedCards.add(card.name);
        
        if (collectedCards.size >= cardData.length) {
          document.getElementById('victory').textContent = '🎉 恭喜！你收集了所有卡牌！';
        }
        
        updateDisplay();
      } else {
        alert('金币不足！');
      }
    }

    function updateDisplay() {
      document.getElementById('collected').textContent = collectedCards.size;
      document.getElementById('total').textContent = cardData.length;
      document.getElementById('coins').textContent = coins;
      
      const poolEl = document.getElementById('cardPool');
      poolEl.innerHTML = '';
      cardData.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card' + (collectedCards.has(card.name) ? ' collected' : '');
        cardEl.innerHTML = `
          <div class="card-front">
            <div class="card-rarity">${card.rarity}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-type">${card.type}</div>
            <div style="margin-top: auto; font-size: 12px;">💰 ${card.cost}</div>
          </div>
        `;
        if (!collectedCards.has(card.name)) {
          cardEl.onclick = () => collectCard(card);
        }
        poolEl.appendChild(cardEl);
      });
      
      const collectionEl = document.getElementById('collection');
      collectionEl.innerHTML = '';
      Array.from(collectedCards).forEach(cardName => {
        const card = cardData.find(c => c.name === cardName);
        if (card) {
          const cardEl = document.createElement('div');
          cardEl.className = 'card collected';
          cardEl.innerHTML = `
            <div class="card-front">
              <div class="card-rarity">${card.rarity}</div>
              <div class="card-name">${card.name}</div>
              <div class="card-type">${card.type}</div>
            </div>
          `;
          collectionEl.appendChild(cardEl);
        }
      });
    }

    startGame();
  </script>
</body>
</html>',
  '{"theme": "collection", "features": ["card-collection", "currency-system"]}'::jsonb,
  true,
  2
FROM game_categories gc
WHERE gc.name = '卡牌游戏'
LIMIT 1;

-- Template 3: Card Puzzle (Advanced)
INSERT INTO game_templates (
  category_id,
  name,
  name_en,
  description,
  description_en,
  difficulty,
  example_code,
  config,
  is_active,
  display_order
)
SELECT 
  gc.id,
  '卡牌解谜',
  'Card Puzzle',
  '策略性卡牌解谜游戏，通过合理组合卡牌解决谜题，考验玩家的逻辑思维',
  'Strategic card puzzle game, solve puzzles by combining cards rationally, tests player logic thinking',
  'advanced',
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 20px; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); font-family: Arial; color: white; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { text-align: center; font-size: 32px; }
    .puzzle-area { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .hand-area, .puzzle-area-section { background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; }
    .hand { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 10px; }
    .puzzle-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; }
    .card { width: 100px; height: 140px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; cursor: pointer; transition: all 0.3s; border: 2px solid rgba(255,255,255,0.3); position: relative; }
    .card:hover { transform: translateY(-5px) scale(1.05); }
    .card.placed { opacity: 0.7; cursor: default; }
    .card-front { padding: 8px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; font-size: 12px; }
    .card-value { font-size: 24px; font-weight: bold; text-align: center; }
    .slot { width: 100px; height: 140px; border: 2px dashed rgba(255,255,255,0.3); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .slot.filled { border-color: #4CAF50; }
    .slot.invalid { border-color: #f44336; }
    .controls { text-align: center; margin: 20px 0; }
    button { padding: 12px 24px; font-size: 16px; border: none; border-radius: 8px; background: #4CAF50; color: white; cursor: pointer; margin: 5px; }
    button:hover { background: #45a049; }
    #result { text-align: center; font-size: 24px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧩 卡牌解谜</h1>
    <div class="controls">
      <button onclick="checkSolution()">检查答案</button>
      <button onclick="resetPuzzle()">重置</button>
      <button onclick="startGame()">新谜题</button>
    </div>
    
    <div class="puzzle-area">
      <div class="puzzle-area-section">
        <h2>谜题区域</h2>
        <p>目标：使每行和每列的和都等于 10</p>
        <div class="puzzle-grid" id="puzzleGrid"></div>
      </div>
      
      <div class="hand-area">
        <h2>可用卡牌</h2>
        <div class="hand" id="hand"></div>
      </div>
    </div>
    
    <div id="result"></div>
  </div>

  <script>
    let puzzle = Array(4).fill(null).map(() => Array(4).fill(null));
    let hand = [];
    let selectedCard = null;
    let targetSum = 10;

    function startGame() {
      puzzle = Array(4).fill(null).map(() => Array(4).fill(null));
      hand = [];
      selectedCard = null;
      
      // Generate puzzle cards
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      for (let i = 0; i < 8; i++) {
        const value = values[Math.floor(Math.random() * values.length)];
        hand.push({ id: Math.random(), value: value });
      }
      
      updateDisplay();
      document.getElementById('result').textContent = '';
    }

    function selectCard(card) {
      selectedCard = card;
      updateDisplay();
    }

    function placeCard(row, col) {
      if (!selectedCard || puzzle[row][col] !== null) return;
      
      puzzle[row][col] = selectedCard;
      hand = hand.filter(c => c.id !== selectedCard.id);
      selectedCard = null;
      updateDisplay();
    }

    function checkSolution() {
      // Check rows
      for (let row = 0; row < 4; row++) {
        const sum = puzzle[row].reduce((acc, card) => acc + (card ? card.value : 0), 0);
        if (sum !== targetSum) {
          document.getElementById('result').textContent = `❌ 第 ${row + 1} 行的和是 ${sum}，不是 ${targetSum}`;
          return;
        }
      }
      
      // Check columns
      for (let col = 0; col < 4; col++) {
        const sum = puzzle.reduce((acc, row) => acc + (row[col] ? row[col].value : 0), 0);
        if (sum !== targetSum) {
          document.getElementById('result').textContent = `❌ 第 ${col + 1} 列的和是 ${sum}，不是 ${targetSum}`;
          return;
        }
      }
      
      document.getElementById('result').textContent = '🎉 恭喜！谜题解决成功！';
    }

    function resetPuzzle() {
      hand = [];
      puzzle.forEach(row => {
        row.forEach((card, colIndex) => {
          if (card) {
            hand.push(card);
            row[colIndex] = null;
          }
        });
      });
      selectedCard = null;
      updateDisplay();
    }

    function updateDisplay() {
      const gridEl = document.getElementById('puzzleGrid');
      gridEl.innerHTML = '';
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const slot = document.createElement('div');
          slot.className = 'slot' + (puzzle[row][col] ? ' filled' : '');
          if (puzzle[row][col]) {
            const card = puzzle[row][col];
            slot.innerHTML = `
              <div class="card placed">
                <div class="card-front">
                  <div class="card-value">${card.value}</div>
                </div>
              </div>
            `;
            slot.onclick = () => {
              hand.push(card);
              puzzle[row][col] = null;
              updateDisplay();
            };
          } else {
            slot.onclick = () => placeCard(row, col);
          }
          gridEl.appendChild(slot);
        }
      }
      
      const handEl = document.getElementById('hand');
      handEl.innerHTML = '';
      hand.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card' + (selectedCard?.id === card.id ? ' selected' : '');
        cardEl.style.border = selectedCard?.id === card.id ? '3px solid gold' : '';
        cardEl.innerHTML = `
          <div class="card-front">
            <div class="card-value">${card.value}</div>
          </div>
        `;
        cardEl.onclick = () => selectCard(card);
        handEl.appendChild(cardEl);
      });
    }

    startGame();
  </script>
</body>
</html>',
  '{"theme": "puzzle", "features": ["logic-puzzle", "grid-based", "strategy"]}'::jsonb,
  true,
  3
FROM game_categories gc
WHERE gc.name = '卡牌游戏'
LIMIT 1;
