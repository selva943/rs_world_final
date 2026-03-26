import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, Search, Loader2, Sparkles, Ticket, Tag, 
  Calendar, CheckCircle2, XCircle, Info, ChevronRight, Settings2,
  Percent, ArrowUpRight, TrendingUp, Users, Gift, ArrowRight
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Coupon, Offer } from '@/types/app';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PromotionManagement: React.FC = () => {
  const { offers, coupons, addCoupon, updateCoupon, deleteCoupon, addOffer, updateOffer, deleteOffer, loading } = useData();
  const [activeTab, setActiveTab] = useState('coupons');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  
  // Coupon Stats
  const activeCoupons = coupons.filter(c => c.is_active);
  const totalRedemptions = coupons.reduce((acc, c) => acc + (c.used_count || 0), 0);

  // Filtered Lists
  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredOffers = offers.filter(o => 
    o.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge variant="outline" className="mb-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary">
            Marketing Engine v2.0
          </Badge>
          <h1 className="text-4xl font-playfair font-black text-slate-900 tracking-tight">
            Promotions <span className="text-primary italic">& Offers</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage your storefront's discount ecosystem and loyalty drivers.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search promos..." 
              className="pl-9 w-64 rounded-xl border-slate-200 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="rounded-xl shadow-lg shadow-primary/20 gap-2" onClick={() => activeTab === 'coupons' ? setIsCouponModalOpen(true) : setIsOfferModalOpen(true)}>
            <Plus className="w-4 h-4" /> New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Coupons" 
          value={activeCoupons.length} 
          subValue={`${coupons.length} Total`}
          icon={<Ticket className="w-5 h-5" />} 
          trend="+12% this week"
          color="primary"
        />
        <StatCard 
          title="Total Redemptions" 
          value={totalRedemptions} 
          icon={<TrendingUp className="w-5 h-5" />} 
          trend="Avg 24/day"
          color="emerald"
        />
        <StatCard 
          title="Live Offers" 
          value={offers.filter(o => o.is_active).length} 
          icon={<Sparkles className="w-5 h-5" />} 
          trend="4 categories covered"
          color="amber"
        />
        <StatCard 
          title="Customer Reach" 
          value="1,240" 
          icon={<Users className="w-5 h-5" />} 
          trend="85% use coupons"
          color="blue"
        />
      </div>

      {/* Main Content Area */}
      <Tabs defaultValue="coupons" className="space-y-6" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between border-b border-slate-200 pb-1">
          <TabsList className="bg-transparent h-auto p-0 gap-8">
            <TabsTrigger value="coupons" className="px-0 py-3 text-sm font-bold border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none transition-all">
              Coupon Repository
            </TabsTrigger>
            <TabsTrigger value="offers" className="px-0 py-3 text-sm font-bold border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none transition-all">
              Auto-Apply Offers
            </TabsTrigger>
            <TabsTrigger value="stats" className="px-0 py-3 text-sm font-bold border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none transition-all">
              Performance Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="coupons" className="space-y-6 m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredCoupons.map((coupon, idx) => (
                <CouponCard 
                  key={coupon.id} 
                  coupon={coupon} 
                  index={idx}
                  onDelete={async () => {
                    if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
                    const res = await deleteCoupon(coupon.id);
                    if (res.success) toast.success("Coupon deleted");
                    else toast.error(res.message || "Failed to delete coupon");
                  }}
                  onEdit={() => {
                    setEditingCoupon(coupon);
                    setIsCouponModalOpen(true);
                  }}
                  onToggleActive={async (active: boolean) => {
                    const res = await updateCoupon(coupon.id, { is_active: active });
                    if (res.success) toast.success(`Coupon ${active ? 'activated' : 'deactivated'}`);
                    else toast.error(res.message || "Failed to update coupon status");
                  }}
                />
              ))}
            </AnimatePresence>
            
            <motion.div 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setIsCouponModalOpen(true)}
              className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-8 bg-white/50 hover:bg-white hover:border-primary/30 transition-all group cursor-pointer"
            >
              <div className="p-4 bg-slate-50 rounded-2xl mb-4 group-hover:bg-primary/10 transition-colors">
                <Plus className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-bold text-slate-400 group-hover:text-primary">Create New Coupon</h3>
              <p className="text-xs text-slate-400 mt-1">Flat, % or Free Delivery</p>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="offers" className="space-y-6 m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer, idx) => (
              <OfferCard 
                key={offer.id} 
                offer={offer} 
                index={idx}
                onEdit={() => {
                  setEditingOffer(offer);
                  setIsOfferModalOpen(true);
                }}
                onDelete={async () => {
                  if (!confirm(`Delete offer "${offer.name || offer.title}"?`)) return;
                  const res = await deleteOffer(offer.id);
                  if (res.success) toast.success("Offer deleted");
                  else toast.error(res.message || "Failed to delete offer");
                }}
              />
            ))}
            
            <div 
              onClick={() => setIsOfferModalOpen(true)}
              className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-8 bg-white/50 hover:bg-white hover:border-primary/30 transition-all group cursor-pointer"
            >
              <div className="p-4 bg-slate-50 rounded-2xl mb-4">
                <Sparkles className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-bold text-slate-400 group-hover:text-primary">New Smart Offer</h3>
              <p className="text-xs text-slate-400 mt-1">Category or Basket Based</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {isCouponModalOpen && (
        <NewCouponModal 
          isOpen={isCouponModalOpen} 
          onClose={() => {
            setIsCouponModalOpen(false);
            setEditingCoupon(null);
          }} 
          onSave={editingCoupon ? (data: any) => updateCoupon(editingCoupon.id, data) : addCoupon} 
          initialData={editingCoupon}
        />
      )}

      {isOfferModalOpen && (
        <NewOfferModal
          isOpen={isOfferModalOpen}
          onClose={() => {
            setIsOfferModalOpen(false);
            setEditingOffer(null);
          }}
          onSave={editingOffer ? (data: any) => updateOffer(editingOffer.id, data) : addOffer}
          initialData={editingOffer}
        />
      )}
    </div>
  );
};

// --- Helper Components ---

const StatCard = ({ title, value, subValue, icon, trend, color }: any) => {
  const colors: any = {
    primary: "bg-primary/10 text-primary border-primary/20",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100"
  };

  return (
    <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2.5 rounded-xl border", colors[color])}>
            {icon}
          </div>
          <Badge variant="outline" className="text-[10px] text-slate-400 p-0 font-medium border-transparent">
            <ArrowUpRight className="w-3 h-3 mr-1" /> {trend}
          </Badge>
        </div>
        <div>
          <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</h4>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-slate-900">{value}</span>
            {subValue && <span className="text-xs text-slate-400 font-medium">{subValue}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CouponCard = ({ coupon, onEdit, onDelete, onToggleActive }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden relative group"
    >
      <div className="p-6 border-b border-dashed border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <Badge className={cn(
            "rounded-lg px-2 text-[10px] font-bold uppercase",
            coupon.is_active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-500"
          )}>
            {coupon.is_active ? 'Live' : 'Inactive'}
          </Badge>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-primary"
              onClick={onEdit}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight select-all">{coupon.code}</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {coupon.type === 'flat' ? `₹${coupon.value} OFF` : `${coupon.value}% OFF`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900">₹{coupon.min_order_amount}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-tighter font-bold">Min Order</div>
          </div>
        </div>
      </div>
      
      <div className="p-5 bg-slate-50/50 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Used</div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900">{coupon.used_count || 0}</span>
              <span className="text-[10px] text-slate-400">/ {coupon.usage_limit || '∞'}</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Status</div>
            <div className="flex items-center gap-2">
               <button 
                 onClick={() => onToggleActive(!coupon.is_active)}
                 className={cn(
                   "w-8 h-4 rounded-full transition-colors relative",
                   coupon.is_active ? "bg-primary" : "bg-slate-300"
                 )}
               >
                 <div className={cn(
                   "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                   coupon.is_active ? "left-4.5" : "left-0.5"
                 )} />
               </button>
               <span className="text-[10px] font-bold text-slate-500 capitalize">{coupon.is_active ? 'ON' : 'OFF'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium px-1">
          <Calendar className="w-3 h-3" />
          Exp. {coupon.valid_to ? format(new Date(coupon.valid_to), 'MMM dd, yyyy') : 'Never'}
        </div>
      </div>
    </motion.div>
  );
};

const OfferCard = ({ offer, onEdit, onDelete }: any) => {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
      <div className="p-6 relative">
        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-primary"
              onClick={onEdit}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
        </div>
        
        <div className="p-3 bg-primary/5 rounded-2xl w-fit mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{offer.title}</h3>
        <p className="text-xs text-slate-500 font-medium line-clamp-2">{offer.description}</p>
        
        <div className="mt-6 flex items-center justify-between">
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 rounded-lg capitalize">
            {offer.logic_type || 'percentage'}
          </Badge>
          <div className="text-right">
             <span className="text-lg font-black text-primary">-{offer.discount_value}{offer.discount_type === 'percentage' ? '%' : '₹'}</span>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-slate-50/80 flex items-center justify-between border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Activity</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};

const NewCouponModal = ({ isOpen, onClose, onSave, initialData }: any) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: initialData?.code || '',
    type: (initialData?.type || 'flat') as 'flat' | 'percentage' | 'free_delivery',
    value: initialData?.value || 0,
    min_order_amount: initialData?.min_order_amount || 0,
    max_discount: initialData?.max_discount?.toString() || '',
    usage_limit: initialData?.usage_limit?.toString() || '',
    per_user_limit: initialData?.per_user_limit || 1,
    valid_from: initialData?.valid_from ? new Date(initialData.valid_from).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    valid_to: initialData?.valid_to ? new Date(initialData.valid_to).toISOString().split('T')[0] : '',
    is_active: initialData?.is_active ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error('Coupon code is required');
    if (form.value <= 0 && form.type !== 'free_delivery') return toast.error('Discount value must be greater than 0');

    setLoading(true);
    try {
      const payload: any = { ...form };
      if (!payload.max_discount) payload.max_discount = null;
      else payload.max_discount = Number(payload.max_discount);
      
      if (!payload.usage_limit) payload.usage_limit = null;
      else payload.usage_limit = Number(payload.usage_limit);
      
      if (!payload.valid_to) payload.valid_to = null;

      const res = await onSave(payload);
      if (res.success) {
        toast.success(initialData ? 'Coupon updated successfully' : 'Coupon created successfully');
        onClose();
      } else {
        toast.error(res.message || 'Failed to process coupon');
      }
    } catch (err: any) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Coupon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Coupon Code</Label>
              <Input 
                value={form.code} 
                onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} 
                placeholder="e.g. WELCOME50"
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select value={form.type} onValueChange={(val: any) => setForm({...form, type: val})}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="free_delivery">Free Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Value</Label>
              <Input 
                type="number" 
                min="0"
                value={form.value} 
                onChange={e => setForm({...form, value: Number(e.target.value)})} 
                required={form.type !== 'free_delivery'}
                disabled={form.type === 'free_delivery'}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Min Order (₹)</Label>
              <Input 
                type="number" 
                min="0"
                value={form.min_order_amount} 
                onChange={e => setForm({...form, min_order_amount: Number(e.target.value)})} 
                required
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Discount (₹)</Label>
              <Input 
                type="number" 
                min="0"
                value={form.max_discount} 
                onChange={e => setForm({...form, max_discount: e.target.value})} 
                placeholder="No cap"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Usage Limit</Label>
              <Input 
                type="number" 
                min="1"
                value={form.usage_limit} 
                onChange={e => setForm({...form, usage_limit: e.target.value})} 
                placeholder="Unlimited"
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valid From</Label>
              <Input 
                type="date" 
                value={form.valid_from} 
                onChange={e => setForm({...form, valid_from: e.target.value})} 
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Valid To</Label>
              <Input 
                type="date" 
                value={form.valid_to} 
                onChange={e => setForm({...form, valid_to: e.target.value})} 
                className="rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="rounded-xl bg-primary text-white hover:bg-primary/90">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// -----------------------------------------------------------
// ADVANCED SMART OFFER SYSTEM (Step-based Wizard)
// -----------------------------------------------------------

const NewOfferModal = ({ isOpen, onClose, onSave, initialData }: any) => {
  const { categories } = useData();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: initialData?.title || initialData?.name || '',
    description: initialData?.description || '',
    logic_type: (initialData?.logic_type || 'percentage') as 'percentage' | 'bogo' | 'free_delivery' | 'bundle' | 'flat',
    offer_type: (initialData?.offer_type || 'category') as 'product' | 'category' | 'all',
    discount_type: (initialData?.discount_type || 'percentage') as 'percentage' | 'fixed',
    discount_value: initialData?.discount_value || 0,
    min_quantity: initialData?.min_quantity || 1,
    min_order_amount: initialData?.min_order_amount || 0,
    max_discount: initialData?.max_discount?.toString() || '',
    buy_quantity: initialData?.buy_quantity || 1,
    get_quantity: initialData?.get_quantity || 1,
    target_audience: (initialData?.target_audience || 'all_users') as 'all_users' | 'new_users' | 'specific_users',
    total_usage_limit: initialData?.total_usage_limit?.toString() || '',
    per_user_limit: initialData?.per_user_limit || 1,
    priority: initialData?.priority || 0,
    allow_with_coupon: initialData?.allow_with_coupon || false,
    start_date: initialData?.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    end_date: initialData?.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '',
    is_active: initialData?.is_active ?? true,
    category_id: initialData?.category_id || '',
    product_id: initialData?.product_id || '',
    badge: initialData?.badge || 'NEW',
    banner_image: initialData?.banner_image || ''
  });

  const getSavingsMessage = () => {
    switch (form.logic_type) {
      case 'percentage': return `${form.discount_value}% OFF`;
      case 'flat': return `₹${form.discount_value} OFF`;
      case 'bogo': return `Buy ${form.buy_quantity} Get ${form.get_quantity} FREE`;
      case 'free_delivery': return `FREE DELIVERY`;
      case 'bundle': return `Bundle Deal`;
      default: return '';
    }
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) return handleNext();

    setLoading(true);
    try {
      const payload: any = { 
        ...form,
        name: form.title,
        slug: form.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        discount_type: form.logic_type === 'percentage' ? 'percentage' : 'fixed',
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        total_usage_limit: form.total_usage_limit ? Number(form.total_usage_limit) : null,
        end_date: form.end_date || null
      };

      const res = await onSave(payload);
      if (res.success) {
        toast.success('Smart Offer Deployed! 🚀');
        onClose();
        setStep(1);
      } else {
        toast.error(res.message || 'Deployment Failed');
      }
    } catch (err: any) {
      toast.error('Critical Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setTimeout(() => setStep(1), 300);
      }
    }}>
      <DialogContent className="sm:max-w-[850px] max-h-[92vh] overflow-hidden p-0 rounded-[2.5rem] border-none shadow-2xl">
        <div className="flex flex-col md:flex-row h-full">
          {/* Main Form Area */}
          <div className="flex-1 p-8 md:p-10 bg-white overflow-y-auto max-h-[92vh]">
            <DialogHeader className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Smart Offer Wizard</DialogTitle>
                  <p className="text-sm text-slate-500 font-medium italic">Configure high-conversion promotional layers.</p>
                </div>
              </div>
              
              {/* Stepper */}
              <div className="flex items-center gap-2 mt-6">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all border-2",
                      step === s ? "bg-primary border-primary text-white shadow-lg shadow-primary/30" : 
                      step > s ? "bg-emerald-500 border-emerald-500 text-white" : "bg-slate-50 border-slate-100 text-slate-400"
                    )}>
                      {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                    </div>
                    {s < 3 && <div className={cn("h-1 flex-1 rounded-full", step > s ? "bg-emerald-500" : "bg-slate-100")} />}
                  </div>
                ))}
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-8 pb-4">
              {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Campaign Logic</Label>
                      <Select value={form.logic_type} onValueChange={(val: any) => setForm({...form, logic_type: val})}>
                        <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:ring-primary/20"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100">
                          <SelectItem value="percentage">Percentage Discount (%)</SelectItem>
                          <SelectItem value="flat">Flat Cash Discount (₹)</SelectItem>
                          <SelectItem value="bogo">BOGO (Buy X Get Y)</SelectItem>
                          <SelectItem value="free_delivery">Free Delivery Layer</SelectItem>
                          <SelectItem value="bundle">Smart Bundle Price</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Target Range</Label>
                      <Select value={form.offer_type} onValueChange={(val: any) => setForm({...form, offer_type: val})}>
                        <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:ring-primary/20"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100">
                          <SelectItem value="all">Global (All Products)</SelectItem>
                          <SelectItem value="category">Category Specific</SelectItem>
                          <SelectItem value="product">Line-Item Specific</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {form.offer_type === 'product' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Select Target Product</Label>
                      <Select value={form.product_id} onValueChange={(val) => setForm({...form, product_id: val})}>
                        <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:ring-primary/20">
                          <SelectValue placeholder="Which product gets this deal?" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 max-h-[400px]">
                          <div className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 mb-2">Products & Subscriptions</div>
                          {useData().experiences.filter(exp => !exp.is_deleted).map(exp => (
                            <SelectItem key={exp.id} value={exp.id}>
                              <div className="flex items-center gap-2">
                                <span className="opacity-50 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{exp.type.toUpperCase()}</span>
                                {exp.name}
                              </div>
                            </SelectItem>
                          ))}
                          
                          <div className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 my-2">Professional Services</div>
                          {useData().services.filter(s => !s.is_deleted).map(service => (
                            <SelectItem key={service.id} value={service.id}>
                               <div className="flex items-center gap-2">
                                <span className="opacity-50 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">SERVICE</span>
                                {service.name}
                              </div>
                            </SelectItem>
                          ))}

                          <div className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 my-2">Recipe Kits</div>
                          {useData().recipes.filter(r => !r.is_deleted).map(recipe => (
                            <SelectItem key={recipe.id} value={recipe.id}>
                               <div className="flex items-center gap-2">
                                <span className="opacity-50 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">KIT</span>
                                {recipe.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {form.offer_type === 'category' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Select Target Category</Label>
                      <Select value={form.category_id} onValueChange={(val) => setForm({...form, category_id: val})}>
                        <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:ring-primary/20">
                          <SelectValue placeholder="Which category gets this deal?" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100">
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {form.logic_type === 'bogo' && (
                    <div className="grid grid-cols-2 gap-6 p-6 bg-primary/5 rounded-[2rem] border border-primary/10 border-dashed animate-in zoom-in-95 duration-300">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary/60">Buy Quantity</Label>
                        <Input type="number" min="1" className="h-12 rounded-xl" value={form.buy_quantity} onChange={e => setForm({...form, buy_quantity: Number(e.target.value)})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary/60">Get Free Quantity</Label>
                        <Input type="number" min="1" className="h-12 rounded-xl" value={form.get_quantity} onChange={e => setForm({...form, get_quantity: Number(e.target.value)})} />
                      </div>
                    </div>
                  )}

                  {(form.logic_type === 'percentage' || form.logic_type === 'flat') && (
                    <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400">Discount Value {form.logic_type === 'percentage' ? '(%)' : '(₹)'}</Label>
                        <Input type="number" min="0" className="h-12 rounded-xl" value={form.discount_value} onChange={e => setForm({...form, discount_value: Number(e.target.value)})} required />
                      </div>
                      {form.logic_type === 'percentage' && (
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400">Max Savings Cap (₹)</Label>
                          <Input type="number" min="0" className="h-12 rounded-xl" value={form.max_discount} onChange={e => setForm({...form, max_discount: e.target.value})} placeholder="Unlimited" />
                        </div>
                      )}
                    </div>
                  )}

                  {form.logic_type !== 'free_delivery' && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-slate-400" />
                        <Label className="text-xs font-bold text-slate-600">Minimum Items in Cart</Label>
                      </div>
                      <Input 
                        type="number" 
                        min="1" 
                        className="w-20 h-10 rounded-lg text-center font-bold" 
                        value={form.min_quantity} 
                        onChange={e => setForm({...form, min_quantity: Number(e.target.value)})} 
                      />
                    </div>
                  )}

                  {form.logic_type === 'free_delivery' && (
                    <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex flex-col items-center text-center space-y-3 animate-in zoom-in-95 duration-500">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-500">
                        <TrendingUp className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="font-black text-emerald-900">Zero Delivery Fee</h4>
                        <p className="text-xs text-emerald-600 font-medium">This offer provides a flat ₹40 delivery credit to the user.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Audience Targeting</Label>
                    <Select value={form.target_audience} onValueChange={(val: any) => setForm({...form, target_audience: val})}>
                      <SelectTrigger className="h-12 rounded-2xl bg-slate-50/50"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="all_users">All Active Customers</SelectItem>
                        <SelectItem value="new_users">First-Time Buyers Only</SelectItem>
                        <SelectItem value="specific_users">Loyalty Tier Members</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Total Redemptions Cap</Label>
                      <Input type="number" className="h-12 rounded-xl" value={form.total_usage_limit} onChange={e => setForm({...form, total_usage_limit: e.target.value})} placeholder="No limit" />
                    </div>
                    <div className="space-y-2">
                      <Label>Priority Rank (0-99)</Label>
                      <Input type="number" className="h-12 rounded-xl" value={form.priority} onChange={e => setForm({...form, priority: Number(e.target.value)})} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Percent className="w-4 h-4" /></div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Stack with Coupons</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Allows combined savings</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setForm({...form, allow_with_coupon: !form.allow_with_coupon})}
                      className={cn("w-12 h-6 rounded-full transition-all relative shrink-0", form.allow_with_coupon ? "bg-primary" : "bg-slate-300")}
                    >
                      <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all", form.allow_with_coupon ? "left-7" : "left-1")} />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <Label>Marketing Headline</Label>
                    <Input className="h-12 rounded-xl shadow-inner bg-slate-50/50 border-none px-4" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. MEGA SUMMER SAVINGS" required />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" className="h-12 rounded-xl" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" className="h-12 rounded-xl" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Flash Badge Text</Label>
                    <Input className="h-12 rounded-xl" value={form.badge} onChange={e => setForm({...form, badge: e.target.value.toUpperCase()})} placeholder="e.g. LIMITED, EXCLUSIVE" />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-10">
                <Button type="button" variant="ghost" className="rounded-xl px-6" onClick={step === 1 ? onClose : handleBack}>
                  {step === 1 ? 'Cancel' : 'Go Back'}
                </Button>
                <Button type="submit" disabled={loading} className="rounded-2xl px-8 h-12 bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {step < 3 ? 'Next Step' : 'Launch Campaign'}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Panel: Advanced Live Preview */}
          <div className="hidden md:flex w-[340px] bg-slate-900 p-10 flex-col items-center justify-center relative overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
             
             <div className="relative z-10 w-full">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-10 text-center">Mobile View Preview</h4>
                
                <div className="bg-white rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden scale-110">
                   <div className="p-7 relative min-h-[180px] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                           <div className="p-2.5 bg-primary/10 rounded-2xl">
                             <Sparkles className="w-5 h-5 text-primary" />
                           </div>
                           {form.badge && (
                             <Badge className="bg-red-500 border-none rounded-lg text-[9px] font-black py-1 px-2 uppercase shadow-lg shadow-red-200">
                               {form.badge}
                             </Badge>
                           )}
                        </div>
                        <h3 className="text-xl font-black text-slate-900 leading-[1.1] mb-2">{form.title || 'Your Offer Title'}</h3>
                        <p className="text-[11px] text-slate-400 font-bold leading-relaxed line-clamp-2">
                          {form.description || 'Dynamic savings message generated based on your offer logic settings.'}
                        </p>
                      </div>
                      
                      <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">You Save</span>
                           <span className="text-2xl font-black text-primary drop-shadow-sm">{getSavingsMessage()}</span>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-300">
                          <ChevronRight className="w-6 h-6 text-white" />
                        </div>
                      </div>
                   </div>
                   <div className="px-7 py-4 bg-slate-900 flex items-center justify-between border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[8px] font-black uppercase text-white tracking-widest">Auto-Applying Now</span>
                      </div>
                   </div>
                </div>

                <div className="mt-12 space-y-4 px-4">
                   {[
                     { label: 'Audience', val: form.target_audience.replace('_', ' '), icon: <Users className="w-4 h-4" /> },
                     { label: 'Priority', val: `#${form.priority}`, icon: <TrendingUp className="w-4 h-4" /> },
                     { label: 'Stackable', val: form.allow_with_coupon ? 'YES' : 'NO', icon: <Percent className="w-4 h-4" /> }
                   ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                        <div className="flex items-center gap-2 uppercase tracking-widest opacity-60">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        <span className="text-slate-300 uppercase">{item.val}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionManagement;
