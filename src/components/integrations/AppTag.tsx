import { cn } from '@/lib/utils';
import { LinkedApp } from '@/types';

interface AppTagProps {
  app: LinkedApp;
  size?: 'sm' | 'md';
  onRemove?: () => void;
}

export function AppTag({ app, size = 'sm', onRemove }: AppTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-all",
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        "bg-opacity-20 hover:bg-opacity-30"
      )}
      style={{ 
        backgroundColor: `${app.color}20`,
        color: app.color,
        borderColor: `${app.color}40`,
        borderWidth: '1px',
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: app.color }}
      />
      {app.siteName}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-70"
        >
          ×
        </button>
      )}
    </span>
  );
}
