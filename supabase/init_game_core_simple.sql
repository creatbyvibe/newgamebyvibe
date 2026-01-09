-- Game Core Database Initialization
-- Fixed version without comment issues

-- Step 1: Create tables
CREATE TABLE IF NOT EXISTS game_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  description_en TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  system_prompt TEXT,
  system_prompt_en TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES game_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT,
  description_en TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  example_code TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  usage_count INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable RLS
ALTER TABLE game_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active game categories" ON game_categories;
CREATE POLICY "Public can view active game categories"
  ON game_categories FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active game templates" ON game_templates;
CREATE POLICY "Public can view active game templates"
  ON game_templates FOR SELECT
  USING (is_active = true);

-- Step 3: Insert card game category
INSERT INTO game_categories (
  name, name_en, icon, description, description_en, 
  is_active, display_order, metadata, system_prompt, system_prompt_en
) VALUES (
  '卡牌游戏', 'Card Games', '🃏',
  '策略与运气的完美结合，通过收集、对战、解谜等方式体验卡牌游戏的魅力',
  'Perfect combination of strategy and luck, experience the charm of card games through collection, battle, and puzzle solving',
  true, 1,
  '{"rarity_system":{"common":"普通","rare":"稀有","epic":"史诗","legendary":"传说"},"card_types":["生物卡","法术卡","装备卡","陷阱卡","场地卡"],"mechanics":["抽卡","弃牌","手牌管理","资源管理","卡牌组合"]}'::jsonb,
  '你是一个专业的卡牌游戏开发AI。创建完整、可玩的HTML5卡牌游戏。',
  'You are a professional card game development AI. Create complete, playable HTML5 card games.'
) ON CONFLICT (name) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  description_en = EXCLUDED.description_en,
  metadata = EXCLUDED.metadata,
  system_prompt = EXCLUDED.system_prompt,
  system_prompt_en = EXCLUDED.system_prompt_en,
  updated_at = NOW();

-- Step 4: Insert card game template
DO $block$
DECLARE
  card_category_id UUID;
  html_code TEXT;
BEGIN
  SELECT id INTO card_category_id FROM game_categories WHERE name = '卡牌游戏' LIMIT 1;
  
  IF card_category_id IS NOT NULL THEN
    html_code := $html$
<!DOCTYPE html>
<html>
<head>
  <title>Card Battle</title>
  <style>
    body { margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: Arial; color: white; }
    .game-container { max-width: 1200px; margin: 0 auto; }
    .player-area { background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin: 10px 0; }
    .hand { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 10px; }
    .card { width: 120px; height: 160px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 10px; cursor: pointer; position: relative; transition: transform 0.3s; border: 2px solid rgba(255,255,255,0.3); }
    .card:hover { transform: translateY(-10px) scale(1.05); }
    .card-front { padding: 10px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
    .card-name { font-weight: bold; font-size: 14px; }
    .card-cost { position: absolute; top: 5px; right: 5px; background: gold; color: #000; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .card-attack { position: absolute; bottom: 5px; left: 5px; background: #ff4444; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .card-health { position: absolute; bottom: 5px; right: 5px; background: #44ff44; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .stats { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .health { font-size: 24px; font-weight: bold; }
    .mana { font-size: 20px; }
    button { padding: 10px 20px; font-size: 16px; border: none; border-radius: 5px; background: #4CAF50; color: white; cursor: pointer; margin: 5px; }
    button:hover { background: #45a049; }
  </style>
</head>
<body>
  <div class="game-container">
    <h1 style="text-align: center;">Card Battle</h1>
    <div class="player-area">
      <div class="stats">
        <div class="health">Life: <span id="playerHealth">30</span></div>
        <div class="mana">Mana: <span id="playerMana">3</span>/10</div>
      </div>
      <div class="hand" id="playerHand"></div>
    </div>
    <div class="player-area">
      <div class="stats">
        <div class="health">Opponent Life: <span id="opponentHealth">30</span></div>
      </div>
    </div>
    <button onclick="endTurn()">End Turn</button>
    <div id="gameOver"></div>
  </div>
  <script>
    let playerHealth = 30, opponentHealth = 30, playerMana = 3, maxMana = 3;
    let playerHand = [], deck = [];
    const cardTypes = [
      {name: "Fireball", cost: 2, attack: 3, type: "spell"},
      {name: "Heal", cost: 1, heal: 5, type: "heal"},
      {name: "Warrior", cost: 3, attack: 2, health: 3, type: "creature"}
    ];
    function initGame() {
      for (let i = 0; i < 3; i++) deck.push(...cardTypes);
      shuffle(deck);
      for (let i = 0; i < 5; i++) drawCard();
      updateDisplay();
    }
    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    function drawCard() {
      if (deck.length > 0 && playerHand.length < 10) {
        playerHand.push(deck.pop());
        updateDisplay();
      }
    }
    function playCard(index) {
      const card = playerHand[index];
      if (!card || playerMana < card.cost) return;
      playerMana -= card.cost;
      playerHand.splice(index, 1);
      if (card.type === "spell") {
        opponentHealth -= card.attack;
      } else if (card.type === "heal") {
        playerHealth = Math.min(30, playerHealth + card.heal);
      }
      updateDisplay();
      checkGameOver();
    }
    function endTurn() {
      maxMana = Math.min(10, maxMana + 1);
      playerMana = maxMana;
      drawCard();
      if (opponentHealth > 0) {
        const randomCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
        if (randomCard.type === "spell") {
          playerHealth -= randomCard.attack;
        }
      }
      updateDisplay();
      checkGameOver();
    }
    function updateDisplay() {
      document.getElementById("playerHealth").textContent = playerHealth;
      document.getElementById("opponentHealth").textContent = opponentHealth;
      document.getElementById("playerMana").textContent = playerMana;
      const handEl = document.getElementById("playerHand");
      handEl.innerHTML = "";
      playerHand.forEach((card, index) => {
        const cardEl = document.createElement("div");
        cardEl.className = "card" + (playerMana < card.cost ? " played" : "");
        cardEl.innerHTML = "<div class=\"card-front\"><div class=\"card-cost\">" + card.cost + "</div><div class=\"card-name\">" + card.name + "</div>" + (card.attack ? "<div class=\"card-attack\">" + card.attack + "</div>" : "") + (card.health ? "<div class=\"card-health\">" + card.health + "</div>" : "") + "</div>";
        if (playerMana >= card.cost) {
          cardEl.onclick = function() { playCard(index); };
        }
        handEl.appendChild(cardEl);
      });
    }
    function checkGameOver() {
      if (playerHealth <= 0) {
        document.getElementById("gameOver").innerHTML = "<h2>Game Over! You Lost!</h2><button onclick=\"location.reload()\">Play Again</button>";
      } else if (opponentHealth <= 0) {
        document.getElementById("gameOver").innerHTML = "<h2>Congratulations! You Won!</h2><button onclick=\"location.reload()\">Play Again</button>";
      }
    }
    initGame();
  </script>
</body>
</html>
$html$;
    
    INSERT INTO game_templates (
      category_id, name, name_en, description, description_en,
      difficulty, example_code, config, is_active, display_order
    ) VALUES (
      card_category_id,
      '卡牌对战', 'Card Battle',
      '经典的卡牌对战游戏，玩家通过出牌攻击对手，先击败对手者获胜',
      'Classic card battle game where players attack opponents by playing cards, first to defeat opponent wins',
      'intermediate',
      html_code,
      '{}'::jsonb,
      true, 1
    ) ON CONFLICT DO NOTHING;
  END IF;
END $block$;

-- Step 5: Verify data
SELECT name, name_en, icon FROM game_categories WHERE is_active = true;
SELECT name, name_en, difficulty FROM game_templates WHERE is_active = true;
