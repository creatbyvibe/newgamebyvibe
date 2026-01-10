import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  X, 
  Wand2,
  Gamepad2,
  Brain,
  Loader2,
  Sparkles,
  Zap,
  CreditCard
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { gameLabService, type GameFusionResult } from "@/services/gameLabService";
import { creationService } from "@/services/creationService";
import { ErrorHandler } from "@/lib/errorHandler";
import { getRandomMessage } from "@/lib/utils/messageUtils";
import { TemplatePreview } from "@/components/TemplatePreview";
import type { GameCategory, GameTemplate } from "@/types/game";
import { Textarea } from "@/components/ui/textarea";
import { generateGameWithHighReliability } from "@/lib/gameGenerator";
import { gameCategoryService } from "@/services/gameCategoryService";

interface GameScore {
  creativity: number;
  playability: number;
  weirdness: number;
  addiction: number;
  overall: number;
  comment: string;
}

const CardGame = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedGame, setGeneratedGame] = useState<{
    name: string;
    description: string;
    scores: GameScore;
    code?: string;
  } | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [cardCategory, setCardCategory] = useState<GameCategory | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);
  const [customDescription, setCustomDescription] = useState<string>("");
  
  const loadingSteps = useMemo(() => [
    { text: t('cardGame.analyzingMechanics'), icon: Brain },
    { text: t('cardGame.conceptualizing'), icon: Sparkles },
    { text: t('cardGame.generatingCode'), icon: Wand2 },
    { text: t('cardGame.optimizing'), icon: Zap },
    { text: t('cardGame.almostDone'), icon: Gamepad2 },
  ], [t]);

  // 加载卡牌游戏类别
  useEffect(() => {
    const loadCardCategory = async () => {
      try {
        // 尝试通过名称查找"卡牌游戏"类别
        const category = await gameCategoryService.getCategoryByName('卡牌游戏');
        if (category) {
          setCardCategory(category);
        } else {
          // 如果没找到，尝试获取所有类别并筛选
          const categories = await gameCategoryService.getActiveCategories();
          const cardCategory = categories.find(
            cat => cat.name === '卡牌游戏' || cat.name_en === 'Card Games'
          );
          if (cardCategory) {
            setCardCategory(cardCategory);
          } else {
            // Category not found - error handled via toast
            toast.error(t('cardGame.categoryNotFound'));
          }
        }
      } catch (error) {
        ErrorHandler.logError(error, 'CardGame.loadCardCategory');
        toast.error(t('cardGame.loadCategoryError'));
      }
    };

    loadCardCategory();
  }, [t]);

  const handleGenerate = useCallback(async () => {
    // 验证：需要模板或自定义描述
    if (!selectedTemplate && !customDescription.trim()) {
      toast.error(getRandomMessage(t('cardGame.selectTemplateRequired')));
      return;
    }

    if (!cardCategory) {
      toast.error(t('cardGame.categoryNotFound'));
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
      let prompt = "";
      
      // 构建基于类别和模板的提示
      if (customDescription.trim()) {
        prompt = customDescription.trim();
      } else if (selectedTemplate) {
        prompt = `${cardCategory.name} - ${selectedTemplate.name}`;
      } else {
        prompt = `${cardCategory.name} 游戏`;
      }
      
      // 创建默认概念对象
      const concept: GameFusionResult = {
        name: selectedTemplate?.name || cardCategory.name || "自定义卡牌游戏",
        description: selectedTemplate?.description || cardCategory.description || customDescription.trim() || "基于选定模板创建的卡牌游戏",
        scores: {
          creativity: 7,
          playability: 8,
          weirdness: 5,
          addiction: 7,
          overall: 7,
          comment: "基于选定类别和模板生成的卡牌游戏",
        },
      };

      // 使用高可靠性生成器（自动重试和修复）
      let htmlCode = "";
      
      try {
        // 构建生成参数
        const generateInput: Parameters<typeof gameLabService.generateGame>[0] = {
          prompt: prompt,
          categoryId: cardCategory.id,
          templateId: selectedTemplate?.id,
          config: {
            difficulty: selectedTemplate?.difficulty,
          },
        };

        // 增加模板使用次数
        if (selectedTemplate) {
          try {
            await import('@/services/templateService').then(({ templateService }) =>
              templateService.incrementUsageCount(selectedTemplate.id)
            );
          } catch (error) {
            // 静默失败，不影响主流程
            // 错误已通过 ErrorHandler 记录
          }
        }

        // Use high-reliability generator with automatic retry and repair
        const generationResult = await generateGameWithHighReliability(
          generateInput,
          {
            maxRetries: 5,
            useAutoRepair: true,
            strictValidation: true,
            onProgress: (attempt, status) => {
              // Progress tracking (silent in production)
            },
          }
        );

        if (!generationResult.success || !generationResult.htmlCode) {
          // Errors are logged via ErrorHandler
          
          let errorMsg = getRandomMessage(t('cardGame.generationFailed'));
          if (generationResult.errors.length > 0) {
            const lastError = generationResult.errors[generationResult.errors.length - 1];
            if (lastError.includes('HTML提取失败') || lastError.includes('提取')) {
              errorMsg = getRandomMessage(t('cardGame.htmlExtractError'));
            } else if (lastError.includes('验证失败') || lastError.includes('验证')) {
              errorMsg = getRandomMessage(t('cardGame.validationFailed')) || '代码验证失败，请重试';
            }
          }
          
          throw new Error(errorMsg);
        }

        htmlCode = generationResult.htmlCode;
        
        // Warnings are handled silently (logged via ErrorHandler if needed)
      } catch (error: any) {
        ErrorHandler.logError(error, 'CardGame.generateGame');
        let errorMsg = ErrorHandler.getUserMessage(error);
        
        if (error?.status === 429 || error?.message?.includes("429") || error?.code === 'RATE_LIMIT') {
          errorMsg = getRandomMessage(t('cardGame.rateLimit'));
        } else if (error?.status === 402 || error?.message?.includes("402") || error?.code === 'QUOTA_EXCEEDED') {
          errorMsg = getRandomMessage(t('cardGame.quotaExceeded'));
        } else if (error?.status === 500 || error?.message?.includes("500") || error?.code === 'SERVER_ERROR') {
          errorMsg = getRandomMessage(t('cardGame.serverError'));
        }
        
        throw new Error(errorMsg);
      }

      // 完成进度
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      setProgress(100);
      setLoadingStep(loadingSteps.length - 1);
      
      await new Promise(resolve => setTimeout(resolve, 300));

      setGeneratedGame({
        name: concept.name,
        description: concept.description,
        scores: concept.scores,
        code: htmlCode,
      });

      toast.success(getRandomMessage(t('cardGame.success')));
    } catch (error) {
      ErrorHandler.logError(error, 'CardGame.handleGenerate');
      
      let errorMessage = getRandomMessage(t('cardGame.generationFailed'));
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes("fetch") || errorMsg.includes("network") || errorMsg.includes("failed to fetch")) {
          errorMessage = getRandomMessage(t('cardGame.networkError'));
        } else if (errorMsg.includes("429") || errorMsg.includes("rate limit")) {
          errorMessage = getRandomMessage(t('cardGame.rateLimit'));
        } else if (errorMsg.includes("401") || errorMsg.includes("unauthorized")) {
          errorMessage = getRandomMessage(t('cardGame.unauthorized'));
        } else if (errorMsg.includes("500") || errorMsg.includes("server")) {
          errorMessage = getRandomMessage(t('cardGame.serverError'));
        } else if (errorMsg.includes("api key")) {
          errorMessage = getRandomMessage(t('cardGame.apiKeyError'));
        } else if (errorMsg.includes("timeout")) {
          errorMessage = getRandomMessage(t('cardGame.timeout'));
        } else if (errorMsg.includes("extract") || errorMsg.includes("valid HTML")) {
          errorMessage = getRandomMessage(t('cardGame.htmlExtractError'));
        } else if (error.message.length < 100) {
          errorMessage = error.message;
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      if (stepInterval) clearInterval(stepInterval);
      setIsGenerating(false);
      setProgress(0);
      setLoadingStep(0);
    }
  }, [selectedTemplate, customDescription, cardCategory, loadingSteps, t]);

  const handleRegenerate = useCallback(() => {
    setGeneratedGame(null);
    handleGenerate();
  }, [handleGenerate]);

  const handlePlayGame = useCallback(async () => {
    if (!generatedGame?.code) return;

    const title = generatedGame.name;
    let prompt = `${cardCategory?.name || '卡牌游戏'}`;
    if (selectedTemplate) {
      prompt += ` - ${selectedTemplate.name}`;
    }
    if (customDescription.trim()) {
      prompt += ` - ${customDescription.trim()}`;
    }

    if (user) {
      setIsSaving(true);
      try {
        toast.loading(getRandomMessage(t('cardGame.savingGame')) || '正在保存游戏...', { id: 'saving-game' });
        const creation = await creationService.createCreation({
          title,
          prompt,
          html_code: generatedGame.code,
          is_public: false,
        });
        toast.success(getRandomMessage(t('cardGame.gameSaved')) || '游戏已保存！', { id: 'saving-game' });
        navigate(`/studio/${creation.id}`);
      } catch (error) {
        ErrorHandler.logError(error, 'CardGame.handlePlayGame');
        toast.error(ErrorHandler.getUserMessage(error), { id: 'saving-game' });
        // 保存到 sessionStorage 作为后备方案
        sessionStorage.setItem('pending_creation', JSON.stringify({
          code: generatedGame.code,
          prompt,
          title,
        }));
        // 保存 returnUrl 以便登录后返回
        sessionStorage.setItem('returnUrl', '/studio/new');
        navigate('/studio/new');
      } finally {
        setIsSaving(false);
      }
    } else {
      // 未登录用户：保存游戏数据并跳转
      toast.info(getRandomMessage(t('cardGame.previewMode')) || '预览模式：登录后可以保存和编辑你的游戏', {
        duration: 4000,
      });
      sessionStorage.setItem('pending_creation', JSON.stringify({
        code: generatedGame.code,
        prompt,
        title,
      }));
      // 保存 returnUrl 以便登录后返回
      sessionStorage.setItem('returnUrl', '/studio/new');
      navigate('/studio/new');
    }
  }, [generatedGame, cardCategory, selectedTemplate, customDescription, user, navigate, t]);

  const ScoreBar = memo(({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) => (
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
  ));

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
              {t('cardGame.backToHome')}
            </Button>
            
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full px-4 py-1.5 mb-4">
              <CreditCard className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-600">{t('cardGame.badge')}</span>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-gradient-primary">{t('cardGame.title')}</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {t('cardGame.description')}
            </p>
          </div>

          {/* Category Display */}
          {cardCategory && (
            <div className="mb-8 bg-card border rounded-xl p-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{cardCategory.icon || '🃏'}</span>
                <div className="flex-1">
                  <h2 className="font-semibold text-xl mb-1">{cardCategory.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {cardCategory.description || cardCategory.description_en}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Template Selection */}
          {cardCategory && (
            <div className="mb-8 bg-card border rounded-xl p-6">
              <h3 className="font-semibold mb-4">{t('cardGame.templateSelection')}</h3>
              <TemplatePreview
                categoryId={cardCategory.id}
                selectedTemplateId={selectedTemplate?.id}
                onSelect={(template) => setSelectedTemplate(template)}
              />
            </div>
          )}

          {/* Custom Description */}
          <div className="mb-8 bg-card border rounded-xl p-6">
            <h3 className="font-semibold mb-4">{t('cardGame.customDescription')}</h3>
            <Textarea
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder={selectedTemplate 
                ? `基于模板 "${selectedTemplate.name}" 的额外描述...`
                : t('cardGame.customDescriptionPlaceholder')
              }
              className="min-h-[120px]"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {!selectedTemplate && !customDescription.trim() 
                ? getRandomMessage(t('cardGame.selectTemplateRequired'))
                : t('cardGame.customDescriptionHint')
              }
            </p>
          </div>

          {/* Generate Button */}
          <div className="text-center mb-8">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={
                isGenerating ||
                !cardCategory ||
                (!selectedTemplate && !customDescription.trim())
              }
              className="gap-2 px-8"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('cardGame.generating')}
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  {t('cardGame.generateGame')}
                </>
              )}
            </Button>
            {(!cardCategory || (!selectedTemplate && !customDescription.trim())) && (
              <p className="text-sm text-muted-foreground mt-2">
                {getRandomMessage(t('cardGame.selectTemplateRequired'))}
              </p>
            )}
          </div>

          {/* Loading Animation */}
          {isGenerating && (
            <div className="rounded-2xl bg-card border overflow-hidden animate-fade-in mb-8">
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl animate-bounce">
                      {cardCategory?.icon || '🃏'}
                    </div>
                    {selectedTemplate && (
                      <>
                        <Zap className="w-8 h-8 text-yellow-500 mx-2 animate-pulse" />
                        <div className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>
                          📋
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-border bg-muted/30">
                <div className="text-center mb-4">
                  <p className="font-display font-semibold text-foreground animate-fade-in" key={loadingStep}>
                    {loadingSteps[loadingStep]?.text || t('cardGame.generating')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {cardCategory?.name || '卡牌游戏'} {selectedTemplate ? `- ${selectedTemplate.name}` : ''} {t('cardGame.equalsQuestion')}
                  </p>
                </div>
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
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t('cardGame.generating')}</span>
                  <span className="font-mono">{progress}%</span>
                </div>
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
                      <span className="text-sm text-primary font-medium">{getRandomMessage(t('cardGame.success'))}</span>
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
                    <div className="text-xs text-muted-foreground">{t('cardGame.overallScore')}</div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h4 className="font-semibold mb-4">{t('cardGame.aiScore')}</h4>
                <ScoreBar 
                  label={t('cardGame.creativity')} 
                  value={generatedGame.scores.creativity} 
                  icon={Brain}
                  color="bg-purple-500"
                />
                <ScoreBar 
                  label={t('cardGame.playability')} 
                  value={generatedGame.scores.playability} 
                  icon={Gamepad2}
                  color="bg-green-500"
                />
                <ScoreBar 
                  label={t('cardGame.weirdness')} 
                  value={generatedGame.scores.weirdness} 
                  icon={Zap}
                  color="bg-orange-500"
                />
                <ScoreBar 
                  label={t('cardGame.addiction')} 
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
                      <Button 
                        onClick={handlePlayGame} 
                        className="flex-1 gap-2"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('cardGame.saving') || '保存中...'}
                          </>
                        ) : (
                          <>
                            <Gamepad2 className="w-4 h-4" />
                            {t('cardGame.playGame')}
                          </>
                        )}
                      </Button>
                  <Button variant="outline" onClick={handleRegenerate} className="gap-2" disabled={isGenerating}>
                    <Wand2 className="w-4 h-4" />
                    {t('cardGame.regenerate')}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setGeneratedGame(null);
                    setSelectedTemplate(null);
                    setCustomDescription("");
                  }} className="gap-2">
                    <X className="w-4 h-4" />
                    {t('common.back')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default memo(CardGame);
