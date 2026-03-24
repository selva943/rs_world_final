import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Pause, 
  Play, 
  XCircle, 
  Edit2, 
  ExternalLink,
  Phone,
  Calendar,
  Package,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  MoreVertical,
  RefreshCcw
} from 'lucide-react';
import { subscriptionsApi } from '@/lib/services/api';
import { Subscription, SubscriptionStatus } from '@/types/app';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const SubscriptionManagement: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all');

  const fetchSubscriptions = async () => {
    try {
      const data = await subscriptionsApi.getAll();
      setSubscriptions(data);
    } catch (err) {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleStatusChange = async (id: string, newStatus: SubscriptionStatus) => {
    try {
      await subscriptionsApi.updateStatus(id, newStatus);
      toast.success(`Subscription ${newStatus} successfully`);
      fetchSubscriptions();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filtered = subscriptions.filter(s => {
    const matchesSearch = s.user_phone.includes(search) || 
                         s.product?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active': return { color: 'text-emerald-600 bg-emerald-50', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'paused': return { color: 'text-amber-600 bg-amber-50', icon: <Pause className="w-4 h-4" /> };
      case 'cancelled': return { color: 'text-rose-600 bg-rose-50', icon: <XCircle className="w-4 h-4" /> };
    }
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-playfair font-black text-slate-900 tracking-tight mb-2">
            Operations Center
          </h2>
          <p className="text-slate-500 font-medium italic">Managing {subscriptions.length} recurring relationships.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-pb-green-deep transition-colors" />
              <Input 
                placeholder="Search phone or product..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 w-full sm:w-80 rounded-2xl border-slate-200 h-14 bg-white shadow-sm focus:ring-emerald-500/20"
              />
           </div>
           
           <div className="flex p-1 bg-white border border-slate-100 rounded-2xl shadow-sm h-14 items-center">
              {(['all', 'active', 'paused', 'cancelled'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-6 h-full rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    statusFilter === s 
                      ? "bg-pb-green-deep text-white shadow-lg" 
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {s}
                </button>
              ))}
           </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="w-12 h-12 text-pb-green-deep animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
           <AnimatePresence mode="popLayout">
             {filtered.map((s, idx) => {
               const config = getStatusConfig(s.status);
               return (
                 <motion.div 
                   key={s.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ delay: idx * 0.05 }}
                   className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all group overflow-hidden relative"
                 >
                    <div className="flex items-center gap-8">
                       {/* Identity */}
                       <div className="w-20 h-20 bg-slate-50 rounded-3xl overflow-hidden shadow-inner border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 transition-colors">
                          {s.product?.image ? (
                             <img src={s.product.image} className="w-full h-full object-cover" alt="Sub" />
                          ) : (
                             <Package className="w-8 h-8 text-slate-200" />
                          )}
                       </div>

                       {/* Info */}
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                             <h4 className="text-xl font-bold text-slate-800 tracking-tight">{s.product?.name || 'Loading product...'}</h4>
                             <div className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", config.color)}>
                                {config.icon} {s.status}
                             </div>
                          </div>
                          <div className="flex flex-wrap gap-6 text-[11px] font-medium text-slate-400">
                             <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5" /> {s.user_phone}
                             </div>
                             <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Starts {new Date(s.start_date).toLocaleDateString()}
                             </div>
                             <div className="flex items-center gap-2">
                                <RefreshCcw className="w-3.5 h-3.5" /> Every {s.frequency}
                             </div>
                          </div>
                       </div>

                       {/* Metrics */}
                       <div className="text-right px-8 border-r border-slate-50">
                          <p className="text-2xl font-black text-slate-900">₹{s.total_per_delivery}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-pb-green-deep">Per Order</p>
                       </div>

                       {/* Actions */}
                       <div className="flex items-center gap-3">
                          {s.status === 'active' ? (
                            <Button 
                                onClick={() => handleStatusChange(s.id, 'paused')}
                                variant="outline" 
                                className="h-14 w-14 rounded-2xl border-amber-100 bg-amber-50/30 text-amber-600 hover:bg-amber-50 hover:border-amber-200"
                            >
                                <Pause className="w-5 h-5" />
                            </Button>
                          ) : s.status === 'paused' ? (
                            <Button 
                                onClick={() => handleStatusChange(s.id, 'active')}
                                variant="outline" 
                                className="h-14 w-14 rounded-2xl border-emerald-100 bg-emerald-50/30 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
                            >
                                <Play className="w-5 h-5" />
                            </Button>
                          ) : null}
                          
                          <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50">
                             <Edit2 className="w-5 h-5" />
                          </Button>
                          
                          <Button variant="ghost" size="icon" className="rounded-full text-slate-300">
                             <MoreVertical className="w-4 h-4" />
                          </Button>
                       </div>
                    </div>
                 </motion.div>
               );
             })}
           </AnimatePresence>
           
           {filtered.length === 0 && (
             <div className="p-20 bg-slate-50 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
                <AlertCircle className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <h5 className="text-2xl font-black text-slate-400 font-playfair italic mb-2">No subscriptions found</h5>
                <p className="text-slate-400 font-medium">Try adjusting your filters or search query.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
};
