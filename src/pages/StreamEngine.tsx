import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StreamEngineDashboard } from '@/components/streamengine';

export default function StreamEngine() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">StreamEngine</h1>
          <p className="text-muted-foreground">
            AI-powered YouTube channel management and content optimization
          </p>
        </div>
        <StreamEngineDashboard />
      </div>
    </DashboardLayout>
  );
}
