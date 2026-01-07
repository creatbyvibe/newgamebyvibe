import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Wand2, Code, Palette, Zap, Gamepad2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "./AuthModal";
import CreationEditor from "./CreationEditor";

const suggestions = [
  "A bouncing ball game",
  "Random decision maker",
  "Meme generator",
  "Focus timer",
];

const loadingSteps = [
  { icon: Wand2, text: "Understanding your idea...", duration: 2000 },
  { icon: Palette, text: "Designing the interface...", duration: 3000 },
  { icon: Code, text: "Writing the code...", duration: 4000 },
  { icon: Zap, text: "Adding magic touches...", duration: 2000 },
  { icon: Gamepad2, text: "Almost ready...", duration: 1500 },
];

const AICreator = () => {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);

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
    setGeneratedCode(null);
    setCurrentPrompt(input.trim());

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-creation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt: input.trim() }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
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
            if (content) {
              fullContent += content;
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

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
        setGeneratedCode(htmlCode);
        toast.success("Creation generated!");
      } else {
        throw new Error("Could not extract valid HTML");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setGeneratedCode(null);
    setInput("");
    setCurrentPrompt("");
  };

  const handleSaved = (id: string) => {
    toast.success("Your creation has been saved to your gallery!");
  };

  // Show editor when code is generated
  if (generatedCode) {
    return (
      <>
        <CreationEditor
          initialCode={generatedCode}
          prompt={currentPrompt}
          onClose={handleClose}
          onSaved={handleSaved}
        />
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </>
    );
  }

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
                  Creating: "{currentPrompt.slice(0, 30)}{currentPrompt.length > 30 ? '...' : ''}"
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
                <span>Generating</span>
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
                  placeholder="Describe what you want to create..."
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
                <span className="ml-1">to create</span>
              </div>
              <Button
                size="sm"
                className="gap-2"
                disabled={!input.trim() || isGenerating}
                onClick={handleCreate}
              >
                Create
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {!isGenerating && (
          <div className="mt-5 flex flex-wrap gap-2 justify-center animate-fade-in">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isGenerating}
                className="px-4 py-2 rounded-full bg-muted hover:bg-primary/10 text-sm text-muted-foreground hover:text-primary transition-all duration-200 border border-transparent hover:border-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
};

export default AICreator;
