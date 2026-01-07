import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

const suggestions = [
  "A bouncing ball game",
  "Random decision maker",
  "Meme generator",
  "Focus timer",
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
              placeholder="Describe what you want to create..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-base min-h-[70px]"
              rows={2}
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between border-t border-border bg-muted/30 rounded-b-2xl">
          <span className="text-sm text-muted-foreground hidden sm:block">
            Press Enter to create
          </span>
          <Button size="sm" className="gap-2" disabled={!input.trim()}>
            Create
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Suggestions */}
      <div className="mt-5 flex flex-wrap gap-2 justify-center">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="px-4 py-2 rounded-full bg-muted hover:bg-primary/10 text-sm text-muted-foreground hover:text-primary transition-all duration-200 border border-transparent hover:border-primary/20"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AICreator;
