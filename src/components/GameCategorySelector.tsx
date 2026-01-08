import { useState, useEffect } from 'react';
import { gameCategoryService } from '@/services/gameCategoryService';
import { ErrorHandler } from '@/lib/errorHandler';
import type { GameCategory } from '@/types/game';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameCategorySelectorProps {
  selectedCategoryId?: string;
  onSelect: (category: GameCategory | null) => void;
  className?: string;
}

export const GameCategorySelector = ({
  selectedCategoryId,
  onSelect,
  className,
}: GameCategorySelectorProps) => {
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await gameCategoryService.getActiveCategories();
        setCategories(data);
      } catch (error) {
        ErrorHandler.logError(error, 'GameCategorySelector.fetchCategories');
        // Silently fail, show empty state
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className={cn('text-center p-8 text-muted-foreground', className)}>
        <p>暂无可用类别</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold">选择游戏类别</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            'p-4 rounded-lg border-2 transition-all text-left',
            'hover:border-primary hover:bg-primary/10',
            !selectedCategoryId
              ? 'border-primary bg-primary/20'
              : 'border-border bg-background'
          )}
        >
          <div className="text-2xl mb-2">🎮</div>
          <div className="font-semibold">任意类别</div>
          <div className="text-sm text-muted-foreground">自由创作</div>
        </button>
        
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category)}
            className={cn(
              'p-4 rounded-lg border-2 transition-all text-left',
              'hover:border-primary hover:bg-primary/10',
              selectedCategoryId === category.id
                ? 'border-primary bg-primary/20'
                : 'border-border bg-background'
            )}
          >
            <div className="text-2xl mb-2">{category.icon || '🃏'}</div>
            <div className="font-semibold">{category.name}</div>
            <div className="text-sm text-muted-foreground line-clamp-2">
              {category.description || category.description_en}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
