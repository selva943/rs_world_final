import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ExperienceCard } from '@/components/ExperienceCard';
import { CategoryBar } from '@/components/CategoryBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Search,
  ShoppingBasket,
  Filter,
  MessageCircle,
  SlidersHorizontal,
  LayoutGrid,
  ShoppingCart,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useCart } from '@/context/CartContext';
import { safeString, cn } from '@/lib/utils';
import { normalizeItem } from '@/lib/dataNormalization';
import { motion, AnimatePresence } from 'motion/react';
export function Experiences() {
  const { experiences, services, categories, loading } = useData();
  const { items, totalAmount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const allItems = useMemo(() => {
    return [
      ...experiences,
      ...services.map(s => ({ ...s, type: 'service' }))
    ];
  }, [experiences, services]);

  const relevantCategories = useMemo(() => {
    const path = location.pathname;
    const relevantItems = allItems.map(normalizeItem).filter((item: any) => {
      if (!item || item.is_active === false) return false;
      if (path === '/deliverables') return item.type === 'product';
      if (path === '/services') return item.type === 'service';
      if (path === '/recipe-kits') return item.isRecipeKit || (item.name && item.name.toLowerCase().includes('kit'));
      if (path === '/subscription') return item.type === 'subscription';

      // Default (Marketplace / Home): Strictly show only products
      return item.type === 'product';
    });

    const activeNames = new Set(relevantItems.map((item: any) => item.category?.toLowerCase()));
    return categories.filter(c => activeNames.has(c.name.toLowerCase()));
  }, [allItems, location.pathname, categories]);

  useEffect(() => {
    if (relevantCategories.length > 0 && (!selectedCategoryId || !relevantCategories.find(c => c.id === selectedCategoryId))) {
      setSelectedCategoryId(relevantCategories[0].id);
    }
  }, [relevantCategories, selectedCategoryId]);

  const filteredProducts = useMemo(() => {
    return allItems.map(normalizeItem).filter((item: any) => {
      if (!item || item.is_active === false) return false;
      const path = location.pathname;
      const selectedCategory = categories.find(c => c.id === selectedCategoryId);
      const categoryName = selectedCategory ? selectedCategory.name.toLowerCase() : '';

      if (path === '/deliverables') {
        if (item.type !== 'product') return false;
      } else if (path === '/recipe-kits') {
        if (!item.isRecipeKit && !item.name.toLowerCase().includes('kit')) return false;
      } else if (path === '/services') {
        if (item.type !== 'service') return false;
      } else if (path === '/subscription') {
        if (item.type !== 'subscription') return false;
      } else {
        // Default (Marketplace / Home): Strictly show only products
        if (item.type !== 'product') return false;
      }

      // Check category assignment if it's selected and we are rendering products
      if (selectedCategory && item.type === 'product' && path !== '/services') {
        if (item.category.toLowerCase() !== categoryName) return false;
      }


      const name = safeString(item.name).toLowerCase();
      const query = searchQuery.toLowerCase();
      return name.includes(query);
    });
  }, [allItems, location.pathname, selectedCategoryId, searchQuery, categories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F7] pt-24 px-4">
        <div className="container mx-auto">
          <div className="h-40 bg-slate-100 rounded-[3rem] animate-pulse mb-12"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[3/4] bg-white rounded-2xl p-4 space-y-4 shadow-sm animate-pulse">
                <div className="h-[160px] bg-slate-50 rounded-xl"></div>
                <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                <div className="h-8 bg-slate-100 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/deliverables') return 'Fresh Groceries';
    if (path === '/recipe-kits') return 'Chef Recipe Kits';
    if (path === '/services') return 'Home Services';
    if (path === '/subscription') return 'Subscriptions';
    return 'Marketplace';
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] pb-32">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-100 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-emerald-50 rounded-full text-pb-green-deep text-[10px] font-black tracking-widest uppercase border border-emerald-100"
              >
                <Sparkles className="w-3 h-3" />
                Purely Local • Farm Fresh
              </motion.div>
              <h1 className="text-6xl md:text-8xl font-playfair font-black text-pb-green-deep tracking-tighter mb-6">
                {getPageTitle()}
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                From fixing leaks to deep cleaning your home, we bring skilled, trusted service professionals from your neighborhood right to your doorstep.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative group flex-1 sm:min-w-[400px]">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-pb-green-deep transition-colors" />
                <Input
                  type="text"
                  placeholder="What are you craving today?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-16 bg-slate-50 border-none text-lg rounded-[2rem] h-14 focus:ring-2 focus:ring-pb-green-deep/10 shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Category Nav */}
      <CategoryBar
        categories={relevantCategories.length > 0 ? relevantCategories : categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(id) => setSelectedCategoryId(id)}
      />

      <div className="container mx-auto px-4 mt-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content Area */}
          <main className="flex-1 w-full">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pb-green-deep rounded-2xl text-white shadow-lg shadow-emerald-900/10">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {relevantCategories.find(c => c.id === selectedCategoryId)?.name || 'All Items'}
                  </h2>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{filteredProducts.length} Items Available</p>
                </div>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ExperienceCard key={product.id} experience={product} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32 bg-white rounded-[4rem] border border-slate-100 shadow-sm"
              >
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <ShoppingBasket className="w-16 h-16 text-slate-200" />
                </div>
                <h3 className="text-4xl font-playfair font-black text-pb-green-deep mb-4">Cart's Still Empty!</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm max-w-sm mx-auto">
                  We couldn't find any fresh {relevantCategories.find(c => c.id === selectedCategoryId)?.name} matching your search.
                </p>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => { setSelectedCategoryId(relevantCategories[0]?.id); setSearchQuery(''); }}
                  className="text-pb-green-deep mt-10 font-black uppercase tracking-widest text-xs rounded-2xl border border-emerald-50"
                >
                  Clear Selection
                </Button>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Sticky Cart Preview */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-4 right-4 z-50 lg:hidden"
          >
            <div className="bg-pb-green-deep text-white p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-between shadow-emerald-900/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center relative">
                  <ShoppingCart className="w-6 h-6" />
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-pb-green-deep">
                    {items.length}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Your Basket</p>
                  <p className="text-lg font-bold">₹{totalAmount.toFixed(2)}</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/checkout')}
                className="bg-[#FFF59D] text-pb-green-deep h-12 rounded-xl px-6 font-black uppercase tracking-widest text-xs"
              >
                Checkout <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global WhatsApp Float */}
      <a
        href="https://wa.me/917550346705"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[60] hidden lg:flex w-20 h-20 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 group"
      >
        <MessageCircle className="w-8 h-8 group-hover:rotate-12 transition-transform" />
      </a>
    </div>
  );
}
