-- Initialize Card Game Category
-- Run this in Supabase SQL Editor after creating game_categories table

-- Insert Card Game Category
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
) ON CONFLICT (name) DO NOTHING;
