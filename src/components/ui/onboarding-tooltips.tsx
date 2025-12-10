import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTooltipsProps {
  steps: OnboardingStep[];
  storageKey: string;
  onComplete?: () => void;
}

export const OnboardingTooltips: React.FC<OnboardingTooltipsProps> = ({
  steps,
  storageKey,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(storageKey);
    if (!hasCompleted) {
      setIsVisible(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isVisible || !steps[currentStep]?.target) return;

    const targetElement = document.querySelector(steps[currentStep].target!);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setTargetRect(rect);
      
      // Scroll target into view if needed
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep, isVisible, steps]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, steps.length]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
    onComplete?.();
  }, [storageKey, onComplete]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
  }, [storageKey]);

  if (!isVisible || steps.length === 0) return null;

  const step = steps[currentStep];
  const position = step.position || 'bottom';

  const getTooltipStyles = () => {
    if (!targetRect) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const styles: React.CSSProperties = {
      position: 'fixed',
    };

    switch (position) {
      case 'top':
        styles.bottom = `${window.innerHeight - targetRect.top + 12}px`;
        styles.left = `${targetRect.left + targetRect.width / 2}px`;
        styles.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        styles.top = `${targetRect.bottom + 12}px`;
        styles.left = `${targetRect.left + targetRect.width / 2}px`;
        styles.transform = 'translateX(-50%)';
        break;
      case 'left':
        styles.right = `${window.innerWidth - targetRect.left + 12}px`;
        styles.top = `${targetRect.top + targetRect.height / 2}px`;
        styles.transform = 'translateY(-50%)';
        break;
      case 'right':
        styles.left = `${targetRect.right + 12}px`;
        styles.top = `${targetRect.top + targetRect.height / 2}px`;
        styles.transform = 'translateY(-50%)';
        break;
    }

    return styles;
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />

      {/* Highlight target */}
      {targetRect && (
        <div
          className="fixed z-50 rounded-lg ring-4 ring-primary ring-offset-2 ring-offset-background"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="z-50 w-80 rounded-lg border bg-card p-4 shadow-xl animate-scale-in"
        style={getTooltipStyles()}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="pr-6">
          <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-colors',
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Done' : 'Next'}
              {currentStep < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 ml-1" />
              )}
            </Button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors"
        >
          Don't show again
        </button>
      </div>
    </>
  );
};
