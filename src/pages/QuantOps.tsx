import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { QuantOpsDashboard } from "@/components/quantops/QuantOpsDashboard";
import { PersonaSelector } from "@/components/quantops/PersonaSelector";
import { useQuantOpsPersonas } from "@/hooks/useQuantOps";

export default function QuantOps() {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const { data: personas, isLoading } = useQuantOpsPersonas();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">QuantOps</h1>
            <p className="text-muted-foreground">
              AI-Powered Trading Automation & Code Deployment
            </p>
          </div>
          <PersonaSelector
            personas={personas || []}
            selectedPersonaId={selectedPersonaId}
            onSelectPersona={setSelectedPersonaId}
            isLoading={isLoading}
          />
        </div>

        <QuantOpsDashboard personaId={selectedPersonaId} />
      </div>
    </DashboardLayout>
  );
}
