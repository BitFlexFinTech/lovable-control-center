import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  value: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  className,
  variant = 'ghost',
  size = 'icon',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn('relative', className)}
      onClick={handleCopy}
    >
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-all duration-200',
          copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        )}
      >
        <Check className="h-4 w-4 text-green-500" />
      </span>
      <Copy
        className={cn(
          'h-4 w-4 transition-all duration-200',
          copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        )}
      />
    </Button>
  );
};
