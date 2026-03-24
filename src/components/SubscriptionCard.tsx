import { useMemo } from 'react';
import { Subscription, SubscriptionStatus } from '@/types/app';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Calendar, Clock, RefreshCw, Pause, Play, ChevronRight, MapPin, ShieldEllipsis } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface SubscriptionCardProps {
  subscription: Subscription;
  onStatusChange: (id: string, status: SubscriptionStatus) => void;
  onEdit: (subscription: Subscription) => void;
}

export function SubscriptionCard({ subscription, onStatusChange, onEdit }: SubscriptionCardProps) {
  const isActive = subscription.status === 'active';
  const isPaused = subscription.status === 'paused';
  
  const statusColors = {
    active: 'bg-emerald-50 text-emerald-700',
    paused: 'bg-amber-50 text-amber-700',
    cancelled: 'bg-rose-50 text-rose-700'
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const scheduleText = useMemo(() => {
    if (subscription.frequency === 'daily') return 'Daily Delivery';
    if (subscription.frequency === 'weekly' && subscription.days_of_week) {
        return subscription.days_of_week.map(d => dayLabels[d]).join(', ');
    }
    if (subscription.frequency === 'monthly') return 'Monthly Delivery';
    return subscription.frequency;
  }, [subscription]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 group relative overflow-hidden"
    >
      {/* Decorative Background for Status */}
      <div className={cn(
          "absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 transition-colors duration-500",
          isActive ? "bg-emerald-500" : "bg-amber-500"
      )} />

      <div className="flex gap-6 relative z-10">
        {/* Product Image */}
        <div className="relative w-24 h-24 rounded-3xl overflow-hidden bg-slate-50 flex-shrink-0 shadow-inner">
          <img
            src={subscription.product?.image || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=200'}
            alt={subscription.product?.name || 'Product'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className={cn(
            "absolute top-2 left-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm",
            statusColors[subscription.status]
          )}>
            {subscription.status}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-black text-slate-800 truncate text-lg">
              {subscription.product?.name || 'Essential Item'}
            </h3>
            <div className="flex flex-col items-end">
                <span className="font-black text-pb-green-deep">₹{subscription.total_per_delivery}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{subscription.quantity} {subscription.product?.unit || 'Units'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 py-1 px-3 rounded-full w-fit max-w-full">
              <RefreshCw className="w-3 h-3 text-pb-green-deep" />
              <span className="truncate">{scheduleText}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Next: {subscription.next_delivery_date ? format(parseISO(subscription.next_delivery_date), 'EEE, MMM dd') : 'Not scheduled'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-50 space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 italic">
                <Clock className="w-3.5 h-3.5 text-slate-300" />
                <span>Slot: {subscription.delivery_slot || 'Morning (6-8 AM)'}</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-yellow-600 uppercase tracking-widest">
                <ShieldEllipsis className="w-3 h-3" /> Secure Plan
            </div>
        </div>

        <div className="flex gap-2">
          {isActive ? (
            <Button
              variant="outline"
              size="lg"
              className="flex-1 rounded-2xl h-12 border-2 font-black uppercase tracking-widest text-[10px]"
              onClick={() => onStatusChange(subscription.id, 'paused')}
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          ) : isPaused ? (
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 rounded-2xl h-12 bg-pb-green-deep text-white font-black uppercase tracking-widest text-[10px]"
              onClick={() => onStatusChange(subscription.id, 'active')}
            >
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="lg"
            className="flex-1 rounded-2xl h-12 text-slate-400 hover:text-pb-green-deep font-black uppercase tracking-widest text-[10px]"
            onClick={() => onEdit(subscription)}
          >
            Settings
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        {isActive && (
           <button 
             onClick={() => toast.info('Delivery skipped for tomorrow!')}
             className="w-full text-center text-[9px] font-black uppercase tracking-[0.2em] text-rose-400 hover:text-rose-600 transition-colors py-1"
           >
             SKip the next delivery ➔
           </button>
        )}
      </div>
    </motion.div>
  );
}
