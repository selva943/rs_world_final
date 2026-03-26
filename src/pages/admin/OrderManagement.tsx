import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2,
  XCircle,
  Phone,
  Calendar,
  MessageSquare,
  Package,
  Truck,
  User,
  Activity,
  Trash2,
  MapPin,
  Clock
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Order, OrderItem } from '@/types/app';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn, safeString } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const statusMap = {
  pending: { label: 'CREATED', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  confirmed: { label: 'CONFIRMED', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
  packed: { label: 'PACKED', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Package },
  out_for_delivery: { label: 'OUT FOR DELIVERY', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck },
  delivered: { label: 'DELIVERED', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  cancelled: { label: 'CANCELLED', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: XCircle },
};

export const OrderManagement: React.FC = () => {
  const { orders, experiences, updateOrderStatus, deleteOrder, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const filteredOrders = orders.filter(o => {
    const name = safeString(o.customer_name).toLowerCase();
    const phone = safeString(o.phone);
    const idMatch = o.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm) || idMatch;
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Helper to fetch fallback info for legacy orders
  const getProductInfo = (id: string) => {
    const p = experiences.find(e => e.id === id);
    return { 
      name: p?.name || 'Unknown Product', 
      price: p?.price || 0, 
      unit: p?.unit || 'unit' 
    };
  };

  // Helper to parse Qty and pure Note from legacy strings
  const parseOrderNotes = (notes?: string) => {
    let quantity = 1;
    let pureNote = notes || '';
    if (pureNote.startsWith('Qty:')) {
      const parts = pureNote.split('| Note:');
      quantity = parseInt(parts[0].replace('Qty:', '').trim()) || 1;
      pureNote = parts[1] ? parts[1].trim() : '';
      if (!parts[1] && !pureNote.includes('Note:')) {
        pureNote = '';
      }
    }
    return { quantity, pureNote };
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      const res = await deleteOrder(id);
      if (res.success) {
        setSelectedOrder(null);
        toast.success("Order deleted successfully");
      } else {
        toast.error(res.message || "Failed to delete order");
      }
    }
  };

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!selectedOrder) return;

    // Basic validation for status transitions
    const currentStatus = selectedOrder.status;
    const statusOrder = Object.keys(statusMap);
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newIndex = statusOrder.indexOf(newStatus);

    if (newIndex < currentIndex && newStatus !== 'cancelled') {
      toast.error("Cannot revert to a previous status (unless cancelling).");
      return;
    }
    if (currentStatus === 'delivered' || currentStatus === 'cancelled') {
      toast.error("Cannot change status of a delivered or cancelled order.");
      return;
    }

    try {
      const success = await updateOrderStatus(selectedOrder.id, newStatus);
      if (success) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        toast.success(`Order status updated to ${newStatus.replace(/_/g, ' ').toUpperCase()}`);
      } else {
        toast.error("Failed to update order status");
      }
    } catch (error) {
      toast.error("An error occurred while updating status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return (
     <div className="flex flex-col items-center justify-center py-32 gap-6">
        <Activity className="w-12 h-12 text-pb-green-deep animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Order Engine...</p>
     </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-pb-green-deep tracking-tight uppercase italic mb-2">Order Management</h2>
          <p className="text-slate-600 font-medium">Full visibility into logistics, deliveries, and timelines.</p>
        </div>
        
        <div className="bg-white px-6 py-4 rounded-3xl flex items-center gap-6 shadow-sm border border-pb-green-deep/10">
          <div className="text-center">
            <div className="text-2xl font-black text-pb-green-deep">{orders.filter(o => o.status === 'pending').length}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pending</div>
          </div>
          <div className="w-[1px] h-10 bg-slate-100" />
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-600">{orders.filter(o => ['packed', 'out_for_delivery'].includes(o.status)).length}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active</div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Search by ID, name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-16 h-16 bg-white border-pb-green-deep/10 rounded-3xl"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', ...Object.keys(statusMap)].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-6 h-16 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                filterStatus === status 
                  ? "bg-pb-green-deep text-white border-pb-green-deep shadow-lg" 
                  : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
              )}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order) => {
            const status = statusMap[order.status as keyof typeof statusMap] || statusMap.pending;
            const StatusIcon = status.icon;
            
            // Calculate totals dynamically if order_items are present, else fallback to legacy calc
            const hasItems = order.items && order.items.length > 0;
            let displayQuantity = 0;
            let displayItemsTitle = '';
            
            if (hasItems) {
              displayQuantity = order.items!.reduce((sum, item) => sum + item.quantity, 0);
              const firstItem = order.items![0].product?.name || 'Item';
              displayItemsTitle = order.items!.length > 1 ? `${firstItem} + ${order.items!.length - 1} more` : firstItem;
            } else {
              // Legacy order parsing
              const pInfo = getProductInfo((order as any).product_id);
              const { quantity } = parseOrderNotes(order.notes);
              displayQuantity = quantity;
              displayItemsTitle = pInfo.name;
            }

            // Honor the true total_amount column if present, otherwise calculate
            const total = order.total_amount > 0 ? order.total_amount : (
               hasItems ? order.items!.reduce((sum, item) => sum + (item.quantity * item.price), 0)
                        : (getProductInfo((order as any).product_id).price * displayQuantity)
            );

            return (
              <motion.div layout key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="bg-white border-pb-green-deep/5 hover:border-pb-green-deep/20 transition-all rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md border">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0", status.color)}>
                        <StatusIcon className="w-7 h-7" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-slate-800 uppercase tracking-tighter">#{order.id.split('-')[0]}</span>
                          <Badge className={cn("border-none text-[8px] px-2 py-0.5", status.color)}>{status.label}</Badge>
                          {order.payment_method === 'whatsapp' && (
                             <Badge variant="outline" className="text-[8px] px-2 py-0.5 border-emerald-200 text-emerald-600 bg-emerald-50">WA ORDER</Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-pb-green-deep truncate flex items-center gap-2">
                          <User className="w-4 h-4" /> {order.customer_name}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {order.phone}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Product Detail */}
                      <div className="lg:w-1/4">
                        <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Package Contents</div>
                        <div className="font-bold text-pb-green-deep truncate max-w-full">
                           {displayQuantity}x {displayItemsTitle}
                        </div>
                        <div className="text-[10px] text-slate-500 italic mt-0.5">
                          {order.delivery_type === 'delivery' ? '🚚 Home Delivery' : '🏪 Branch Pickup'}
                        </div>
                      </div>

                      {/* Revenue Badge */}
                      <div className="lg:w-32 flex flex-col lg:items-end justify-center">
                         <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                            {order.payment_status === 'paid' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Clock className="w-3 h-3" />}
                            Total
                         </div>
                         <div className="text-xl font-black text-emerald-600">₹{total.toFixed(0)}</div>
                      </div>

                      <div className="flex items-center gap-2 lg:ml-4">
                        <Button 
                          onClick={() => setSelectedOrder(order)}
                          variant="outline" 
                          className="h-12 px-6 rounded-2xl border-pb-green-deep/10 text-pb-green-deep font-black text-[10px] uppercase tracking-widest"
                        >
                          Details
                        </Button>
                        <Button 
                          onClick={() => window.open(`https://wa.me/${order.phone.replace(/\D/g, '')}`)}
                          className="h-12 w-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white p-0 shrink-0"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {filteredOrders.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">No orders found.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-[#F7F9F7] shrink-0">
                <div>
                  <h3 className="text-2xl font-black text-pb-green-deep uppercase italic">Order Intel</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase text-left tracking-widest mt-1">Ref: {selectedOrder.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(selectedOrder.id)} className="rounded-full hover:bg-red-50 text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)} className="rounded-full hover:bg-slate-200">
                    <XCircle className="w-8 h-8 text-slate-400" />
                  </Button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-8 overflow-y-auto">
                
                {/* Top Row: Customer Info & Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   
                   {/* Left Col: Customer & Address */}
                   <div className="md:col-span-2 space-y-6">
                      <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left">Customer</label>
                          <p className="font-bold text-slate-800 text-lg text-left">{selectedOrder.customer_name}</p>
                          <p className="text-sm text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3"/> {selectedOrder.phone}</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left">Current Status</label>
                          <div className="flex justify-start mt-1">
                            <Badge className={cn("border-none px-3 py-1 text-xs", statusMap[selectedOrder.status as keyof typeof statusMap]?.color)}>
                              {selectedOrder.status.replace(/_/g, ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Address Block */}
                      {selectedOrder.address && (
                        <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 space-y-2">
                          <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5 text-left justify-start">
                            <MapPin className="w-3.5 h-3.5" /> Delivery Address
                          </label>
                          <p className="text-sm font-semibold text-amber-950 leading-relaxed text-left">{selectedOrder.address}</p>
                        </div>
                      )}

                      {/* Notes Block */}
                      {selectedOrder.notes && (
                         <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left">Special Instructions</label>
                           <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600 italic text-left">
                             "{parseOrderNotes(selectedOrder.notes).pureNote || selectedOrder.notes}"
                           </div>
                         </div>
                       )}

                   </div>

                   {/* Right Col: Timeline Ledger */}
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Timeline Ledger</h4>
                      <div className="p-6 border border-slate-100 rounded-[2rem] bg-white h-full shadow-sm max-h-[300px] overflow-y-auto">
                        {selectedOrder.logs && selectedOrder.logs.length > 0 ? (
                           <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                              {selectedOrder.logs.sort((a,b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()).map((log, idx) => {
                                const logStatus = statusMap[log.status as keyof typeof statusMap] || statusMap.pending;
                                const LogIcon = logStatus.icon;
                                return (
                                   <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                      <div className={cn("w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm", logStatus.color)}>
                                          <LogIcon className="w-4 h-4" />
                                      </div>
                                      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-3 rounded-xl border border-slate-100">
                                          <div className="flex items-center justify-between space-x-2 mb-1">
                                             <div className="font-bold text-slate-800 text-xs">{log.status.toUpperCase()}</div>
                                             <time className="text-[9px] font-black text-slate-400">{new Date(log.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</time>
                                          </div>
                                          {log.note && <div className="text-[10px] text-slate-500 italic">{log.note}</div>}
                                      </div>
                                   </div>
                                )
                              })}
                           </div>
                        ) : (
                           <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">No logs available</div>
                        )}
                      </div>
                   </div>
                </div>

                {/* Items Summary Table */}
                <div className="border border-slate-200 rounded-[2rem] overflow-hidden">
                   <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cart Items</span>
                     <Badge variant="outline" className="bg-white">{selectedOrder.payment_method.toUpperCase()}</Badge>
                   </div>
                   <div className="p-0">
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                         // Render Relational Content
                         <div className="divide-y divide-slate-100">
                           {selectedOrder.items.map(item => (
                              <div key={item.id} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50 transition-colors">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden">
                                       {item.product?.image ? <img src={item.product.image} className="w-full h-full object-cover" alt="" /> : <Package className="w-5 h-5 m-auto text-slate-400 mt-2.5"/>}
                                    </div>
                                    <div>
                                       <p className="font-bold text-slate-800 text-sm">{item.product?.name || 'Item'}</p>
                                       <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Qty: {item.quantity}</p>
                                    </div>
                                 </div>
                                 <div className="font-black text-emerald-600">₹{(item.price * item.quantity).toFixed(0)}</div>
                              </div>
                           ))}
                         </div>
                      ) : (
                         // Fallback for Legacy Orders before OrderItems table Migration
                         <div className="p-6">
                            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                              <span className="text-xs font-bold text-slate-500 uppercase">Legacy Cart Capture</span>
                              <span className="font-black text-slate-700">
                                {parseOrderNotes(selectedOrder.notes).quantity}x {getProductInfo((selectedOrder as any).product_id).name}
                              </span>
                            </div>
                         </div>
                      )}
                      
                      {/* Total Footer */}
                      <div className="bg-pb-green-deep text-white px-6 py-5 flex justify-between items-center">
                         <span className="text-xs font-black uppercase tracking-widest text-emerald-300">Total Purchase</span>
                         <span className="font-black text-3xl">
                           ₹{selectedOrder.total_amount > 0 ? selectedOrder.total_amount : (
                              (selectedOrder.items && selectedOrder.items.length > 0) 
                              ? selectedOrder.items.reduce((s,i) => s+(i.price*i.quantity), 0)
                              : parseOrderNotes(selectedOrder.notes).quantity * getProductInfo((selectedOrder as any).product_id).price
                           )}
                         </span>
                      </div>
                   </div>
                </div>

                {/* Update Status Actions */}
                <div className="pt-6 border-t border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Command Actions</label>
                  <div className="flex flex-wrap gap-3">
                    <select 
                      className="bg-white border border-slate-200 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-pb-green-deep/20 transition-all cursor-pointer hover:border-slate-300"
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusUpdate(e.target.value as Order['status'])}
                      disabled={updatingStatus || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}
                    >
                      {Object.entries(statusMap).map(([value, info]) => (
                        <option key={value} value={value} disabled={
                          // Simple validation: can't change from final states
                          (selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled') ||
                          // Prevent going backwards in general (except to cancel)
                          (Object.keys(statusMap).indexOf(value) < Object.keys(statusMap).indexOf(selectedOrder.status) && value !== 'cancelled')
                        }>
                          {info.label}
                        </option>
                      ))}
                    </select>
                    {updatingStatus && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse self-center ml-2">Updating...</span>}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
