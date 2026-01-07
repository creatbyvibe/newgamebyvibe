import { useState, useRef, useEffect, useCallback } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Code, MessageSquare, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import CodeEditor from '@/components/CodeEditor';

interface SplitEditorProps {
  code: string;
  prompt: string;
  onCodeChange: (code: string) => void;
  creationId?: string;
}

const SplitEditor = ({ code, prompt, onCodeChange, creationId }: SplitEditorProps) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'code'>('ai');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Update iframe when code changes
  useEffect(() => {
    if (iframeRef.current && code) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(code);
        doc.close();
      }
    }
  }, [code]);

  // Handle game save messages
  const handleMessage = useCallback(async (event: MessageEvent) => {
    if (!user || !creationId) return;

    if (event.data.type === 'GAME_SAVE') {
      try {
        const { slotId, saveName, data } = event.data;
        
        const { data: existing } = await supabase
          .from('game_saves')
          .select('id')
          .eq('user_id', user.id)
          .eq('creation_id', creationId)
          .eq('save_slot', slotId || 1)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('game_saves')
            .update({
              save_data: data,
              save_name: saveName,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('game_saves')
            .insert({
              user_id: user.id,
              creation_id: creationId,
              save_slot: slotId || 1,
              save_name: saveName,
              save_data: data,
            });
        }

        iframeRef.current?.contentWindow?.postMessage({
          type: 'GAME_SAVE_RESULT',
          success: true,
        }, '*');
      } catch (error) {
        console.error('Save failed:', error);
      }
    }

    if (event.data.type === 'GAME_LOAD_REQUEST') {
      try {
        const { slotId } = event.data;
        
        const { data: saveData } = await supabase
          .from('game_saves')
          .select('save_data, save_name')
          .eq('user_id', user.id)
          .eq('creation_id', creationId)
          .eq('save_slot', slotId || 1)
          .maybeSingle();

        iframeRef.current?.contentWindow?.postMessage({
          type: 'GAME_LOAD_RESULT',
          success: true,
          data: saveData?.save_data || null,
          saveName: saveData?.save_name,
        }, '*');
      } catch (error) {
        console.error('Load failed:', error);
      }
    }
  }, [user, creationId]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // AI modification
  const handleAIModify = async () => {
    if (!aiPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setChatHistory(prev => [...prev, { role: 'user', content: aiPrompt }]);
    
    try {
      const response = await supabase.functions.invoke('ai-code-assist', {
        body: {
          prompt: aiPrompt,
          currentCode: code,
          context: prompt,
        },
      });

      if (response.error) throw response.error;

      const newCode = response.data?.code || code;
      const explanation = response.data?.explanation || 'Code updated successfully';
      
      onCodeChange(newCode);
      setChatHistory(prev => [...prev, { role: 'ai', content: explanation }]);
      setAiPrompt('');
      
      toast({
        title: 'Code Updated',
        description: 'AI has modified your game',
      });
    } catch (error) {
      console.error('AI modification failed:', error);
      setChatHistory(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
      toast({
        title: 'Error',
        description: 'Failed to modify code',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current && code) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(code);
        doc.close();
      }
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Left Panel - Preview */}
      <ResizablePanel defaultSize={55} minSize={30}>
        <div className="h-full flex flex-col">
          <div className="h-10 border-b flex items-center justify-between px-3 bg-muted/30">
            <span className="text-sm font-medium">Preview</span>
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 bg-black">
            {code ? (
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                title="Game Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No content to preview
              </div>
            )}
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right Panel - AI/Code Editor */}
      <ResizablePanel defaultSize={45} minSize={25}>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'ai' | 'code')} className="h-full flex flex-col">
          <div className="border-b">
            <TabsList className="w-full justify-start rounded-none h-10 bg-muted/30">
              <TabsTrigger value="ai" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <Code className="w-4 h-4" />
                Code
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ai" className="flex-1 m-0 flex flex-col">
            {/* Chat History */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Wand2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Ask AI to modify your game</p>
                  <p className="text-sm mt-1">e.g., "Make the player move faster" or "Add a score counter"</p>
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-8'
                        : 'bg-muted mr-8'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))
              )}
              {isGenerating && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe what you want to change..."
                  className="min-h-[80px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAIModify();
                    }
                  }}
                />
              </div>
              <Button 
                className="w-full mt-2" 
                onClick={handleAIModify}
                disabled={!aiPrompt.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Apply Changes
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="code" className="flex-1 m-0">
            <CodeEditor
              code={code}
              onCodeChange={onCodeChange}
              onRun={handleRefresh}
            />
          </TabsContent>
        </Tabs>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default SplitEditor;
