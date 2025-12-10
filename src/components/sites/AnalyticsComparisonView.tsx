import { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus, Users, ShoppingCart, Zap, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Site } from '@/types';
import { SiteOwnerType } from '@/types/billing';
import { cn } from '@/lib/utils';

interface AnalyticsComparisonViewProps {
  sites: (Site & { ownerType?: SiteOwnerType })[];
}

interface MetricData {
  label: string;
  adminValue: number;
  customerValue: number;
  format: 'number' | 'percent' | 'time';
  icon: React.ElementType;
}

const generateChartData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month) => ({
    name: month,
    admin: Math.floor(Math.random() * 50000) + 20000,
    customer: Math.floor(Math.random() * 80000) + 30000,
  }));
};

export function AnalyticsComparisonView({ sites }: AnalyticsComparisonViewProps) {
  const [timeRange, setTimeRange] = useState('6m');
  const [chartData] = useState(generateChartData);

  const adminSites = sites.filter(s => s.ownerType === 'admin' || !s.ownerType);
  const customerSites = sites.filter(s => s.ownerType === 'customer');

  const calculateTotals = (siteList: typeof sites) => {
    return {
      traffic: siteList.reduce((sum, s) => sum + (s.metrics?.traffic || 0), 0),
      orders: siteList.reduce((sum, s) => sum + (s.metrics?.orders || 0), 0),
      uptime: siteList.length > 0 
        ? siteList.reduce((sum, s) => sum + (s.healthCheck?.uptime || 0), 0) / siteList.length 
        : 0,
      responseTime: siteList.length > 0 
        ? siteList.reduce((sum, s) => sum + (s.healthCheck?.responseTime || 0), 0) / siteList.length 
        : 0,
    };
  };

  const adminTotals = calculateTotals(adminSites);
  const customerTotals = calculateTotals(customerSites);

  const metrics: MetricData[] = [
    { label: 'Total Traffic', adminValue: adminTotals.traffic, customerValue: customerTotals.traffic, format: 'number', icon: Users },
    { label: 'Total Orders', adminValue: adminTotals.orders, customerValue: customerTotals.orders, format: 'number', icon: ShoppingCart },
    { label: 'Avg Uptime', adminValue: adminTotals.uptime, customerValue: customerTotals.uptime, format: 'percent', icon: Zap },
    { label: 'Avg Response', adminValue: adminTotals.responseTime, customerValue: customerTotals.responseTime, format: 'time', icon: Clock },
  ];

  const formatValue = (value: number, format: MetricData['format']) => {
    switch (format) {
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'time':
        return `${Math.round(value)}ms`;
      default:
        return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toString();
    }
  };

  const getDiff = (admin: number, customer: number) => {
    if (admin === 0) return 0;
    return ((customer - admin) / admin) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">Analytics Comparison</h2>
            <p className="text-sm text-muted-foreground">
              Compare performance between admin and customer sites
            </p>
          </div>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="6m">Last 6 months</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Site Counts */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10">
          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-sm font-medium">{adminSites.length} Admin Sites</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-status-active/10">
          <div className="h-2.5 w-2.5 rounded-full bg-status-active" />
          <span className="text-sm font-medium">{customerSites.length} Customer Sites</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const diff = getDiff(metric.adminValue, metric.customerValue);
          const Icon = metric.icon;
          
          return (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{metric.label}</span>
                </div>
                
                <div className="space-y-2">
                  {/* Admin */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-xs text-muted-foreground">Admin</span>
                    </div>
                    <span className="font-semibold">{formatValue(metric.adminValue, metric.format)}</span>
                  </div>
                  
                  {/* Customer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-status-active" />
                      <span className="text-xs text-muted-foreground">Customer</span>
                    </div>
                    <span className="font-semibold">{formatValue(metric.customerValue, metric.format)}</span>
                  </div>

                  {/* Difference */}
                  <div className="pt-2 border-t border-border">
                    <div className={cn(
                      'flex items-center gap-1 text-xs',
                      diff > 0 ? 'text-status-active' : diff < 0 ? 'text-status-inactive' : 'text-muted-foreground'
                    )}>
                      {diff > 0 ? <TrendingUp className="h-3 w-3" /> : 
                       diff < 0 ? <TrendingDown className="h-3 w-3" /> : 
                       <Minus className="h-3 w-3" />}
                      <span>{diff > 0 ? '+' : ''}{diff.toFixed(1)}% customer vs admin</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Traffic Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Traffic Comparison Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${(value / 1000).toFixed(1)}K`, '']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="admin" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Admin Sites"
                />
                <Line 
                  type="monotone" 
                  dataKey="customer" 
                  stroke="hsl(var(--status-active))" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Customer Sites"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
