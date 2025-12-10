import { Play, CheckCircle2, Clock, Rocket, Workflow, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTour } from '@/contexts/TourContext';
import { tourCategories } from '@/data/tours';
import { cn } from '@/lib/utils';

const categoryIcons = {
  onboarding: Rocket,
  workflow: Workflow,
  feature: Sparkles,
  custom: Wand2,
};

export function TourLibrary() {
  const { availableTours, completedTours, startTour } = useTour();

  // Group tours by category
  const toursByCategory = availableTours.reduce((acc, tour) => {
    if (!acc[tour.category]) {
      acc[tour.category] = [];
    }
    acc[tour.category].push(tour);
    return acc;
  }, {} as Record<string, typeof availableTours>);

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full">
      {Object.entries(tourCategories).map(([category, info]) => {
        const tours = toursByCategory[category] || [];
        if (tours.length === 0) return null;

        const Icon = categoryIcons[category as keyof typeof categoryIcons];

        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">
                {info.label}
              </h3>
            </div>

            <div className="space-y-2">
              {tours.map((tour) => {
                const isCompleted = completedTours.includes(tour.id);

                return (
                  <div
                    key={tour.id}
                    className={cn(
                      "p-4 rounded-xl border transition-all",
                      isCompleted
                        ? "bg-status-active/5 border-status-active/20"
                        : "bg-card border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <CheckCircle2 className="h-4 w-4 text-status-active flex-shrink-0" />
                          )}
                          <h4 className="font-medium truncate">{tour.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {tour.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {tour.estimatedTime}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {tour.steps.length} steps
                          </span>
                          {tour.aiGenerated && (
                            <Badge variant="outline" className="text-xs py-0">
                              AI
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        variant={isCompleted ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => startTour(tour.id)}
                        className="flex-shrink-0 gap-1.5"
                      >
                        <Play className="h-3.5 w-3.5" />
                        {isCompleted ? 'Replay' : 'Start'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {availableTours.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="font-medium mb-2">No Tours Yet</h3>
          <p className="text-sm text-muted-foreground">
            Ask the AI assistant a question to generate a custom tour!
          </p>
        </div>
      )}
    </div>
  );
}
