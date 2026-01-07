import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Save, 
  Share2, 
  Globe, 
  Lock, 
  Check, 
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface StudioHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  isPublic: boolean;
  onSave: () => void;
  onTogglePublic: () => void;
  creationId?: string;
  isNewCreation: boolean;
  version?: number;
}

const StudioHeader = ({
  title,
  onTitleChange,
  saveStatus,
  isPublic,
  onSave,
  onTogglePublic,
  creationId,
  isNewCreation,
  version,
}: StudioHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const getShareUrl = () => {
    if (!creationId) return '';
    return `${window.location.origin}/creation/${creationId}`;
  };

  const handleCopyLink = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied',
      description: 'Share link has been copied to clipboard',
    });
  };

  const handleOpenInNewTab = () => {
    const url = getShareUrl();
    window.open(url, '_blank');
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'saved':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'unsaved':
        return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'unsaved':
        return 'Unsaved changes';
    }
  };

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4 gap-4">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/my-creations')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        {isEditingTitle ? (
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
            className="w-48 h-8"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="text-lg font-semibold hover:text-primary transition-colors"
          >
            {title}
          </button>
        )}
        
        {version && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            v{version}
          </span>
        )}
      </div>

      {/* Center section - Save status */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {getSaveStatusIcon()}
        <span>{getSaveStatusText()}</span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePublic}
          disabled={isNewCreation}
        >
          {isPublic ? (
            <>
              <Globe className="w-4 h-4 mr-1" />
              Public
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-1" />
              Private
            </>
          )}
        </Button>

        {isPublic && creationId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenInNewTab}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button onClick={onSave} size="sm">
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
      </div>
    </header>
  );
};

export default StudioHeader;
