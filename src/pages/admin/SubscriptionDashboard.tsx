import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  RefreshCcw, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Package,
  Activity,
  ChevronRight,
  MoreVertical,
  Zap,
  Flame,
  Globe
} from 'lucide-react';
import { subscriptionsApi } from '@/lib/services/api';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const SubscriptionDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await subscriptionsApi.getMetrics();
        setMetrics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-12 h-12 text-pb-green-deep animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-playfair font-black text-slate-900 tracking-tight mb-2">
            Subscription Analytics
          </h2>
          <p className="text-slate-500 font-medium">Monitoring recurring revenue health and delivery volume.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-2xl h-12 border-slate-200">
             <Calendar className="w-4 h-4 mr-2" /> Export Report
           </Button>
           <Button className="bg-pb-green-deep hover:bg-emerald-800 text-white rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-900/10">
             Build Bundle Offer
           </Button>
        </div>
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Monthly Recurring (MRR)" 
          value={`₹${(metrics.mrr / 1000).toFixed(1)}k`} 
          trend={`+${metrics.revenue_growth}%`}
          isUp={true}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-emerald-500"
        />
        <MetricCard 
          title="Active Members" 
          value={metrics.active_subscriptions} 
          trend="+12"
          isUp={true}
          icon={<Users className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <MetricCard 
          title="Churn Rate" 
          value={`${metrics.churn_rate}%`} 
          trend={`${metrics.churn_trend}%`}
          isUp={false}
          icon={<RefreshCcw className="w-6 h-6" />}
          color="bg-rose-500"
        />
        <MetricCard 
          title="Daily Shipments" 
          value="156" 
          trend="+8.4%"
          isUp={true}
          icon={<Package className="w-6 h-6" />}
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Forecast Chart (Simplified placeholder with CSS/Framer) */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-10">
                <div>
                   <h3 className="text-2xl font-black text-slate-800 font-playfair italic">Revenue Forecast</h3>
                   <p className="text-sm text-slate-400 font-medium">Estimated growth over next 4 months</p>
                </div>
                <Activity className="w-6 h-6 text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="h-[300px] flex items-end justify-between gap-4 px-4">
               {metrics.forecast.map((f: any, i: number) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-4">
                    <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${(f.revenue / 150000) * 100}%` }}
                        transition={{ delay: i * 0.1, duration: 1, ease: 'circOut' }}
                        className="w-full max-w-[60px] bg-gradient-to-t from-emerald-50 via-emerald-100 to-emerald-500 rounded-2xl relative group/bar"
                    >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                            ₹{(f.revenue / 1000).toFixed(0)}k
                        </div>
                    </motion.div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{f.month}</span>
                 </div>
               ))}
            </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-pb-green-deep rounded-[2.5rem] p-10 text-white border border-emerald-800 shadow-2xl relative overflow-hidden">
            <Globe className="absolute -top-10 -right-10 w-48 h-48 text-white/5" />
            <h3 className="text-2xl font-black font-playfair italic mb-8 relative z-10">Kit Distribution</h3>
            
            <div className="space-y-6 relative z-10">
               {metrics.categories.map((c: any, i: number) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest bg-white/5 p-2 rounded-xl">
                       <span>{c.name}</span>
                       <span className="text-emerald-300">{c.value}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${c.value}%` }}
                          transition={{ delay: 0.5 + (i * 0.1), duration: 1.5 }}
                          className="h-full bg-emerald-400"
                       />
                    </div>
                 </div>
               ))}
            </div>

            <div className="mt-12 p-6 bg-white/10 rounded-3xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                   <Zap className="w-5 h-5 text-amber-400" />
                   <span className="font-black text-sm uppercase tracking-widest text-[#FFF59D]">Growth Insight</span>
                </div>
                <p className="text-xs text-emerald-100/70 font-medium leading-relaxed">
                   Dairy subscriptions increased by 15% this month. Recommendation: Bundle with "Breakfast Essentials" for better stickiness.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, trend, isUp, icon, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl hover:shadow-emerald-900/5 transition-all"
  >
    <div className="flex items-center justify-between mb-6">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", color)}>
        {icon}
      </div>
      <Button variant="ghost" size="icon" className="rounded-full text-slate-300">
        <MoreVertical className="w-4 h-4" />
      </Button>
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{title}</p>
      <div className="flex items-end gap-3">
        <h4 className="text-3xl font-black text-slate-900 leading-none">{value}</h4>
        <div className={cn(
          "flex items-center text-[10px] font-black h-5 px-2 rounded-lg mb-0.5",
          isUp ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
        )}>
          {isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
          {trend}
        </div>
      </div>
    </div>
  </motion.div>
);

const Loader2 = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);
