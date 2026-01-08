import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Loader2, X, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";
import { ErrorHandler } from "@/lib/errorHandler";

interface AICodeAssistantProps {
  currentCode: string;
  onCodeUpdate: (newCode: string) => void;
}

const AICodeAssistant = ({ currentCode, onCodeUpdate }: AICodeAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe what you want to change");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.invokeFunction<{ code: string }>("ai-code-assist", {
        prompt: prompt.trim(),
        currentCode,
      });

      if (response?.code) {
        onCodeUpdate(response.code);
        setPrompt("");
        setIsOpen(false);
        toast.success("代码已更新！");
      } else {
        throw new Error("未返回代码");
      }
    } catch (error) {
      ErrorHandler.logError(error, 'AICodeAssistant.handleSubmit');
      toast.error(ErrorHandler.getUserMessage(error) || "更新代码失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: "Add animation", prompt: "Add smooth animations and transitions to make it more interactive" },
    { label: "Improve design", prompt: "Improve the visual design with better colors, shadows, and modern styling" },
    { label: "Make mobile-friendly", prompt: "Make it fully responsive and mobile-friendly" },
    { label: "Add sounds", prompt: "Add sound effects for interactions using Web Audio API" },
    { label: "Fix bugs", prompt: "Review and fix any potential bugs or issues in the code" },
    { label: "Add dark mode", prompt: "Add a dark mode toggle with appropriate color schemes" },
  ];

  if (!isOpen) {
    return (
      <div className="absolute bottom-4 left-4 z-10">
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          variant="outline"
          className="gap-2 bg-background/95 backdrop-blur-sm shadow-lg border-primary/30 hover:border-primary/50"
        >
          <Wand2 className="w-4 h-4 text-primary" />
          <span className="text-primary font-medium">AI Assist</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 right-4 z-10 bg-background/95 backdrop-blur-sm rounded-xl border border-border shadow-lg p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-medium text-foreground">AI Code Assistant</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-7 w-7"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => setPrompt(action.prompt)}
            className="px-3 py-1.5 text-xs rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to change... (e.g., 'Add a score counter' or 'Change colors to blue theme')"
          className="min-h-[80px] resize-none text-sm flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              handleSubmit();
            }
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-muted-foreground">
          Ctrl/Cmd + Enter to submit
        </span>
        <Button
          onClick={handleSubmit}
          disabled={loading || !prompt.trim()}
          size="sm"
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Apply Changes
        </Button>
      </div>
    </div>
  );
};

export default AICodeAssistant;