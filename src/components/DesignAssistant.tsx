import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2, Lightbulb, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";
import { ErrorHandler } from "@/lib/errorHandler";

interface DesignAssistantProps {
  prompt: string;
  onUseOptimized: (optimizedPrompt: string) => void;
}

interface AnalysisResult {
  enhancedDescription?: string;
  coreMechanics?: string[];
  visualStyle?: string;
  playerGoals?: string[];
  suggestedFeatures?: string[];
  optimizedPrompt?: string;
  rawAnalysis?: string;
}

const DesignAssistant = ({ prompt, onUseOptimized }: DesignAssistantProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      toast.error("请先输入游戏描述");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await apiClient.invokeFunction<{ analysis: AnalysisResult }>("design-assistant", {
        prompt: prompt.trim(),
      });

      if (response?.analysis) {
        setAnalysis(response.analysis);
        setIsExpanded(true);
      }
    } catch (error) {
      ErrorHandler.logError(error, 'DesignAssistant.handleAnalyze');
      toast.error(ErrorHandler.getUserMessage(error) || "分析失败，请重试");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseOptimized = () => {
    if (analysis?.optimizedPrompt) {
      onUseOptimized(analysis.optimizedPrompt);
      toast.success("已应用优化后的提示词");
    }
  };

  return (
    <div className="w-full max-w-xl mt-4">
      {/* Analyze Button */}
      {!analysis && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !prompt.trim()}
          className="w-full gap-2 border-dashed"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              AI正在分析你的想法...
            </>
          ) : (
            <>
              <Lightbulb className="w-4 h-4" />
              让AI帮你优化游戏设计
            </>
          )}
        </Button>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 overflow-hidden animate-fade-in">
          {/* Header */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">AI设计建议</span>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {isExpanded && (
            <div className="px-4 pb-4 space-y-4">
              {/* Enhanced Description */}
              {analysis.enhancedDescription && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">✨ 优化后的描述</h4>
                  <p className="text-sm text-foreground">{analysis.enhancedDescription}</p>
                </div>
              )}

              {/* Core Mechanics */}
              {analysis.coreMechanics && analysis.coreMechanics.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">🎮 核心机制</h4>
                  <ul className="text-sm text-foreground space-y-1">
                    {analysis.coreMechanics.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Player Goals */}
              {analysis.playerGoals && analysis.playerGoals.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">🎯 玩家目标</h4>
                  <ul className="text-sm text-foreground space-y-1">
                    {analysis.playerGoals.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Features */}
              {analysis.suggestedFeatures && analysis.suggestedFeatures.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">💡 推荐功能</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.suggestedFeatures.map((item, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full bg-background border border-border"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Visual Style */}
              {analysis.visualStyle && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">🎨 视觉风格</h4>
                  <p className="text-sm text-foreground">{analysis.visualStyle}</p>
                </div>
              )}

              {/* Use Optimized Prompt Button */}
              {analysis.optimizedPrompt && (
                <div className="pt-2 flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleUseOptimized}
                    className="flex-1 gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    使用优化后的提示词
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAnalysis(null)}
                  >
                    关闭
                  </Button>
                </div>
              )}

              {/* Raw Analysis Fallback */}
              {analysis.rawAnalysis && !analysis.optimizedPrompt && (
                <div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{analysis.rawAnalysis}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DesignAssistant;
