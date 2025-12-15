import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { YouTubeCrisisEvent } from "@/types/streamengine";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { useUpdateCrisisStatus } from "@/hooks/useStreamEngineFeatures";

interface CrisisAlertBannerProps {
  crises: YouTubeCrisisEvent[];
}

export function CrisisAlertBanner({ crises }: CrisisAlertBannerProps) {
  const updateStatus = useUpdateCrisisStatus();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityVariant = (severity: string): "default" | "destructive" => {
    return severity === 'critical' || severity === 'high' ? 'destructive' : 'default';
  };

  const handleDismiss = (id: string) => {
    updateStatus.mutate({ id, status: 'resolved' });
  };

  if (crises.length === 0) return null;

  return (
    <div className="space-y-2">
      {crises.map((crisis) => (
        <Alert key={crisis.id} variant={getSeverityVariant(crisis.severity)}>
          {getSeverityIcon(crisis.severity)}
          <AlertTitle className="flex items-center justify-between">
            <span>{crisis.title}</span>
            <Button variant="ghost" size="sm" onClick={() => handleDismiss(crisis.id)} disabled={updateStatus.isPending}>
              <X className="h-4 w-4" />
            </Button>
          </AlertTitle>
          <AlertDescription>
            {crisis.description}
            {crisis.responseRecommendations && crisis.responseRecommendations.length > 0 && (
              <div className="mt-2">
                <strong>Suggested actions:</strong>
                <ul className="list-disc list-inside mt-1">
                  {crisis.responseRecommendations.filter(r => r.recommended).map((rec) => (
                    <li key={rec.id} className="text-sm">{rec.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
