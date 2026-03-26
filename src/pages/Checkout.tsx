import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  MessageCircle,
  Sparkles,
  Ticket,
  Tag,
  Info,
  Trash2,
  Minus,
  Plus,
  AlertCircle
} from 'lucide-react';
import { OTPModal } from '@/components/OTPModal';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { submitOrder } from '@/lib/services/orderService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import { calculateCouponDiscount } from '@/lib/services/couponService';

export default function Checkout() {
  const { t } = useTranslation();
  const { 
    items, totalAmount, clearCart, updateQuantity, removeFromCart,
    appliedCoupon, bestOffer, discountTotal, finalTotal, 
    applyCoupon, removeCoupon 
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

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
    
    // 1. UI VALIDATION
    if (items.length === 0) {
      toast.error(t('cart_empty_toast'));
      return;
    }
    if (!form.customer_name.trim()) {
      toast.error(t('error_enter_name'));
      return;
    }
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) {
      toast.error(t('error_enter_valid_phone'));
      return;
    }
    if (form.delivery_type === 'delivery' && !form.address.trim()) {
      toast.error(t('error_enter_address'));
      return;
    }

    setIsSubmitting(true);
    try {
      // 2. Subscription auth gate
      const hasSubscription = items.some(item => 
        (item.type || '').toLowerCase() === 'subscription' || item.is_subscription_available
      );
      if (hasSubscription && !user) {
        setShowOtpModal(true);
        setIsSubmitting(false);
        return;
      }

      // 3. Submit via orderService (validation + creation + coupon recording)
      const result = await submitOrder(
        {
          user_id: user?.id,
          customer_name: form.customer_name,
          phone: form.phone,
          address: form.address,
          delivery_type: form.delivery_type,
          payment_method: form.payment_method,
          notes: form.notes,
        },
        items.map(item => ({
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          type: item.type,
        })),
        {
          coupon: appliedCoupon,
          offer: bestOffer,
          discountTotal,
          finalTotal,
        }
      );

      if (!result.success || !result.order) {
        throw new Error(result.error || t('checkout_error_failed_to_place_order'));
      }

      const savedOrder = result.order;
      setOrderId(savedOrder.id);

      // 4. WhatsApp Notification
      const waMessage = [
        `🛒 *${t('whatsapp_order_new_title')}*`,
        ``,
        `🔖 *${t('whatsapp_order_id')}:* #${savedOrder.id.split('-')[0].toUpperCase()}`,
        `👤 *${t('whatsapp_customer')}:* ${form.customer_name}`,
        `📞 *${t('whatsapp_phone')}:* ${form.phone}`,
        `🏠 *${t('whatsapp_type')}:* ${form.delivery_type.toUpperCase()}`,
        form.delivery_type === 'delivery' ? `📍 *${t('whatsapp_address')}:* ${form.address}` : null,
        ``,
        `📋 *${t('whatsapp_items')}:*`,
        ...items.map(item => `• ${item.name} (${item.quantity} ${item.unit}) - ₹${item.price * item.quantity}`),
        ``,
        discountTotal > 0 ? `🧧 *Discount Applied:* -₹${discountTotal}` : null,
        bestOffer ? `✨ *Offer:* ${bestOffer.title}` : null,
        appliedCoupon ? `🎫 *Coupon:* ${appliedCoupon.code}` : null,
        `💰 *${t('whatsapp_grand_total')}: ₹${finalTotal}*`,
        form.notes ? `📝 *${t('whatsapp_notes')}:* ${form.notes}` : null,
        ``,
        t('whatsapp_confirm_message')
      ].filter(Boolean).join('\n');

      setOrderComplete(true);
      clearCart();
      
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;
      window.open(waUrl, '_blank');

      toast.success(t('checkout_success_toast'));
      
    } catch (error: any) {
      console.error('[Checkout] Error:', error);
      toast.error(error.message || t('checkout_error_failed_to_place_order'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">{t('order_success_title')}</h2>
          <p className="text-slate-600 text-lg">
            {t('order_success_message', { orderId: orderId.split('-')[0].toUpperCase() })}
          </p>
          <div className="flex flex-col gap-3 pt-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => navigate('/orders')}>
              {t('track_order_button')}
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/')}>
              {t('back_to_home_button')}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-sm"
        >
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBasket className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{t('cart_empty_title')}</h2>
          <p className="text-slate-600">{t('cart_empty_description')}</p>
          <div className="flex flex-col gap-3">
            <Button size="lg" className="w-full" onClick={() => navigate('/marketplace')}>
              {t('browse_marketplace_button')}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back_to_shop_button')}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {t('checkout_title_part1')} <span className="text-primary">{t('checkout_title_part2')}</span>
            </h1>
            <p className="text-slate-500 mt-1">{t('checkout_subtitle')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{t('delivery_details_title')}</h3>
                  <p className="text-xs text-slate-500">{t('delivery_details_subtitle')}</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="customer_name">{t('full_name_label')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="customer_name"
                        required
                        placeholder={t('full_name_placeholder')}
                        className="pl-10"
                        value={form.customer_name}
                        onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('whatsapp_number_label')}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        required
                        type="tel"
                        placeholder={t('whatsapp_number_placeholder')}
                        className="pl-10"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Label>{t('order_type_label')}</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div 
                      onClick={() => setForm({ ...form, delivery_type: 'delivery' })}
                      className={cn(
                        "relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                        form.delivery_type === 'delivery' 
                          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" 
                          : "border-slate-100 hover:border-slate-200 bg-white"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        form.delivery_type === 'delivery' ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                      )}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{t('home_delivery_option')}</div>
                        <div className="text-xs text-slate-500 leading-tight">{t('recommended_label')}</div>
                      </div>
                      {form.delivery_type === 'delivery' && (
                        <CheckCircle2 className="w-5 h-5 text-primary absolute top-2 right-2" />
                      )}
                    </div>

                    <div 
                      onClick={() => setForm({ ...form, delivery_type: 'pickup' })}
                      className={cn(
                        "relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                        form.delivery_type === 'pickup' 
                          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" 
                          : "border-slate-100 hover:border-slate-200 bg-white"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        form.delivery_type === 'pickup' ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                      )}>
                        <Store className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{t('branch_pickup_option')}</div>
                        <div className="text-xs text-slate-500 leading-tight">{t('branch_pickup_description')}</div>
                      </div>
                      {form.delivery_type === 'pickup' && (
                        <CheckCircle2 className="w-5 h-5 text-primary absolute top-2 right-2" />
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {form.delivery_type === 'delivery' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 pt-2"
                    >
                      <Label htmlFor="address">{t('delivery_address_label')}</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Textarea
                          id="address"
                          required
                          placeholder={t('delivery_address_placeholder')}
                          className="pl-10 min-h-[100px] resize-none"
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="notes">{t('special_notes_label')}</Label>
                  <div className="relative">
                    <StickyNote className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Textarea
                      id="notes"
                      placeholder={t('special_notes_placeholder')}
                      className="pl-10 min-h-[80px] resize-none"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{t('payment_option_title')}</h3>
                  <p className="text-xs text-slate-500">{t('payment_option_subtitle')}</p>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div 
                    onClick={() => setForm({ ...form, payment_method: 'cod' })}
                    className={cn(
                      "relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                      form.payment_method === 'cod' 
                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" 
                        : "border-slate-100 hover:border-slate-200 bg-white"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      form.payment_method === 'cod' ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                    )}>
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t('cod_option')}</div>
                      <div className="text-xs text-slate-500">{t('cod_description')}</div>
                    </div>
                    {form.payment_method === 'cod' && (
                      <CheckCircle2 className="w-5 h-5 text-primary absolute top-2 right-2" />
                    )}
                  </div>

                  <div 
                    onClick={() => setForm({ ...form, payment_method: 'whatsapp' })}
                    className={cn(
                      "relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                      form.payment_method === 'whatsapp' 
                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" 
                        : "border-slate-100 hover:border-slate-200 bg-white"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      form.payment_method === 'whatsapp' ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                    )}>
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t('confirm_via_whatsapp_option')}</div>
                      <div className="text-xs text-slate-500">{t('confirm_via_whatsapp_description')}</div>
                    </div>
                    {form.payment_method === 'whatsapp' && (
                      <CheckCircle2 className="w-5 h-5 text-primary absolute top-2 right-2" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-4 h-fit sticky top-24">
            <Card className="border-slate-200 shadow-xl overflow-hidden">
              <div className="p-6 bg-slate-900 text-white">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBasket className="w-6 h-6 text-primary" />
                  {t('cart_summary_title')}
                </h3>
                <p className="text-slate-400 text-sm mt-1">{t('items_count', { count: items.length })}</p>
              </div>
              
              <CardContent className="p-0">
                <div className="max-h-[300px] overflow-y-auto px-6 py-4 space-y-4">
                  {items.map((item) => (
                    <div key={item.product_id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative group">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                        />
                        <div className="absolute top-0 right-0 p-1">
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 bg-white/90 backdrop-blur-sm shadow-sm ring-1 ring-black/5">
                            {item.quantity}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-semibold text-slate-800 text-sm line-clamp-1 leading-tight">{item.name}</h4>
                          <button 
                            type="button"
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1 -m-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                           <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                             <Button 
                                type="button"
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 rounded-md hover:bg-white hover:shadow-sm"
                                onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                             >
                               <Minus className="w-3 h-3" />
                             </Button>
                             <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                             <Button 
                                type="button"
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 rounded-md hover:bg-white hover:shadow-sm"
                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                             >
                               <Plus className="w-3 h-3" />
                             </Button>
                           </div>
                           <span className="font-bold text-slate-900 text-sm">₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100 space-y-6">
                  {/* Add More Products Button */}
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full bg-white border-dashed border-slate-300 text-slate-600 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all group h-12"
                    onClick={() => navigate('/marketplace')}
                  >
                    <Plus className="w-4 h-4 mr-2 text-slate-400 group-hover:text-primary transition-colors" />
                    {t('add_more_products')}
                  </Button>

                  {/* Coupon Input */}
                  {!appliedCoupon ? (
                    <div className="space-y-2">
                       <Label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5 ml-1">
                         <Ticket className="w-3 h-3" /> Apply Promotion
                       </Label>
                       <div className="flex gap-2">
                         <Input 
                            placeholder="Enter Code" 
                            className="bg-white border-slate-200"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                         />
                         <Button 
                            type="button" 
                            size="sm" 
                            disabled={!couponCode || isApplyingCoupon}
                            onClick={async () => {
                              setIsApplyingCoupon(true);
                              const res = await applyCoupon(couponCode);
                              if (res.success) setCouponCode('');
                              setIsApplyingCoupon(false);
                            }}
                         >
                           {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                         </Button>
                       </div>
                    </div>
                  ) : (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Tag className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-primary">{appliedCoupon.code}</p>
                          <p className="text-[10px] text-primary/60">Coupon Applied Successfully</p>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={removeCoupon}
                      >
                        Remove
                      </Button>
                    </div>
                  )}

                  {/* Nudge: Free Delivery */}
                  {totalAmount < 500 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-3">
                      <div className="p-1.5 bg-amber-100 rounded-lg">
                        <Info className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <p className="text-[10px] text-amber-700 font-medium">
                        Add ₹{500 - totalAmount} more to unlock <b>Free Delivery</b>!
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-slate-600 text-sm">
                      <span>{t('subtotal_label')}</span>
                      <span>₹{totalAmount}</span>
                    </div>
                    
                    {bestOffer && (
                      <div className="flex justify-between text-green-600 text-sm">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          {bestOffer.title}
                        </span>
                        {/* Calculate individual savings for display */}
                        <span>
                          -₹{Math.round(bestOffer.logic_type === 'percentage' 
                            ? (bestOffer.max_discount ? Math.min(totalAmount * bestOffer.discount_value / 100, bestOffer.max_discount) : (totalAmount * bestOffer.discount_value / 100))
                            : 40)}
                        </span>
                      </div>
                    )}

                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600 text-sm font-medium">
                        <span className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5" />
                          Coupon ({appliedCoupon.code})
                        </span>
                        <span>-₹{calculateCouponDiscount(appliedCoupon, totalAmount).discount}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600 text-sm">
                      <span>{t('delivery_fee_label')}</span>
                      <span className={cn(totalAmount >= 500 ? "text-green-600 font-medium" : "text-slate-900")}>
                        {totalAmount >= 500 ? t('free_label') : '₹40'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                    <div>
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">{t('grand_total_label')}</div>
                      <div className="text-3 shadow-primary/10">₹{finalTotal + (totalAmount >= 500 ? 0 : 40)}</div>
                    </div>
                    <div className="text-right">
                       <Badge variant="outline" className="text-slate-400 font-normal border-slate-200">
                         Incl. all taxes
                       </Badge>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t('processing_order_button')}
                      </>
                    ) : (
                      <>
                        {t('complete_order_button')}
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                  
                  <p className="text-[10px] text-center text-slate-400 pt-2">
                    {t('terms_and_conditions_message')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <AlertCircle className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs text-primary/80 leading-relaxed font-medium">
                {t('checkout_subtitle')}
              </p>
            </div>
          </div>
        </form>
      </div>
      
      <OTPModal 
        isOpen={showOtpModal} 
        onClose={() => setShowOtpModal(false)}
        onSuccess={() => {
          setShowOtpModal(false);
          // Retry submit will be handled by user clicking button again or we can trigger it
          toast.success("Login successful! You can now complete your order.");
        }}
      />
    </div>
  );
}
