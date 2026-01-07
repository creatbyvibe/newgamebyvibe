import { useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FullscreenPreviewProps {
  code: string;
  creationId?: string;
}

const FullscreenPreview = ({ code, creationId }: FullscreenPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Handle messages from iframe (game saves)
  const handleMessage = useCallback(async (event: MessageEvent) => {
    if (!user || !creationId) return;

    if (event.data.type === 'GAME_SAVE') {
      try {
        const { slotId, saveName, data } = event.data;
        
        // Check if save exists
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

        // Send confirmation to iframe
        iframeRef.current?.contentWindow?.postMessage({
          type: 'GAME_SAVE_RESULT',
          success: true,
        }, '*');

        toast({
          title: 'Game Saved',
          description: saveName ? `Saved to: ${saveName}` : 'Progress saved to cloud',
        });
      } catch (error) {
        console.error('Save failed:', error);
        iframeRef.current?.contentWindow?.postMessage({
          type: 'GAME_SAVE_RESULT',
          success: false,
          error: 'Save failed',
        }, '*');
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
        iframeRef.current?.contentWindow?.postMessage({
          type: 'GAME_LOAD_RESULT',
          success: false,
          error: 'Load failed',
        }, '*');
      }
    }
  }, [user, creationId, toast]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // Update iframe content
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

  if (!code) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">No content to preview</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-black">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title="Game Preview"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
};

export default FullscreenPreview;
