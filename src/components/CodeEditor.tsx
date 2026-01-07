import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  onRun: () => void;
}

const CodeEditor = ({ code, onCodeChange, onRun }: CodeEditorProps) => {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = code.split("\n");
  const lineCount = lines.length;

  useEffect(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, [code]);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      onCodeChange(newCode);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e2e] rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-[#313244]">
        <span className="text-xs text-[#a6adc8] font-mono">HTML / CSS / JS</span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-7 px-2 text-[#a6adc8] hover:text-white hover:bg-[#313244]"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
          <Button
            size="sm"
            onClick={onRun}
            className="h-7 px-3 gap-1.5 bg-primary hover:bg-primary/90"
          >
            <Play className="w-3.5 h-3.5" />
            Run
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line numbers */}
        <div
          ref={lineNumbersRef}
          className="w-12 py-3 pr-2 text-right font-mono text-xs text-[#6c7086] bg-[#181825] overflow-hidden select-none"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="leading-6 h-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code area */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className="flex-1 p-3 bg-transparent text-[#cdd6f4] font-mono text-sm leading-6 resize-none outline-none overflow-auto"
          spellCheck={false}
          style={{ tabSize: 2 }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
