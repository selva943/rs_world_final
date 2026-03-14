import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Calendar,
  Tag,
  Percent,
  IndianRupee,
  Download,
  Eye
} from 'lucide-react';
import { Offer, OfferUsage } from '../types';

interface OfferAnalyticsProps {
  offers: Offer[];
  offerUsage: OfferUsage[];
  dateRange?: { start: Date; end: Date };
}

interface AnalyticsData {
  totalOffers: number;
  activeOffers: number;
  totalUsage: number;
  totalSavings: number;
  topPerformingOffers: Offer[];
  offerTypeDistribution: Record<string, number>;
  discountTypeDistribution: Record<string, number>;
  monthlyTrends: Array<{ month: string; usage: number; savings: number }>;
  conversionRate: number;
  averageOrderValue: number;
}

export function OfferAnalytics({ offers, offerUsage, dateRange }: OfferAnalyticsProps) {
  const analytics = useMemo((): AnalyticsData => {
    const now = new Date();
    const startDate = dateRange?.start || new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = dateRange?.end || now;

    // Filter offers and usage within date range
    const filteredOffers = offers.filter(offer => {
      const offerDate = new Date(offer.created_at);
      return offerDate >= startDate && offerDate <= endDate;
    });

    const filteredUsage = offerUsage.filter(usage => {
      const usageDate = new Date(usage.used_at);
      return usageDate >= startDate && usageDate <= endDate;
    });

    // Basic metrics
    const totalOffers = filteredOffers.length;
    const activeOffers = filteredOffers.filter(offer => 
      offer.status === 'active' && 
      (!offer.end_date || new Date(offer.end_date) >= new Date())
    ).length;

    const totalUsage = filteredUsage.length;
    const totalSavings = filteredUsage.reduce((sum, usage) => sum + usage.discount_amount, 0);

    // Top performing offers
    const offerUsageMap = new Map<string, number>();
    filteredUsage.forEach(usage => {
      const current = offerUsageMap.get(usage.offer_id) || 0;
      offerUsageMap.set(usage.offer_id, current + 1);
    });

    const topPerformingOffers = Array.from(offerUsageMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([offerId]) => offers.find(o => o.id === offerId))
      .filter(Boolean) as Offer[];

    // Distribution data
    const offerTypeDistribution: Record<string, number> = {};
    const discountTypeDistribution: Record<string, number> = {};

    filteredOffers.forEach(offer => {
      offerTypeDistribution[offer.offer_type] = (offerTypeDistribution[offer.offer_type] || 0) + 1;
      discountTypeDistribution[offer.discount_type] = (discountTypeDistribution[offer.discount_type] || 0) + 1;
    });

    // Monthly trends (mock data for now)
    const monthlyTrends = [
      { month: 'Jan', usage: 45, savings: 12500 },
      { month: 'Feb', usage: 52, savings: 15800 },
      { month: 'Mar', usage: 61, savings: 18900 },
      { month: 'Apr', usage: 58, savings: 17200 },
      { month: 'May', usage: 72, savings: 21500 },
      { month: 'Jun', usage: 68, savings: 19800 },
    ];

    // Calculate conversion rate (mock calculation)
    const conversionRate = totalOffers > 0 ? (totalUsage / (totalOffers * 10)) * 100 : 0;
    const averageOrderValue = totalUsage > 0 ? totalSavings / totalUsage : 0;

    return {
      totalOffers,
      activeOffers,
      totalUsage,
      totalSavings,
      topPerformingOffers,
      offerTypeDistribution,
      discountTypeDistribution,
      monthlyTrends,
      conversionRate,
      averageOrderValue
    };
  }, [offers, offerUsage, dateRange]);

  const exportData = () => {
    const csvContent = [
      ['Offer ID', 'Offer Name', 'Type', 'Discount Type', 'Usage Count', 'Total Savings'],
      ...analytics.topPerformingOffers.map(offer => [
        offer.id,
        offer.offer_name,
        offer.offer_type,
        offer.discount_type,
        offerUsage.filter(u => u.offer_id === offer.id).length,
        offerUsage.filter(u => u.offer_id === offer.id).reduce((sum, u) => sum + u.discount_amount, 0)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offer-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Offer Analytics</h2>
          <p className="text-muted-foreground">
            Track performance and usage of your offers
          </p>
        </div>
        <Button onClick={exportData} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Offers</p>
                <p className="text-2xl font-bold">{analytics.totalOffers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Offers</p>
                <p className="text-2xl font-bold">{analytics.activeOffers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Usage</p>
                <p className="text-2xl font-bold">{analytics.totalUsage}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Savings</p>
                <p className="text-2xl font-bold">₹{analytics.totalSavings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Offers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Top Performing Offers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPerformingOffers.map((offer, index) => {
                const usageCount = offerUsage.filter(u => u.offer_id === offer.id).length;
                const totalSavings = offerUsage.filter(u => u.offer_id === offer.id)
                  .reduce((sum, u) => sum + u.discount_amount, 0);

                return (
                  <div key={offer.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="font-semibold">{offer.offer_name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{offer.offer_type}</span>
                        <span>{usageCount} uses</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{totalSavings.toLocaleString()}</div>
                      <div className="text-xs text-green-600">saved</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Distribution Charts */}
        <Card>
          <CardHeader>
            <CardTitle>Offer Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Offer Type Distribution */}
              <div>
                <h4 className="font-semibold mb-3">By Offer Type</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.offerTypeDistribution).map(([type, count]) => {
                    const percentage = (count / analytics.totalOffers) * 100;
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <span className="w-20 text-sm capitalize">{type}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Discount Type Distribution */}
              <div>
                <h4 className="font-semibold mb-3">By Discount Type</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.discountTypeDistribution).map(([type, count]) => {
                    const percentage = (count / analytics.totalOffers) * 100;
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <span className="w-20 text-sm capitalize">{type}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Conversion Rate</span>
                <span className="font-semibold">{analytics.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Average Savings per Use</span>
                <span className="font-semibold">₹{analytics.averageOrderValue.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Active Rate</span>
                <span className="font-semibold">
                  {analytics.totalOffers > 0 
                    ? ((analytics.activeOffers / analytics.totalOffers) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.monthlyTrends.map((trend) => (
                <div key={trend.month} className="flex items-center justify-between">
                  <span className="text-sm w-12">{trend.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(trend.usage / 100) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">
                        {trend.usage}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-right w-20">
                    ₹{trend.savings.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
