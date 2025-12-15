import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPIGauge } from "./KPIGauge";
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign } from "lucide-react";

interface MetricsSnapshotPanelProps {
  personaId: string;
}

// Mock data - will be replaced with real data
const mockMetrics = {
  rejectRate: { value: 2.3, threshold: 5, status: 'healthy' as const },
  fillLatencyMs: { value: 45, threshold: 100, status: 'healthy' as const },
  balanceDrift: { value: 0.8, threshold: 2, status: 'healthy' as const },
  netProfitMin: { value: 127.50, threshold: 50, status: 'healthy' as const },
};

export function MetricsSnapshotPanel({ personaId }: MetricsSnapshotPanelProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Reject Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <KPIGauge 
            value={mockMetrics.rejectRate.value} 
            maxValue={10}
            threshold={mockMetrics.rejectRate.threshold}
            unit="%"
            status={mockMetrics.rejectRate.status}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Fill Latency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <KPIGauge 
            value={mockMetrics.fillLatencyMs.value} 
            maxValue={200}
            threshold={mockMetrics.fillLatencyMs.threshold}
            unit="ms"
            status={mockMetrics.fillLatencyMs.status}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Balance Drift
          </CardTitle>
        </CardHeader>
        <CardContent>
          <KPIGauge 
            value={mockMetrics.balanceDrift.value} 
            maxValue={5}
            threshold={mockMetrics.balanceDrift.threshold}
            unit="%"
            status={mockMetrics.balanceDrift.status}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Net Profit/min
          </CardTitle>
        </CardHeader>
        <CardContent>
          <KPIGauge 
            value={mockMetrics.netProfitMin.value} 
            maxValue={500}
            threshold={mockMetrics.netProfitMin.threshold}
            unit="$"
            status={mockMetrics.netProfitMin.status}
            invertThreshold
          />
        </CardContent>
      </Card>
    </div>
  );
}
