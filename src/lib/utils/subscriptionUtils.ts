import { Subscription } from '@/types/app';

/**
 * Calculates the next delivery date for a subscription based on its frequency and schedule.
 */
export function calculateNextDeliveryDate(subscription: Subscription, fromDate: Date = new Date()): Date {
  const next = new Date(fromDate);
  next.setHours(0, 0, 0, 0);

  // If subscription is not active, there is no next delivery
  if (subscription.status !== 'active') return next;

  switch (subscription.frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;

    case 'weekly': {
      const allowedDays = subscription.schedule.days || [];
      if (allowedDays.length === 0) {
        next.setDate(next.getDate() + 7); // Default to same day next week
      } else {
        // Find the next allowed day after today
        let found = false;
        for (let i = 1; i <= 7; i++) {
          const checkDate = new Date(next);
          checkDate.setDate(next.getDate() + i);
          if (allowedDays.includes(checkDate.getDay())) {
            next.setDate(checkDate.getDate());
            found = true;
            break;
          }
        }
        if (!found) next.setDate(next.getDate() + 7);
      }
      break;
    }

    case 'monthly': {
      const allowedDates = subscription.schedule.dates || [1];
      const currentDay = next.getDate();
      
      // Find the next allowed date in current or next month
      let targetDate = allowedDates.find(d => d > currentDay);
      if (targetDate) {
        next.setDate(targetDate);
      } else {
        // Move to next month
        next.setMonth(next.getMonth() + 1);
        next.setDate(allowedDates[0]);
      }
      break;
    }

    default:
      next.setDate(next.getDate() + 1);
  }

  return next;
}

/**
 * Generates mock orders for a set of subscriptions for a specific date.
 * Used by the background "Order Generation Engine".
 */
export function generateSubscriptionOrders(subscriptions: Subscription[], targetDate: Date) {
  return subscriptions
    .filter(s => {
      if (s.status !== 'active') return false;
      const nextDate = calculateNextDeliveryDate(s, new Date(targetDate.getTime() - 86400000));
      return nextDate.toDateString() === targetDate.toDateString();
    })
    .map(s => ({
      subscription_id: s.id,
      product_id: s.product_id,
      customer_phone: s.user_phone,
      quantity: s.quantity,
      delivery_date: targetDate.toISOString(),
      status: 'pending'
    }));
}
