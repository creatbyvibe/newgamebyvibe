import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, Calendar, HardDrive } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface GameSave {
  id: string;
  save_slot: number;
  save_name: string | null;
  save_data: unknown;
  created_at: string;
  updated_at: string;
}

interface SavesManagerProps {
  creationId?: string;
}

const SavesManager = ({ creationId }: SavesManagerProps) => {
  const [saves, setSaves] = useState<GameSave[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !creationId) {
      setLoading(false);
      return;
    }

    const fetchSaves = async () => {
      const { data, error } = await supabase
        .from('game_saves')
        .select('*')
        .eq('user_id', user.id)
        .eq('creation_id', creationId)
        .order('save_slot', { ascending: true });

      if (error) {
        console.error('Failed to fetch saves:', error);
      } else {
        setSaves(data || []);
      }
      setLoading(false);
    };

    fetchSaves();
  }, [user, creationId]);

  const handleDelete = async (saveId: string) => {
    try {
      const { error } = await supabase
        .from('game_saves')
        .delete()
        .eq('id', saveId);

      if (error) throw error;

      setSaves(saves.filter(s => s.id !== saveId));
      toast({
        title: 'Save Deleted',
        description: 'The save file has been removed',
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete save',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatSize = (data: unknown) => {
    const size = new Blob([JSON.stringify(data)]).size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <HardDrive className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Cloud Saves</h3>
          <p className="text-muted-foreground">
            Sign in to access cloud saves and sync your progress across devices.
          </p>
        </div>
      </div>
    );
  }

  if (!creationId) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <p>Save the creation first to enable cloud saves.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Cloud Saves</h2>
        <p className="text-muted-foreground">
          Manage your game save files. These are synced to the cloud automatically.
        </p>
      </div>

      {saves.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <HardDrive className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-1">No saves yet</p>
              <p className="text-sm">
                Play the game and save your progress to see saves here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {saves.map((save) => (
            <Card key={save.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {save.save_name || `Slot ${save.save_slot}`}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(save.updated_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {formatSize(save.save_data)}
                      </span>
                    </CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Save?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this save file. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(save.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded font-mono overflow-hidden">
                  <pre className="truncate">
                    {JSON.stringify(save.save_data, null, 0).slice(0, 200)}
                    {JSON.stringify(save.save_data).length > 200 && '...'}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavesManager;
