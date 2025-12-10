import { useState } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  MousePointer,
  Plus,
  Search,
  Filter,
  FileText,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { EmailTemplate, EmailDelivery, EmailStats } from '@/types/monitoring';

// Mock data
const mockTemplates: EmailTemplate[] = [
  {
    id: 'template-1',
    name: 'Welcome Email',
    subject: 'Welcome to {{company_name}}!',
    htmlContent: '<h1>Welcome!</h1><p>Thanks for joining...</p>',
    textContent: 'Welcome! Thanks for joining...',
    category: 'transactional',
    variables: ['company_name', 'user_name', 'login_url'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'template-2',
    name: 'Password Reset',
    subject: 'Reset your password',
    htmlContent: '<h1>Password Reset</h1><p>Click the link below...</p>',
    textContent: 'Password Reset. Click the link below...',
    category: 'transactional',
    variables: ['user_name', 'reset_url', 'expiry_time'],
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'template-3',
    name: 'Order Confirmation',
    subject: 'Order #{{order_id}} Confirmed',
    htmlContent: '<h1>Order Confirmed!</h1><p>Your order details...</p>',
    textContent: 'Order Confirmed! Your order details...',
    category: 'transactional',
    variables: ['order_id', 'customer_name', 'order_total', 'items'],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'template-4',
    name: 'System Alert',
    subject: 'Alert: {{alert_type}}',
    htmlContent: '<h1>System Alert</h1><p>{{alert_message}}</p>',
    textContent: 'System Alert: {{alert_message}}',
    category: 'system',
    variables: ['alert_type', 'alert_message', 'timestamp'],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockDeliveries: EmailDelivery[] = [
  {
    id: 'delivery-1',
    templateId: 'template-1',
    to: 'user@example.com',
    subject: 'Welcome to TechStore!',
    status: 'delivered',
    sentAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 59 * 60 * 1000).toISOString(),
    openedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'delivery-2',
    templateId: 'template-2',
    to: 'customer@test.com',
    subject: 'Reset your password',
    status: 'sent',
    sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'delivery-3',
    templateId: 'template-3',
    to: 'buyer@shop.com',
    subject: 'Order #12345 Confirmed',
    status: 'delivered',
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000).toISOString(),
    openedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    clickedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'delivery-4',
    templateId: 'template-1',
    to: 'invalid@email',
    subject: 'Welcome!',
    status: 'bounced',
    sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    error: 'Invalid email address',
  },
  {
    id: 'delivery-5',
    templateId: 'template-4',
    to: 'admin@control.center',
    subject: 'Alert: High CPU Usage',
    status: 'delivered',
    sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 30000).toISOString(),
  },
];

const mockStats: EmailStats = {
  sent: 1250,
  delivered: 1180,
  opened: 890,
  clicked: 342,
  bounced: 45,
  failed: 25,
};

export function EmailPipeline() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockTemplates);
  const [deliveries] = useState<EmailDelivery[]>(mockDeliveries);
  const [stats] = useState<EmailStats>(mockStats);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    category: 'transactional' as EmailTemplate['category'],
    htmlContent: '',
  });

  const getStatusIcon = (status: EmailDelivery['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-status-active" />;
      case 'sent':
        return <Send className="h-4 w-4 text-primary" />;
      case 'queued':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'bounced':
      case 'failed':
        return <XCircle className="h-4 w-4 text-status-inactive" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const template: EmailTemplate = {
      id: `template-${Date.now()}`,
      ...newTemplate,
      textContent: newTemplate.htmlContent.replace(/<[^>]*>/g, ''),
      variables: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates(prev => [template, ...prev]);
    setNewTemplate({ name: '', subject: '', category: 'transactional', htmlContent: '' });
    setIsCreateOpen(false);
    toast({
      title: 'Template Created',
      description: 'Email template has been created successfully.',
    });
  };

  const openRate = stats.sent > 0 ? ((stats.opened / stats.delivered) * 100).toFixed(1) : 0;
  const clickRate = stats.opened > 0 ? ((stats.clicked / stats.opened) * 100).toFixed(1) : 0;
  const bounceRate = stats.sent > 0 ? ((stats.bounced / stats.sent) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Email Pipeline</h2>
            <p className="text-sm text-muted-foreground">
              SendGrid integration with delivery tracking
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Send className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sent</span>
            </div>
            <p className="text-2xl font-bold">{stats.sent.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-status-active" />
              <span className="text-sm text-muted-foreground">Delivered</span>
            </div>
            <p className="text-2xl font-bold text-status-active">{stats.delivered.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Opened</span>
            </div>
            <p className="text-2xl font-bold">{stats.opened.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{openRate}% rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <MousePointer className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Clicked</span>
            </div>
            <p className="text-2xl font-bold">{stats.clicked.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{clickRate}% rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-status-warning" />
              <span className="text-sm text-muted-foreground">Bounced</span>
            </div>
            <p className="text-2xl font-bold text-status-warning">{stats.bounced}</p>
            <p className="text-xs text-muted-foreground">{bounceRate}% rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-status-inactive" />
              <span className="text-sm text-muted-foreground">Failed</span>
            </div>
            <p className="text-2xl font-bold text-status-inactive">{stats.failed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="deliveries">
        <TabsList>
          <TabsTrigger value="deliveries" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Deliveries
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deliveries" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Deliveries</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Opened</TableHead>
                    <TableHead>Clicked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries
                    .filter(d => 
                      d.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      d.subject.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(delivery.status)}
                          <Badge variant={
                            delivery.status === 'delivered' ? 'active' :
                            delivery.status === 'sent' ? 'secondary' :
                            delivery.status === 'bounced' || delivery.status === 'failed' ? 'destructive' :
                            'outline'
                          }>
                            {delivery.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{delivery.to}</TableCell>
                      <TableCell>{delivery.subject}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatTime(delivery.sentAt)}
                      </TableCell>
                      <TableCell>
                        {delivery.openedAt ? (
                          <Eye className="h-4 w-4 text-status-active" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {delivery.clickedAt ? (
                          <MousePointer className="h-4 w-4 text-status-active" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Email Templates</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Variables</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {template.variables.length} variables
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(template.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Template Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Welcome Email"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newTemplate.category}
                  onValueChange={(value: EmailTemplate['category']) => 
                    setNewTemplate(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., Welcome to {{company_name}}!"
              />
              <p className="text-xs text-muted-foreground">
                Use {'{{variable}}'} for dynamic content
              </p>
            </div>
            <div className="space-y-2">
              <Label>HTML Content</Label>
              <Textarea
                value={newTemplate.htmlContent}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, htmlContent: e.target.value }))}
                placeholder="<h1>Hello {{user_name}}</h1>"
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
