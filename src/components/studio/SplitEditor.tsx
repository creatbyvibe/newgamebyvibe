import { useState, useRef, useEffect, useCallback } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Code, MessageSquare, RefreshCw, Undo2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import CodeEditor from '@/components/CodeEditor';
import AISkills from './AISkills';

interface SplitEditorProps {
  code: string;
  prompt: string;
  onCodeChange: (code: string) => void;
  creationId?: string;
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  previousCode?: string;
}

const SplitEditor = ({ code, prompt, onCodeChange, creationId }: SplitEditorProps) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'code'>('ai');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Example prompts based on context
  const examplePrompts = [
    "让玩家移动更快",
    "添加一个计分系统",
    "改变背景颜色为渐变色",
    "添加游戏结束画面",
  ];

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

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

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
  const handleAIModify = async (customPrompt?: string) => {
    const promptToUse = customPrompt || aiPrompt;
    if (!promptToUse.trim() || isGenerating) return;

    setIsGenerating(true);
    const currentCode = code;
    setChatHistory(prev => [...prev, { role: 'user', content: promptToUse }]);
    
    try {
      const response = await apiClient.invokeFunction<{ code: string; explanation?: string }>('ai-code-assist', {
        prompt: promptToUse,
        currentCode: code,
        context: prompt,
      });

      const newCode = response?.code || code;
      const explanation = response?.explanation || '✅ 代码已更新成功';
      
      onCodeChange(newCode);
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        content: explanation,
        previousCode: currentCode 
      }]);
      setAiPrompt('');
      
      toast({
        title: '修改成功',
        description: 'AI 已更新你的作品',
      });
    } catch (error) {
      console.error('AI modification failed:', error);
      ErrorHandler.logError(error, 'SplitEditor.handleAIGenerate');
      setChatHistory(prev => [...prev, { role: 'ai', content: `❌ ${ErrorHandler.getUserMessage(error) || '抱歉，遇到了一些问题。请重试。'}` }]);
      toast({
        title: '出错了',
        description: ErrorHandler.getUserMessage(error) || '修改失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUndo = (previousCode: string) => {
    onCodeChange(previousCode);
    toast({
      title: '已撤销',
      description: '代码已恢复到上一个版本',
    });
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
            <span className="text-sm font-medium">预览</span>
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
                暂无内容
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
                AI 助手
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <Code className="w-4 h-4" />
                代码
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ai" className="flex-1 m-0 flex flex-col overflow-hidden">
            {/* AI Skills */}
            <div className="p-3 border-b bg-muted/20">
              <AISkills 
                onSelectSkill={(skillPrompt) => handleAIModify(skillPrompt)} 
                disabled={isGenerating}
              />
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {chatHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Wand2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium mb-2">让 AI 帮你修改作品</p>
                  <p className="text-sm text-muted-foreground mb-4">选择上方的技能或输入你的想法</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {examplePrompts.map((example, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => setAiPrompt(example)}
                        className="text-xs"
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-8'
                        : 'bg-muted mr-8'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === 'ai' && msg.previousCode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUndo(msg.previousCode!)}
                        className="mt-2 h-7 text-xs gap-1 opacity-70 hover:opacity-100"
                      >
                        <Undo2 className="w-3 h-3" />
                        撤销这次修改
                      </Button>
                    )}
                  </div>
                ))
              )}
              {isGenerating && (
                <div className="flex items-center gap-2 text-muted-foreground p-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI 正在思考...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4 bg-background">
              <div className="flex gap-2">
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="描述你想要的修改..."
                  className="min-h-[60px] max-h-[120px] resize-none"
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
                onClick={() => handleAIModify()}
                disabled={!aiPrompt.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    应用修改
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
