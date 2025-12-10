import { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Calendar,
  HardDrive,
  Settings2,
  Play,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Backup, BackupSchedule } from '@/types/monitoring';
import { cn } from '@/lib/utils';

// Mock data
const mockBackups: Backup[] = [
  {
    id: 'backup-1',
    type: 'full',
    status: 'completed',
    size: 256000000,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    retentionDays: 30,
    downloadUrl: '#',
  },
  {
    id: 'backup-2',
    type: 'incremental',
    status: 'completed',
    size: 45000000,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 26 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    retentionDays: 7,
    downloadUrl: '#',
  },
  {
    id: 'backup-3',
    type: 'database',
    status: 'in_progress',
    size: 0,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    retentionDays: 30,
  },
  {
    id: 'backup-4',
    type: 'full',
    status: 'failed',
    size: 0,
    createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    retentionDays: 30,
    error: 'Insufficient storage space',
  },
];

const mockSchedules: BackupSchedule[] = [
  {
    id: 'schedule-1',
    name: 'Daily Full Backup',
    frequency: 'daily',
    time: '02:00',
    retentionDays: 30,
    enabled: true,
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    targetType: 'all',
  },
  {
    id: 'schedule-2',
    name: 'Hourly Incremental',
    frequency: 'hourly',
    time: '00:00',
    retentionDays: 7,
    enabled: true,
    lastRun: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    targetType: 'all',
  },
  {
    id: 'schedule-3',
    name: 'Weekly Database',
    frequency: 'weekly',
    time: '03:00',
    retentionDays: 90,
    enabled: false,
    nextRun: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    targetType: 'all',
  },
];

export function BackupManager() {
  const { toast } = useToast();
  const [backups, setBackups] = useState<Backup[]>(mockBackups);
  const [schedules, setSchedules] = useState<BackupSchedule[]>(mockSchedules);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    frequency: 'daily' as BackupSchedule['frequency'],
    time: '02:00',
    retentionDays: 30,
  });

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: Backup['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-status-active" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-status-inactive" />;
    }
  };

  const handleCreateBackup = async (type: Backup['type']) => {
    setIsCreating(true);
    
    const newBackup: Backup = {
      id: `backup-${Date.now()}`,
      type,
      status: 'in_progress',
      size: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      retentionDays: 30,
    };
    
    setBackups(prev => [newBackup, ...prev]);
    
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setBackups(prev => prev.map(b => 
      b.id === newBackup.id 
        ? { 
            ...b, 
            status: 'completed' as const, 
            size: Math.floor(Math.random() * 500000000),
            completedAt: new Date().toISOString(),
            downloadUrl: '#',
          }
        : b
    ));
    
    setIsCreating(false);
    toast({
      title: 'Backup Created',
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} backup completed successfully.`,
    });
  };

  const handleRestore = async (backup: Backup) => {
    setIsRestoring(backup.id);
    setShowRestoreDialog(false);
    
    // Simulate restore process
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    setIsRestoring(null);
    toast({
      title: 'Restore Complete',
      description: 'Your data has been restored successfully.',
    });
  };

  const handleDeleteBackup = (backupId: string) => {
    setBackups(prev => prev.filter(b => b.id !== backupId));
    toast({
      title: 'Backup Deleted',
      description: 'Backup has been permanently deleted.',
    });
  };

  const toggleSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.map(s => 
      s.id === scheduleId ? { ...s, enabled: !s.enabled } : s
    ));
    toast({
      title: 'Schedule Updated',
      description: 'Backup schedule has been updated.',
    });
  };

  const handleCreateSchedule = () => {
    const schedule: BackupSchedule = {
      id: `schedule-${Date.now()}`,
      ...newSchedule,
      enabled: true,
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      targetType: 'all',
    };
    
    setSchedules(prev => [schedule, ...prev]);
    setNewSchedule({ name: '', frequency: 'daily', time: '02:00', retentionDays: 30 });
    setShowScheduleDialog(false);
    toast({
      title: 'Schedule Created',
      description: 'New backup schedule has been created.',
    });
  };

  const completedBackups = backups.filter(b => b.status === 'completed').length;
  const totalSize = backups.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.size, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Backup & Restore</h2>
            <p className="text-sm text-muted-foreground">
              Automated backups with one-click restore
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowScheduleDialog(true)}>
            <Calendar className="h-4 w-4 mr-1.5" />
            Schedule
          </Button>
          <Button 
            onClick={() => handleCreateBackup('full')} 
            disabled={isCreating}
            className="gap-1.5"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Create Backup
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Backups</p>
                <p className="text-2xl font-bold">{backups.length}</p>
              </div>
              <Database className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-status-active/30 bg-status-active/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-status-active">{completedBackups}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-status-active/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Size</p>
                <p className="text-2xl font-bold">{formatSize(totalSize)}</p>
              </div>
              <HardDrive className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Schedules</p>
                <p className="text-2xl font-bold">
                  {schedules.filter(s => s.enabled).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Backup Schedules</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      schedule.enabled ? "bg-primary/10" : "bg-muted"
                    )}>
                      <Calendar className={cn(
                        "h-5 w-5",
                        schedule.enabled ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <p className="font-medium">{schedule.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {schedule.frequency} at {schedule.time} • {schedule.retentionDays} days retention
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm">Next run</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(schedule.nextRun)}
                      </p>
                    </div>
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={() => toggleSchedule(schedule.id)}
                    />
                    <Button variant="ghost" size="icon-sm">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backups List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Backups</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(backup.status)}
                      <Badge variant={
                        backup.status === 'completed' ? 'active' :
                        backup.status === 'in_progress' ? 'secondary' :
                        backup.status === 'failed' ? 'destructive' : 'outline'
                      }>
                        {backup.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{backup.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {backup.status === 'completed' ? formatSize(backup.size) : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(backup.createdAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(backup.expiresAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {backup.status === 'completed' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBackup(backup);
                              setShowRestoreDialog(true);
                            }}
                            disabled={isRestoring === backup.id}
                          >
                            {isRestoring === backup.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Upload className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBackup(backup.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-status-inactive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Backup Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Schedule Name</Label>
              <Input
                value={newSchedule.name}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Daily Full Backup"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={newSchedule.frequency}
                  onValueChange={(value: BackupSchedule['frequency']) =>
                    setNewSchedule(prev => ({ ...prev, frequency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Retention (days)</Label>
              <Input
                type="number"
                value={newSchedule.retentionDays}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                min={1}
                max={365}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSchedule}>
              Create Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore from Backup</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore from this backup? This will overwrite current data.
            </DialogDescription>
          </DialogHeader>
          {selectedBackup && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <Badge variant="outline">{selectedBackup.type}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Size</span>
                <span className="text-sm font-medium">{formatSize(selectedBackup.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">{formatDate(selectedBackup.createdAt)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedBackup && handleRestore(selectedBackup)}
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Restore Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
