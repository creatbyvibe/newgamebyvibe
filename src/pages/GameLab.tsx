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
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { gameLabService } from "@/services/gameLabService";
import { creationService } from "@/services/creationService";
import { ErrorHandler } from "@/lib/errorHandler";

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
  const { t } = useTranslation();
  const [selectedGames, setSelectedGames] = useState<GameType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGame, setGeneratedGame] = useState<{
    name: string;
    description: string;
    scores: GameScore;
    code?: string;
  } | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const loadingSteps = [
    { text: "正在分析游戏机制...", icon: Brain },
    { text: "构思融合方案...", icon: Sparkles },
    { text: "生成游戏代码...", icon: Wand2 },
    { text: "优化游戏体验...", icon: Zap },
    { text: "即将完成...", icon: Gamepad2 },
  ];

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
    setProgress(0);
    setLoadingStep(0);

    // 启动进度动画
    let progressValue = 0;
    let stepIndex = 0;
    let progressInterval: NodeJS.Timeout | null = null;
    let stepInterval: NodeJS.Timeout | null = null;
    
    progressInterval = setInterval(() => {
      progressValue += 1;
      setProgress(Math.min(progressValue, 95));
    }, 150);
    
    stepInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % loadingSteps.length;
      setLoadingStep(stepIndex);
    }, 2500);

    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/938b3518-4852-4c89-8195-34f66fcdebec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameLab.tsx:87',message:'handleFusion started',data:{selectedGamesCount:selectedGames.length,selectedGames:selectedGames.map(g=>g.name),supabaseUrl:import.meta.env.VITE_SUPABASE_URL,hasSupabaseKey:!!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion

      const gameNames = selectedGames.map(g => g.name).join(" + ");
      const prompt = `Create a unique fusion game that combines: ${selectedGames.map(g => `${g.name} (${g.description})`).join(" and ")}.
      
The game should creatively merge the core mechanics of each game into something new and interesting.
Make sure the game is fully playable with clear instructions shown on screen.
Use a fun, colorful visual style.`;

      // First, get the AI to generate scores and concept
      // 使用 gameLabService 融合游戏概念
      const concept = await gameLabService.fuseGames({
        selectedGames: selectedGames.map(g => ({
          id: g.id,
          name: g.name,
          emoji: g.emoji,
          description: g.description,
        })),
      });

      // 使用 gameLabService 生成游戏代码（流式响应）
      let fullContent = "";
      
      try {
        fullContent = await gameLabService.generateGame(
          {
            fusionResult: concept,
            prompt: prompt, // gameLabService 会自动构建完整的 prompt
          },
          (chunk) => {
            // 实时更新进度（可选）
          }
        );
      } catch (error: any) {
        ErrorHandler.logError(error, 'GameLab.generateGame');
        let errorMsg = ErrorHandler.getUserMessage(error);
        
        // 针对特定错误提供更友好的提示
        if (error?.status === 429 || error?.message?.includes("429") || error?.code === 'RATE_LIMIT') {
          errorMsg = "请求过于频繁，请稍等片刻后重试";
        } else if (error?.status === 402 || error?.message?.includes("402") || error?.code === 'QUOTA_EXCEEDED') {
          errorMsg = "API 使用额度已用完，请稍后重试";
        } else if (error?.status === 400 || error?.message?.includes("400") || error?.code === 'BAD_REQUEST') {
          errorMsg = "请求参数错误，请重试";
        } else if (error?.status === 500 || error?.message?.includes("500") || error?.code === 'SERVER_ERROR') {
          errorMsg = "服务器错误，请稍后重试";
        }
        
        throw new Error(errorMsg);
      }

      // Extract HTML with multiple fallback strategies
      let htmlCode = "";
      
      // Strategy 1: Look for markdown code blocks
      const htmlMatch = fullContent.match(/```html\s*([\s\S]*?)```/);
      if (htmlMatch) {
        htmlCode = htmlMatch[1].trim();
      } else {
        // Strategy 2: Look for HTML wrapped in code blocks without language tag
        const codeBlockMatch = fullContent.match(/```\s*([\s\S]*?)```/);
        if (codeBlockMatch && codeBlockMatch[1].includes("<!DOCTYPE html")) {
          htmlCode = codeBlockMatch[1].trim();
        } else {
          // Strategy 3: Look for raw HTML with DOCTYPE
          const doctypeMatch = fullContent.match(/(<!DOCTYPE html[\s\S]*<\/html>)/i);
          if (doctypeMatch) {
            htmlCode = doctypeMatch[1];
          } else {
            // Strategy 4: Look for HTML without DOCTYPE (just <html> tag)
            const htmlTagMatch = fullContent.match(/(<html[\s\S]*<\/html>)/i);
            if (htmlTagMatch) {
              htmlCode = htmlTagMatch[1];
            } else {
              // Strategy 5: If content looks like HTML, use it directly
              if (fullContent.trim().startsWith("<") && fullContent.includes("</html>")) {
                htmlCode = fullContent.trim();
              }
            }
          }
        }
      }

      // Validate extracted HTML
      if (!htmlCode || (!htmlCode.includes("<!DOCTYPE html") && !htmlCode.includes("<html"))) {
        // Log the issue for debugging
        console.error("HTML extraction failed. Full content preview:", fullContent.substring(0, 500));
        throw new Error("无法从 AI 响应中提取有效的 HTML 代码。AI 可能没有生成完整的游戏代码，请尝试重新生成。");
      }

      // 完成进度
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      setProgress(100);
      setLoadingStep(loadingSteps.length - 1);
      
      // 短暂延迟以显示完成状态
      await new Promise(resolve => setTimeout(resolve, 300));

      setGeneratedGame({
        name: concept.name,
        description: concept.description,
        scores: concept.scores,
        code: htmlCode,
      });

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/938b3518-4852-4c89-8195-34f66fcdebec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameLab.tsx:185',message:'Fusion success',data:{hasCode:!!htmlCode,codeLength:htmlCode.length,hasConcept:!!concept},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'ALL'})}).catch(()=>{});
      // #endregion

      toast.success(t('gameLab.success'));
    } catch (error) {
      ErrorHandler.logError(error, 'GameLab.handleFusion');
      
      // 详细的错误分类和友好提示
      let errorMessage = "融合失败，请重试";
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        // 网络错误
        if (errorMsg.includes("fetch") || errorMsg.includes("network") || errorMsg.includes("failed to fetch")) {
          errorMessage = "网络连接失败，请检查网络后重试";
        }
        // API 错误
        else if (errorMsg.includes("429") || errorMsg.includes("rate limit")) {
          errorMessage = "请求过于频繁，请稍等片刻后重试";
        }
        // 认证错误
        else if (errorMsg.includes("401") || errorMsg.includes("unauthorized") || errorMsg.includes("auth")) {
          errorMessage = "认证失败，请刷新页面后重试";
        }
        // 服务器错误
        else if (errorMsg.includes("500") || errorMsg.includes("server")) {
          errorMessage = "服务器暂时无法响应，请稍后重试";
        }
        // API Key 错误
        else if (errorMsg.includes("api key") || errorMsg.includes("key")) {
          errorMessage = "API 配置错误，请联系管理员";
        }
        // 生成失败
        else if (errorMsg.includes("generate") || errorMsg.includes("generation")) {
          errorMessage = "游戏生成失败，可能是内容过于复杂，请尝试其他组合";
        }
        // 解析错误
        else if (errorMsg.includes("parse") || errorMsg.includes("json")) {
          errorMessage = "数据解析失败，请重试";
        }
        // 超时
        else if (errorMsg.includes("timeout") || errorMsg.includes("time out")) {
          errorMessage = "生成超时，请重试或选择更简单的游戏组合";
        }
        // HTML 提取错误
        else if (errorMsg.includes("无法从 AI 响应中提取") || errorMsg.includes("extract") || errorMsg.includes("valid HTML")) {
          errorMessage = "无法提取有效的游戏代码，AI 可能没有生成完整代码。请尝试重新生成或选择其他游戏组合。";
        }
        // 其他错误，显示原始消息（如果友好）
        else if (error.message.length < 100) {
          errorMessage = error.message;
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
    } finally {
      // 清理进度动画
      if (progressInterval) clearInterval(progressInterval);
      if (stepInterval) clearInterval(stepInterval);
      setIsGenerating(false);
      setProgress(0);
      setLoadingStep(0);
    }
  };

  const handleRegenerate = () => {
    // 保持用户选择的游戏，只重新生成
    setGeneratedGame(null);
    handleFusion();
  };

  const handlePlayGame = async () => {
    if (!generatedGame?.code) return;

    const title = generatedGame.name;
    const prompt = `Fusion: ${selectedGames.map(g => g.name).join(" + ")}`;

    if (user) {
      try {
        const creation = await creationService.createCreation({
          title,
          prompt,
          html_code: generatedGame.code,
          is_public: false,
        });
        navigate(`/studio/${creation.id}`);
      } catch (error) {
        ErrorHandler.logError(error, 'GameLab.handlePlayGame');
        toast.error(ErrorHandler.getUserMessage(error));
        // 保存到 sessionStorage 作为后备方案
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
              {t('gameLab.backToHome')}
            </Button>
            
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full px-4 py-1.5 mb-4">
              <FlaskConical className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-600">{t('gameLab.experimental')}</span>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-gradient-primary">{t('gameLab.title')}</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {t('gameLab.description')}
              <br />
              <span className="text-foreground font-medium">{t('gameLab.descriptionHint')}</span>
            </p>
          </div>

          {/* Selected Games */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold">{t('gameLab.selected')} ({selectedGames.length}/3)</h2>
              <Button variant="outline" size="sm" onClick={randomSelect} className="gap-2">
                <Shuffle className="w-4 h-4" />
                {t('gameLab.randomSelect')}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-3 min-h-[60px] p-4 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30">
              {selectedGames.length === 0 ? (
                <p className="text-muted-foreground text-sm w-full text-center py-2">
                  {t('gameLab.clickToSelect')}
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
            <h2 className="font-display font-semibold mb-4">{t('gameLab.gameTypes')}</h2>
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
                  {t('gameLab.fusing')}
                </>
              ) : (
                <>
                  <FlaskConical className="w-5 h-5" />
                  {t('gameLab.fuseGames')}
                </>
              )}
            </Button>
            {selectedGames.length < 2 && (
              <p className="text-sm text-muted-foreground mt-2">
                至少选择 2 个游戏才能开始融合
              </p>
            )}
          </div>

          {/* Loading Animation with Progress */}
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
              <div className="p-6 border-t border-border bg-muted/30">
                {/* Step text */}
                <div className="text-center mb-4">
                  <p className="font-display font-semibold text-foreground animate-fade-in" key={loadingStep}>
                    {loadingSteps[loadingStep]?.text || t('gameLab.generating')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedGames.map(g => g.name).join(" × ")} = ???
                  </p>
                </div>

                {/* Progress bar */}
                <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-secondary to-primary rounded-full transition-all duration-300 ease-out"
                    style={{ 
                      width: `${progress}%`,
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s linear infinite',
                    }}
                  />
                </div>
                
                {/* Progress percentage */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t('gameLab.generating')}</span>
                  <span className="font-mono">{progress}%</span>
                </div>

                {/* Step indicators */}
                <div className="flex justify-center gap-2 mt-4">
                  {loadingSteps.map((step, index) => {
                    const StepIcon = step.icon;
                    return (
                      <div
                        key={index}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          index === loadingStep
                            ? "bg-primary text-primary-foreground scale-110"
                            : index < loadingStep
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <StepIcon className="w-4 h-4" />
                      </div>
                    );
                  })}
                </div>
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
                    <div className="text-xs text-muted-foreground">{t('gameLab.overallScore')}</div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h4 className="font-semibold mb-4">{t('gameLab.aiScore')}</h4>
                <ScoreBar 
                  label={t('gameLab.creativity')} 
                  value={generatedGame.scores.creativity} 
                  icon={Brain}
                  color="bg-purple-500"
                />
                <ScoreBar 
                  label={t('gameLab.playability')} 
                  value={generatedGame.scores.playability} 
                  icon={Target}
                  color="bg-green-500"
                />
                <ScoreBar 
                  label={t('gameLab.weirdness')} 
                  value={generatedGame.scores.weirdness} 
                  icon={Laugh}
                  color="bg-orange-500"
                />
                <ScoreBar 
                  label={t('gameLab.addiction')} 
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
                    {t('gameLab.playGame')}
                  </Button>
                  <Button variant="outline" onClick={handleRegenerate} className="gap-2" disabled={isGenerating}>
                    <Shuffle className="w-4 h-4" />
                    {t('gameLab.regenerate')}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setGeneratedGame(null);
                    setSelectedGames([]);
                  }} className="gap-2">
                    <X className="w-4 h-4" />
                    {t('common.back')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Examples */}
          <div className="mt-16">
            <h2 className="font-display font-semibold text-center mb-6">{t('gameLab.examples')}</h2>
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
