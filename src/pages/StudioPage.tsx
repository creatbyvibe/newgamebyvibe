import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import StudioHeader from '@/components/studio/StudioHeader';
import FullscreenPreview from '@/components/studio/FullscreenPreview';
import SplitEditor from '@/components/studio/SplitEditor';
import SavesManager from '@/components/studio/SavesManager';
import VersionHistory from '@/components/studio/VersionHistory';
import { Loader2 } from 'lucide-react';
import { creationService } from '@/services/creationService';
import { ErrorHandler } from '@/lib/errorHandler';

interface Creation {
  id: string;
  title: string;
  prompt: string;
  html_code: string;
  is_public: boolean;
  status: string;
  version: number;
  plays: number;
  likes: number;
  created_at: string;
  auto_saved_at: string | null;
}

const StudioPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<'play' | 'edit' | 'saves' | 'versions'>('play');
  const [creation, setCreation] = useState<Creation | null>(null);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('Untitled Creation');
  const [prompt, setPrompt] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isNewCreation, setIsNewCreation] = useState(false);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedCodeRef = useRef<string>('');

  // Save as draft for new creations - 使用 useCallback 包装避免依赖问题
  const saveAsDraft = useCallback(async () => {
    if (!user) return;
    
    const pendingData = sessionStorage.getItem('pending_creation');
    if (!pendingData) return;
    
    try {
      const parsed = JSON.parse(pendingData);
      const creation = await creationService.createCreation({
        title: parsed.title || 'Untitled Creation',
        prompt: parsed.prompt || '',
        html_code: parsed.code || '',
        is_public: false,
      });
      
      // Clear session storage and redirect to the new creation
      sessionStorage.removeItem('pending_creation');
      setIsNewCreation(false);
      setCreation(creation as Creation);
      navigate(`/studio/${creation.id}`, { replace: true });
      
      toast({
        title: 'Draft Saved',
        description: 'Your creation has been saved as a draft',
      });
    } catch (error) {
      ErrorHandler.logError(error, 'StudioPage.saveAsDraft');
      toast({
        title: 'Error',
        description: ErrorHandler.getUserMessage(error),
        variant: 'destructive',
      });
    }
  }, [user, navigate, toast]);

  // Load creation data
  useEffect(() => {
    // 如果认证还在加载，等待完成（最多等待 5 秒后强制继续）
    if (authLoading) {
      const timeoutId = setTimeout(() => {
        console.warn('Auth loading timeout after 5s, proceeding anyway');
        setLoading(false);
      }, 5000);
      
      // 返回清理函数，当 authLoading 变为 false 时会重新触发 useEffect
      return () => {
        clearTimeout(timeoutId);
      };
    }
    
    // 认证加载完成，开始加载数据
    const loadData = async () => {
      try {
        if (id === 'new') {
          // Load from sessionStorage for new/temp creations
          const pendingData = sessionStorage.getItem('pending_creation');
          if (pendingData) {
            try {
              const parsed = JSON.parse(pendingData);
              setCode(parsed.code || '');
              setPrompt(parsed.prompt || '');
              setTitle(parsed.title || 'Untitled Creation');
              lastSavedCodeRef.current = parsed.code || '';
            } catch (e) {
              console.error('Failed to parse pending creation:', e);
            }
          }
          setIsNewCreation(true);
          setLoading(false);
          
          // If user is logged in, auto-save as draft (don't wait for it to block rendering)
          if (user && pendingData) {
            saveAsDraft().catch(error => {
              ErrorHandler.logError(error, 'StudioPage.autoSaveDraft');
              // Don't show error toast for auto-save failures
            });
          }
        } else if (id) {
          // Load from database
          const data = await creationService.getCreationById(id);
          
          if (!data) {
            toast({
              title: 'Error',
              description: 'Failed to load creation',
              variant: 'destructive',
            });
            setLoading(false);
            navigate('/');
            return;
          }
          
          // Check ownership for editing
          if (data.user_id !== user?.id) {
            // Can only view if public, otherwise redirect to public view
            if (!data.is_public) {
              toast({
                title: 'Access Denied',
                description: 'You do not have permission to view this creation',
                variant: 'destructive',
              });
              setLoading(false);
              navigate('/');
              return;
            }
            // If public and not owner, redirect to play-only view
            setLoading(false);
            navigate(`/creation/${id}`);
            return;
          }
          
          // User owns this creation, load for editing
          setCreation(data as Creation);
          setCode(data.html_code);
          setTitle(data.title);
          setPrompt(data.prompt);
          setIsPublic(data.is_public || false);
          lastSavedCodeRef.current = data.html_code;
          setIsNewCreation(false);
          setLoading(false);
        } else {
          // No id, treat as new
          setIsNewCreation(true);
          setLoading(false);
        }
      } catch (error) {
        ErrorHandler.logError(error, 'StudioPage.loadData');
        toast({
          title: 'Error',
          description: ErrorHandler.getUserMessage(error),
          variant: 'destructive',
        });
        setLoading(false);
        // Don't navigate on error, let user see the error message
      }
    };
    
    loadData();
    
    // 清理函数
    return () => {
      // 如果组件卸载，可以在这里清理资源
    };
  }, [id, user, authLoading, navigate, toast, saveAsDraft]);

  // Auto-save logic
  const performAutoSave = useCallback(async () => {
    if (!creation?.id || !user || code === lastSavedCodeRef.current) return;
    
    setSaveStatus('saving');
    
    try {
      await creationService.updateCreation(creation.id, {
        html_code: code,
      });
      
      lastSavedCodeRef.current = code;
      setSaveStatus('saved');
    } catch (error) {
      ErrorHandler.logError(error, 'StudioPage.performAutoSave');
      setSaveStatus('unsaved');
    }
  }, [creation?.id, user, code]);

  // Trigger auto-save on code change
  useEffect(() => {
    if (!creation?.id || code === lastSavedCodeRef.current) return;
    
    setSaveStatus('unsaved');
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      performAutoSave();
    }, 5000); // 5 second debounce
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [code, creation?.id, performAutoSave]);

  // Manual save
  const handleSave = async () => {
    if (isNewCreation && user) {
      // Save new creation first
      sessionStorage.setItem('pending_creation', JSON.stringify({
        code,
        prompt,
        title,
      }));
      await saveAsDraft();
      return;
    }
    
    if (!creation?.id) return;
    
    setSaveStatus('saving');
    
    try {
      // Save current version to history (使用 apiClient)
      const { apiClient } = await import('@/lib/apiClient');
      const { supabase } = await import('@/integrations/supabase/client');
      
      await apiClient.execute(() =>
        supabase.from('creation_versions').insert({
          creation_id: creation.id,
          version: creation.version || 1,
          html_code: lastSavedCodeRef.current,
          change_note: 'Manual save',
        })
      );
      
      // Update creation with new version
      const updatedCreation = await creationService.updateCreation(creation.id, {
        html_code: code,
        title,
      });
      
      lastSavedCodeRef.current = code;
      setCreation(prev => prev ? { ...prev, version: (prev.version || 1) + 1, ...updatedCreation } : null);
      setSaveStatus('saved');
      
      toast({
        title: 'Saved',
        description: 'Your changes have been saved',
      });
    } catch (error) {
      ErrorHandler.logError(error, 'StudioPage.handleSave');
      setSaveStatus('unsaved');
      toast({
        title: 'Save Failed',
        description: ErrorHandler.getUserMessage(error),
        variant: 'destructive',
      });
    }
  };

  // Toggle public/private
  const handleTogglePublic = async () => {
    if (!creation?.id) return;
    
    try {
      const newStatus = !isPublic;
      await creationService.updateCreation(creation.id, {
        is_public: newStatus,
      });
      
      setIsPublic(newStatus);
      setCreation(prev => prev ? { ...prev, is_public: newStatus } : null);
      toast({
        title: newStatus ? 'Published' : 'Unpublished',
        description: newStatus 
          ? 'Your creation is now public and can be shared'
          : 'Your creation is now private',
      });
    } catch (error) {
      ErrorHandler.logError(error, 'StudioPage.handleTogglePublic');
      toast({
        title: 'Error',
        description: ErrorHandler.getUserMessage(error),
        variant: 'destructive',
      });
    }
  };

  // Handle code update from AI
  const handleCodeUpdate = (newCode: string) => {
    setCode(newCode);
  };

  // Restore version
  const handleRestoreVersion = async (versionCode: string, versionNumber: number) => {
    setCode(versionCode);
    setMode('edit');
    toast({
      title: 'Version Restored',
      description: `Restored to version ${versionNumber}. Save to keep changes.`,
    });
  };

  if (loading || authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <StudioHeader
        title={title}
        onTitleChange={setTitle}
        saveStatus={saveStatus}
        isPublic={isPublic}
        onSave={handleSave}
        onTogglePublic={handleTogglePublic}
        creationId={creation?.id}
        isNewCreation={isNewCreation}
        version={creation?.version}
      />
      
      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="flex-1 flex flex-col">
        <div className="border-b bg-muted/30 px-4">
          <TabsList className="h-12 bg-transparent">
            <TabsTrigger value="play" className="data-[state=active]:bg-background">
              🎮 Play
            </TabsTrigger>
            <TabsTrigger value="edit" className="data-[state=active]:bg-background">
              ✏️ Edit
            </TabsTrigger>
            <TabsTrigger value="saves" className="data-[state=active]:bg-background">
              💾 Saves
            </TabsTrigger>
            <TabsTrigger value="versions" className="data-[state=active]:bg-background">
              📜 History
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="play" className="flex-1 m-0 p-0">
          <FullscreenPreview code={code} creationId={creation?.id} />
        </TabsContent>
        
        <TabsContent value="edit" className="flex-1 m-0 p-0">
          <SplitEditor 
            code={code} 
            prompt={prompt}
            onCodeChange={handleCodeUpdate}
            creationId={creation?.id}
          />
        </TabsContent>
        
        <TabsContent value="saves" className="flex-1 m-0 overflow-auto">
          <SavesManager creationId={creation?.id} />
        </TabsContent>
        
        <TabsContent value="versions" className="flex-1 m-0 overflow-auto">
          <VersionHistory 
            creationId={creation?.id} 
            onRestore={handleRestoreVersion}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudioPage;
