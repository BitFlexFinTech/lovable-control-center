import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AvatarWithInitialsProps {
  src?: string;
  name: string;
  className?: string;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColorFromName = (name: string): string => {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export const AvatarWithInitials: React.FC<AvatarWithInitialsProps> = ({
  src,
  name,
  className,
}) => {
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  return (
    <Avatar className={cn(className)}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback className={cn(bgColor, 'text-white font-medium')}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
