import React, { useMemo } from 'react';
import { 
  ShoppingBasket, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Package,
  Zap,
  Truck,
  Tags,
  AlertTriangle,
  RefreshCcw,
  DollarSign,
  Activity
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { safeString } from '@/lib/utils';
import { Link } from 'react-router';

// Tiny bar sparkline component (pure CSS/SVG, no deps)
const Sparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = '#1B5E20' }) => {
  const max = Math.max(...data, 1);
  const width = 160;
  const height = 40;
  const barW = Math.floor(width / data.length) - 2;
  return (
    <svg width={width} height={height} className="overflow-visible">
      {data.map((v, i) => {
        const barH = Math.max(2, (v / max) * height);
        return (
          <rect
            key={i}
            x={i * (barW + 2)}
            y={height - barH}
            width={barW}
            height={barH}
            rx={2}
            fill={color}
            fillOpacity={0.7}
          />
        );
      })}
    </svg>
  );
};

export const DashboardOverview: React.FC = () => {
  const { experiences, orders, subscriptions, coupons, loading } = useData();

  const today = new Date().toISOString().split('T')[0];

  const metrics = useMemo(() => {
    const todayOrders = orders.filter(o => o.created_at?.startsWith(today));
    const todayRevenue = todayOrders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
    const outForDelivery = orders.filter(o => o.status === 'out_for_delivery');
    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const cancelledOrders = orders.filter(o => o.status === 'cancelled');
    
    // 7-day revenue trend
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      return orders
        .filter(o => o.created_at?.startsWith(dateStr) && o.status !== 'cancelled')
        .reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
    });

    return { todayOrders, todayRevenue, pendingOrders, outForDelivery, totalRevenue, activeSubscriptions, cancelledOrders, last7 };
  }, [orders, subscriptions, today]);

  const stats = [
    { 
      label: "Today's Orders", 
      value: metrics.todayOrders.length, 
      icon: ShoppingCart, 
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
      trend: `₹${metrics.todayRevenue.toLocaleString()} Revenue`,
      trendColor: 'text-emerald-600'
    },
    { 
      label: 'Pending Actions', 
      value: metrics.pendingOrders.length, 
      icon: Clock, 
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      trend: `${metrics.pendingOrders.length} awaiting action`,
      trendColor: 'text-amber-600'
    },
    { 
      label: 'Out for Delivery', 
      value: metrics.outForDelivery.length, 
      icon: Truck, 
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      trend: 'Active deliveries',
      trendColor: 'text-blue-600'
    },
    { 
      label: 'Active Subscriptions', 
      value: metrics.activeSubscriptions.length, 
      icon: RefreshCcw, 
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      trend: 'Recurring orders',
      trendColor: 'text-purple-600'
    },
    { 
      label: 'Total Products', 
      value: experiences.length, 
      icon: Package, 
      color: 'text-pb-green-deep',
      bg: 'bg-pb-green-deep/10',
      trend: 'In catalog',
      trendColor: 'text-pb-green-deep'
    },
    { 
      label: 'Gross Revenue',
      value: `₹${Math.round(metrics.totalRevenue / 1000)}K`, 
      icon: TrendingUp, 
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      trend: 'All-time delivered',
      trendColor: 'text-rose-600'
    },
  ];

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, i) => <div key={i} className="h-36 bg-slate-100 rounded-3xl" />)}
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-4xl font-black text-pb-green-deep tracking-tighter uppercase italic">Control Center</h2>
        <p className="text-slate-500 font-medium">Live analytics for {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat, idx) => (
          <Card key={idx} className="bg-white border-pb-green-deep/10 hover:border-pb-green-deep/30 transition-all duration-300 group shadow-sm hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-pb-green-deep tabular-nums">{stat.value}</h3>
              <p className={`text-[10px] mt-2 uppercase tracking-widest font-black ${stat.trendColor}`}>{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics + Logs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Revenue Trend */}
        <Card className="lg:col-span-2 bg-white border-pb-green-deep/10 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-pb-green-deep uppercase tracking-tight">7-Day Revenue Trend</h3>
                <p className="text-[11px] text-slate-400 font-medium">Order revenue for the last 7 days</p>
              </div>
              <Activity className="w-5 h-5 text-pb-green-deep/30" />
            </div>
            <div className="flex items-end gap-1.5 h-20 w-full">
              {metrics.last7.map((v, i) => {
                const max = Math.max(...metrics.last7, 1);
                const heightPct = Math.max(4, (v / max) * 100);
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short' });
                const isToday = i === 6;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full relative group/bar">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-700 ${isToday ? 'bg-pb-green-deep' : 'bg-pb-green-deep/20 hover:bg-pb-green-deep/40'}`}
                        style={{ height: `${heightPct * 0.64}px` }}
                      />
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover/bar:block bg-pb-green-deep text-white text-[9px] font-black px-1.5 py-0.5 rounded whitespace-nowrap">
                        ₹{v.toLocaleString()}
                      </div>
                    </div>
                    <span className={`text-[9px] font-black uppercase ${isToday ? 'text-pb-green-deep' : 'text-slate-300'}`}>{dayLabel}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Error/Alert Summary */}
        <Card className="bg-white border-pb-green-deep/10 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-black text-pb-green-deep mb-4 uppercase tracking-tight">System Status</h3>
            <div className="space-y-3">
              {[
                { 
                  label: 'Active Offers', 
                  value: coupons.filter(c => c.is_active).length,
                  icon: Tags, 
                  color: 'text-emerald-500', 
                  bg: 'bg-emerald-50' 
                },
                { 
                  label: 'Cancelled Orders', 
                  value: metrics.cancelledOrders.length, 
                  icon: AlertTriangle, 
                  color: metrics.cancelledOrders.length > 0 ? 'text-rose-500' : 'text-slate-300',
                  bg: metrics.cancelledOrders.length > 0 ? 'bg-rose-50' : 'bg-slate-50', 
                },
                { 
                  label: 'Paused Subscriptions', 
                  value: subscriptions.filter(s => s.status === 'paused').length, 
                  icon: Zap,
                  color: 'text-amber-500', 
                  bg: 'bg-amber-50' 
                },
                { 
                  label: 'Active Coupons', 
                  value: coupons.filter(c => c.is_active).length, 
                  icon: Tags,
                  color: 'text-purple-500', 
                  bg: 'bg-purple-50' 
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${item.bg}`}>
                      <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                    </div>
                    <span className="text-xs font-bold text-slate-600">{item.label}</span>
                  </div>
                  <span className={`text-sm font-black ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-white border-pb-green-deep/10 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-pb-green-deep uppercase tracking-tight">Recent Orders</h3>
            <span className="text-[10px] font-black text-[#66BB6A] uppercase tracking-widest">{orders.length} Total</span>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 6).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F9F7] border border-pb-green-deep/5 hover:border-pb-green-deep/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-pb-green-deep/10 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-pb-green-deep" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{safeString(order?.customer_name, 'Anonymous')}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{order?.phone} • {new Date(order?.created_at || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-pb-green-deep text-sm">₹{Number(order.total_amount || 0).toLocaleString()}</span>
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    order?.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                    order?.status === 'out_for_delivery' ? 'bg-blue-50 text-blue-700' :
                    order?.status === 'cancelled' ? 'bg-rose-50 text-rose-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {safeString(order?.status, 'Pending').replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-medium italic">No orders yet. The market is quiet.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const DashboardOverview: React.FC = () => {
  const { experiences, orders, testimonials, loading } = useData();

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const today = new Date().toISOString().split('T')[0];
  const todayDeliveries = orders.filter(o => o.scheduled_time && o.scheduled_time.startsWith(today)).length;
  
  const stats = [
    { 
      label: 'Total Inventory', 
      value: experiences.length, 
      icon: Package, 
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      trend: 'Active Products'
    },
    { 
      label: 'Pending Requests', 
      value: pendingOrders, 
      icon: Clock, 
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      trend: `${pendingOrders} awaiting action`
    },
    { 
      label: "Today's Deliveries", 
      value: todayDeliveries, 
      icon: ShoppingBasket, 
      color: 'text-[#66BB6A]',
      bg: 'bg-[#66BB6A]/10',
      trend: 'Scheduled for today'
    },
    { 
      label: 'Gross Revenue', 
      value: `₹${orders.filter(o => o.status === 'delivered').reduce((acc, o) => {
        const product = experiences.find(e => e.id === o.product_id);
        return acc + (product?.price || 0);
      }, 0).toLocaleString()}`, 
      icon: TrendingUp, 
      color: 'text-[#FFF59D]',
      bg: 'bg-[#FFF59D]/10',
      trend: 'Delivered orders'
    },
  ];

  if (loading) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-pb-green-deep tracking-tighter uppercase italic">Control Center</h2>
        <p className="text-slate-600 font-medium">Welcome back, Store Manager. Here's your fresh overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="bg-white border-pb-green-deep/10 hover:border-pb-green-deep/30 transition-all duration-500 group shadow-md hover:shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-pb-green-deep bg-[#66BB6A]/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-[#66BB6A]/20">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.trend.split(' ')[0]}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-pb-green-deep tabular-nums tracking-tighter">{stat.value}</h3>
                </div>
                <p className="text-[10px] text-[#66BB6A] mt-4 uppercase tracking-[0.2em] font-black">{stat.trend}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-white border-pb-green-deep/10 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-pb-green-deep uppercase tracking-tight">Recent Orders</h3>
              <button className="text-[10px] font-black text-[#66BB6A] hover:text-pb-green-deep transition-colors uppercase tracking-widest">Explore All {orders.length} Orders</button>
            </div>
            
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-5 rounded-3xl bg-[#F7F9F7] border border-pb-green-deep/5 hover:border-pb-green-deep/20 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-pb-green-deep/10 flex items-center justify-center text-pb-green-deep group-hover:scale-105 transition-transform">
                      <ShoppingCart className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg tracking-tight">{safeString(order?.user_name, "Anonymous")}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{safeString(order?.delivery_type, "Standard").replace(/_/g, ' ')} • {new Date(order?.created_at || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                      order?.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      order?.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-[#FFF59D]/20 text-pb-green-deep border border-[#FFF59D]/40'
                    }`}>
                      {safeString(order?.status, "Pending").replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center py-16 text-slate-400 font-medium italic">
                  No orders today. The market is quiet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-pb-green-deep/10 shadow-lg">
          <CardContent className="p-8">
            <h3 className="text-2xl font-black text-pb-green-deep mb-10 text-center uppercase tracking-tight">System Logs</h3>
            <div className="relative space-y-8 before:absolute before:left-7 before:top-2 before:bottom-2 before:w-px before:bg-pb-green-deep/10">
              {[
                { label: 'Basket Ordered', time: '2 mins ago', icon: ShoppingCart, color: 'bg-emerald-500' },
                { label: 'Review Published', time: '45 mins ago', icon: Clock, color: 'bg-amber-500' },
                { label: 'Inventory Restocked', time: '1 hour ago', icon: CheckCircle2, color: 'bg-[#66BB6A]' },
                { label: 'Manager Login', time: '3 hours ago', icon: Users, color: 'bg-pb-green-deep' },
              ].map((item, idx) => (
                <div key={idx} className="relative flex items-center gap-10 pl-11">
                  <div className={`absolute left-[18px] w-5 h-5 rounded-full ${item.color} shadow-lg border-4 border-white z-10`} />
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.label}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
