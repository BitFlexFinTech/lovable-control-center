import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdvancedAuditViewer } from '@/components/audit/AdvancedAuditViewer';
import { AuditTimeline } from '@/components/audit/AuditTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { List, Clock } from 'lucide-react';

const AuditLogs = () => {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 opacity-0 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">
            Track all administrative actions across your organization
          </p>
        </div>
      </div>

      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table" className="gap-1.5">
            <List className="h-4 w-4" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5">
            <Clock className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <AdvancedAuditViewer />
        </TabsContent>

        <TabsContent value="timeline">
          <AuditTimeline />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AuditLogs;