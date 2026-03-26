import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBasket, 
  Clock, 
  CalendarDays, 
  Package, 
  ChevronRight, 
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  MapPin,
  FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ordersApi, bookingsApi, subscriptionsApi } from '@/lib/services/api';
import { cancelOrder } from '@/lib/services/orderService';
import { Order, Booking, Subscription } from '@/types/app';
import { OrderTrackingMap } from '@/components/OrderTrackingMap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';

const STATUS_MAP: Record<string, { label: string; color: string; step: number }> = {
  'pending': { label: 'CREATED', color: 'bg-amber-50 text-amber-600 border-amber-100', step: 1 },
  'confirmed': { label: 'CONFIRMED', color: 'bg-blue-50 text-blue-600 border-blue-100', step: 2 },
  'packed': { label: 'PACKED', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', step: 3 },
  'out_for_delivery': { label: 'OUT FOR DELIVERY', color: 'bg-purple-50 text-purple-600 border-purple-100', step: 4 },
  'delivered': { label: 'DELIVERED', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', step: 5 },
  'cancelled': { label: 'CANCELLED', color: 'bg-rose-50 text-rose-600 border-rose-100', step: 0 },
};

export const MyOrders: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [orderData, bookingData, subData] = await Promise.all([
        ordersApi.getByUser(user.id),
        bookingsApi.getByUser(user.id),
        subscriptionsApi.getAll() // Assuming we filter in app or getByUser exists
      ]);
      setOrders(orderData);
      setBookings(bookingData);
      setSubscriptions(subData.filter(s => s.user_id === user.id || s.user_phone === user.phone));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
      case 'confirmed':
      case 'active':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'pending':
      case 'preparing':
      case 'packed':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'cancelled':
      case 'failed':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'out_for_delivery':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <Package className="w-12 h-12 text-slate-200" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Login to see your orders</h2>
        <p className="text-slate-500 mb-8 max-w-sm">Track your delicious meals, service bookings, and subscriptions all in one place.</p>
        <Button onClick={() => window.location.href = '/login'} size="lg" className="px-12">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Badge className="bg-emerald-100 text-pb-green-deep border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] mb-4">
              User Dashboard
            </Badge>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
              My <span className="text-pb-green-deep">Activity</span>
            </h1>
            <p className="text-slate-500 font-medium">Manage all your independent orders and requests</p>
          </div>
          <div className="flex items-center gap-3">
             <Button
               variant="outline"
               onClick={fetchData}
               disabled={loading}
               size="md"
               className="w-11 h-11 p-0 rounded-xl"
             >
               <RefreshCw className={cn("w-4 h-4 text-slate-400", loading && "animate-spin")} />
             </Button>
             <div className="h-11 px-4 bg-white rounded-[10px] flex items-center gap-3 shadow-sm border border-slate-100">
                <Search className="w-4 h-4 text-slate-300" />
                <input
                  placeholder="Search orders..."
                  className="bg-transparent border-none focus:outline-none text-sm font-medium text-slate-600 placeholder:text-slate-300 w-32 md:w-48"
                />
             </div>
          </div>
        </div>

        {/* Multi-Domain Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-10">
          <TabsList className="bg-white/80 backdrop-blur-md p-1 rounded-full w-full max-w-2xl mx-auto border border-white h-14 shadow-lg shadow-slate-200/50">
            <TabsTrigger value="products" className="rounded-full font-bold uppercase tracking-widest text-[10px] flex-1 data-[state=active]:bg-pb-green-deep data-[state=active]:text-white transition-all">
              <ShoppingBasket className="w-4 h-4 mr-2" /> Products
            </TabsTrigger>
            <TabsTrigger value="services" className="rounded-full font-bold uppercase tracking-widest text-[10px] flex-1 data-[state=active]:bg-pb-green-deep data-[state=active]:text-white transition-all">
              <CalendarDays className="w-4 h-4 mr-2" /> Bookings
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="rounded-full font-bold uppercase tracking-widest text-[10px] flex-1 data-[state=active]:bg-pb-green-deep data-[state=active]:text-white transition-all">
              <Clock className="w-4 h-4 mr-2" /> Subscriptions
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent key={activeTab} value={activeTab} className="focus-visible:outline-none ring-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="grid grid-cols-1 gap-6"
              >
                {activeTab === 'products' && (
                  orders.length === 0 ? <EmptyState icon={<ShoppingBasket />} title="No Product Orders" /> :
                  orders.map(order => <OrderCard key={order.id} order={order} onUpdate={fetchData} />)
                )}

                {activeTab === 'services' && (
                  bookings.length === 0 ? <EmptyState icon={<CalendarDays />} title="No Service Bookings" /> :
                  bookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
                )}

                {activeTab === 'subscriptions' && (
                  subscriptions.length === 0 ? <EmptyState icon={<Clock />} title="No Active Subscriptions" /> :
                  subscriptions.map(sub => <SubscriptionCard key={sub.id} subscription={sub} />)
                )}
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}

function OrderCard({ order, onUpdate }: { order: Order; onUpdate: () => void }) {
  const [isCancelling, setIsCancelling] = useState(false);
  const navigate = useNavigate();
  const statusInfo = STATUS_MAP[order.status.toLowerCase()] || STATUS_MAP.pending;
  const canCancel = order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'confirmed';

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setIsCancelling(true);
    try {
      const res = await cancelOrder(order.id);
      if (res.success) {
        toast.success('Order cancelled successfully');
        onUpdate();
      } else {
        toast.error(res.error || 'Failed to cancel order');
      }
    } catch (err) {
      toast.error('An error occurred while cancelling the order');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Card className="bg-white border-slate-100 overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-all group border-2 hover:border-emerald-100">
      <CardContent className="p-0">
        <div className="p-8 border-b border-slate-50">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-pb-green-deep">
                <Package className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</p>
                <h3 className="text-lg font-black text-slate-800 line-clamp-1">#{order.id.split('-')[0].toUpperCase()}</h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={cn("px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[9px] border", statusInfo.color)}>
                {statusInfo.label}
              </Badge>
              <p className="text-sm font-bold text-slate-400">{format(new Date(order.created_at), 'MMM dd, yyyy')}</p>
            </div>
          </div>

          {/* Timeline UI */}
          {order.status.toLowerCase() !== 'cancelled' && (
            <div className="mb-8 px-2">
              <div className="relative flex justify-between">
                {/* Connector Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                <div 
                  className="absolute top-1/2 left-0 h-0.5 bg-pb-green-deep -translate-y-1/2 z-0 transition-all duration-500" 
                  style={{ width: `${Math.max(0, (statusInfo.step - 1) * 25)}%` }}
                />
                
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="relative z-10 flex flex-col items-center">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 transition-all duration-300",
                      statusInfo.step >= s ? "bg-pb-green-deep border-pb-green-deep scale-110" : "bg-white border-slate-200"
                    )} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter w-12 text-center">Created</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter w-12 text-center">Confirmed</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter w-12 text-center">Packed</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter w-12 text-center">Out</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter w-12 text-center">Delivered</span>
              </div>
            </div>
          )}

          {/* Tracking Map for Out for Delivery */}
          {order.status.toLowerCase() === 'out_for_delivery' && order.latitude && order.longitude && (
            <div className="mb-8 pt-4 border-t border-slate-50">
               <OrderTrackingMap 
                 lat={order.latitude} 
                 lng={order.longitude} 
               />
            </div>
          )}

          <div className="space-y-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between group/item">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                     <img src={item.product?.image} className="w-full h-full object-cover" alt="" />
                   </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{(item as any).name || item.product?.name || 'Item'}</p>
                      <p className="text-xs text-slate-400 font-medium">{item.quantity} {(item as any).unit || item.product?.unit || 'unit'} × ₹{item.price}</p>
                    </div>
                </div>
                <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-8 py-6 bg-slate-50/50 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Payment</p>
                <p className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full", order.payment_status === 'paid' ? "bg-emerald-500" : "bg-amber-500")} />
                  {order.payment_method}
                </p>
              </div>
              {order.address && (
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Delivery To</p>
                  <p className="text-xs font-bold text-slate-600 line-clamp-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-300" />
                    {order.address}
                  </p>
                </div>
              )}
            </div>
            <div className="text-right">
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Amount</p>
               <p className="text-2xl font-black text-pb-green-deep tracking-tight">₹{order.total_amount}</p>
            </div>
        </div>
        <div className="p-4 bg-white flex items-center justify-end gap-3 px-6">
          {canCancel && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
            View Details
          </Button>
          <Button size="sm" className="gap-2 px-6" onClick={() => navigate('/deliverables')}>
            <RefreshCw className="w-3.5 h-3.5" /> Reorder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <Card className="bg-white border-slate-100 overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-all group border-2 hover:border-blue-100">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 relative overflow-hidden group-hover:scale-105 transition-transform">
               {booking.service?.image ? (
                 <img src={booking.service.image} className="w-full h-full object-cover absolute inset-0" alt="" />
               ) : (
                 <CalendarDays className="w-10 h-10" />
               )}
            </div>
            <div className="space-y-1">
              <Badge className="bg-blue-100 text-blue-700 border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest mb-1">
                {booking.service?.category || 'Service'}
              </Badge>
              <h3 className="text-2xl font-black text-slate-800">{booking.service?.name || 'Professional Service'}</h3>
              <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
                <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> {format(new Date(booking.booking_date), 'EEE, MMM dd')}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {booking.time_slot}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <Badge className={cn("px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] border shadow-sm", 
              booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
              booking.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100')}>
              {booking.status}
            </Badge>
            <Button variant="outline" size="sm" className="gap-2 group-hover:border-blue-200 transition-all">
              Reschedule <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  return (
    <Card className="bg-white border-slate-100 overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-all group border-2 hover:border-emerald-100 py-2">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-emerald-50 rounded-2xl flex items-center justify-center relative overflow-hidden ring-4 ring-white shadow-xl">
               <img src={subscription.product?.image} className="w-full h-full object-cover" alt="" />
               <div className="absolute inset-x-0 bottom-0 bg-emerald-500 text-white text-[8px] font-black uppercase text-center py-1">
                 {subscription.frequency}
               </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-1">{subscription.product?.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                 <Badge className="bg-emerald-500 text-white border-none py-1 px-3 text-[9px] font-black uppercase tracking-widest">
                   {subscription.status}
                 </Badge>
                 <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Ongoing Deliveries</span>
              </div>
              <div className="flex flex-col gap-1.5">
                 <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                   <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                   Next Delivery: <span className="text-emerald-600">{subscription.next_delivery_date ? format(new Date(subscription.next_delivery_date), 'MMM dd, yyyy') : 'TBD'}</span>
                 </p>
                 <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                   <MapPin className="w-3.5 h-3.5" />
                   {subscription.address || 'Saved Address'}
                 </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-4 min-w-[200px]">
            <div className="text-right">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Recurring Cost</p>
               <p className="text-3xl font-black text-slate-800">
                 ₹{subscription.total_per_delivery}
                 <span className="text-sm text-slate-300 font-bold tracking-normal ml-1">/delivery</span>
               </p>
            </div>
            <div className="flex gap-2">
               <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50 hover:text-rose-600">
                 Pause
               </Button>
               <Button variant="outline" size="sm" className="border-slate-100 hover:border-emerald-100 hover:text-pb-green-deep">
                 Edit Plan
               </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl text-center">
      <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-200 mb-6 border border-slate-100">
        {React.cloneElement(icon as React.ReactElement, { className: "w-8 h-8" })}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-8 max-w-xs">Looks like you haven't started your journey here yet. Ready for some deliciousness?</p>
      <Button onClick={() => window.location.href = '/deliverables'} size="sm" className="px-8">
        Browse Marketplace
      </Button>
    </div>
  );
}
