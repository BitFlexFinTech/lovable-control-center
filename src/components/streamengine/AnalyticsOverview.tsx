import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Users, Eye, Clock } from "lucide-react";

interface AnalyticsOverviewProps {
  channelId: string;
}

// Mock data - will be replaced with real data from hooks
const mockViewsData = [
  { date: 'Mon', views: 12400 },
  { date: 'Tue', views: 15200 },
  { date: 'Wed', views: 18900 },
  { date: 'Thu', views: 14300 },
  { date: 'Fri', views: 22100 },
  { date: 'Sat', views: 28500 },
  { date: 'Sun', views: 31200 },
];

const mockSubsData = [
  { date: 'Mon', gained: 120, lost: 15 },
  { date: 'Tue', gained: 180, lost: 22 },
  { date: 'Wed', gained: 150, lost: 18 },
  { date: 'Thu', gained: 210, lost: 25 },
  { date: 'Fri', gained: 280, lost: 30 },
  { date: 'Sat', gained: 320, lost: 35 },
  { date: 'Sun', gained: 290, lost: 28 },
];

export function AnalyticsOverview({ channelId }: AnalyticsOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Views (7d)</span>
            </div>
            <p className="text-2xl font-bold mt-1">142.6K</p>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +12.5%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">New Subs (7d)</span>
            </div>
            <p className="text-2xl font-bold mt-1">+1,550</p>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +8.3%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Watch Time</span>
            </div>
            <p className="text-2xl font-bold mt-1">4,250h</p>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +5.2%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg. CTR</span>
            </div>
            <p className="text-2xl font-bold mt-1">6.8%</p>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +0.4%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Views Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockViewsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscriber Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockSubsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="gained" fill="hsl(var(--primary))" />
                  <Bar dataKey="lost" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
