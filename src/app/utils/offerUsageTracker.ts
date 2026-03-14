import { OfferUsage } from '../types';

export class OfferUsageTracker {
  private static instance: OfferUsageTracker;
  private usageData: OfferUsage[] = [];

  private constructor() {
    // Load existing usage data from localStorage
    this.loadUsageData();
  }

  public static getInstance(): OfferUsageTracker {
    if (!OfferUsageTracker.instance) {
      OfferUsageTracker.instance = new OfferUsageTracker();
    }
    return OfferUsageTracker.instance;
  }

  private loadUsageData(): void {
    try {
      const stored = localStorage.getItem('offer_usage_data');
      if (stored) {
        this.usageData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading offer usage data:', error);
      this.usageData = [];
    }
  }

  private saveUsageData(): void {
    try {
      localStorage.setItem('offer_usage_data', JSON.stringify(this.usageData));
    } catch (error) {
      console.error('Error saving offer usage data:', error);
    }
  }

  public trackOfferUsage(
    offerId: string,
    userId?: string,
    productId?: string,
    originalPrice?: number,
    discountedPrice?: number,
    quantity?: number
  ): void {
    const usage: OfferUsage = {
      id: crypto.randomUUID(),
      offer_id: offerId,
      user_id: userId || 'anonymous',
      product_id: productId || null,
      original_price: originalPrice || 0,
      discounted_price: discountedPrice || 0,
      discount_amount: (originalPrice || 0) - (discountedPrice || 0),
      quantity: quantity || 1,
      used_at: new Date().toISOString(),
      ip_address: this.getClientIP(),
      user_agent: navigator.userAgent,
      session_id: this.getSessionId()
    };

    this.usageData.push(usage);
    this.saveUsageData();

    // Also send to server if available
    this.sendUsageToServer(usage);
  }

  public getUsageData(): OfferUsage[] {
    return [...this.usageData];
  }

  public getUsageByOffer(offerId: string): OfferUsage[] {
    return this.usageData.filter(usage => usage.offer_id === offerId);
  }

  public getUsageByDateRange(startDate: Date, endDate: Date): OfferUsage[] {
    return this.usageData.filter(usage => {
      const usageDate = new Date(usage.used_at);
      return usageDate >= startDate && usageDate <= endDate;
    });
  }

  public getUsageByUser(userId: string): OfferUsage[] {
    return this.usageData.filter(usage => usage.user_id === userId);
  }

  public getTopOffers(limit: number = 10): Array<{ offerId: string; usageCount: number; totalSavings: number }> {
    const offerStats = new Map<string, { usageCount: number; totalSavings: number }>();

    this.usageData.forEach(usage => {
      const existing = offerStats.get(usage.offer_id) || { usageCount: 0, totalSavings: 0 };
      offerStats.set(usage.offer_id, {
        usageCount: existing.usageCount + 1,
        totalSavings: existing.totalSavings + usage.discount_amount
      });
    });

    return Array.from(offerStats.entries())
      .map(([offerId, stats]) => ({ offerId, ...stats }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  public clearUsageData(): void {
    this.usageData = [];
    this.saveUsageData();
  }

  public exportUsageData(): string {
    return JSON.stringify(this.usageData, null, 2);
  }

  public getAnalytics() {
    const totalUsage = this.usageData.length;
    const totalSavings = this.usageData.reduce((sum, usage) => sum + usage.discount_amount, 0);
    const averageSavings = totalUsage > 0 ? totalSavings / totalUsage : 0;
    
    const uniqueUsers = new Set(this.usageData.map(usage => usage.user_id)).size;
    const uniqueOffers = new Set(this.usageData.map(usage => usage.offer_id)).size;

    // Usage by month
    const monthlyUsage = new Map<string, number>();
    this.usageData.forEach(usage => {
      const month = usage.used_at.substring(0, 7); // YYYY-MM
      monthlyUsage.set(month, (monthlyUsage.get(month) || 0) + 1);
    });

    return {
      totalUsage,
      totalSavings,
      averageSavings,
      uniqueUsers,
      uniqueOffers,
      monthlyUsage: Object.fromEntries(monthlyUsage)
    };
  }

  private getClientIP(): string {
    // In a real implementation, this would get the client IP from the server
    // For now, return a placeholder
    return 'client_ip';
  }

  private getSessionId(): string {
    // Get or create a session ID
    let sessionId = sessionStorage.getItem('offer_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('offer_session_id', sessionId);
    }
    return sessionId;
  }

  private async sendUsageToServer(usage: OfferUsage): Promise<void> {
    try {
      // In a real implementation, this would send the data to your server
      // For now, we'll just log it
      console.log('Offer usage tracked:', usage);
      
      // Example server call (commented out):
      // await fetch('/api/offer-usage', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(usage)
      // });
    } catch (error) {
      console.error('Error sending usage to server:', error);
    }
  }

  // Method to track offer views (impressions)
  public trackOfferView(offerId: string, userId?: string): void {
    // Similar to trackOfferUsage but for views
    const viewData = {
      id: crypto.randomUUID(),
      offer_id: offerId,
      user_id: userId || 'anonymous',
      viewed_at: new Date().toISOString(),
      session_id: this.getSessionId(),
      type: 'view'
    };

    // Store views separately or in the same usage data with a type field
    console.log('Offer view tracked:', viewData);
  }

  // Method to track offer clicks
  public trackOfferClick(offerId: string, userId?: string): void {
    const clickData = {
      id: crypto.randomUUID(),
      offer_id: offerId,
      user_id: userId || 'anonymous',
      clicked_at: new Date().toISOString(),
      session_id: this.getSessionId(),
      type: 'click'
    };

    console.log('Offer click tracked:', clickData);
  }

  // Method to get conversion rate
  public getConversionRate(offerId: string): number {
    // This would require tracking both views and usage
    // For now, return a placeholder calculation
    const usage = this.getUsageByOffer(offerId);
    const views = 1; // This would come from view tracking data
    return views > 0 ? (usage.length / views) * 100 : 0;
  }
}

// Export a singleton instance
export const offerUsageTracker = OfferUsageTracker.getInstance();
