import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { OfferAnalytics } from '../components/OfferAnalytics';
import { useData } from '../context/DataContext';
import { offerUsageTracker } from '../utils/offerUsageTracker';
import { ArrowLeft, Calendar, Download, RefreshCw } from 'lucide-react';

export function Analytics() {
  const { offers } = useData();
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  });
  const [usageData, setUsageData] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Load usage data
    const data = offerUsageTracker.getUsageData();
    setUsageData(data);
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleExportData = () => {
    const data = {
      offers: offers,
      usageData: usageData,
      analytics: offerUsageTracker.getAnalytics(),
      topOffers: offerUsageTracker.getTopOffers(),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offer-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Offer Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into offer performance and customer engagement
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">From:</label>
              <input
                type="date"
                value={dateRange.start.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                className="px-3 py-1 border rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">To:</label>
              <input
                type="date"
                value={dateRange.end.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                className="px-3 py-1 border rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analytics */}
      <OfferAnalytics 
        offers={offers} 
        offerUsage={usageData}
        dateRange={dateRange}
      />

      {/* Additional Insights */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm">Total Offers Created</span>
                <Badge variant="secondary">{offers.length}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm">Total Tracked Usage</span>
                <Badge variant="secondary">{usageData.length}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm">Average Usage per Offer</span>
                <Badge variant="secondary">
                  {offers.length > 0 ? (usageData.length / offers.length).toFixed(1) : '0'}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm">Data Freshness</span>
                <Badge variant="secondary">
                  {usageData.length > 0 
                    ? new Date(usageData[usageData.length - 1]?.['used_at'] || new Date()).toLocaleDateString()
                    : 'No data'
                  }
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">
                  Local Storage Usage
                </div>
                <div className="text-lg font-semibold">
                  {JSON.stringify(usageData).length} characters
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all usage data? This cannot be undone.')) {
                    offerUsageTracker.clearUsageData();
                    setRefreshKey(prev => prev + 1);
                  }
                }}
              >
                Clear Usage Data
              </Button>
              
              <div className="text-xs text-muted-foreground">
                Note: Usage data is currently stored locally in your browser. 
                In a production environment, this would be stored on the server.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
