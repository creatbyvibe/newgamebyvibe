import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import StudioHeader from '@/components/studio/StudioHeader';
import FullscreenPreview from '@/components/studio/FullscreenPreview';
import SplitEditor from '@/components/studio/SplitEditor';
import SavesManager from '@/components/studio/SavesManager';
import VersionHistory from '@/components/studio/VersionHistory';
import { Loader2 } from 'lucide-react';

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

  // Load creation data
  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;
      
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
        
        // If user is logged in, auto-save as draft
        if (user && pendingData) {
          await saveAsDraft();
        }
      } else if (id) {
        // Load from database
        const { data, error } = await supabase
          .from('creations')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error || !data) {
          toast({
            title: 'Error',
            description: 'Failed to load creation',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }
        
        // Check ownership for editing
        if (data.user_id !== user?.id) {
          // Can only view if public
          if (!data.is_public) {
            toast({
              title: 'Access Denied',
              description: 'You do not have permission to view this creation',
              variant: 'destructive',
            });
            navigate('/');
            return;
          }
          // Redirect to play-only view
          navigate(`/creation/${id}`);
          return;
        }
        
        setCreation(data as Creation);
        setCode(data.html_code);
        setTitle(data.title);
        setPrompt(data.prompt);
        setIsPublic(data.is_public || false);
        lastSavedCodeRef.current = data.html_code;
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, user, authLoading, navigate, toast]);

  // Save as draft for new creations
  const saveAsDraft = async () => {
    if (!user) return;
    
    const pendingData = sessionStorage.getItem('pending_creation');
    if (!pendingData) return;
    
    try {
      const parsed = JSON.parse(pendingData);
      const { data, error } = await supabase
        .from('creations')
        .insert({
          user_id: user.id,
          title: parsed.title || 'Untitled Creation',
          prompt: parsed.prompt || '',
          html_code: parsed.code || '',
          status: 'draft',
          is_public: false,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Clear session storage and redirect to the new creation
      sessionStorage.removeItem('pending_creation');
      setIsNewCreation(false);
      setCreation(data as Creation);
      navigate(`/studio/${data.id}`, { replace: true });
      
      toast({
        title: 'Draft Saved',
        description: 'Your creation has been saved as a draft',
      });
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  // Auto-save logic
  const performAutoSave = useCallback(async () => {
    if (!creation?.id || !user || code === lastSavedCodeRef.current) return;
    
    setSaveStatus('saving');
    
    try {
      const { error } = await supabase
        .from('creations')
        .update({
          html_code: code,
          auto_saved_at: new Date().toISOString(),
        })
        .eq('id', creation.id);
      
      if (error) throw error;
      
      lastSavedCodeRef.current = code;
      setSaveStatus('saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
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
      // Save current version to history
      await supabase.from('creation_versions').insert({
        creation_id: creation.id,
        version: creation.version,
        html_code: lastSavedCodeRef.current,
        change_note: 'Manual save',
      });
      
      // Update creation with new version
      const { error } = await supabase
        .from('creations')
        .update({
          html_code: code,
          title,
          version: creation.version + 1,
          auto_saved_at: new Date().toISOString(),
        })
        .eq('id', creation.id);
      
      if (error) throw error;
      
      lastSavedCodeRef.current = code;
      setCreation(prev => prev ? { ...prev, version: prev.version + 1 } : null);
      setSaveStatus('saved');
      
      toast({
        title: 'Saved',
        description: 'Your changes have been saved',
      });
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('unsaved');
      toast({
        title: 'Save Failed',
        description: 'Failed to save your changes',
        variant: 'destructive',
      });
    }
  };

  // Toggle public/private
  const handleTogglePublic = async () => {
    if (!creation?.id) return;
    
    try {
      const newStatus = !isPublic;
      const { error } = await supabase
        .from('creations')
        .update({ 
          is_public: newStatus,
          status: newStatus ? 'published' : 'draft',
        })
        .eq('id', creation.id);
      
      if (error) throw error;
      
      setIsPublic(newStatus);
      toast({
        title: newStatus ? 'Published' : 'Unpublished',
        description: newStatus 
          ? 'Your creation is now public and can be shared'
          : 'Your creation is now private',
      });
    } catch (error) {
      console.error('Toggle public failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to update visibility',
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
