import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBasket, 
  MapPin, 
  Phone, 
  User, 
  StickyNote, 
  ChevronRight, 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  Store,
  CheckCircle2,
  Loader2,
  Trash2,
  AlertCircle,
  Plus,
  Minus,
  MessageCircle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ordersApi } from '@/lib/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router';
import { cn } from '@/lib/utils';

export default function Checkout() {
  const { items, totalAmount, clearCart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [form, setForm] = useState({
    customer_name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
    phone: user?.phone || '',
    address: '',
    delivery_type: 'delivery' as 'delivery' | 'pickup',
    payment_method: 'cod' as 'cod' | 'whatsapp',
    notes: '',
  });

  const WHATSAPP_NUMBER = '917550346705';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. DATA VALIDATION (CRITICAL)
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!form.customer_name.trim()) { toast.error('Please enter your name'); return; }
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid phone number'); return;
    }
    if (form.delivery_type === 'delivery' && !form.address.trim()) {
      toast.error('Please enter your delivery address'); return;
    }

    setIsSubmitting(true);
    try {
      // 2. ORDER CREATION SEQUENCE (MANDATORY)
      
      // Step A: Insert Order
      const orderPayload = {
        user_id: user?.id,
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        address: form.delivery_type === 'delivery' ? form.address.trim() : 'Store Pickup',
        delivery_type: form.delivery_type,
        status: 'pending' as const,
        payment_method: form.payment_method,
        payment_status: 'pending' as const,
        total_amount: totalAmount,
        notes: form.notes.trim() || undefined
      };

      // Step B: Prepare Items
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      console.log('[Checkout] Placing order:', orderPayload);
      
      const savedOrder = await ordersApi.add(orderPayload, orderItems);
      
      if (!savedOrder) {
        throw new Error('Could not create order records. Please check your connection.');
      }

      setOrderId(savedOrder.id);
      
      // 3. SUCCESS FLOW
      
      // WhatsApp Messaging
      const waMessage = [
        `🛒 *NEW PALANI BASKET ORDER*`,
        ``,
        `🔖 *Order ID:* #${savedOrder.id.split('-')[0].toUpperCase()}`,
        `👤 *Customer:* ${form.customer_name}`,
        `📞 *Phone:* ${form.phone}`,
        `🏠 *Type:* ${form.delivery_type.toUpperCase()}`,
        form.delivery_type === 'delivery' ? `📍 *Address:* ${form.address}` : null,
        ``,
        `📋 *Items:*`,
        ...items.map(item => `• ${item.name} (${item.quantity} ${item.unit}) - ₹${item.price * item.quantity}`),
        ``,
        `💰 *GRAND TOTAL: ₹${totalAmount}*`,
        form.notes ? `📝 *Notes:* ${form.notes}` : null,
        ``,
        `Please confirm this order! 🥦📦`
      ].filter(Boolean).join('\n');

      setOrderComplete(true);
      clearCart();
      
      // Opening WhatsApp
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;
      window.open(waUrl, '_blank');

      toast.success('Order placed successfully!');
      
    } catch (error: any) {
      console.error('[Checkout] Error:', error);
      toast.error(error.message || 'Failed to place order. Cart has been kept.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
     return (
       <div className="min-h-[80vh] flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full text-center space-y-8 bg-white p-8 md:p-12 rounded-2xl shadow-2xl shadow-emerald-900/10 border border-emerald-50"
          >
             <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 text-white" />
             </div>
             <div className="space-y-3">
               <h2 className="text-4xl font-black text-slate-800 tracking-tight">Success!</h2>
               <p className="text-slate-500 font-medium">Your order <span className="text-pb-green-deep font-bold">#{orderId.split('-')[0].toUpperCase()}</span> has been placed and sent to our team via WhatsApp.</p>
             </div>
             <div className="pt-4 flex flex-col gap-3">
                <Button onClick={() => navigate('/my-orders')} size="lg" className="w-full">
                   Track My Order
                </Button>
                <Button onClick={() => navigate('/')} variant="ghost" size="md" className="w-full text-slate-400">
                   Back to Home
                </Button>
             </div>
          </motion.div>
       </div>
     );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBasket className="w-12 h-12 text-slate-200" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 mb-8 max-w-sm">Looks like you haven't added anything to your basket yet. Let's find some freshness!</p>
        <Button onClick={() => navigate('/deliverables')} size="lg" className="px-12">
          Browse Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-pb-green-deep font-black uppercase tracking-widest text-[10px] mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Form */}
          <div className="lg:col-span-7 space-y-10">
            <div>
               <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
                 Completing <br /><span className="text-pb-green-deep italic">Your Order</span>
               </h1>
               <p className="text-slate-500 font-medium italic">Double check your details for a smooth delivery.</p>
            </div>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Delivery Section */}
              <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-pb-green-deep">
                       <Truck className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-slate-800">Delivery Details</h3>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Where should we deliver?</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <User className="w-3 h-3" /> Full Name
                      </Label>
                      <Input 
                        value={form.customer_name}
                        onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                        placeholder="John Doe"
                        className="h-11 bg-slate-50 border-slate-100 rounded-[10px] font-medium text-slate-700"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Phone className="w-3 h-3" /> WhatsApp Number
                      </Label>
                      <Input 
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="9876543210"
                        className="h-11 bg-slate-50 border-slate-100 rounded-[10px] font-medium text-slate-700"
                        required
                      />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Type</Label>
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         type="button"
                         onClick={() => setForm(f => ({ ...f, delivery_type: 'delivery' }))}
                         className={cn(
                           "flex flex-col p-4 rounded-xl border-2 transition-all text-left",
                           form.delivery_type === 'delivery' ? "border-pb-green-deep bg-emerald-50/50" : "border-slate-100 bg-white hover:border-slate-200"
                         )}
                       >
                          <Truck className={cn("w-5 h-5 mb-2", form.delivery_type === 'delivery' ? "text-pb-green-deep" : "text-slate-300")} />
                          <span className="font-bold text-slate-800 text-sm">Home Delivery</span>
                          <span className="text-[10px] text-slate-400 font-medium">To your doorstep</span>
                       </button>
                       <button 
                         type="button"
                         onClick={() => setForm(f => ({ ...f, delivery_type: 'pickup' }))}
                         className={cn(
                           "flex flex-col p-4 rounded-xl border-2 transition-all text-left",
                           form.delivery_type === 'pickup' ? "border-pb-green-deep bg-emerald-50/50" : "border-slate-100 bg-white hover:border-slate-200"
                         )}
                       >
                          <Store className={cn("w-5 h-5 mb-2", form.delivery_type === 'pickup' ? "text-pb-green-deep" : "text-slate-300")} />
                          <span className="font-bold text-slate-800 text-sm">Branch Pickup</span>
                          <span className="text-[10px] text-slate-400 font-medium">Collect from store</span>
                       </button>
                    </div>
                 </div>

                 <AnimatePresence>
                   {form.delivery_type === 'delivery' && (
                     <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-2 overflow-hidden"
                     >
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <MapPin className="w-3 h-3" /> Delivery Address
                        </Label>
                        <Textarea 
                          value={form.address}
                          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                          placeholder="House No, Street, Landmark, Area..."
                          className="min-h-[100px] bg-slate-50 border-slate-100 rounded-xl font-medium text-slate-700 resize-none p-4"
                          required={form.delivery_type === 'delivery'}
                        />
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                       <StickyNote className="w-3 h-3" /> Special Notes
                    </Label>
                    <Input 
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="e.g. Leave at gate, No onion in kit, etc."
                      className="h-11 bg-slate-50 border-slate-100 rounded-[10px] font-medium text-slate-700"
                    />
                 </div>
              </section>

              {/* Payment Section */}
              <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                       <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-slate-800">Payment Option</h3>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">How would you like to pay?</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setForm(f => ({ ...f, payment_method: 'cod' }))}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                        form.payment_method === 'cod' ? "border-pb-green-deep bg-emerald-50/50" : "border-slate-100 bg-white hover:border-slate-200"
                      )}
                    >
                       <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", form.payment_method === 'cod' ? "bg-pb-green-deep text-white" : "bg-slate-100 text-slate-400")}>
                          <Truck className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="font-bold text-slate-800 text-sm">Cash on Delivery</p>
                         <p className="text-[10px] text-slate-400 font-medium">Pay when you receive</p>
                       </div>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setForm(f => ({ ...f, payment_method: 'whatsapp' }))}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                        form.payment_method === 'whatsapp' ? "border-pb-green-deep bg-emerald-50/50" : "border-slate-100 bg-white hover:border-slate-200"
                      )}
                    >
                       <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", form.payment_method === 'whatsapp' ? "bg-pb-green-deep text-white" : "bg-slate-100 text-slate-400")}>
                          <MessageCircle className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="font-bold text-slate-800 text-sm">Confirm via WA</p>
                         <p className="text-[10px] text-slate-400 font-medium">UPI / Online transfer</p>
                       </div>
                    </button>
                 </div>
              </section>
            </form>
          </div>

          {/* Right Sidebar: Cart Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-40 space-y-6">
               <Card className="bg-white border-slate-100 rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden">
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                     <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <ShoppingBasket className="w-5 h-5 text-pb-green-deep" /> Cart Summary
                     </h3>
                     <Badge className="bg-pb-green-deep text-white border-none text-[10px]">
                        {items.length} Items
                     </Badge>
                  </div>
                  
                  <CardContent className="p-0">
                    <div className="max-h-[400px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                      {items.map((item) => (
                        <div key={item.id} className="group p-3 bg-white border border-slate-50 rounded-xl hover:border-emerald-100 transition-all flex items-center gap-4 relative">
                           <div className="w-16 h-16 bg-slate-50 rounded-lg overflow-hidden shadow-inner flex-shrink-0">
                              <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">{item.unit}</p>
                              <div className="flex items-center gap-3">
                                 <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-0.5 border border-slate-100">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-pb-green-deep hover:text-emerald-400"><Minus className="w-3 h-3" /></button>
                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-pb-green-deep hover:text-emerald-400"><Plus className="w-3 h-3" /></button>
                                 </div>
                                 <span className="text-sm font-bold text-pb-green-deep">₹{item.price * item.quantity}</span>
                              </div>
                           </div>
                           <button 
                             onClick={() => removeFromCart(item.id)}
                             className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 w-8 h-8 bg-white border border-rose-50 rounded-full flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm"
                           >
                              <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 space-y-4 bg-slate-50/50">
                       <div className="flex items-center justify-between text-slate-400">
                          <span className="text-xs font-bold uppercase tracking-wider">Subtotal</span>
                          <span className="font-bold">₹{totalAmount}</span>
                       </div>
                       <div className="flex items-center justify-between text-slate-400">
                          <span className="text-xs font-bold uppercase tracking-wider">Delivery Fee</span>
                          <span className="font-bold text-pb-green-deep">FREE</span>
                       </div>
                       <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                          <span className="text-sm font-bold uppercase tracking-wider text-slate-800">Grand Total</span>
                          <span className="text-3xl font-bold text-pb-green-deep tracking-tight">₹{totalAmount}</span>
                       </div>
                    </div>

                    <div className="p-6">
                       <Button 
                        form="checkout-form"
                        type="submit"
                        disabled={isSubmitting}
                        size="lg"
                        className="w-full h-12 gap-2"
                       >
                          {isSubmitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                          ) : (
                            <>Complete Order <ChevronRight className="w-4 h-4" /></>
                          )}
                       </Button>
                       <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-100">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                          <p className="text-[10px] font-medium text-slate-400 leading-normal">
                             By placing this order, you agree to our terms and conditions.
                          </p>
                       </div>
                    </div>
                  </CardContent>
               </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
