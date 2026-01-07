import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Gamepad2, 
  Puzzle, 
  Zap, 
  Target, 
  Palette, 
  Music, 
  Brain, 
  Dice1, 
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Play
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AICreator from "@/components/AICreator";

interface GameTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  emoji: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

const categories: Category[] = [
  { id: "arcade", name: "街机经典", icon: Gamepad2, color: "from-red-500 to-orange-500", description: "经典街机风格游戏" },
  { id: "puzzle", name: "益智解谜", icon: Puzzle, color: "from-blue-500 to-cyan-500", description: "烧脑益智类游戏" },
  { id: "action", name: "动作敏捷", icon: Zap, color: "from-yellow-500 to-amber-500", description: "考验反应速度" },
  { id: "casual", name: "休闲娱乐", icon: Target, color: "from-green-500 to-emerald-500", description: "轻松休闲小游戏" },
  { id: "creative", name: "创意工具", icon: Palette, color: "from-purple-500 to-pink-500", description: "艺术创作工具" },
  { id: "music", name: "音乐节奏", icon: Music, color: "from-pink-500 to-rose-500", description: "音乐相关游戏" },
  { id: "brain", name: "记忆训练", icon: Brain, color: "from-indigo-500 to-violet-500", description: "锻炼大脑记忆" },
  { id: "luck", name: "随机趣味", icon: Dice1, color: "from-teal-500 to-cyan-500", description: "随机决定器" },
];

const templates: GameTemplate[] = [
  // 街机经典
  { id: "snake", title: "贪吃蛇", description: "控制蛇吃食物变长，不要撞墙", prompt: "Create a classic Snake game with arrow key controls, growing snake, score tracking, and game over when hitting walls or self", emoji: "🐍", difficulty: "easy", category: "arcade" },
  { id: "breakout", title: "打砖块", description: "用挡板反弹球打破所有砖块", prompt: "Create a Breakout/Arkanoid game with paddle, bouncing ball, colorful bricks, score system, and multiple lives", emoji: "🧱", difficulty: "medium", category: "arcade" },
  { id: "pong", title: "乒乓球", description: "经典双人对战乒乓球", prompt: "Create a Pong game with two paddles, AI opponent, score tracking, ball speed increase over time", emoji: "🏓", difficulty: "easy", category: "arcade" },
  { id: "pacman", title: "吃豆人", description: "在迷宫中吃豆子躲避幽灵", prompt: "Create a Pac-Man style maze game with dots to collect, ghost enemies, power pellets, and increasing difficulty", emoji: "👻", difficulty: "hard", category: "arcade" },
  
  // 益智解谜
  { id: "2048", title: "2048", description: "滑动合并数字达到2048", prompt: "Create a 2048 puzzle game with smooth sliding animations, score tracking, and game over detection", emoji: "🔢", difficulty: "medium", category: "puzzle" },
  { id: "sudoku", title: "数独", description: "填充9x9数字格子", prompt: "Create a Sudoku puzzle game with different difficulty levels, input validation, hints, and timer", emoji: "🧩", difficulty: "hard", category: "puzzle" },
  { id: "wordle", title: "猜词游戏", description: "5次机会猜出5字母单词", prompt: "Create a Wordle-like word guessing game with color feedback (green/yellow/gray), keyboard, and 6 attempts", emoji: "📝", difficulty: "medium", category: "puzzle" },
  { id: "sliding", title: "滑动拼图", description: "移动方块还原图案", prompt: "Create a sliding puzzle game (15 puzzle) with numbered tiles, move counter, and shuffle function", emoji: "🔲", difficulty: "medium", category: "puzzle" },
  
  // 动作敏捷
  { id: "flappy", title: "飞翔小鸟", description: "点击让小鸟穿过管道", prompt: "Create a Flappy Bird clone with tap/click to fly, pipe obstacles, score counter, and difficulty progression", emoji: "🐦", difficulty: "medium", category: "action" },
  { id: "runner", title: "无尽跑酷", description: "躲避障碍物跑得更远", prompt: "Create an endless runner game with jumping, obstacles, coins to collect, increasing speed, and high score", emoji: "🏃", difficulty: "medium", category: "action" },
  { id: "whackamole", title: "打地鼠", description: "快速点击冒出的地鼠", prompt: "Create a Whac-A-Mole game with random moles popping up, timer, score, combo system, and increasing speed", emoji: "🔨", difficulty: "easy", category: "action" },
  { id: "avoider", title: "躲避球", description: "控制角色躲避下落的物体", prompt: "Create a dodge game where player avoids falling objects, with power-ups, score, and increasing difficulty", emoji: "⚡", difficulty: "easy", category: "action" },
  
  // 休闲娱乐
  { id: "clicker", title: "点击大师", description: "疯狂点击获取积分升级", prompt: "Create a cookie clicker style game with click counter, auto-clickers, upgrades shop, and achievements", emoji: "🍪", difficulty: "easy", category: "casual" },
  { id: "fishing", title: "钓鱼游戏", description: "耐心钓鱼收集各种鱼", prompt: "Create a fishing game with timing mechanic, different fish rarities, collection book, and relaxing vibes", emoji: "🎣", difficulty: "easy", category: "casual" },
  { id: "garden", title: "小花园", description: "种植照料你的虚拟花园", prompt: "Create a virtual garden game where you plant seeds, water flowers, watch them grow, and collect them", emoji: "🌻", difficulty: "easy", category: "casual" },
  { id: "pet", title: "电子宠物", description: "照顾你的像素小宠物", prompt: "Create a Tamagotchi-style virtual pet with hunger, happiness, sleep stats, mini-games, and pixel art style", emoji: "🐣", difficulty: "medium", category: "casual" },
  
  // 创意工具
  { id: "drawing", title: "画板", description: "自由绘画创作", prompt: "Create a drawing canvas with brush sizes, color picker, eraser, undo/redo, clear, and save as image", emoji: "🎨", difficulty: "easy", category: "creative" },
  { id: "pixel", title: "像素画", description: "创作像素艺术", prompt: "Create a pixel art editor with grid, color palette, zoom, fill tool, and export function", emoji: "👾", difficulty: "medium", category: "creative" },
  { id: "mandala", title: "曼陀罗", description: "对称图案生成器", prompt: "Create a mandala drawing tool with radial symmetry, multiple colors, and mesmerizing patterns", emoji: "🔮", difficulty: "easy", category: "creative" },
  { id: "avatar", title: "头像生成", description: "创建独特的卡通头像", prompt: "Create an avatar maker with face shapes, eyes, hair, accessories options, randomize, and download", emoji: "👤", difficulty: "medium", category: "creative" },
  
  // 音乐节奏
  { id: "piano", title: "钢琴", description: "弹奏虚拟钢琴", prompt: "Create a piano keyboard that plays notes with keyboard input, multiple octaves, and visual feedback", emoji: "🎹", difficulty: "easy", category: "music" },
  { id: "drums", title: "架子鼓", description: "用键盘打鼓", prompt: "Create a drum machine with different drum sounds, keyboard shortcuts, and recording playback", emoji: "🥁", difficulty: "easy", category: "music" },
  { id: "beatmaker", title: "节拍器", description: "创作自己的节奏", prompt: "Create a beat maker with grid sequencer, multiple instrument sounds, tempo control, and loop playback", emoji: "🎵", difficulty: "medium", category: "music" },
  { id: "rhythm", title: "节奏游戏", description: "跟着节拍按键", prompt: "Create a rhythm game where notes fall and player must press keys in time with music, with scoring", emoji: "🎼", difficulty: "hard", category: "music" },
  
  // 记忆训练
  { id: "memory", title: "记忆翻牌", description: "找出配对的卡片", prompt: "Create a memory matching card game with flip animations, move counter, timer, and different themes", emoji: "🃏", difficulty: "easy", category: "brain" },
  { id: "simon", title: "Simon说", description: "记住并重复颜色序列", prompt: "Create a Simon Says game with colored buttons, sound feedback, increasing sequence length, and high score", emoji: "🔴", difficulty: "medium", category: "brain" },
  { id: "sequence", title: "数字记忆", description: "记住闪现的数字序列", prompt: "Create a number memory game that shows numbers briefly, player repeats them, increasing difficulty", emoji: "🔢", difficulty: "medium", category: "brain" },
  { id: "reaction", title: "反应测试", description: "测试你的反应速度", prompt: "Create a reaction time test game that measures how fast you can click when color changes, with statistics", emoji: "⚡", difficulty: "easy", category: "brain" },
  
  // 随机趣味
  { id: "wheel", title: "转盘抽奖", description: "命运之轮决定一切", prompt: "Create a spinning wheel picker with customizable options, smooth animation, and dramatic reveal", emoji: "🎰", difficulty: "easy", category: "luck" },
  { id: "dice", title: "骰子模拟", description: "掷骰子决定命运", prompt: "Create a dice roller with 3D dice animation, multiple dice support, history log, and statistics", emoji: "🎲", difficulty: "easy", category: "luck" },
  { id: "fortune", title: "算命师", description: "获取你的今日运势", prompt: "Create a fortune teller with mystical animations, random fortunes, lucky numbers, and share function", emoji: "🔮", difficulty: "easy", category: "luck" },
  { id: "magic8", title: "神奇8号球", description: "问问题获得答案", prompt: "Create a Magic 8 Ball that shakes and reveals random answers to yes/no questions with animation", emoji: "🎱", difficulty: "easy", category: "luck" },
];

const difficultyColors = {
  easy: "bg-green-500/10 text-green-600 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-600 border-red-500/20",
};

const difficultyLabels = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

const Inspiration = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);

  const filteredTemplates = selectedCategory
    ? templates.filter(t => t.category === selectedCategory)
    : templates;

  if (selectedTemplate) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-4 left-4 z-50">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedTemplate(null)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回灵感库
          </Button>
        </div>
        <div className="pt-20 pb-12 px-4 flex flex-col items-center justify-center min-h-screen">
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 block">{selectedTemplate.emoji}</span>
            <h1 className="font-display text-2xl font-bold mb-2">{selectedTemplate.title}</h1>
            <p className="text-muted-foreground">{selectedTemplate.description}</p>
          </div>
          {/* Pass the template prompt to AICreator */}
          <AICreator 
            key={selectedTemplate.id} 
            initialPrompt={selectedTemplate.prompt}
            showSuggestions={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
              className="gap-2 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-gradient-primary">创作灵感库</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              探索各种游戏类型和创意模板，点击即可开始创作你的专属版本
            </p>
          </div>

          {/* Categories */}
          <div className="mb-10">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === null
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                全部
              </button>
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Description */}
          {selectedCategory && (
            <div className="text-center mb-8 animate-fade-in">
              <p className="text-muted-foreground">
                {categories.find(c => c.id === selectedCategory)?.description}
              </p>
            </div>
          )}

          {/* Templates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="group relative bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedTemplate(template)}
              >
                {/* Emoji & Title */}
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{template.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4">
                  <span className={`text-xs px-2 py-1 rounded-full border ${difficultyColors[template.difficulty]}`}>
                    {difficultyLabels[template.difficulty]}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play className="w-3.5 h-3.5" />
                    创建
                  </Button>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-muted/50 border border-border">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">
                没有找到想要的？
              </span>
              <Button size="sm" onClick={() => navigate("/")}>
                自由创作
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Inspiration;
