import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TourSpotlightProps {
  target: string;
  isActive: boolean;
}

export function TourSpotlight({ target, isActive }: TourSpotlightProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!isActive) {
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      const element = document.querySelector(target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      }
      rafRef.current = requestAnimationFrame(updatePosition);
    };

    updatePosition();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, isActive]);

  if (!isActive || !targetRect) return null;

  const padding = 8;
  const x = targetRect.left - padding;
  const y = targetRect.top - padding;
  const width = targetRect.width + padding * 2;
  const height = targetRect.height + padding * 2;

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      {/* Overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              rx="8"
              fill="black"
              className="transition-all duration-300 ease-out"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Highlight border */}
      <div
        className={cn(
          "absolute rounded-lg border-2 border-primary",
          "shadow-[0_0_0_4px_rgba(6,182,212,0.2)]",
          "transition-all duration-300 ease-out",
          "animate-pulse"
        )}
        style={{
          left: x,
          top: y,
          width,
          height,
        }}
      />
    </div>
  );
}
