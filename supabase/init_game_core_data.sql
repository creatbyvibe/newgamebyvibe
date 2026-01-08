-- ============================================
-- 游戏核心功能数据库初始化脚本
-- ============================================
-- 执行顺序：
-- 1. 先执行 game_core_schema.sql 创建表结构
-- 2. 然后执行本脚本初始化数据
-- ============================================

-- ============================================
-- 步骤 1: 创建游戏分类表（如果不存在）
-- ============================================
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

-- ============================================
-- 步骤 2: 创建游戏模板表（如果不存在）
-- ============================================
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

-- ============================================
-- 步骤 3: 启用 RLS 并创建策略
-- ============================================
ALTER TABLE game_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_templates ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Public can view active game categories" ON game_categories;
DROP POLICY IF EXISTS "Public can view active game templates" ON game_templates;

-- 创建新的 RLS 策略
CREATE POLICY "Public can view active game categories"
  ON game_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active game templates"
  ON game_templates FOR SELECT
  USING (is_active = true);

-- ============================================
-- 步骤 4: 插入卡牌游戏分类
-- ============================================
INSERT INTO game_categories (
  name,
  name_en,
  icon,
  description,
  description_en,
  is_active,
  display_order,
  metadata,
  system_prompt,
  system_prompt_en
) VALUES (
  '卡牌游戏',
  'Card Games',
  '🃏',
  '策略与运气的完美结合，通过收集、对战、解谜等方式体验卡牌游戏的魅力',
  'Perfect combination of strategy and luck, experience the charm of card games through collection, battle, and puzzle solving',
  true,
  1,
  '{
    "rarity_system": {
      "common": "普通",
      "rare": "稀有",
      "epic": "史诗",
      "legendary": "传说"
    },
    "card_types": [
      "生物卡",
      "法术卡",
      "装备卡",
      "陷阱卡",
      "场地卡"
    ],
    "effect_types": [
      "即时效果",
      "持续效果",
      "触发效果",
      "被动效果"
    ],
    "mechanics": [
      "抽卡",
      "弃牌",
      "手牌管理",
      "资源管理",
      "卡牌组合",
      "连锁效果",
      "卡牌升级",
      "卡牌融合"
    ],
    "constraints": [
      "游戏必须包含完整的卡牌系统",
      "必须实现抽卡、出牌、弃牌等基本操作",
      "卡牌必须有清晰的视觉效果和说明",
      "游戏必须包含胜负判定机制",
      "必须实现卡牌之间的交互逻辑"
    ],
    "best_practices": [
      "使用清晰的卡牌布局和视觉层次",
      "提供卡牌悬停效果显示详细信息",
      "实现流畅的卡牌动画效果",
      "添加音效反馈增强游戏体验",
      "确保卡牌游戏逻辑清晰易懂",
      "提供新手教程或说明",
      "实现合理的游戏平衡性"
    ]
  }'::jsonb,
  '你是一个专业的卡牌游戏开发AI。你需要创建完整、可玩的HTML5卡牌游戏。

关键要求：
1. 游戏必须包含完整的卡牌系统（抽卡、手牌、出牌区、弃牌堆）
2. 卡牌必须有清晰的视觉效果（正面、背面、稀有度标识）
3. 必须实现卡牌之间的交互逻辑（攻击、防御、效果触发）
4. 游戏必须包含胜负判定机制
5. 必须实现流畅的卡牌动画（抽卡、出牌、弃牌）

卡牌游戏结构：
- 卡牌库（Deck）：游戏开始时洗牌
- 手牌（Hand）：玩家当前持有的卡牌
- 出牌区（Board）：已打出的卡牌
- 弃牌堆（Discard）：已使用的卡牌

必须实现的功能：
- 点击卡牌查看详细信息
- 拖拽或点击出牌
- 卡牌效果触发动画
- 游戏状态显示（生命值、资源、回合数等）
- 清晰的游戏规则说明',
  'You are a professional card game development AI. You need to create complete, playable HTML5 card games.

Key Requirements:
1. The game must include a complete card system (drawing, hand, play area, discard pile)
2. Cards must have clear visual effects (front, back, rarity indicators)
3. Must implement card interaction logic (attack, defense, effect triggers)
4. The game must include win/loss determination mechanisms
5. Must implement smooth card animations (drawing, playing, discarding)

Card Game Structure:
- Deck: Shuffled at game start
- Hand: Cards currently held by player
- Board: Cards that have been played
- Discard Pile: Cards that have been used

Required Features:
- Click cards to view detailed information
- Drag or click to play cards
- Card effect trigger animations
- Game state display (health, resources, turn count, etc.)
- Clear game rules and instructions'
) ON CONFLICT (name) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  description_en = EXCLUDED.description_en,
  metadata = EXCLUDED.metadata,
  system_prompt = EXCLUDED.system_prompt,
  system_prompt_en = EXCLUDED.system_prompt_en,
  updated_at = NOW();

-- ============================================
-- 步骤 5: 插入卡牌游戏模板
-- ============================================
-- 注意：这里只插入一个简化版本的模板，完整版本请参考 card_templates_init.sql

-- 获取卡牌游戏分类ID
DO $$
DECLARE
  card_category_id UUID;
BEGIN
  -- 获取卡牌游戏分类ID
  SELECT id INTO card_category_id FROM game_categories WHERE name = '卡牌游戏' LIMIT 1;
  
  IF card_category_id IS NOT NULL THEN
    -- 插入卡牌对战模板（简化版）
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
    ) VALUES (
      card_category_id,
      '卡牌对战',
      'Card Battle',
      '经典的卡牌对战游戏，玩家通过出牌攻击对手，先击败对手者获胜',
      'Classic card battle game where players attack opponents by playing cards, first to defeat opponent wins',
      'intermediate',
      '<!DOCTYPE html><html><head><title>卡牌对战</title><style>body{margin:0;padding:20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);font-family:Arial;color:white}.game-container{max-width:1200px;margin:0 auto}.player-area{background:rgba(255,255,255,0.1);border-radius:15px;padding:20px;margin:10px 0}.hand{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:10px}.card{width:120px;height:160px;background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);border-radius:10px;cursor:pointer;position:relative;transition:transform 0.3s;border:2px solid rgba(255,255,255,0.3)}.card:hover{transform:translateY(-10px) scale(1.05)}.card-front{padding:10px;height:100%;display:flex;flex-direction:column;justify-content:space-between}.card-name{font-weight:bold;font-size:14px}.card-cost{position:absolute;top:5px;right:5px;background:gold;color:#000;width:25px;height:25px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold}.card-attack{position:absolute;bottom:5px;left:5px;background:#ff4444;color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold}.card-health{position:absolute;bottom:5px;right:5px;background:#44ff44;color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold}.stats{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.health{font-size:24px;font-weight:bold}.mana{font-size:20px}button{padding:10px 20px;font-size:16px;border:none;border-radius:5px;background:#4CAF50;color:white;cursor:pointer;margin:5px}button:hover{background:#45a049}button:disabled{background:#666;cursor:not-allowed}</style></head><body><div class="game-container"><h1 style="text-align:center">🃏 卡牌对战</h1><div class="player-area"><div class="stats"><div class="health">❤️ 生命: <span id="playerHealth">30</span></div><div class="mana">💎 法力: <span id="playerMana">3</span>/10</div></div><div class="hand" id="playerHand"></div></div><div class="player-area"><div class="stats"><div class="health">❤️ 对手生命: <span id="opponentHealth">30</span></div></div><div id="opponentBoard"></div></div><button onclick="endTurn()">结束回合</button><div id="gameOver"></div></div><script>let playerHealth=30,opponentHealth=30,playerMana=3,maxMana=3,playerHand=[],deck=[],turn=1;const cardTypes=[{name:"火球术",cost:2,attack:3,type:"spell"},{name:"治疗",cost:1,heal:5,type:"heal"},{name:"战士",cost:3,attack:2,health:3,type:"creature"},{name:"法师",cost:4,attack:4,health:2,type:"creature"}];function initGame(){for(let i=0;i<3;i++)deck.push(...cardTypes);shuffle(deck);for(let i=0;i<5;i++)drawCard();updateDisplay()}function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}}function drawCard(){if(deck.length>0&&playerHand.length<10){playerHand.push(deck.pop());updateDisplay()}}function playCard(index){const card=playerHand[index];if(!card||playerMana<card.cost)return;playerMana-=card.cost;playerHand.splice(index,1);if(card.type==="spell"){opponentHealth-=card.attack}else if(card.type==="heal"){playerHealth=Math.min(30,playerHealth+card.heal)}updateDisplay();checkGameOver()}function endTurn(){maxMana=Math.min(10,maxMana+1);playerMana=maxMana;drawCard();if(opponentHealth>0){const randomCard=cardTypes[Math.floor(Math.random()*cardTypes.length)];if(randomCard.type==="spell"){playerHealth-=randomCard.attack}}updateDisplay();checkGameOver()}function updateDisplay(){document.getElementById("playerHealth").textContent=playerHealth;document.getElementById("opponentHealth").textContent=opponentHealth;document.getElementById("playerMana").textContent=playerMana;const handEl=document.getElementById("playerHand");handEl.innerHTML="";playerHand.forEach((card,index)=>{const cardEl=document.createElement("div");cardEl.className="card"+(playerMana<card.cost?" played":"");cardEl.innerHTML=`<div class="card-front"><div class="card-cost">${card.cost}</div><div class="card-name">${card.name}</div>${card.attack?`<div class="card-attack">${card.attack}</div>`:""}${card.health?`<div class="card-health">${card.health}</div>`:""}</div>`;if(playerMana>=card.cost){cardEl.onclick=()=>playCard(index)}handEl.appendChild(cardEl)})}function checkGameOver(){if(playerHealth<=0){document.getElementById("gameOver").innerHTML="<h2>游戏结束！你输了！</h2><button onclick=\"location.reload()\">再来一局</button>"}else if(opponentHealth<=0){document.getElementById("gameOver").innerHTML="<h2>恭喜！你赢了！</h2><button onclick=\"location.reload()\">再来一局</button>"}}initGame();</script></body></html>',
      '{}'::jsonb,
      true,
      1
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================
-- 步骤 6: 验证数据
-- ============================================
-- 检查分类是否创建成功
SELECT 
  '游戏分类数量: ' || COUNT(*)::text as result
FROM game_categories
WHERE is_active = true;

-- 检查模板是否创建成功
SELECT 
  '游戏模板数量: ' || COUNT(*)::text as result
FROM game_templates
WHERE is_active = true;

-- 显示所有激活的分类
SELECT 
  name,
  name_en,
  icon,
  display_order
FROM game_categories
WHERE is_active = true
ORDER BY display_order;
