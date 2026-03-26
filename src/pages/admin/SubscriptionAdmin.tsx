import { useState, useEffect, useMemo } from 'react';
import { Subscription, SubscriptionStatus } from '@/types/app';
import { useData } from '@/context/DataContext';
import { 
  RefreshCw, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ArrowUpRight, 
  Users, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Package,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function SubscriptionAdmin() {
  const { subscriptions, loading, updateSubscriptionStatus } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled'>('all');

  const fetchSubscriptions = async () => {
    // Note: useData already loads subscriptions periodically, 
    // but if we need a manual trigger we can add a refresh flag or use the context method.
    // For now we'll rely on the context value.
  };


  const handleStatusUpdate = async (id: string, newStatus: SubscriptionStatus) => {
    const res = await updateSubscriptionStatus(id, newStatus);
    if (res.success) {
      toast.success(`Subscription ${newStatus} updated`);
    } else {
      toast.error(res.message || 'Status update failed');
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub: Subscription) => {
    const matchesSearch = 
      sub.user_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = useMemo(() => {
    const active = subscriptions.filter((s: Subscription) => s.status === 'active').length;
    const revenue = subscriptions
      .filter((s: Subscription) => s.status === 'active')
      .reduce((sum: number, s: Subscription) => sum + (s.total_per_delivery || 0), 0);
    
    return {
      total: subscriptions.length,
      active,
      revenue
    };
  }, [subscriptions]);

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Subscription Dashboard</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Manage recurring revenue and deliveries</p>
        </div>
        <Button 
          onClick={fetchSubscriptions} 
          variant="outline" 
          className="rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] gap-2 h-12"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard 
          label="Total Subscribers" 
          value={stats.total} 
          icon={<Users className="w-5 h-5 text-blue-500" />} 
          trend="+8%"
          color="blue"
        />
        <StatsCard 
          label="Active Plans" 
          value={stats.active} 
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} 
          trend="+12%"
          color="emerald"
        />
        <StatsCard 
          label="Est. Monthly Rev" 
          value={`₹${stats.revenue * 30}`} 
          icon={<TrendingUp className="w-5 h-5 text-indigo-500" />} 
          trend="+15%"
          color="indigo"
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search phone, product..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-pb-green-deep/20"
            />
          </div>
          <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl">
            {['all', 'active', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab as any)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  statusFilter === tab 
                    ? "bg-white text-pb-green-deep shadow-sm" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Subscriber</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Plan Details</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Schedule</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Next Delivery</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-20 font-bold text-slate-400 italic">Curating data...</TableCell></TableRow>
              ) : filteredSubscriptions.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-20 font-bold text-slate-400 italic">No matches found</TableCell></TableRow>
              ) : filteredSubscriptions.map((sub: Subscription) => (
                <TableRow key={sub.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                        {(sub.user_phone ?? '??').slice(-2)}
                      </div>
                      <div>
                        <p className="font-black text-slate-700">{sub.user_phone || sub.user_id?.slice(0,8) || 'Unknown'}</p>
                        <p className="text-[10px] font-bold text-slate-400 italic">
                          {sub.created_at ? `Joined ${format(parseISO(sub.created_at), 'MMM dd')}` : 'New'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <Package className="w-4 h-4 text-pb-green-deep" />
                       <div>
                         <p className="font-bold text-slate-700">{sub.product?.name}</p>
                         <p className="text-[10px] font-bold text-slate-400">{sub.quantity} {sub.product?.unit || 'unit'}</p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                       <Badge variant="outline" className="w-fit text-[9px] font-black uppercase tracking-tighter bg-slate-50 border-slate-200">
                          {sub.frequency}
                       </Badge>
                       {sub.frequency === 'weekly' && sub.days_of_week && (
                          <span className="text-[9px] font-bold text-slate-400 italic">
                             {sub.days_of_week.map((d: number) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}
                          </span>
                       )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
                       <Clock className="w-3.5 h-3.5" />
                       <span className="text-sm font-bold">
                          {sub.next_delivery_date ? format(parseISO(sub.next_delivery_date), 'MMM dd') : '---'}
                       </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "rounded-full text-[9px] font-black uppercase tracking-widest px-3",
                      sub.status === 'active' && "bg-emerald-100 text-emerald-700 border-none",
                      sub.status === 'paused' && "bg-amber-100 text-amber-700 border-none",
                      sub.status === 'cancelled' && "bg-rose-100 text-rose-700 border-none",
                    )}>
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg border-2">
                         <MoreHorizontal className="w-4 h-4 text-slate-400" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon, trend, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100"
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl border", colors[color])}>
          {icon}
        </div>
        <Badge className="bg-slate-50 text-emerald-600 border-none font-bold text-[10px]">
          {trend} <ArrowUpRight className="w-3 h-3 ml-1" />
        </Badge>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h4>
      </div>
    </motion.div>
  );
}
