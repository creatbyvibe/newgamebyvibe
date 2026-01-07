import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Lightbulb } from "lucide-react";

const suggestions = [
  "帮我做一个弹球小游戏",
  "做一个选择困难症决策器",
  "生成一个表情包制作工具",
  "创建一个专注计时器",
];

const AICreator = () => {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="w-full max-w-xl">
      {/* Input Container */}
      <div
        className={`relative rounded-2xl bg-card border-2 transition-all duration-300 ${
          isFocused
            ? "border-primary shadow-glow"
            : "border-border hover:border-muted-foreground/50"
        }`}
      >
        {/* Textarea */}
        <div className="p-4 pb-16">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg gradient-neon flex items-center justify-center flex-shrink-0 mt-1">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="描述你想做什么..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-base min-h-[60px]"
              rows={2}
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between border-t border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">按 Enter 快速创建</span>
          </div>
          <Button
            size="sm"
            className="gap-2"
            disabled={!input.trim()}
          >
            开始创作
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Suggestions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 border border-border hover:border-primary/50"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AICreator;
