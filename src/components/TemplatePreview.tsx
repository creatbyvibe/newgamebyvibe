import { useState, useEffect } from 'react';
import { templateService } from '@/services/templateService';
import { ErrorHandler } from '@/lib/errorHandler';
import type { GameTemplate, GameDifficulty } from '@/types/game';
import { Loader2, Play, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TemplatePreviewProps {
  categoryId?: string;
  selectedTemplateId?: string;
  onSelect: (template: GameTemplate | null) => void;
  onPreview?: (template: GameTemplate) => void;
  className?: string;
}

const difficultyLabels: Record<GameDifficulty, string> = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级',
};

const difficultyColors: Record<GameDifficulty, string> = {
  beginner: 'bg-green-500/20 text-green-500 border-green-500',
  intermediate: 'bg-yellow-500/20 text-yellow-500 border-yellow-500',
  advanced: 'bg-red-500/20 text-red-500 border-red-500',
};

export const TemplatePreview = ({
  categoryId,
  selectedTemplateId,
  onSelect,
  onPreview,
  className,
}: TemplatePreviewProps) => {
  const [templates, setTemplates] = useState<GameTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewingTemplate, setPreviewingTemplate] = useState<GameTemplate | null>(null);

  useEffect(() => {
    if (!categoryId) {
      setTemplates([]);
      return;
    }

    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await templateService.getTemplatesByCategory(categoryId);
        setTemplates(data);
      } catch (error) {
        ErrorHandler.logError(error, 'TemplatePreview.fetchTemplates');
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [categoryId]);

  const handlePreview = (template: GameTemplate) => {
    setPreviewingTemplate(template);
    if (onPreview) {
      onPreview(template);
    }
  };

  if (!categoryId) {
    return (
      <div className={cn('text-center p-8 text-muted-foreground', className)}>
        <p>请先选择游戏类别</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className={cn('text-center p-8 text-muted-foreground', className)}>
        <p>该类别暂无可用模板</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">选择模板（可选）</h3>
        <button
          onClick={() => onSelect(null)}
          className={cn(
            'text-sm px-3 py-1 rounded-md border transition-colors',
            !selectedTemplateId
              ? 'border-primary bg-primary/20 text-primary'
              : 'border-border hover:border-primary/50'
          )}
        >
          不使用模板
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={cn(
              'p-4 rounded-lg border-2 transition-all',
              'hover:border-primary/50 hover:shadow-md',
              selectedTemplateId === template.id
                ? 'border-primary bg-primary/20'
                : 'border-border bg-background'
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold">{template.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {template.description || template.description_en}
                </p>
              </div>
              {selectedTemplateId === template.id && (
                <Check className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
              )}
            </div>

            <div className="flex items-center justify-between mt-3">
              <span
                className={cn(
                  'text-xs px-2 py-1 rounded border',
                  difficultyColors[template.difficulty]
                )}
              >
                {difficultyLabels[template.difficulty]}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreview(template)}
                >
                  <Play className="w-4 h-4 mr-1" />
                  预览
                </Button>
                <Button
                  size="sm"
                  onClick={() => onSelect(template)}
                  variant={selectedTemplateId === template.id ? 'default' : 'outline'}
                >
                  选择
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {previewingTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{previewingTemplate.name} - 预览</h3>
              <Button variant="outline" onClick={() => setPreviewingTemplate(null)}>
                关闭
              </Button>
            </div>
            <iframe
              srcDoc={previewingTemplate.example_code}
              className="w-full h-[600px] border rounded"
              sandbox="allow-scripts"
              title="Template Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};
