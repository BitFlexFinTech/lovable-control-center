import { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TourStep } from '@/types/tour';
import { cn } from '@/lib/utils';

interface TourTooltipProps {
  step: TourStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export function TourTooltip({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onClose,
}: TourTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  useEffect(() => {
    const element = document.querySelector(step.target);
    if (!element || !tooltipRef.current) return;

    const targetRect = element.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 16;

    let top = 0;
    let left = 0;

    switch (step.placement) {
      case 'top':
        top = targetRect.top - tooltipRect.height - padding;
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        left = targetRect.left - tooltipRect.width - padding;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        left = targetRect.right + padding;
        break;
      case 'center':
        top = window.innerHeight / 2 - tooltipRect.height / 2;
        left = window.innerWidth / 2 - tooltipRect.width / 2;
        break;
    }

    // Keep within viewport bounds
    const viewportPadding = 20;
    left = Math.max(viewportPadding, Math.min(left, window.innerWidth - tooltipRect.width - viewportPadding));
    top = Math.max(viewportPadding, Math.min(top, window.innerHeight - tooltipRect.height - viewportPadding));

    setPosition({ top, left });
  }, [step]);

  return (
    <div
      ref={tooltipRef}
      className={cn(
        "fixed z-[9999] w-80 p-4",
        "bg-card border border-border rounded-xl shadow-2xl",
        "animate-in fade-in-0 zoom-in-95 duration-200"
      )}
      style={{ top: position.top, left: position.left }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-foreground pr-2">{step.title}</h3>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="h-6 w-6 -mt-1 -mr-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <p className="text-sm text-muted-foreground mb-4">{step.content}</p>

      {/* Progress */}
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= currentStepIndex ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
        
        <div className="flex items-center gap-2">
          {step.canSkip && !isLastStep && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-xs gap-1"
            >
              Skip
              <SkipForward className="h-3 w-3" />
            </Button>
          )}
          
          {!isFirstStep && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={onNext}
            className="gap-1"
          >
            {isLastStep ? 'Finish' : 'Next'}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
