import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Zap, 
  Package, 
  Info,
  Plus,
  Minus,
  Sparkles,
  Clock
} from 'lucide-react';
import { Experience } from '@/types/app';
import { Button } from '@/components/ui/button';
import { subscriptionService } from '@/lib/services/subscriptionService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';

interface SubscriptionModalProps {
  product: Experience;
  isOpen: boolean;
  onClose: () => void;
}

const WEEK_DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 }
];

export function SubscriptionModal({ product, isOpen, onClose }: SubscriptionModalProps) {
  const { user } = useAuth();

  // Only show frequencies the product supports
  const availableFrequencies = (['daily', 'alternate', 'weekly', 'monthly'] as const).filter(
    f => !product.allowed_frequencies?.length || product.allowed_frequencies.includes(f)
  );
  const defaultFreq = availableFrequencies[0] ?? 'daily';

  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'alternate' | 'monthly'>(defaultFreq);
  const [quantity, setQuantity] = useState(1);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset frequency when product changes
  const [prevProductId, setPrevProductId] = useState(product.id);
  if (product.id !== prevProductId) {
    setPrevProductId(product.id);
    setFrequency(defaultFreq);
  }

  // Recalculate next delivery when parameters change
  const nextDeliveryDate = useMemo(() => {
    return subscriptionService.calculateNextDelivery(startDate, frequency, selectedDays);
  }, [startDate, frequency, selectedDays]);

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please login to subscribe');
      return;
    }

    if (frequency === 'weekly' && selectedDays.length === 0) {
      toast.error('Please select at least one day for weekly delivery');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        user_id: user.id,
        user_phone: user.phone || '',
        product_id: product.id,
        quantity,
        frequency,
        days_of_week: frequency === 'weekly' ? selectedDays : [],
        start_date: startDate,
        total_per_delivery: (product.discount_price || product.price) * quantity,
        status: 'active' as const,
        auto_renew: true,
        schedule: {
             days: frequency === 'weekly' ? selectedDays : undefined
        }
      };

      const result = await subscriptionService.create(payload as any);
      if (result) {
        toast.success(`Subscribed to ${product.name} successfully!`);
        onClose();
      } else {
        throw new Error('Failed to create subscription');
      }
    } catch (error) {
      toast.error('Could not create subscription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative h-48 bg-pb-green-deep overflow-hidden">
            <div className="absolute inset-0 opacity-20">
               <img src={product.image} className="w-full h-full object-cover blur-sm scale-110" alt="" />
               <div className="absolute inset-0 bg-gradient-to-t from-pb-green-deep via-transparent to-transparent" />
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-6 left-8 flex items-end gap-6">
              <div className="w-20 h-20 bg-white rounded-2xl p-2 shadow-xl overflow-hidden">
                 <img src={product.image} className="w-full h-full object-cover rounded-xl" alt={product.name} />
              </div>
              <div className="pb-1">
                <h3 className="text-2xl font-black text-white leading-tight">{product.name}</h3>
                <p className="text-emerald-300 font-bold text-sm tracking-wide uppercase italic">Subscription Plan</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Frequency Selection */}
            <div className="space-y-4">
               <Label label="How often do you need it?" sub="Select your delivery cycle" />
               <div className={`grid gap-3 ${availableFrequencies.length <= 2 ? 'grid-cols-2' : availableFrequencies.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
                  {[
                    { id: 'daily' as const, icon: <Zap className="w-4 h-4" />, label: 'Daily', desc: 'Every day' },
                    { id: 'alternate' as const, icon: <Clock className="w-4 h-4" />, label: 'Alternate', desc: 'Every 2 days' },
                    { id: 'weekly' as const, icon: <Calendar className="w-4 h-4" />, label: 'Weekly', desc: 'Select days' },
                    { id: 'monthly' as const, icon: <Package className="w-4 h-4" />, label: 'Monthly', desc: 'Once a month' }
                  ].filter(item => availableFrequencies.includes(item.id)).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setFrequency(item.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                        frequency === item.id 
                          ? "border-pb-green-deep bg-emerald-50 text-pb-green-deep shadow-md" 
                          : "border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg", frequency === item.id ? "bg-pb-green-deep text-white" : "bg-white")}>
                        {item.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </button>
                  ))}
               </div>
            </div>

            {/* Weekly Days Selection */}
            {frequency === 'weekly' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="space-y-4 overflow-hidden"
              >
                <Label label="On which days?" sub="Pick one or more" />
                <div className="flex flex-wrap gap-2">
                   {WEEK_DAYS.map((day) => (
                     <button
                        key={day.value}
                        onClick={() => toggleDay(day.value)}
                        className={cn(
                          "flex-1 min-w-[60px] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                          selectedDays.includes(day.value)
                            ? "border-pb-green-deep bg-pb-green-deep text-white"
                            : "border-slate-100 text-slate-400 hover:border-slate-300"
                        )}
                     >
                        {day.label}
                     </button>
                   ))}
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-8">
               {/* Quantity Selector */}
               <div className="space-y-4">
                  <Label label="Quantity" sub={`Per delivery (${product.unit || 'unit'})`} />
                  <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-2 border border-slate-100">
                     <button 
                       onClick={() => setQuantity(Math.max(1, quantity - 1))}
                       className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-pb-green-deep hover:bg-emerald-50 shadow-sm transition-all"
                     >
                       <Minus className="w-4 h-4" />
                     </button>
                     <span className="flex-1 text-center font-black text-xl">{quantity}</span>
                     <button 
                       onClick={() => setQuantity(quantity + 1)}
                       className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-pb-green-deep hover:bg-emerald-50 shadow-sm transition-all"
                     >
                       <Plus className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               {/* Start Date */}
               <div className="space-y-4">
                  <Label label="Start Date" sub="When to begin?" />
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="date"
                      value={startDate}
                      min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-pb-green-deep/20 transition-all"
                    />
                  </div>
               </div>
            </div>

            {/* Summary Card */}
            <div className="bg-pb-green-deep/5 rounded-3xl p-6 space-y-4 border border-pb-green-deep/10">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Price / Delivery</span>
                  <span className="text-xl font-black text-pb-green-deep">₹{(product.discount_price || product.price) * quantity}</span>
               </div>
               <div className="flex justify-between items-center pt-4 border-t border-pb-green-deep/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                     <Clock className="w-4 h-4" /> Next Delivery
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    {nextDeliveryDate ? format(new Date(nextDeliveryDate), 'EEE, MMM dd, yyyy') : 'Calculating...'}
                  </span>
               </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 rounded-2xl text-amber-700 border border-amber-100/50">
               <Info className="w-4 h-4 shrink-0" />
               <p className="text-[10px] font-bold leading-normal italic">
                 Calculated next delivery based on {frequency} schedule starting from {format(new Date(startDate), 'MMM dd')}.
               </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-8 bg-slate-50/50 flex gap-4">
            <Button 
               onClick={onClose}
               variant="outline" 
               className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-2"
            >
               Cancel
            </Button>
            <Button 
              onClick={handleSubscribe}
              disabled={isSubmitting}
              className="flex-[2] h-14 bg-pb-green-deep hover:bg-emerald-800 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-900/20 gap-3"
            >
              {isSubmitting ? 'Finalizing...' : (
                <><Sparkles className="w-4 h-4" /> Confirm Subscription</>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function Label({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="space-y-0.5">
       <span className="block text-sm font-black text-slate-800 tracking-tight">{label}</span>
       <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub}</span>
    </div>
  );
}
