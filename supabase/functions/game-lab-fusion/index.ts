import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GameInput {
  name: string;
  description: string;
}

interface GameMechanics {
  movement: string;
  goal: string;
  fail: string;
  unique: string[];
}

// 游戏机制映射表
const gameMechanicsMap: Record<string, GameMechanics> = {
  "贪吃蛇": {
    movement: "4方向网格移动（上下左右）",
    goal: "吃食物变长，尽可能获得高分",
    fail: "撞墙或撞到自己的身体",
    unique: ["成长机制", "空间限制", "自我碰撞检测"]
  },
  "俄罗斯方块": {
    movement: "方块从上落下，可左右移动和旋转",
    goal: "填满一行消除，获得分数",
    fail: "方块堆到顶部",
    unique: ["形状匹配", "行消除", "时间压力"]
  },
  "乒乓球": {
    movement: "挡板左右移动，球反弹",
    goal: "让对手接不到球",
    fail: "球从自己这边出界",
    unique: ["反弹物理", "双人对战", "反应速度"]
  },
  "打砖块": {
    movement: "挡板控制，球反弹击破砖块",
    goal: "击破所有砖块",
    fail: "球从底部掉落",
    unique: ["角度计算", "目标消除", "挡板控制"]
  },
  "飞翔小鸟": {
    movement: "点击/按键上升，重力下降",
    goal: "穿越管道障碍",
    fail: "撞到管道或地面",
    unique: ["重力物理", "障碍躲避", "节奏控制"]
  },
  "吃豆人": {
    movement: "迷宫中4方向移动",
    goal: "吃光所有豆子，躲避幽灵",
    fail: "被幽灵抓到",
    unique: ["迷宫导航", "敌人AI", "道具系统"]
  },
  "跑酷": {
    movement: "水平移动，跳跃躲避",
    goal: "跑得越远越好",
    fail: "撞到障碍物",
    unique: ["无尽模式", "速度递增", "反应测试"]
  },
  "射击": {
    movement: "角色移动，瞄准射击",
    goal: "消灭敌人",
    fail: "被敌人击中",
    unique: ["瞄准系统", "敌人生成", "弹药管理"]
  },
  "拼图": {
    movement: "移动/旋转拼图块",
    goal: "完成拼图",
    fail: "无（时间限制）",
    unique: ["空间推理", "模式识别", "耐心挑战"]
  },
  "三消": {
    movement: "交换相邻元素",
    goal: "形成3个或更多相同元素消除",
    fail: "无（时间限制）",
    unique: ["匹配机制", "连锁反应", "策略规划"]
  },
  "塔防": {
    movement: "放置防御塔，敌人自动移动",
    goal: "阻止敌人到达终点",
    fail: "敌人到达终点",
    unique: ["策略布局", "资源管理", "路径规划"]
  },
  "赛车": {
    movement: "车辆左右移动，加速减速",
    goal: "完成赛道或获得最高分",
    fail: "撞车或出界",
    unique: ["速度控制", "赛道导航", "竞争元素"]
  },
  "节奏": {
    movement: "按键跟随节拍",
    goal: "准确按下节拍",
    fail: "错过太多节拍",
    unique: ["时间同步", "音乐节奏", "反应协调"]
  },
  "种植": {
    movement: "点击种植，等待成长",
    goal: "种植收获，获得资源",
    fail: "无（时间管理）",
    unique: ["时间管理", "资源积累", "成长系统"]
  },
  "钓鱼": {
    movement: "等待时机，点击收杆",
    goal: "钓到更多更好的鱼",
    fail: "无（耐心挑战）",
    unique: ["时机把握", "随机性", "收集系统"]
  },
  "烹饪": {
    movement: "点击操作，时间管理",
    goal: "完成订单，获得分数",
    fail: "订单超时",
    unique: ["多任务", "时间压力", "顺序管理"]
  }
};

// 生成智能融合选项
function generateFusionOptions(game1: GameMechanics, game2: GameMechanics, name1: string, name2: string): string[] {
  return [
    `融合方式A - 机制叠加：将${name1}的${game1.movement}与${name2}的${game2.goal}结合。例如：${game1.movement}时，需要完成${game2.goal}的目标。`,
    `融合方式B - 交替机制：在${name1}的玩法基础上，定期切换到${name2}的机制。例如：主要玩${name1}，但每隔一段时间需要完成${name2}的挑战。`,
    `融合方式C - 创新组合：创造全新的玩法，将${name1}的${game1.unique[0]}与${name2}的${game2.unique[0]}结合，产生意想不到的效果。例如：${game1.unique[0]}时触发${game2.unique[0]}的效果。`
  ];
}

// 解析游戏机制
function parseGameMechanics(gameName: string, description: string): GameMechanics {
  // 尝试从映射表获取
  const mechanics = gameMechanicsMap[gameName];
  if (mechanics) {
    return mechanics;
  }
  
  // 如果不在映射表中，根据描述推断
  return {
    movement: "基础移动机制",
    goal: description.includes("获得") || description.includes("收集") ? "收集物品获得分数" : "完成目标",
    fail: description.includes("撞") || description.includes("碰") ? "碰撞失败" : "时间限制或生命值耗尽",
    unique: [description]
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { games } = await req.json() as { games: GameInput[] };

    if (!games || games.length < 2) {
      return new Response(
        JSON.stringify({ error: "At least 2 games required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // 解析游戏机制
    const game1Mechanics = parseGameMechanics(games[0].name, games[0].description);
    const game2Mechanics = games.length > 1 ? parseGameMechanics(games[1].name, games[1].description) : null;
    const game3Mechanics = games.length > 2 ? parseGameMechanics(games[2].name, games[2].description) : null;
    
    // 生成融合选项
    let fusionOptions = "";
    if (game2Mechanics) {
      fusionOptions = generateFusionOptions(game1Mechanics, game2Mechanics, games[0].name, games[1].name).join("\n");
      if (game3Mechanics) {
        fusionOptions += "\n" + generateFusionOptions(game1Mechanics, game3Mechanics, games[0].name, games[2].name).join("\n");
        fusionOptions += "\n" + generateFusionOptions(game2Mechanics, game3Mechanics, games[1].name, games[2].name).join("\n");
      }
    }
    
    const gamesList = games.map(g => `${g.name} (${g.description})`).join(" + ");
    const mechanicsAnalysis = `
游戏机制分析：

${games[0].name}:
- 移动方式：${game1Mechanics.movement}
- 目标：${game1Mechanics.goal}
- 失败条件：${game1Mechanics.fail}
- 独特机制：${game1Mechanics.unique.join("、")}

${game2Mechanics ? `${games[1].name}:
- 移动方式：${game2Mechanics.movement}
- 目标：${game2Mechanics.goal}
- 失败条件：${game2Mechanics.fail}
- 独特机制：${game2Mechanics.unique.join("、")}` : ""}

${game3Mechanics ? `${games[2].name}:
- 移动方式：${game3Mechanics.movement}
- 目标：${game3Mechanics.goal}
- 失败条件：${game3Mechanics.fail}
- 独特机制：${game3Mechanics.unique.join("、")}` : ""}

智能融合建议：
${fusionOptions}

请基于以上机制分析，选择最有创意和可玩性的融合方式，创造出一个独特、有趣、可玩的融合游戏概念。
`;

    const systemPrompt = `You are a creative game designer AI that creates unique fusion games by combining different game mechanics.

Given a combination of games with detailed mechanics analysis, you will:
1. Analyze the core mechanics of each game
2. Choose the most creative and playable fusion approach from the suggestions
3. Create a unique fusion game concept with a creative name
4. Write a detailed description of how the mechanics are combined (explain the fusion logic clearly)
5. Score the concept on multiple dimensions

Your response MUST be valid JSON with this exact structure:
{
  "name": "Creative fusion game name in Chinese",
  "description": "Brief description of the fusion game concept in Chinese (2-3 sentences)",
  "scores": {
    "creativity": 1-10,
    "playability": 1-10,
    "weirdness": 1-10,
    "addiction": 1-10,
    "overall": 1-10,
    "comment": "A fun, witty comment about this fusion in Chinese (1-2 sentences)"
  }
}

Scoring guidelines:
- creativity: How unique and innovative is the fusion concept?
- playability: How likely is it to be fun and work well?
- weirdness: How strange/unexpected is the combination?
- addiction: How addictive could this game potentially be?
- overall: Overall rating considering all factors

Be creative but realistic. Some combinations might be weird but could actually work well!`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\n${mechanicsAnalysis}\n\nCreate a fusion game concept for: ${gamesList}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "请求过于频繁，请稍后再试。" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "使用额度已用完，请添加积分继续使用。" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "处理失败，请重试。" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let content =
      data.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text || "")
        .join("") || "";

    // Clean up and parse JSON
    try {
      if (content.includes("```json")) {
        content = content.split("```json")[1].split("```")[0].trim();
      } else if (content.includes("```")) {
        content = content.split("```")[1].split("```")[0].trim();
      }

      const parsed = JSON.parse(content);
      
      // Validate and ensure all required fields exist
      const result = {
        name: parsed.name || `${games[0].name}${games[1].name}融合`,
        description: parsed.description || "一个独特的融合游戏",
        scores: {
          creativity: Math.min(10, Math.max(1, parsed.scores?.creativity || 7)),
          playability: Math.min(10, Math.max(1, parsed.scores?.playability || 6)),
          weirdness: Math.min(10, Math.max(1, parsed.scores?.weirdness || 8)),
          addiction: Math.min(10, Math.max(1, parsed.scores?.addiction || 6)),
          overall: Math.min(10, Math.max(1, parsed.scores?.overall || 7)),
          comment: parsed.scores?.comment || "这是一个有趣的组合！",
        },
      };

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch {
      // Fallback response if parsing fails
      const fallback = {
        name: `${games[0].name}×${games[1].name}`,
        description: `融合了${games.map(g => g.name).join("和")}的核心玩法，创造出全新的游戏体验。`,
        scores: {
          creativity: 7,
          playability: 6,
          weirdness: 8,
          addiction: 6,
          overall: 7,
          comment: "这个组合很有创意，可能会产生意想不到的效果！",
        },
      };

      return new Response(
        JSON.stringify(fallback),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("game-lab-fusion error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
