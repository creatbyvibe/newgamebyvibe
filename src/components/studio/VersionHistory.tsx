import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, History, RotateCcw, Clock } from 'lucide-react';
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

interface Version {
  id: string;
  version: number;
  html_code: string;
  change_note: string | null;
  created_at: string;
}

interface VersionHistoryProps {
  creationId?: string;
  onRestore: (code: string, version: number) => void;
}

const VersionHistory = ({ creationId, onRestore }: VersionHistoryProps) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !creationId) {
      setLoading(false);
      return;
    }

    const fetchVersions = async () => {
      const { data, error } = await supabase
        .from('creation_versions')
        .select('*')
        .eq('creation_id', creationId)
        .order('version', { ascending: false });

      if (error) {
        console.error('Failed to fetch versions:', error);
      } else {
        setVersions(data || []);
      }
      setLoading(false);
    };

    fetchVersions();
  }, [user, creationId]);

  const handleRestore = (version: Version) => {
    onRestore(version.html_code, version.version);
    toast({
      title: 'Version Restored',
      description: `Reverted to version ${version.version}. Remember to save!`,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than 1 hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleString();
  };

  const getCodePreview = (code: string) => {
    // Extract title or first meaningful content
    const titleMatch = code.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) return titleMatch[1];
    
    const h1Match = code.match(/<h1[^>]*>([^<]+)<\/h1>/);
    if (h1Match) return h1Match[1];
    
    return code.slice(0, 100).replace(/<[^>]+>/g, ' ').trim();
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Version History</h3>
          <p className="text-muted-foreground">
            Sign in to access version history.
          </p>
        </div>
      </div>
    );
  }

  if (!creationId) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <p>Save the creation first to enable version history.</p>
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
        <h2 className="text-2xl font-bold">Version History</h2>
        <p className="text-muted-foreground">
          Browse and restore previous versions of your creation.
        </p>
      </div>

      {versions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-1">No versions yet</p>
              <p className="text-sm">
                Versions are created each time you manually save your work.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
            <Card key={version.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">v{version.version}</span>
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {version.change_note || `Version ${version.version}`}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(version.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Restore
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Restore Version {version.version}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will replace your current code with this version. Your current changes will be lost if not saved.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRestore(version)}>
                          Restore
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground truncate">
                  {getCodePreview(version.html_code)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VersionHistory;
