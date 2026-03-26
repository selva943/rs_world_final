import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, MessageCircle, ShoppingBasket, MapPin, Phone, User, StickyNote, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ordersApi } from '@/lib/services/api';
import { toast } from 'sonner';
import { Experience } from '@/types/app';
import { useAuth } from '@/context/AuthContext';

interface OrderModalProps {
  isOpen: boolean;
  product: Experience | null;
  onClose: () => void;
}

const WHATSAPP_NUMBER = '917550346705'; // Change to your actual number

export const OrderModal: React.FC<OrderModalProps> = ({ isOpen, product, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    address: '',
    quantity: '1',
    notes: '',
    delivery_type: 'delivery' as 'delivery' | 'pickup',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => {
    setForm({ customer_name: '', phone: '', address: '', quantity: '1', notes: '', delivery_type: 'delivery' });
    setDone(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    // Validation
    if (!form.customer_name.trim()) { toast.error(t('error_enter_name')); return; }
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) {
      toast.error(t('error_enter_phone')); return;
    }
    if (form.delivery_type === 'delivery' && !form.address.trim()) {
      toast.error(t('error_enter_address')); return;
    }

    setIsSaving(true);
    try {
      // ── STEP 1: Save order to Supabase ──────────────────────
      const total_amount = Number(form.quantity) * (product.price || 0);
      const orderPayload = {
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim() || undefined,
        delivery_type: form.delivery_type,
        notes: form.notes || undefined,
        status: 'pending' as const,
        payment_method: 'whatsapp',
        payment_status: 'pending' as const,
        total_amount: total_amount,
        user_id: user?.id
      };

      const orderItems = [{
        product_id: product.id,
        quantity: Number(form.quantity),
        price: product.price || 0
      }];

      console.log('[OrderModal] Saving order:', orderPayload);
      const savedOrder = await ordersApi.add(orderPayload, orderItems);

      if (!savedOrder) {
        throw new Error(t('order_save_error', 'Order could not be saved. Please try again.'));
      }

      console.log('[OrderModal] Order saved:', savedOrder.id);

      // ── STEP 2: Open WhatsApp with pre-filled message ──────
      const waMessage = [
        `🛒 *New Order — Palani Basket*`,
        ``,
        `📦 *Product:* ${product.name}`,
        `🔢 *Quantity:* ${form.quantity} ${product.unit || 'unit(s)'}`,
        `💰 *Price:* ₹${product.price} per ${product.unit || 'unit'}`,
        ``,
        `👤 *Name:* ${form.customer_name}`,
        `📞 *Phone:* ${form.phone}`,
        form.delivery_type === 'delivery'
          ? `🏠 *Delivery To:* ${form.address}`
          : `🏪 *Pickup from Branch*`,
        form.notes ? `📝 *Note:* ${form.notes}` : null,
        ``,
        `🔖 *Order ID:* #${savedOrder.id.split('-')[0].toUpperCase()}`,
      ].filter(Boolean).join('\n');

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

      toast.success(t('order_placed_toast'));
      setDone(true);
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 800);

    } catch (err: any) {
      console.error('[OrderModal] Error:', err);
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
          className="bg-white w-full sm:max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[95vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 bg-pb-green-deep text-white flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-1">{t('quick_order')}</p>
              <h3 className="text-xl font-black leading-tight">{product.name}</h3>
              <p className="text-sm text-emerald-200 font-bold mt-1">₹{product.price} / {product.unit || t('unit')}</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Done state */}
          {done ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center gap-4">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-emerald-500" />
              </div>
              <h4 className="text-2xl font-black text-slate-800">{t('order_placed_title')}</h4>
              <p className="text-slate-500 font-medium">{t('order_placed_desc')}</p>
              <Button onClick={handleClose} variant="ghost" className="mt-4 text-pb-green-deep">
                {t('close')}
              </Button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-5">

                {/* Name */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> {t('your_name_label')}
                  </Label>
                  <Input
                    value={form.customer_name}
                    onChange={(e) => setForm(f => ({ ...f, customer_name: e.target.value }))}
                    placeholder={t('name_placeholder')}
                    className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {t('whatsapp_number_label')}
                  </Label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder={t('phone_placeholder_order')}
                    className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {t('quantity_label', { unit: product.unit || t('unit') })}
                  </Label>
                  <div className="flex items-center gap-4 bg-slate-50 rounded-xl border border-slate-200 px-4 py-2">
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, quantity: String(Math.max(1, Number(f.quantity) - 1)) }))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-pb-green-deep font-black flex items-center justify-center hover:bg-pb-green-deep hover:text-white transition-colors"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center text-lg font-black text-slate-800">{form.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, quantity: String(Number(f.quantity) + 1) }))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-pb-green-deep font-black flex items-center justify-center hover:bg-pb-green-deep hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Delivery type */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {t('delivery_option_label')}
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'delivery', label: `🚚 ${t('home_delivery_label')}`, sub: t('home_delivery_desc') },
                      { value: 'pickup', label: `🏪 ${t('branch_pickup_label')}`, sub: t('branch_pickup_desc') },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, delivery_type: opt.value as any }))}
                        className={cn(
                          'p-4 rounded-2xl text-left border-2 transition-all',
                          form.delivery_type === opt.value
                            ? 'border-pb-green-deep bg-emerald-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        )}
                      >
                        <p className="text-sm font-bold text-slate-800">{opt.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Address — only for delivery */}
                {form.delivery_type === 'delivery' && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> {t('delivery_address_label')}
                    </Label>
                    <Textarea
                      value={form.address}
                      onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                      placeholder={t('address_placeholder_order')}
                      className="bg-slate-50 border-slate-200 rounded-xl font-medium min-h-[80px] resize-none"
                      required={form.delivery_type === 'delivery'}
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <StickyNote className="w-3.5 h-3.5" /> {t('instructions_label')}
                  </Label>
                  <Input
                    value={form.notes}
                    onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder={t('instructions_placeholder')}
                    className="h-11 bg-slate-50 border-slate-200 rounded-xl font-medium"
                  />
                </div>

                {/* Price summary */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-pb-green-deep uppercase tracking-widest">{t('order_total_label')}</p>
                    <p className="text-xs text-slate-500">{form.quantity} × ₹{product.price}</p>
                  </div>
                  <p className="text-2xl font-black text-pb-green-deep">
                    ₹{(Number(form.quantity) * product.price).toFixed(0)}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 pb-8 pt-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-sm gap-3 shadow-lg shadow-emerald-500/30 rounded-2xl"
                >
                  {isSaving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {t('placing_order_status')}</>
                  ) : (
                    <><MessageCircle className="w-5 h-5" /> {t('order_whatsapp_btn')}</>
                  )}
                </Button>
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3">
                  {t('order_footer_note')}
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
