import React from 'react';
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
  Globe
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { safeString } from '@/lib/utils';

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
