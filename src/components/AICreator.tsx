import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
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

const AICreator = () => {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim()) {
      e.preventDefault();
      handleCreate();
    }
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

      if (htmlCode && htmlCode.includes("<!DOCTYPE html")) {
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

  return (
    <>
      <div className="w-full max-w-xl">
        {/* Input Container */}
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
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                )}
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
            <span className="text-sm text-muted-foreground hidden sm:block">
              {isGenerating ? "Generating your creation..." : "Press Enter to create"}
            </span>
            <Button
              size="sm"
              className="gap-2"
              disabled={!input.trim() || isGenerating}
              onClick={handleCreate}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mt-5 flex flex-wrap gap-2 justify-center">
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
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
};

export default AICreator;
