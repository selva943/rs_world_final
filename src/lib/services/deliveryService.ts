/**
 * deliveryService.ts
 * Business logic for delivery slot availability and booking capacity.
 */

import { supabase } from '@/lib/supabase';

export interface DeliverySlot {
  date: string;
  time: string;
  bookings: number;
  capacity: number;
  available: boolean;
  label: string;
}

const DEFAULT_SLOT_CAPACITY = 20; // max orders per slot

const STANDARD_SLOTS = [
  { time: '07:00-09:00', label: 'Morning (7–9 AM)' },
  { time: '09:00-12:00', label: 'Late Morning (9–12 PM)' },
  { time: '14:00-17:00', label: 'Afternoon (2–5 PM)' },
  { time: '17:00-20:00', label: 'Evening (5–8 PM)' },
];

/**
 * Get available delivery slots for a given date.
 * Returns each slot with its booking count and availability.
 */
export async function getAvailableSlots(date: string): Promise<DeliverySlot[]> {
  try {
    // Count orders per time slot for the given date
    const { data, error } = await supabase
      .from('orders')
      .select('scheduled_time')
      .eq('scheduled_date', date)
      .not('status', 'eq', 'cancelled');

    if (error) {
      console.error('[deliveryService] Failed to fetch slot data:', error);
      // Optimistic fallback — return all slots as available
      return STANDARD_SLOTS.map(slot => ({
        date,
        ...slot,
        bookings: 0,
        capacity: DEFAULT_SLOT_CAPACITY,
        available: true,
      }));
    }

    const countBySlot: Record<string, number> = {};
    const rows = (data || []) as { scheduled_time: string | null }[];
    rows.forEach(row => {
      if (row.scheduled_time) {
        countBySlot[row.scheduled_time] = (countBySlot[row.scheduled_time] || 0) + 1;
      }
    });

    return STANDARD_SLOTS.map(slot => {
      const bookings = countBySlot[slot.time] || 0;
      return {
        date,
        time: slot.time,
        label: slot.label,
        bookings,
        capacity: DEFAULT_SLOT_CAPACITY,
        available: bookings < DEFAULT_SLOT_CAPACITY,
      };
    });
  } catch (err) {
    console.error('[deliveryService] Unexpected error:', err);
    return [];
  }
}

/**
 * Check if a specific slot on a given date is still available.
 */
export async function isSlotAvailable(date: string, time: string): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('scheduled_date', date)
      .eq('scheduled_time', time)
      .not('status', 'eq', 'cancelled');

    if (error) return true; // optimistic fallback
    return (count || 0) < DEFAULT_SLOT_CAPACITY;
  } catch {
    return true;
  }
}

/**
 * Haversine formula to calculate distance between two points in km.
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Find the nearest available delivery agent for an order.
 * Note: If no agent system exists, it returns null but keeps structure ready.
 */
export async function findNearestAgent(orderLat: number, orderLng: number): Promise<string | null> {
  try {
    // 1. Fetch available agents (assuming they have lat/lng in profiles or a specific table)
    // For this lightweight version, we check the 'profiles' table for any user with role='agent'
    const { data: agents, error } = await supabase
      .from('profiles')
      .select('id, latitude, longitude')
      .eq('role', 'agent')
      .eq('is_available', true);

    if (error || !agents || agents.length === 0) return null;

    let nearestId: string | null = null;
    let minDistance = Infinity;

    (agents as any[]).forEach(agent => {
      const aLat = agent.latitude;
      const aLng = agent.longitude;
      if (aLat && aLng) {
        const dist = calculateDistance(orderLat, orderLng, aLat, aLng);
        if (dist < minDistance) {
          minDistance = dist;
          nearestId = agent.id;
        }
      }
    });

    return nearestId;
  } catch (err) {
    console.error('[deliveryService] Nearest agent search failed:', err);
    return null;
  }
}
