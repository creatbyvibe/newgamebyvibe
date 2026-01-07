import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  X,
  Maximize2,
  Minimize2,
  Save,
  Share2,
  Code,
  Eye,
  Loader2,
  Globe,
  Lock,
  Wand2,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import CodeEditor from "./CodeEditor";

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
  const [code, setCode] = useState(initialCode);
  const [previewCode, setPreviewCode] = useState(initialCode);
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showAdvancedCode, setShowAdvancedCode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const words = prompt.split(" ").slice(0, 4).join(" ");
    setTitle(words.charAt(0).toUpperCase() + words.slice(1));
  }, [prompt]);

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
    { label: "🎨 Change colors", prompt: "Change the color scheme to something more vibrant and modern" },
    { label: "✨ Add animations", prompt: "Add smooth animations and transitions" },
    { label: "📱 Mobile friendly", prompt: "Make it fully responsive for mobile devices" },
    { label: "🔊 Add sounds", prompt: "Add sound effects for interactions" },
    { label: "🌙 Dark mode", prompt: "Add a dark mode option" },
    { label: "🎮 More fun", prompt: "Make it more fun and engaging with better interactions" },
  ];

  return (
    <div
      className={`bg-background transition-all duration-300 animate-fade-in ${
        isFullscreen
          ? "fixed inset-0 z-50"
          : "fixed inset-4 z-50 rounded-2xl border border-border shadow-medium overflow-hidden"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Creation title..."
              className="w-64 h-9 font-display font-semibold"
            />
            <div className="flex items-center gap-2">
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
              <Label htmlFor="public-toggle" className="text-sm text-muted-foreground">
                {isPublic ? "Public" : "Private"}
              </Label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {creationId && isPublic && (
              <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !user}
              className="gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8"
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
          {/* Left: AI Edit Panel */}
          <div className="w-80 border-r border-border flex flex-col bg-muted/20">
            {/* AI Edit Section */}
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Wand2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">AI Editor</h3>
                  <p className="text-xs text-muted-foreground">Describe changes in plain language</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => setAiPrompt(action.prompt)}
                      className="px-3 py-1.5 text-xs rounded-full bg-background border border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all"
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
                  placeholder="Tell me what to change...&#10;&#10;Examples:&#10;• Make the background blue&#10;• Add a restart button&#10;• Speed up the game"
                  className="min-h-[120px] resize-none text-sm"
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
                <p className="text-xs text-center text-muted-foreground">
                  Ctrl/Cmd + Enter to apply
                </p>
              </div>
            </div>

            {/* Advanced: Code Editor Toggle */}
            <div className="border-t border-border">
              <button
                onClick={() => setShowAdvancedCode(!showAdvancedCode)}
                className="w-full px-4 py-3 flex items-center justify-between text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  <span>Advanced: Edit Code</span>
                </div>
                {showAdvancedCode ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Right: Preview or Code+Preview */}
          <div className="flex-1 flex">
            {showAdvancedCode ? (
              <>
                {/* Code Editor */}
                <div className="w-1/2 border-r border-border">
                  <CodeEditor code={code} onCodeChange={setCode} onRun={handleRun} />
                </div>
                {/* Preview */}
                <div className="w-1/2 bg-white">
                  <iframe
                    ref={iframeRef}
                    srcDoc={previewCode}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-forms"
                    title="Creation Preview"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 bg-white">
                <iframe
                  ref={iframeRef}
                  srcDoc={previewCode}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-forms"
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