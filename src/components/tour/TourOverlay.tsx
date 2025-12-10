import { useTour } from '@/contexts/TourContext';
import { TourSpotlight } from './TourSpotlight';
import { TourTooltip } from './TourTooltip';

export function TourOverlay() {
  const {
    activeTour,
    currentStep,
    isPlaying,
    nextStep,
    prevStep,
    skipStep,
    endTour,
  } = useTour();

  if (!isPlaying || !activeTour) return null;

  const step = activeTour.steps[currentStep];
  if (!step) return null;

  return (
    <>
      <TourSpotlight target={step.target} isActive={isPlaying} />
      <TourTooltip
        step={step}
        currentStepIndex={currentStep}
        totalSteps={activeTour.steps.length}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipStep}
        onClose={endTour}
      />
    </>
  );
}
