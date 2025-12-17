import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { QuantOpsDashboard } from '@/components/quantops';

export default function QuantOps() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QuantOps</h1>
          <p className="text-muted-foreground">
            GreenBack Trading Automation - AI-driven recommendations and deployments
          </p>
        </div>
        <QuantOpsDashboard />
      </div>
    </DashboardLayout>
  );
}
