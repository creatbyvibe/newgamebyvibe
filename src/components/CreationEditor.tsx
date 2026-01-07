import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  X,
  Maximize2,
  Minimize2,
  Save,
  Share2,
  Code,
  Loader2,
  Globe,
  Lock,
  Wand2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import CodeEditor from "./CodeEditor";
import { useIsMobile } from "@/hooks/use-mobile";

interface CreationEditorProps {
  initialCode: string;
  prompt: string;
  creationId?: string;
  onClose: () => void;
  onSaved?: (id: string) => void;
}

const CreationEditor = ({
  initialCode,
  prompt,
  creationId,
  onClose,
  onSaved,
}: CreationEditorProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [code, setCode] = useState(initialCode);
  const [previewCode, setPreviewCode] = useState(initialCode);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showAdvancedCode, setShowAdvancedCode] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(!isMobile);
  const [saving, setSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync code when initialCode changes (e.g., after AI generation)
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setPreviewCode(initialCode);
    }
  }, [initialCode]);

  // Force iframe to remount whenever previewCode changes (avoids occasional blank srcDoc rendering)
  useEffect(() => {
    setPreviewNonce((n) => n + 1);
    console.log("[CreationEditor] previewCode updated", { length: previewCode?.length ?? 0 });
  }, [previewCode]);

  useEffect(() => {
    const words = prompt.split(" ").slice(0, 4).join(" ");
    setTitle(words.charAt(0).toUpperCase() + words.slice(1));
  }, [prompt]);

  // Handle messages from iframe (for cloud save functionality)
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (!event.data?.type) return;
      
      const { type, data } = event.data;
      
      if (type === 'GAME_SAVE' && user && creationId) {
        try {
          const response = await supabase.functions.invoke('game-save', {
            body: {
              action: 'save',
              creationId,
              saveSlot: data?.slot || 1,
              saveData: data?.saveData || data,
              saveName: data?.name || 'Auto Save',
            },
          });
          
          if (response.error) throw response.error;
          
          // Notify game of successful save
          iframeRef.current?.contentWindow?.postMessage(
            { type: 'GAME_SAVE_SUCCESS', slot: data?.slot || 1 },
            '*'
          );
          toast.success('游戏已保存到云端');
        } catch (error) {
          console.error('Cloud save error:', error);
          iframeRef.current?.contentWindow?.postMessage(
            { type: 'GAME_SAVE_ERROR', error: 'Save failed' },
            '*'
          );
        }
      }
      
      if (type === 'GAME_LOAD_REQUEST' && user && creationId) {
        try {
          const response = await supabase.functions.invoke('game-save', {
            body: {
              action: 'load',
              creationId,
              saveSlot: data?.slot || 1,
            },
          });
          
          if (response.error) throw response.error;
          
          // Send save data back to game
          iframeRef.current?.contentWindow?.postMessage(
            { 
              type: 'GAME_LOAD_RESPONSE', 
              saveData: response.data?.save?.save_data || null,
              slot: data?.slot || 1,
            },
            '*'
          );
        } catch (error) {
          console.error('Cloud load error:', error);
          iframeRef.current?.contentWindow?.postMessage(
            { type: 'GAME_LOAD_RESPONSE', saveData: null, error: 'Load failed' },
            '*'
          );
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, creationId]);

  const handleRun = () => {
    setPreviewCode(code);
    toast.success("Preview updated!");
  };

  const handleAIModify = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please describe what you want to change");
      return;
    }

    setAiLoading(true);
    try {
      const response = await supabase.functions.invoke("ai-code-assist", {
        body: { 
          prompt: aiPrompt.trim(),
          currentCode: code 
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const newCode = response.data?.code;
      if (newCode) {
        setCode(newCode);
        setPreviewCode(newCode);
        setAiPrompt("");
        toast.success("Changes applied!");
      } else {
        throw new Error("No code returned");
      }
    } catch (error) {
      console.error("AI assist error:", error);
      toast.error("Failed to apply changes. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Please sign in to save");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setSaving(true);
    try {
      if (creationId) {
        const { error } = await supabase
          .from("creations")
          .update({
            title: title.trim(),
            html_code: code,
            is_public: isPublic,
          })
          .eq("id", creationId);

        if (error) throw error;
        toast.success("Creation updated!");
      } else {
        const { data, error } = await supabase
          .from("creations")
          .insert({
            user_id: user.id,
            title: title.trim(),
            prompt,
            html_code: code,
            is_public: isPublic,
          })
          .select()
          .single();

        if (error) throw error;
        toast.success("Creation saved!");
        if (onSaved && data) {
          onSaved(data.id);
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!isPublic) {
      toast.error("Make your creation public to share");
      return;
    }
    
    const url = `${window.location.origin}/creation/${creationId}`;
    await navigator.clipboard.writeText(url);
    toast.success("Share link copied!");
  };

  const quickActions = [
    // Game mechanics
    { label: "🏆 Score", prompt: "Add a scoring system that tracks points" },
    { label: "❤️ Lives", prompt: "Add a lives/health system with game over" },
    { label: "⏱️ Timer", prompt: "Add a countdown timer challenge" },
    { label: "📈 Levels", prompt: "Add difficulty levels that increase over time" },
    // Visual & Audio
    { label: "✨ Animate", prompt: "Add smooth animations and visual effects" },
    { label: "🔊 Sounds", prompt: "Add sound effects for actions and events" },
    { label: "🎨 Colors", prompt: "Make the colors more vibrant and appealing" },
    { label: "🌙 Dark", prompt: "Add dark mode toggle" },
    // Gameplay
    { label: "👾 Enemies", prompt: "Add enemies or obstacles to avoid" },
    { label: "💎 Items", prompt: "Add collectible items and power-ups" },
    { label: "🎯 Goals", prompt: "Add clear goals and win conditions" },
    { label: "📱 Mobile", prompt: "Optimize for touch controls on mobile" },
  ];

  // AI Panel Content (reusable for both desktop sidebar and mobile sheet)
  const AIEditPanel = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
            <Wand2 className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-foreground">AI Editor</h3>
            <p className="text-xs text-muted-foreground truncate">Describe changes in plain language</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Quick Actions</p>
          <div className="flex flex-wrap gap-1.5">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => setAiPrompt(action.prompt)}
                className="px-2.5 py-1 text-xs rounded-full bg-background border border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Input */}
        <div className="space-y-3">
          <Textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Tell me what to change..."
            className="min-h-[100px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                handleAIModify();
              }
            }}
          />
          <Button
            onClick={handleAIModify}
            disabled={aiLoading || !aiPrompt.trim()}
            className="w-full gap-2"
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Apply Changes
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground hidden sm:block">
            Ctrl/Cmd + Enter to apply
          </p>
        </div>
      </div>

      {/* Advanced: Code Editor Toggle */}
      <div className="border-t border-border mt-auto">
        <button
          onClick={() => setShowAdvancedCode(!showAdvancedCode)}
          className="w-full px-4 py-3 flex items-center justify-between text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            <span>Advanced: Code</span>
          </div>
          {showAdvancedCode ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`bg-background transition-all duration-300 animate-fade-in ${
        isFullscreen
          ? "fixed inset-0 z-50"
          : "fixed inset-2 sm:inset-4 z-50 rounded-2xl border border-border shadow-medium overflow-hidden"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 border-b border-border bg-muted/30 gap-2">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* Mobile: AI Panel Toggle */}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0">
                    <Wand2 className="w-4 h-4 text-primary" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0">
                  <AIEditPanel />
                </SheetContent>
              </Sheet>
            )}
            
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title..."
              className="w-full sm:w-48 md:w-64 h-9 font-display font-semibold text-sm"
            />
            
            <div className="hidden sm:flex items-center gap-2">
              {isPublic ? (
                <Globe className="w-4 h-4 text-primary" />
              ) : (
                <Lock className="w-4 h-4 text-muted-foreground" />
              )}
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
                id="public-toggle"
              />
              <Label htmlFor="public-toggle" className="text-sm text-muted-foreground hidden md:inline">
                {isPublic ? "Public" : "Private"}
              </Label>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Mobile: Public Toggle */}
            <div className="flex sm:hidden items-center gap-1">
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
                id="public-toggle-mobile"
              />
            </div>

            {creationId && isPublic && (
              <Button variant="ghost" size="icon" onClick={handleShare} className="h-8 w-8 hidden sm:flex">
                <Share2 className="w-4 h-4" />
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !user}
              className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Save</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 hidden sm:flex"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>

            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: AI Edit Panel (Desktop only) */}
          {!isMobile && (
            <div className="w-64 lg:w-80 border-r border-border flex-shrink-0 bg-muted/20">
              <AIEditPanel />
            </div>
          )}

          {/* Right: Preview or Code+Preview */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {showAdvancedCode ? (
              <>
                {/* Code Editor */}
                <div className="h-1/2 md:h-full md:w-1/2 border-b md:border-b-0 md:border-r border-border">
                  <CodeEditor code={code} onCodeChange={setCode} onRun={handleRun} />
                </div>
                {/* Preview */}
                <div className="h-1/2 md:h-full md:w-1/2 bg-white">
                  <iframe
                    key={previewNonce}
                    ref={iframeRef}
                    srcDoc={previewCode}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-forms allow-modals"
                    title="Creation Preview"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 bg-white">
                <iframe
                  key={previewNonce}
                  ref={iframeRef}
                  srcDoc={previewCode}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-forms allow-modals"
                  title="Creation Preview"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreationEditor;