import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Experience } from '@/types/app';
import { subscriptionService } from '@/lib/services/subscriptionService';
import { Subscription } from '@/types/app';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import {
  Sparkles,
  RefreshCcw,
  Zap,
  Calendar,
  Package,
  ArrowRight,
  ShieldCheck,
  Clock,
  PauseCircle,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

// ─── Frequency Badge ────────────────────────────────────────────
const FREQ_ICONS: Record<string, React.ReactNode> = {
  daily: <Zap className="w-3 h-3" />,
  alternate: <RefreshCcw className="w-3 h-3" />,
  weekly: <Calendar className="w-3 h-3" />,
  monthly: <Package className="w-3 h-3" />,
};

function FreqBadge({ freq }: { freq: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-pb-green-deep rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-100">
      {FREQ_ICONS[freq] ?? <RefreshCcw className="w-3 h-3" />}
      {freq}
    </span>
  );
}

// ─── Subscribable Product Card ───────────────────────────────────
interface SubscribableCardProps {
  product: Experience;
  onSubscribe: (p: Experience) => void;
}

function SubscribableProductCard({ product, onSubscribe }: SubscribableCardProps) {
  const freqs = product.allowed_frequencies ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/8 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        <ImageWithFallback
          src={product.image || ''}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {product.discount_percentage && (
          <span className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-xl">
            -{product.discount_percentage}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-pb-green-deep/60 mb-1">
            {product.category}
          </p>
          <h3 className="text-base font-black text-slate-800 line-clamp-2 leading-snug">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{product.description}</p>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          {product.discount_price ? (
            <>
              <span className="text-xl font-black text-pb-green-deep">
                ₹{product.discount_price}
              </span>
              <span className="text-sm text-slate-400 line-through">₹{product.price}</span>
            </>
          ) : (
            <span className="text-xl font-black text-pb-green-deep">₹{product.price}</span>
          )}
          <span className="text-xs text-slate-400 font-bold">/ {product.unit || 'unit'}</span>
        </div>

        {/* Frequencies */}
        {freqs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {freqs.map(f => <FreqBadge key={f} freq={f} />)}
          </div>
        )}

        {/* CTA */}
        <Button
          onClick={() => onSubscribe(product)}
          className="w-full bg-pb-green-deep hover:bg-emerald-800 text-white rounded-2xl h-11 font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-900/10 gap-2 mt-auto"
        >
          <Sparkles className="w-4 h-4" />
          Start Subscription
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Active Subscription Row ─────────────────────────────────────
function ActiveSubscriptionRow({
  sub,
  onStatusChange,
}: {
  sub: Subscription;
  onStatusChange: (id: string, status: any) => void;
}) {
  const statusConfig = {
    active: { color: 'text-emerald-600 bg-emerald-50', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Active' },
    cancelled: { color: 'text-rose-500 bg-rose-50', icon: <XCircle className="w-4 h-4" />, label: 'Cancelled' },
  };
  const cfg = statusConfig[sub.status as keyof typeof statusConfig] ?? statusConfig.active;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
    >
      {/* Product Image */}
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0">
        {sub.product?.image ? (
          <img src={sub.product.image} alt={sub.product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-6 h-6 text-slate-200" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-black text-slate-800 text-sm truncate">{sub.product?.name ?? 'Product'}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <FreqBadge freq={sub.frequency} />
          <span className="text-[10px] text-slate-400 font-bold">×{sub.quantity}</span>
        </div>
      </div>

      {/* Status Badge */}
      <span className={cn('flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider', cfg.color)}>
        {cfg.icon}{cfg.label}
      </span>

      {/* Actions */}
      {sub.status === 'active' && (
        <button
          onClick={() => onStatusChange(sub.id, 'cancelled')}
          className="text-rose-500 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-all"
          title="Cancel"
        >
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [subscribableProducts, setSubscribableProducts] = useState<Experience[]>([]);
  const [mySubscriptions, setMySubscriptions] = useState<Subscription[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Experience | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'mine'>('browse');

  // ── Fetch subscribable products ──────────────────────────
  useEffect(() => {
    async function loadSubscribableProducts() {
      setLoadingProducts(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_subscription_available', true)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('[SubscriptionsPage] products error:', error.message);
        toast.error('Could not load subscription products');
      } else {
        setSubscribableProducts(
          (data ?? []).map((row: any) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            category: row.category,
            type: 'subscription',
            price: Number(row.price) || 0,
            stock: row.stock || 0,
            unit: row.unit || 'kg',
            description: row.description || '',
            image: row.image || row.image_url || '',
            is_subscription_available: true,
            allowed_frequencies: Array.isArray(row.allowed_frequencies) ? row.allowed_frequencies : ['daily', 'weekly'],
            subscription_options: row.subscription_options || {},
            discount_price: row.discount_price || undefined,
            discount_percentage: row.discount_percentage || undefined,
            is_featured: row.is_featured || false,
            is_active: true,
          }))
        );
      }
      setLoadingProducts(false);
    }
    loadSubscribableProducts();
  }, []);

  // ── Fetch user subscriptions ───────────────────────────
  useEffect(() => {
    if (!user) return;
    const phone = (user as any).phone || '';
    subscriptionService.getByUser(phone, user.id).then(setMySubscriptions);
  }, [user]);

  const handleStatusChange = async (id: string, status: string) => {
    const success = await subscriptionService.updateStatus(id, status as any);
    if (success) {
      toast.success(`Subscription ${status}`);
      setMySubscriptions(prev =>
        prev.map(s => s.id === id ? { ...s, status: status as any } : s)
      );
    }
  };

  const activeSubscriptions = mySubscriptions.filter(s => s.status === 'active');

  return (
    <div className="min-h-screen bg-[#F7F9F7] pt-24 pb-24 px-6 md:px-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">

        {/* ── Page Header ── */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-pb-green-deep text-[10px] font-black uppercase tracking-wider mb-4 border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5" />
            Never Run Out Again
          </div>
          <h1 className="text-4xl md:text-5xl font-playfair font-black text-pb-green-deep tracking-tight mb-3">
            Fresh on a <span className="italic text-emerald-500">Schedule</span>
          </h1>
          <p className="text-slate-400 max-w-lg font-medium">
            Subscribe to your everyday essentials and get them delivered daily, weekly, or whenever you need them — automatically.
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 max-w-fit mb-8 gap-1">
          {[
            { id: 'browse', label: 'Browse Plans', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'mine', label: `My Subscriptions${activeSubscriptions.length > 0 ? ` (${activeSubscriptions.length})` : ''}`, icon: <ShieldCheck className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all',
                activeTab === tab.id
                  ? 'bg-pb-green-deep text-white shadow-lg shadow-pb-green-deep/10'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Browse Plans Tab ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'browse' && (
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {loadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-[2rem] overflow-hidden animate-pulse border border-slate-100">
                      <div className="aspect-[4/3] bg-slate-100" />
                      <div className="p-5 space-y-3">
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                        <div className="h-5 bg-slate-100 rounded w-3/4" />
                        <div className="h-4 bg-slate-100 rounded w-1/2" />
                        <div className="h-10 bg-slate-100 rounded-2xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : subscribableProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {subscribableProducts.map(product => (
                    <SubscribableProductCard
                      key={product.id}
                      product={product}
                      onSubscribe={setSelectedProduct}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-8 h-8 text-slate-200" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-700 mb-2 font-playfair">No plans available yet</h2>
                  <p className="text-slate-400 mb-8 max-w-xs mx-auto">
                    The admin team hasn't enabled subscription options for any products yet.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── My Subscriptions Tab ── */}
          {activeTab === 'mine' && (
            <motion.div
              key="mine"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {!user ? (
                <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                  <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <h2 className="text-xl font-black text-slate-700 mb-2">Login to see your plans</h2>
                  <p className="text-slate-400 max-w-xs mx-auto">Sign in to manage your subscriptions.</p>
                </div>
              ) : activeSubscriptions.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                  <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <h2 className="text-xl font-black text-slate-700 mb-2">No active subscriptions</h2>
                  <p className="text-slate-400 mb-6 max-w-xs mx-auto">
                    You haven't subscribed to any products yet. Browse plans to get started!
                  </p>
                  <Button
                    onClick={() => setActiveTab('browse')}
                    className="bg-pb-green-deep rounded-2xl gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Browse Plans
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-w-2xl">
                  <AnimatePresence>
                    {activeSubscriptions.map(sub => (
                      <ActiveSubscriptionRow
                        key={sub.id}
                        sub={sub}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Subscription Modal ── */}
      {selectedProduct && (
        <SubscriptionModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
