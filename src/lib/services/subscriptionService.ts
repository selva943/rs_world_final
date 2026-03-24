import { supabase } from '@/lib/supabase';
import { Subscription, SubscriptionDelivery, Experience } from '@/types/app';
import { addDays, addWeeks, addMonths, format, startOfToday, isAfter, parseISO } from 'date-fns';

export const subscriptionService = {
  // Get all subscriptions for a user by phone or ID
  async getByUser(phone?: string, userId?: string): Promise<Subscription[]> {
    let query = (supabase.from('subscriptions') as any)
      .select('*, product:products(*)');
    
    if (userId) {
      query = query.eq('user_id', userId);
    } else if (phone) {
      query = query.eq('user_phone', phone);
    } else {
      return [];
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
    return data || [];
  },

  // Legacy — calls getByUser
  async getByPhone(phone: string): Promise<Subscription[]> {
    return this.getByUser(phone);
  },

  // Create a new subscription
  async create(subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription | null> {
    const nextDelivery = this.calculateNextDelivery(
      subscription.start_date, 
      subscription.frequency, 
      subscription.days_of_week || (subscription as any).schedule?.days
    );

    // Build a safe payload with only columns that exist in the subscriptions table
    // Strips unknown fields like auto_renew, schedule that aren't in the DB schema
    const safePayload: Record<string, any> = {
      user_id: subscription.user_id,
      product_id: subscription.product_id,
      frequency: subscription.frequency,
      quantity: subscription.quantity,
      start_date: subscription.start_date,
      next_delivery_date: nextDelivery,
      status: 'active',
    };

    // Include optional known columns only if they have values
    if (subscription.user_phone) safePayload.user_phone = subscription.user_phone;
    if (subscription.days_of_week?.length) safePayload.days_of_week = subscription.days_of_week;
    if (subscription.total_per_delivery) safePayload.total_per_delivery = subscription.total_per_delivery;

    const { data, error } = await (supabase.from('subscriptions') as any)
      .insert(safePayload)
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      return null;
    }

    // Log the creation
    await this.logAction(data.id, 'Created subscription');
    
    return data;
  },

  // Update subscription status (pause/resume/cancel)
  async updateStatus(id: string, status: 'active' | 'paused' | 'cancelled'): Promise<boolean> {
    const { error } = await (supabase.from('subscriptions') as any)
      .update({ status })
      .eq('id', id);
    
    if (!error) {
      await this.logAction(id, `Status changed to ${status}`);
    }
    
    return !error;
  },

  // Log a subscription action
  async logAction(subscriptionId: string, action: string): Promise<void> {
    const { error } = await (supabase.from('subscription_logs') as any)
      .insert({ subscription_id: subscriptionId, action });
    
    if (error) console.error('Error logging subscription action:', error);
  },

  // Calculate the next delivery date based on frequency and schedule
  calculateNextDelivery(startDateStr: string, frequency: string, daysOfWeek?: number[]): string {
    const startDate = parseISO(startDateStr);
    const today = startOfToday();
    // Default start is either the provided start date (if in future) or today
    let baseDate = isAfter(startDate, today) ? startDate : today;

    if (frequency === 'daily') {
      return format(addDays(baseDate, 1), 'yyyy-MM-dd');
    }

    if (frequency === 'weekly' && daysOfWeek && daysOfWeek.length > 0) {
      // Find the next available day in the weekly schedule
      for (let i = 1; i <= 7; i++) {
        const checkDate = addDays(baseDate, i);
        if (daysOfWeek.includes(checkDate.getDay())) {
          return format(checkDate, 'yyyy-MM-dd');
        }
      }
    }

    if (frequency === 'alternate') {
      // Alternate is every 2 days
      return format(addDays(baseDate, 2), 'yyyy-MM-dd');
    }

    if (frequency === 'monthly') {
      // Monthly is usually same date next month
      return format(addMonths(baseDate, 1), 'yyyy-MM-dd');
    }

    return format(addDays(baseDate, 1), 'yyyy-MM-dd'); // Default to next day
  },

  // Get delivery history for a subscription
  async getDeliveries(subscriptionId: string): Promise<SubscriptionDelivery[]> {
    const { data, error } = await (supabase.from('subscription_deliveries') as any)
      .select('*')
      .eq('subscription_id', subscriptionId)
      .order('delivery_date', { ascending: false });

    if (error) return [];
    return data || [];
  },

  // Get logs for a subscription
  async getLogs(subscriptionId: string) {
    const { data, error } = await (supabase.from('subscription_logs') as any)
      .select('*')
      .eq('subscription_id', subscriptionId)
      .order('created_at', { ascending: false });

    return data || [];
  },

  // Skip a specific delivery date
  async skipDelivery(subscriptionId: string, date: string): Promise<boolean> {
    const { error } = await (supabase.from('subscription_deliveries') as any)
      .insert({
        subscription_id: subscriptionId,
        delivery_date: date,
        status: 'skipped'
      });
    
    if (!error) {
      await this.logAction(subscriptionId, `Skipped delivery for ${date}`);
    }
    
    return !error;
  },

  // AUTO ORDER GENERATION LOGIC (For CRON/Function)
  // This would be called by a daily scheduled job
  async processAutoDeliveries(): Promise<{ success: number; failed: number }> {
    const today = format(startOfToday(), 'yyyy-MM-dd');
    
    // 1. Fetch active subscriptions due today
    const { data: dueSubscriptions, error } = await (supabase.from('subscriptions') as any)
      .select('*, product:products(*)')
      .eq('status', 'active')
      .eq('next_delivery_date', today);

    if (error || !dueSubscriptions) {
      console.error('Error fetching due subscriptions:', error);
      return { success: 0, failed: 0 };
    }

    let successCount = 0;
    let failedCount = 0;

    for (const sub of dueSubscriptions) {
      try {
        // 2. Create Order for this delivery
        const { data: order, error: orderError } = await (supabase.from('orders') as any)
          .insert({
            user_id: sub.user_id,
            total_amount: sub.total_per_delivery,
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'subscription',
            customer_name: sub.user_phone, // Fallback
            phone: sub.user_phone,
            notes: `Auto-generated from subscription #${sub.id.slice(0, 8)}`
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // 3. Create Order Item
        await (supabase.from('order_items') as any).insert({
          order_id: order.id,
          product_id: sub.product_id,
          quantity: sub.quantity,
          price: sub.total_per_delivery / sub.quantity
        });

        // 4. Record the delivery attempt
        await (supabase.from('subscription_deliveries') as any).insert({
          subscription_id: sub.id,
          order_id: order.id,
          delivery_date: today,
          status: 'pending'
        });

        // 5. Update next delivery date
        const nextDate = this.calculateNextDelivery(today, sub.frequency, sub.days_of_week || sub.schedule?.days);
        await (supabase.from('subscriptions') as any).update({ 
          next_delivery_date: nextDate 
        }).eq('id', sub.id);

        successCount++;
      } catch (err) {
        console.error(`Failed to process sub ${sub.id}:`, err);
        failedCount++;
      }
    }

    return { success: successCount, failed: failedCount };
  }
};
