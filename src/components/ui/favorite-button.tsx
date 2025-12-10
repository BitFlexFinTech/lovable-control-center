import { useState, useCallback, ReactNode } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: (isFavorite: boolean) => void | Promise<void>;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  onToggle,
  className,
  size = 'default',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticFavorite, setOptimisticFavorite] = useState(isFavorite);

  const handleToggle = useCallback(async () => {
    setIsLoading(true);
    setOptimisticFavorite(!optimisticFavorite);
    
    try {
      await onToggle(!isFavorite);
    } catch (error) {
      setOptimisticFavorite(isFavorite); // Revert on error
    } finally {
      setIsLoading(false);
    }
  }, [isFavorite, onToggle, optimisticFavorite]);

  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    default: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8', className)}
          onClick={handleToggle}
          disabled={isLoading}
        >
          <Star
            className={cn(
              sizeClasses[size],
              'transition-all duration-200',
              optimisticFavorite
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground hover:text-yellow-400'
            )}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{optimisticFavorite ? 'Remove from favorites' : 'Add to favorites'}</p>
      </TooltipContent>
    </Tooltip>
  );
};

// Hook for managing favorites
export const useFavorites = <T extends { id: string }>(
  storageKey: string
) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      
      localStorage.setItem(storageKey, JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, [storageKey]);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  const sortByFavorites = useCallback(
    (items: T[]) => {
      return [...items].sort((a, b) => {
        const aFav = favorites.includes(a.id);
        const bFav = favorites.includes(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return 0;
      });
    },
    [favorites]
  );

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    sortByFavorites,
  };
};
