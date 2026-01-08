import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Wand2, Code, Palette, Zap, Gamepad2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "./AuthModal";
import DesignAssistant from "./DesignAssistant";
import { gameLabService } from "@/services/gameLabService";
import { creationService } from "@/services/creationService";
import { ErrorHandler } from "@/lib/errorHandler";
import { useTranslation } from "react-i18next";
import { getRandomMessage } from "@/lib/utils/messageUtils";

// Game-focused suggestions to inspire creativity
const gameSuggestions = [
  "🎮 Pac-Man style maze game",
  "🔨 Whac-A-Mole game",
  "🎲 Dice rolling game",
  "🐍 Snake game",
  "🏓 Pong game",
  "🧩 Memory matching game",
];

const toolSuggestions = [
  "⏱️ Pomodoro timer",
  "🎯 Random picker wheel",
  "📝 Todo list",
  "🎨 Drawing canvas",
];

const weirderSuggestions = [
  "🌈 Mood ring simulator",
  "🔮 Fortune teller",
  "👾 Pixel art pet",
  "🎵 Beat maker",
];

interface AICreatorProps {
  initialPrompt?: string;
  showSuggestions?: boolean;
}

const AICreator = ({ initialPrompt = "", showSuggestions = true }: AICreatorProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const loadingSteps = [
    { icon: Wand2, text: t('aiCreator.understanding'), duration: 2000 },
    { icon: Palette, text: t('aiCreator.designing'), duration: 3000 },
    { icon: Code, text: t('aiCreator.coding'), duration: 4000 },
    { icon: Zap, text: t('aiCreator.addingMagic'), duration: 2000 },
    { icon: Gamepad2, text: t('aiCreator.almostDone'), duration: 1500 },
  ];
  const [input, setInput] = useState(initialPrompt);
  const [isFocused, setIsFocused] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // Update input when initialPrompt changes
  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
    }
  }, [initialPrompt]);

  // Animate loading steps
  useEffect(() => {
    if (!isGenerating) {
      setLoadingStep(0);
      setProgress(0);
      return;
    }

    let stepIndex = 0;
    let progressValue = 0;
    
    const progressInterval = setInterval(() => {
      progressValue += 1;
      // Cap at 95% until actual completion
      setProgress(Math.min(progressValue, 95));
    }, 150);

    const stepInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % loadingSteps.length;
      setLoadingStep(stepIndex);
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isGenerating]);

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Enter or Cmd+Enter to generate
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && input.trim()) {
      e.preventDefault();
      handleCreate();
    }
    // Enter alone just creates new lines (default behavior)
  };

  const handleCreate = async () => {
    if (!input.trim() || isGenerating) return;

    setIsGenerating(true);
    setCurrentPrompt(input.trim());

    try {
      // 使用 gameLabService 生成游戏代码（流式响应）
      const fullContent = await gameLabService.generateGame(
        { prompt: input.trim() },
        (chunk) => {
          // 实时更新进度（可选）
        }
      );

      // Extract HTML from the response
      let htmlCode = fullContent;

      // Remove markdown code blocks if present
      const htmlMatch = fullContent.match(/```html\s*([\s\S]*?)```/);
      if (htmlMatch) {
        htmlCode = htmlMatch[1].trim();
      } else {
        // Try to find raw HTML
        const doctypeMatch = fullContent.match(/(<!DOCTYPE html[\s\S]*<\/html>)/i);
        if (doctypeMatch) {
          htmlCode = doctypeMatch[1];
        }
      }

      setProgress(100);
      
      if (htmlCode && htmlCode.includes("<!DOCTYPE html")) {
        // Small delay to show 100% completion
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Auto-generate title from prompt
        const autoTitle = input.trim().slice(0, 50) + (input.trim().length > 50 ? '...' : '');
        
        if (user) {
          // Logged in: Create draft in database and navigate
          try {
            const creation = await creationService.createCreation({
              title: autoTitle,
              prompt: input.trim(),
              html_code: htmlCode,
              is_public: false,
            });

            toast.success(getRandomMessage(t('aiCreator.creationSuccess')));
            navigate(`/studio/${creation.id}`);
          } catch (error) {
            ErrorHandler.logError(error, 'AICreator.handleCreate');
            // Fallback to session storage
            sessionStorage.setItem('pending_creation', JSON.stringify({
              code: htmlCode,
              prompt: input.trim(),
              title: autoTitle,
            }));
            navigate('/studio/new');
          }
        } else {
          // Not logged in: Store in session storage
          sessionStorage.setItem('pending_creation', JSON.stringify({
            code: htmlCode,
            prompt: input.trim(),
            title: autoTitle,
          }));
          toast.success(getRandomMessage(t('aiCreator.creationSuccess')));
          navigate('/studio/new');
        }
      } else {
        throw new Error(getRandomMessage(t('aiCreator.htmlExtractError')));
      }
    } catch (error) {
      ErrorHandler.logError(error, 'AICreator.handleCreate');
      let errorMessage = ErrorHandler.getUserMessage(error);
      
      // 优化错误消息，让它更风趣
      const errorStr = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
      
      if (errorStr.includes("代码藏得太深") || errorStr.includes("extract") || errorStr.includes("valid html") || errorStr.includes("hide and seek") || errorStr.includes("went MIA")) {
        errorMessage = getRandomMessage(t('aiCreator.htmlExtractError'));
      } else if (errorStr.includes("429") || errorStr.includes("rate limit")) {
        errorMessage = getRandomMessage(t('aiCreator.rateLimit'));
      } else if (errorStr.includes("402") || errorStr.includes("quota")) {
        errorMessage = getRandomMessage(t('aiCreator.quotaExceeded'));
      } else if (errorStr.includes("timeout")) {
        errorMessage = getRandomMessage(t('aiCreator.timeout'));
      } else if (errorStr.includes("network") || errorStr.includes("fetch")) {
        errorMessage = getRandomMessage(t('aiCreator.networkError'));
      } else if (errorStr.includes("500") || errorStr.includes("server")) {
        errorMessage = getRandomMessage(t('aiCreator.serverError'));
      } else if (!errorMessage || errorMessage === "生成失败") {
        errorMessage = getRandomMessage(t('aiCreator.creationFailed'));
      }
      
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const CurrentIcon = loadingSteps[loadingStep].icon;


  return (
    <>
      <div className="w-full max-w-xl">
        {/* Loading State */}
        {isGenerating ? (
          <div className="rounded-2xl bg-card border-2 border-primary shadow-glow overflow-hidden animate-fade-in">
            {/* Preview area with animated gradient */}
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-pulse" />
              
              {/* Animated particles */}
              <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-primary/40"
                    style={{
                      left: `${10 + (i % 4) * 25}%`,
                      top: `${15 + Math.floor(i / 4) * 30}%`,
                      animation: `float ${2 + (i % 3)}s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Pulsing ring */}
                  <div className="absolute inset-0 -m-4 rounded-full bg-primary/20 animate-ping" />
                  <div className="absolute inset-0 -m-2 rounded-full bg-primary/30 animate-pulse" />
                  
                  {/* Icon container */}
                  <div className="relative w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow transition-all duration-500">
                    <CurrentIcon className="w-8 h-8 text-primary-foreground transition-all duration-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Progress section */}
            <div className="p-6 border-t border-border bg-muted/30">
              {/* Step text with animation */}
              <div className="text-center mb-4">
                <p className="font-display font-semibold text-foreground animate-fade-in" key={loadingStep}>
                  {loadingSteps[loadingStep].text}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('aiCreator.creating')}: "{currentPrompt.slice(0, 30)}{currentPrompt.length > 30 ? '...' : ''}"
                </p>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
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
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{t('aiCreator.generating')}</span>
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
        ) : (
          /* Normal Input Container */
          <div
            className={`relative rounded-2xl bg-card border-2 transition-all duration-300 shadow-soft ${
              isFocused
                ? "border-primary shadow-glow"
                : "border-border hover:border-primary/30"
            }`}
          >
            <div className="p-5 pb-16">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('aiCreator.descriptionPlaceholder')}
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-base min-h-[70px]"
                  rows={2}
                  disabled={isGenerating}
                />
              </div>
            </div>

            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between border-t border-border bg-muted/30 rounded-b-2xl">
              <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border border-border">⌘</kbd>
                <span>/</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border border-border">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border border-border">Enter</kbd>
                <span className="ml-1">{t('aiCreator.startCreating')}</span>
              </div>
              <Button
                size="sm"
                className="gap-2"
                disabled={!input.trim() || isGenerating}
                onClick={handleCreate}
              >
                创作
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Suggestions - Categorized */}
        {!isGenerating && showSuggestions && (
          <div className="mt-5 space-y-3 animate-fade-in">
            {/* Games */}
            <div className="flex flex-wrap gap-2 justify-center">
              {gameSuggestions.map((suggestion, index) => (
                <button
                  key={`game-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isGenerating}
                  className="px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-sm text-primary hover:text-primary transition-all duration-200 border border-primary/20 hover:border-primary/40 focus:outline-none focus:ring-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            {/* Tools & Weird stuff */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[...toolSuggestions, ...weirderSuggestions].map((suggestion, index) => (
                <button
                  key={`other-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isGenerating}
                  className="px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 text-sm text-muted-foreground hover:text-primary transition-all duration-200 border border-transparent hover:border-primary/20 focus:outline-none focus:ring-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Design Assistant */}
            {input.trim().length > 5 && (
              <DesignAssistant 
                prompt={input} 
                onUseOptimized={(optimized) => setInput(optimized)} 
              />
            )}
          </div>
        )}
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
};

export default AICreator;
