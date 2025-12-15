import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { YouTubeBrandDeal } from "@/types/streamengine";
import { DollarSign, Calendar, Building2, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface BrandDealCardProps {
  deal: YouTubeBrandDeal;
}

export function BrandDealCard({ deal }: BrandDealCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'contracted': case 'active': case 'completed': return 'default';
      case 'negotiating': return 'secondary';
      case 'prospecting': case 'outreach': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">{deal.brandName}</CardTitle>
          </div>
          <Badge variant={getStatusColor(deal.status)}>{deal.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{deal.dealType}</p>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <div>
              <p className="font-semibold">{formatCurrency(deal.rateNegotiatedCents || deal.rateOfferedCents)}</p>
              <p className="text-xs text-muted-foreground">Deal Value</p>
            </div>
          </div>
          {deal.endDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-semibold">{format(new Date(deal.endDate), 'MMM d')}</p>
                <p className="text-xs text-muted-foreground">End Date</p>
              </div>
            </div>
          )}
        </div>
        {deal.deliverables && deal.deliverables.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-1">Deliverables:</p>
            <div className="flex flex-wrap gap-1">
              {deal.deliverables.map((d) => (
                <Badge key={d.id} variant="outline" className="text-xs">{d.type}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 gap-2">
        <Button variant="outline" size="sm" className="flex-1"><MessageSquare className="h-4 w-4 mr-1" />Contact</Button>
        <Button size="sm" className="flex-1">View Details</Button>
      </CardFooter>
    </Card>
  );
}
