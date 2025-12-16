import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBrandDeals, useUpdateDealStatus } from '@/hooks/useStreamEngineFeatures';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Handshake, 
  DollarSign, 
  Calendar,
  Building2,
  CheckCircle,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

interface BrandDealsPanelProps {
  channelId: string;
}

const statusColors: Record<string, string> = {
  prospecting: 'bg-blue-500/10 text-blue-500',
  outreach: 'bg-cyan-500/10 text-cyan-500',
  negotiating: 'bg-amber-500/10 text-amber-500',
  contracted: 'bg-purple-500/10 text-purple-500',
  active: 'bg-green-500/10 text-green-500',
  completed: 'bg-green-600/10 text-green-600',
  cancelled: 'bg-destructive/10 text-destructive',
};

export function BrandDealsPanel({ channelId }: BrandDealsPanelProps) {
  const { data: deals, isLoading } = useBrandDeals(channelId);
  const updateStatus = useUpdateDealStatus();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  const activeDeals = deals?.filter(d => !['completed', 'cancelled'].includes(d.status || '')) || [];
  const completedDeals = deals?.filter(d => ['completed', 'cancelled'].includes(d.status || '')) || [];

  const totalValue = activeDeals.reduce((sum, d) => sum + (d.rateNegotiatedCents || d.rateOfferedCents || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Handshake className="h-4 w-4" />
              <span className="text-sm">Active Deals</span>
            </div>
            <p className="text-2xl font-bold">{activeDeals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Pipeline Value</span>
            </div>
            <p className="text-2xl font-bold">${(totalValue / 100).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Completed</span>
            </div>
            <p className="text-2xl font-bold">
              {completedDeals.filter(d => d.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Deals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Active Brand Deals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeDeals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No active brand deals. New opportunities will appear here.
            </p>
          ) : (
            <div className="space-y-4">
              {activeDeals.map(deal => (
                <Card key={deal.id} className="border-l-4 border-l-primary">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{deal.brandName}</span>
                        </div>
                        {deal.contactEmail && (
                          <p className="text-sm text-muted-foreground">{deal.contactEmail}</p>
                        )}
                      </div>
                      <Badge className={statusColors[deal.status || 'prospecting']}>
                        {deal.status?.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-medium">
                          ${((deal.rateNegotiatedCents || deal.rateOfferedCents || 0) / 100).toLocaleString()}
                        </span>
                      </div>
                      {deal.endDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(deal.endDate), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>

                    {/* Deliverables */}
                    {deal.deliverables && deal.deliverables.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground mb-1">Deliverables:</p>
                        <div className="flex flex-wrap gap-2">
                          {deal.deliverables.map((d, i) => (
                            <Badge key={i} variant="outline">{d.type}: {d.description}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {deal.notes && (
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {deal.notes}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      {deal.status === 'prospecting' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => updateStatus.mutate({ 
                              dealId: deal.id, 
                              status: 'outreach' 
                            })}
                          >
                            Start Outreach
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateStatus.mutate({ 
                              dealId: deal.id, 
                              status: 'cancelled' 
                            })}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      {deal.status === 'outreach' && (
                        <Button 
                          size="sm"
                          onClick={() => updateStatus.mutate({ 
                            dealId: deal.id, 
                            status: 'negotiating' 
                          })}
                        >
                          Start Negotiation
                        </Button>
                      )}
                      {deal.status === 'negotiating' && (
                        <Button 
                          size="sm"
                          onClick={() => updateStatus.mutate({ 
                            dealId: deal.id, 
                            status: 'contracted' 
                          })}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Mark Contracted
                        </Button>
                      )}
                      {deal.status === 'contracted' && (
                        <Button 
                          size="sm"
                          onClick={() => updateStatus.mutate({ 
                            dealId: deal.id, 
                            status: 'active' 
                          })}
                        >
                          Start Production
                        </Button>
                      )}
                      {deal.status === 'active' && (
                        <Button 
                          size="sm"
                          onClick={() => updateStatus.mutate({ 
                            dealId: deal.id, 
                            status: 'completed' 
                          })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Completed
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
