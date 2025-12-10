import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
}) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className={cn(
        'animate-fade-in',
        className
      )}
    >
      {children}
    </div>
  );
};

// Staggered list animation wrapper
interface StaggeredListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  className,
  staggerDelay = 50,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              className="animate-fade-in"
              style={{
                animationDelay: `${index * staggerDelay}ms`,
                animationFillMode: 'both',
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
};
