import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Offer } from '@/types/app';

interface OfferAnalyticsProps {
  offers: Offer[];
  offerUsage: any[];
  dateRange: { start: Date; end: Date };
}

export function OfferAnalytics({ offers, offerUsage, dateRange }: OfferAnalyticsProps) {
  const activeOffers = offers.filter(o => o.is_active);
  const featuredOffers = offers.filter(o => o.is_featured);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Total Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-black text-slate-900">{offers.length}</p>
          <p className="text-sm text-muted-foreground mt-1">{activeOffers.length} active</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Featured Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-black text-slate-900">{featuredOffers.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Currently highlighted</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage Records</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-black text-slate-900">{offerUsage.length}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {dateRange.start.toLocaleDateString()} – {dateRange.end.toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
