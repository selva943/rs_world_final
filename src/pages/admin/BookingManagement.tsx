import React, { useState } from 'react';
import {
  Search, Phone, Calendar, Clock, CheckCircle2, XCircle,
  AlertCircle, Loader2, Wrench, MapPin, MoreVertical
} from 'lucide-react';
import { BookingStatus } from '@/types/app';
import { useData } from '@/context/DataContext';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const STATUS_CONFIGS: Record<BookingStatus, { color: string; icon: React.ReactNode }> = {
  pending:   { color: 'text-amber-600 bg-amber-50 border-amber-100',   icon: <AlertCircle className="w-3.5 h-3.5" /> },
  confirmed: { color: 'text-blue-600 bg-blue-50 border-blue-100',      icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  completed: { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelled: { color: 'text-rose-600 bg-rose-50 border-rose-100',      icon: <XCircle className="w-3.5 h-3.5" /> },
};

export const BookingManagement: React.FC = () => {
  const { bookings, loading, updateBookingStatus } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    try {
      const res = await updateBookingStatus(id, newStatus);
      if (res.success) {
        toast.success(`Booking ${newStatus}`);
      } else {
        toast.error(res.message || 'Failed to update booking status');
      }
    } catch {
      toast.error('An unexpected error occurred');
    }
  };

  const filtered = bookings.filter(b => {
    const matchSearch = String(b.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
                        String(b.customer_phone || '').includes(search) ||
                        String(b.service?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-playfair font-black text-slate-900 tracking-tight mb-2">Booking Center</h2>
          <p className="text-slate-500 font-medium italic">{bookings.length} total bookings · Managing service fulfillment.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, or service..." className="pl-12 w-full sm:w-80 rounded-2xl h-12 border-slate-100" />
          </div>
          <div className="flex p-1 bg-white border border-slate-100 rounded-2xl shadow-sm h-12 items-center gap-1 overflow-x-auto">
            {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={cn("px-4 h-full rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  statusFilter === s ? 'bg-pb-green-deep text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50')}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-10 h-10 text-pb-green-deep animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((b, idx) => {
              const cfg = STATUS_CONFIGS[b.status];
              return (
                <motion.div key={b.id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.04 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all p-6 group">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Service Icon */}
                    <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <Wrench className="w-7 h-7 text-pb-green-deep" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-lg font-black text-slate-800">{b.service?.name || 'Unknown Service'}</h4>
                        <span className={cn("px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5", cfg?.color)}>
                          {cfg?.icon} {b.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-5 text-[11px] font-medium text-slate-400">
                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{b.customer_name} · {b.customer_phone}</span>
                        {b.booking_date && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                            {format(new Date(b.booking_date), 'MMM d, yyyy')}
                          </span>
                        )}
                        {b.time_slot && (
                           <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-400" />{b.time_slot}</span>
                        )}
                        {b.address && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{b.address} · {b.user_pincode}</span>}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right px-6 border-x border-slate-50 flex-shrink-0">
                      <p className="text-2xl font-black text-slate-900">₹{b.total_price || b.service?.price || '0'}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-pb-green-deep">Total Price</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap items-center justify-end md:justify-start">
                      {b.status === 'pending' && (
                        <Button onClick={() => handleStatusChange(b.id, 'confirmed')}
                          className="h-12 px-5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg">
                          Confirm
                        </Button>
                      )}
                      {b.status === 'confirmed' && (
                        <Button onClick={() => handleStatusChange(b.id, 'completed')}
                          className="h-12 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg">
                          Complete
                        </Button>
                      )}
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <Button onClick={() => handleStatusChange(b.id, 'cancelled')} variant="outline"
                          className="h-12 px-4 rounded-2xl border-rose-100 text-rose-400 hover:bg-rose-50 font-black text-[10px] uppercase tracking-widest">
                          Cancel
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-300">
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
              <h5 className="text-2xl font-black text-slate-400 font-playfair italic">No bookings found</h5>
              <p className="text-slate-400 font-medium mt-2">Adjust your filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
