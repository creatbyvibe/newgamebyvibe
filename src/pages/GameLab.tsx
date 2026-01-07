import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  FlaskConical, 
  Sparkles, 
  ArrowLeft, 
  X, 
  Shuffle, 
  Zap,
  Wand2,
  Star,
  Gamepad2,
  Brain,
  Laugh,
  Target,
  Loader2,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface GameType {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

const gameTypes: GameType[] = [
  { id: "snake", name: "贪吃蛇", emoji: "🐍", description: "吃东西变长" },
  { id: "tetris", name: "俄罗斯方块", emoji: "🧱", description: "消除方块" },
  { id: "pong", name: "乒乓球", emoji: "🏓", description: "弹球对战" },
  { id: "breakout", name: "打砖块", emoji: "🎯", description: "反弹击破" },
  { id: "flappy", name: "飞翔小鸟", emoji: "🐦", description: "穿越障碍" },
  { id: "pacman", name: "吃豆人", emoji: "👻", description: "迷宫追逐" },
  { id: "runner", name: "跑酷", emoji: "🏃", description: "躲避障碍" },
  { id: "shooter", name: "射击", emoji: "🔫", description: "瞄准射击" },
  { id: "puzzle", name: "拼图", emoji: "🧩", description: "逻辑解谜" },
  { id: "match3", name: "三消", emoji: "💎", description: "配对消除" },
  { id: "tower", name: "塔防", emoji: "🏰", description: "防守攻击" },
  { id: "racing", name: "赛车", emoji: "🏎️", description: "竞速比赛" },
  { id: "rhythm", name: "节奏", emoji: "🎵", description: "音乐节拍" },
  { id: "farming", name: "种植", emoji: "🌱", description: "经营成长" },
  { id: "fishing", name: "钓鱼", emoji: "🎣", description: "耐心等待" },
  { id: "cooking", name: "烹饪", emoji: "🍳", description: "时间管理" },
];

interface GameScore {
  creativity: number;
  playability: number;
  weirdness: number;
  addiction: number;
  overall: number;
  comment: string;
}

const GameLab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedGames, setSelectedGames] = useState<GameType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGame, setGeneratedGame] = useState<{
    name: string;
    description: string;
    scores: GameScore;
    code?: string;
  } | null>(null);

  const toggleGame = (game: GameType) => {
    if (selectedGames.find(g => g.id === game.id)) {
      setSelectedGames(prev => prev.filter(g => g.id !== game.id));
    } else if (selectedGames.length < 3) {
      setSelectedGames(prev => [...prev, game]);
    } else {
      toast.error("最多选择3个游戏进行融合");
    }
  };

  const randomSelect = () => {
    const shuffled = [...gameTypes].sort(() => Math.random() - 0.5);
    setSelectedGames(shuffled.slice(0, 2));
  };

  const handleFusion = async () => {
    if (selectedGames.length < 2) {
      toast.error("至少选择2个游戏进行融合");
      return;
    }

    setIsGenerating(true);
    setGeneratedGame(null);

    try {
      const gameNames = selectedGames.map(g => g.name).join(" + ");
      const prompt = `Create a unique fusion game that combines: ${selectedGames.map(g => `${g.name} (${g.description})`).join(" and ")}.
      
The game should creatively merge the core mechanics of each game into something new and interesting.
Make sure the game is fully playable with clear instructions shown on screen.
Use a fun, colorful visual style.`;

      // First, get the AI to generate scores and concept
      const conceptResponse = await supabase.functions.invoke('game-lab-fusion', {
        body: {
          games: selectedGames.map(g => ({ name: g.name, description: g.description })),
        },
      });

      if (conceptResponse.error) throw conceptResponse.error;

      const concept = conceptResponse.data;

      // Then generate the actual game code
      const codeResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-creation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            prompt: `${prompt}\n\nGame concept: ${concept.name} - ${concept.description}` 
          }),
        }
      );

      if (!codeResponse.ok) throw new Error("Failed to generate game");

      const reader = codeResponse.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) fullContent += content;
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Extract HTML
      let htmlCode = fullContent;
      const htmlMatch = fullContent.match(/```html\s*([\s\S]*?)```/);
      if (htmlMatch) {
        htmlCode = htmlMatch[1].trim();
      } else {
        const doctypeMatch = fullContent.match(/(<!DOCTYPE html[\s\S]*<\/html>)/i);
        if (doctypeMatch) htmlCode = doctypeMatch[1];
      }

      setGeneratedGame({
        name: concept.name,
        description: concept.description,
        scores: concept.scores,
        code: htmlCode,
      });

      toast.success("融合游戏生成成功！");
    } catch (error) {
      console.error("Fusion error:", error);
      toast.error("融合失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayGame = async () => {
    if (!generatedGame?.code) return;

    const title = generatedGame.name;
    const prompt = `Fusion: ${selectedGames.map(g => g.name).join(" + ")}`;

    if (user) {
      try {
        const { data, error } = await supabase
          .from('creations')
          .insert({
            user_id: user.id,
            title,
            prompt,
            html_code: generatedGame.code,
            status: 'draft',
            is_public: false,
          })
          .select()
          .single();

        if (error) throw error;
        navigate(`/studio/${data.id}`);
      } catch (error) {
        console.error('Failed to save:', error);
        sessionStorage.setItem('pending_creation', JSON.stringify({
          code: generatedGame.code,
          prompt,
          title,
        }));
        navigate('/studio/new');
      }
    } else {
      sessionStorage.setItem('pending_creation', JSON.stringify({
        code: generatedGame.code,
        prompt,
        title,
      }));
      navigate('/studio/new');
    }
  };

  const ScoreBar = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) => (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{value}/10</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-500`}
            style={{ width: `${value * 10}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
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
            
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full px-4 py-1.5 mb-4">
              <FlaskConical className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-600">实验性功能</span>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-gradient-primary">游戏实验室</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              选择 2-3 个游戏类型，让 AI 创造出前所未有的融合游戏。
              <br />
              <span className="text-foreground font-medium">结果可能很奇怪，但绝对有趣！</span>
            </p>
          </div>

          {/* Selected Games */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold">已选择 ({selectedGames.length}/3)</h2>
              <Button variant="outline" size="sm" onClick={randomSelect} className="gap-2">
                <Shuffle className="w-4 h-4" />
                随机选择
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-3 min-h-[60px] p-4 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30">
              {selectedGames.length === 0 ? (
                <p className="text-muted-foreground text-sm w-full text-center py-2">
                  点击下方游戏类型进行选择...
                </p>
              ) : (
                <>
                  {selectedGames.map((game, index) => (
                    <div key={game.id} className="flex items-center gap-2">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground">
                        <span className="text-lg">{game.emoji}</span>
                        <span className="font-medium">{game.name}</span>
                        <button 
                          onClick={() => toggleGame(game)}
                          className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {index < selectedGames.length - 1 && (
                        <Zap className="w-5 h-5 text-primary animate-pulse" />
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Game Types Grid */}
          <div className="mb-8">
            <h2 className="font-display font-semibold mb-4">游戏类型</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {gameTypes.map((game) => {
                const isSelected = selectedGames.find(g => g.id === game.id);
                return (
                  <button
                    key={game.id}
                    onClick={() => toggleGame(game)}
                    disabled={isGenerating}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-2xl block mb-2">{game.emoji}</span>
                    <div className="font-medium text-sm">{game.name}</div>
                    <div className="text-xs text-muted-foreground">{game.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fusion Button */}
          <div className="text-center mb-8">
            <Button
              size="lg"
              onClick={handleFusion}
              disabled={selectedGames.length < 2 || isGenerating}
              className="gap-2 px-8"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  融合中...
                </>
              ) : (
                <>
                  <FlaskConical className="w-5 h-5" />
                  开始融合！
                </>
              )}
            </Button>
            {selectedGames.length < 2 && (
              <p className="text-sm text-muted-foreground mt-2">
                至少选择 2 个游戏才能开始融合
              </p>
            )}
          </div>

          {/* Loading Animation */}
          {isGenerating && (
            <div className="rounded-2xl bg-card border overflow-hidden animate-fade-in">
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-4">
                    {selectedGames.map((game, i) => (
                      <div key={game.id} className="flex items-center">
                        <div className="text-5xl animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>
                          {game.emoji}
                        </div>
                        {i < selectedGames.length - 1 && (
                          <Zap className="w-8 h-8 text-yellow-500 mx-2 animate-pulse" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 text-center">
                <p className="font-display font-semibold text-lg mb-2">
                  AI 正在进行基因重组...
                </p>
                <p className="text-muted-foreground text-sm">
                  {selectedGames.map(g => g.name).join(" × ")} = ???
                </p>
              </div>
            </div>
          )}

          {/* Result */}
          {generatedGame && !isGenerating && (
            <div className="rounded-2xl bg-card border overflow-hidden animate-fade-in">
              <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="text-sm text-primary font-medium">融合成功!</span>
                    </div>
                    <h3 className="font-display text-2xl font-bold mb-2">
                      {generatedGame.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {generatedGame.description}
                    </p>
                  </div>
                  <div className="text-center bg-card rounded-xl p-4 border shadow-sm">
                    <div className="text-3xl font-bold text-primary">
                      {generatedGame.scores.overall}
                    </div>
                    <div className="text-xs text-muted-foreground">综合评分</div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h4 className="font-semibold mb-4">AI 评分</h4>
                <ScoreBar 
                  label="创意指数" 
                  value={generatedGame.scores.creativity} 
                  icon={Brain}
                  color="bg-purple-500"
                />
                <ScoreBar 
                  label="可玩性" 
                  value={generatedGame.scores.playability} 
                  icon={Target}
                  color="bg-green-500"
                />
                <ScoreBar 
                  label="怪异程度" 
                  value={generatedGame.scores.weirdness} 
                  icon={Laugh}
                  color="bg-orange-500"
                />
                <ScoreBar 
                  label="成瘾性" 
                  value={generatedGame.scores.addiction} 
                  icon={Gamepad2}
                  color="bg-blue-500"
                />

                <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm italic text-muted-foreground">
                    "{generatedGame.scores.comment}"
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button onClick={handlePlayGame} className="flex-1 gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    进入游戏
                  </Button>
                  <Button variant="outline" onClick={() => setGeneratedGame(null)} className="gap-2">
                    <Shuffle className="w-4 h-4" />
                    重新融合
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Examples */}
          <div className="mt-16">
            <h2 className="font-display font-semibold text-center mb-6">奇怪组合示例</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { games: ["🐍", "🧱"], name: "俄罗斯贪吃蛇", desc: "蛇吃掉的食物会变成俄罗斯方块落下" },
                { games: ["🏓", "👻"], name: "乒乓吃豆", desc: "在迷宫里用挡板反弹吃豆豆" },
                { games: ["🐦", "💎"], name: "三消小鸟", desc: "飞行时消除障碍物方块" },
              ].map((example, i) => (
                <div key={i} className="p-4 rounded-xl bg-muted/50 border">
                  <div className="flex items-center gap-2 mb-2">
                    {example.games.map((emoji, j) => (
                      <span key={j} className="flex items-center">
                        <span className="text-2xl">{emoji}</span>
                        {j < example.games.length - 1 && <Zap className="w-4 h-4 text-primary mx-1" />}
                      </span>
                    ))}
                  </div>
                  <h4 className="font-medium">{example.name}</h4>
                  <p className="text-sm text-muted-foreground">{example.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameLab;
