import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Wrench, 
  Clock, 
  ArrowUpRight,
  BarChart2, 
  Zap,
  Star,
  Loader2
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { isToday, parseISO, getHours } from 'date-fns';

export const ServiceDashboard: React.FC = () => {
  const { bookings, services, loading } = useData();

  const metrics = useMemo(() => {
    if (!bookings || !services) return null;

    const todayBookings = bookings.filter(b => isToday(parseISO(b.created_at)));
    const revenueToday = todayBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
    
    // Revenue by service
    const revenueMap = new Map<string, { count: number, revenue: number }>();
    bookings.forEach(b => {
      const sName = b.service?.name || 'Unknown Service';
      const current = revenueMap.get(sName) || { count: 0, revenue: 0 };
      revenueMap.set(sName, { 
        count: current.count + 1, 
        revenue: current.revenue + (Number(b.total_price) || 0) 
      });
    });

    const bookings_by_service = Array.from(revenueMap.entries())
      .map(([service, data]) => ({ service, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5

    // Peak hours
    const hourMap = new Map<number, number>();
    bookings.forEach(b => {
      // parse slot_time or created_at
      let hour = 12;
      try {
        if (b.slot_time) {
          const match = b.slot_time.match(/(\d+)/);
          hour = match ? parseInt(match[0]) + (b.slot_time.toLowerCase().includes('pm') && !b.slot_time.includes('12') ? 12 : 0) : 12;
        } else {
          hour = getHours(parseISO(b.created_at));
        }
      } catch { /* safe fallback */ }
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });

    const peak_hours = [9, 10, 11, 14, 16].map(h => ({
      hour: `${h > 12 ? h - 12 : h} ${h >= 12 ? 'PM' : 'AM'}`,
      bookings: hourMap.get(h) || 0
    }));

    // Find actual max peak
    let bestHour = '2 PM';
    let bestCount = 0;
    hourMap.forEach((count, h) => {
      if (count > bestCount) {
        bestCount = count;
        bestHour = `${h > 12 ? h - 12 : h} ${h >= 12 ? 'PM' : 'AM'}`;
      }
    });

    return {
      total_bookings_today: todayBookings.length,
      revenue_today: revenueToday,
      revenue_growth: 12.5, // Mocked growth
      bookings_by_service,
      peak_hours,
      bestHour,
      bestCount
    };
  }, [bookings, services]);

  if (loading || !metrics) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="w-12 h-12 text-pb-green-deep animate-spin" />
    </div>
  );

  const maxPeak = Math.max(...metrics.peak_hours.map((p) => p.bookings), 1);
  const maxRevenue = Math.max(...metrics.bookings_by_service.map((s) => s.revenue), 1);

  return (
    <div className="space-y-10 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-playfair font-black text-slate-900 tracking-tight mb-2">
            Service Intelligence
          </h2>
          <p className="text-slate-500 font-medium">Real-time performance metrics for your service marketplace.</p>
        </div>
        <Button className="bg-pb-green-deep hover:bg-emerald-800 text-white rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-900/10">
          <Calendar className="w-4 h-4 mr-2" /> Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Today's Bookings", value: metrics.total_bookings_today, icon: <Calendar className="w-6 h-6" />, color: 'bg-blue-500', trend: 'Live updates' },
          { label: "Revenue Today", value: `₹${metrics.revenue_today.toLocaleString()}`, icon: <TrendingUp className="w-6 h-6" />, color: 'bg-emerald-500', trend: `+${metrics.revenue_growth}% growth` },
          { label: "Peak Slot", value: metrics.bestHour, icon: <Clock className="w-6 h-6" />, color: 'bg-amber-500', trend: `${metrics.bestCount} bookings` },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6", m.color)}>{m.icon}</div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{m.label}</p>
            <div className="flex items-end gap-3">
              <h4 className="text-3xl font-black text-slate-900 leading-none">{m.value}</h4>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg mb-0.5 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />{m.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue by Service */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-800 font-playfair italic">Revenue by Service</h3>
            <BarChart2 className="w-5 h-5 text-slate-200" />
          </div>
          <div className="space-y-6">
            {metrics.bookings_by_service.length === 0 ? (
              <p className="text-slate-400 text-sm font-medium">No bookings yet.</p>
            ) : metrics.bookings_by_service.map((s, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Wrench className="w-4 h-4 text-pb-green-deep" />
                    <span className="text-sm font-bold text-slate-700">{s.service}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900">₹{s.revenue.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 ml-2">({s.count} jobs)</span>
                  </div>
                </div>
                <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.revenue / maxRevenue) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 1.2, ease: 'circOut' }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hour Analysis */}
        <div className="bg-pb-green-deep rounded-[2.5rem] p-10 text-white relative overflow-hidden">
          <Zap className="absolute -top-8 -right-8 w-40 h-40 text-white/5" />
          <h3 className="text-xl font-black font-playfair italic mb-2">Peak Hour Analysis</h3>
          <p className="text-emerald-100/60 text-sm font-medium mb-10">Booking demand throughout the day</p>

          <div className="flex items-end justify-between gap-3 h-[200px] px-2">
            {metrics.peak_hours.map((p, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(p.bookings / maxPeak) * 160}px` }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 1, ease: 'circOut' }}
                  className={cn(
                    "w-full rounded-xl",
                    p.bookings > 0 && p.bookings === maxPeak ? 'bg-[#FFF59D]' : 'bg-white/20'
                  )}
                />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-200/70">{p.hour}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3 p-5 bg-white/10 rounded-2xl border border-white/10">
            <Star className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs text-emerald-100/70 font-medium leading-relaxed">
              <span className="text-white font-black">{metrics.bestHour}</span> is your highest recorded slot with {metrics.bestCount} bookings overall. Consider enabling peak-hour pricing (+20%) to maximize revenue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
