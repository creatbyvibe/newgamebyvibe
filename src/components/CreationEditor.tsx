import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import CodeEditor from "./CodeEditor";
import AICodeAssistant from "./AICodeAssistant";

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
  const [isFullscreen, setIsFullscreen] = useState(true); // Default to fullscreen for better UX
  const [showCode, setShowCode] = useState(false);
  const [saving, setSaving] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Generate title from prompt
    const words = prompt.split(" ").slice(0, 4).join(" ");
    setTitle(words.charAt(0).toUpperCase() + words.slice(1));
  }, [prompt]);

  const handleRun = () => {
    setPreviewCode(code);
    toast.success("Preview updated!");
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
        // Update existing
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
        // Create new
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCode(!showCode)}
              className="gap-2"
            >
              {showCode ? <Eye className="w-4 h-4" /> : <Code className="w-4 h-4" />}
              {showCode ? "Preview" : "Code"}
            </Button>
            
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
        <div className={`flex-1 flex ${isFullscreen ? "h-[calc(100vh-57px)]" : "h-[500px]"}`}>
          {showCode ? (
            <div className="flex-1 flex relative">
              {/* Code Editor */}
              <div className="w-1/2 border-r border-border relative">
                <CodeEditor code={code} onCodeChange={setCode} onRun={handleRun} />
                <AICodeAssistant 
                  currentCode={code} 
                  onCodeUpdate={(newCode) => {
                    setCode(newCode);
                    setPreviewCode(newCode);
                  }} 
                />
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
            </div>
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
  );
};

export default CreationEditor;
