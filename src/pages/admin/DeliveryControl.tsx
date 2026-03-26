import React, { useState } from 'react';
import {
  Truck,
  Search,
  MapPin,
  Phone,
  Calendar,
  User,
  Package,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn, safeString } from '@/lib/utils';

export const DeliveryControl: React.FC = () => {
  const { orders, updateOrderStatus, loading } = useData();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const activeDeliveries = orders.filter(o =>
    o.status === 'out_for_delivery' || o.status === 'packed'
  ).filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      safeString(o.customer_name).toLowerCase().includes(q) ||
      safeString(o.phone).includes(q) ||
      o.id.toLowerCase().includes(q)
    );
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleMarkDelivered = async (id: string) => {
    const ok = await updateOrderStatus(id, 'delivered' as any);
    if (ok) toast.success('Order marked as Delivered!');
    else toast.error('Failed to update order status');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 600));
    setRefreshing(false);
    toast.success('Delivery list refreshed');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 mb-2">
            <Truck className="w-3.5 h-3.5" /> Live Delivery Feed
          </div>
          <h2 className="text-3xl font-black text-pb-green-deep tracking-tight uppercase italic">Delivery Control</h2>
          <p className="text-slate-500 font-medium">
            {activeDeliveries.length} active deliveries · {orders.filter(o => o.status === 'delivered').length} completed today
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="gap-2 border-slate-200 text-slate-500 h-11"
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by name, phone or order ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-12 h-11 rounded-xl bg-white border-slate-200"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Packed (Ready)', count: orders.filter(o => o.status === 'packed').length, color: 'bg-indigo-50 text-indigo-600', icon: Package },
          { label: 'Out for Delivery', count: orders.filter(o => o.status === 'out_for_delivery').length, color: 'bg-blue-50 text-blue-600', icon: Truck },
          { label: 'Delivered Today', count: orders.filter(o => o.status === 'delivered' && o.created_at?.startsWith(new Date().toISOString().split('T')[0])).length, color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
        ].map((item, i) => (
          <Card key={i} className="border-slate-100 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-pb-green-deep">{item.count}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delivery List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-4 border-pb-green-deep border-t-transparent rounded-full" />
        </div>
      ) : activeDeliveries.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <AlertCircle className="w-14 h-14 text-slate-200 mx-auto mb-4" />
          <h4 className="text-xl font-black text-slate-400">No Active Deliveries</h4>
          <p className="text-slate-400 text-sm mt-2">All orders are either delivered or pending dispatch.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeDeliveries.map(order => (
            <Card key={order.id} className="border-slate-100 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Customer Info */}
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                      order.status === 'out_for_delivery' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
                    )}>
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-black text-slate-800">{safeString(order.customer_name, 'Customer')}</h4>
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest",
                          order.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
                        )}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {order.phone}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {safeString(order.address, 'Address not set').substring(0, 40)}{safeString(order.address).length > 40 ? '...' : ''}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(order.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Amount + Actions */}
                  <div className="flex items-center gap-3 md:flex-shrink-0">
                    <div className="text-right mr-2">
                      <p className="text-lg font-black text-pb-green-deep">₹{Number(order.total_amount || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{safeString(order.payment_method, 'COD')}</p>
                    </div>
                    {order.status === 'out_for_delivery' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkDelivered(order.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[11px] uppercase tracking-widest"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
