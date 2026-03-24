import { useState, useMemo } from 'react';
import { OfferCarousel } from '@/components/OfferCarousel';
import { OfferCard } from '@/components/OfferCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Tag,
  Calendar,
  Percent,
  Package,
  Users,
  X,
  ChevronDown,
  Sparkles,
  Zap,
  Ticket,
  Star
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Offer } from '@/types/app';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const offerTypes = [
  { value: 'all', label: 'All Offers' },
  { value: 'product', label: 'Daily Essentials' },
  { value: 'category', label: 'Fresh Produce' },
  { value: 'combo', label: 'Service Bundles' }
];

const sortByOptions = [
  { value: 'priority', label: 'Top Deals' },
  { value: 'name', label: 'Alphabetical' },
  { value: 'discount', label: 'Best Savings' },
  { value: 'endDate', label: 'Ending Soon' }
];

export function Offers() {
  const { offers, loading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedOffers = useMemo(() => {
    let filtered = offers.filter(offer =>
      offer.status &&
      (!offer.end_date || new Date(offer.end_date) >= new Date())
    );

    if (searchQuery) {
      filtered = filtered.filter(offer =>
        offer.offer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (offer.offer_subtitle && offer.offer_subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(offer => offer.offer_type === selectedType);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return (b.priority || 0) - (a.priority || 0);
        case 'name':
          return a.offer_name.localeCompare(b.offer_name);
        case 'discount':
          return (b.discount_value || 0) - (a.discount_value || 0);
        case 'endDate':
          const aEnd = a.end_date ? new Date(a.end_date).getTime() : Infinity;
          const bEnd = b.end_date ? new Date(b.end_date).getTime() : Infinity;
          return aEnd - bEnd;
        default:
          return 0;
      }
    });
  }, [offers, searchQuery, selectedType, sortBy]);

  const featuredOffers = useMemo(() => 
    filteredAndSortedOffers.filter(o => o.is_featured),
    [filteredAndSortedOffers]
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSortBy('priority');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9F7]">
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 relative">
             <div className="absolute inset-0 border-4 border-pb-green-deep/20 rounded-full" />
             <div className="absolute inset-0 border-4 border-pb-green-deep border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(27,94,32,0.2)]" />
          </div>
          <p className="text-pb-green-deep font-bold tracking-[0.2em] animate-pulse text-xs uppercase">Gathering Fresh Deals...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-slate-800 pt-24 pb-32 selection:bg-emerald-500/30">
      {/* Featured Carousel */}
      {featuredOffers.length > 0 && (
        <section className="relative w-full mb-16 px-4">
          <div className="container mx-auto">
            <OfferCarousel offers={featuredOffers} />
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-pb-green-deep/10 rounded-full border border-pb-green-deep/20 text-pb-green-deep"
          >
            <Ticket className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">The Palani Treasury</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-playfair font-bold mb-6 text-pb-green-deep"
          >
            Daily <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-700">Savings</span>
          </motion.h1>
        </div>


        {/* Filter Bar */}
        <div className="sticky top-24 z-40 mb-16 px-6 py-4 bg-white/80 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-emerald-900/5 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full lg:w-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search fresh deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 h-14 bg-slate-50 border-transparent text-slate-900 rounded-full focus:bg-white focus:ring-2 focus:ring-pb-green-deep/20 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Type Shortcuts */}
            <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
              {offerTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={cn(
                    "px-6 h-14 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                    selectedType === type.value 
                      ? "bg-pb-green-deep text-white border-pb-green-deep shadow-lg shadow-emerald-900/20" 
                      : "bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <div className="h-8 w-[1px] bg-slate-100 hidden lg:block" />

            {/* Sort */}
            <div className="w-full lg:w-48 relative">
                <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-14 bg-slate-50 border-transparent rounded-full px-6 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-pb-green-deep/20 appearance-none cursor-pointer"
                >
                {sortByOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                    {opt.label}
                    </option>
                ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          {filteredAndSortedOffers.length > 0 ? (
            <motion.div 
               layout
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredAndSortedOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-32 text-center"
            >
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100 text-pb-green-deep">
                <Sparkles className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-pb-green-deep mb-4">No Savings Found</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto font-light">
                We couldn't find any deals matching your search. Try resetting the filters to explore more neighborly savings.
              </p>
              <Button onClick={clearFilters} className="bg-pb-green-deep text-white rounded-full px-10 h-14 shadow-xl shadow-emerald-900/10">
                Reset All Filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Support Banner */}
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-40 relative group"
        >
            <div className="absolute inset-0 bg-pb-green-deep/5 rounded-[3rem] blur-3xl opacity-50" />
            <div className="relative bg-pb-green-deep rounded-[3rem] p-12 md:p-20 overflow-hidden text-center md:text-left shadow-2xl shadow-emerald-900/20">
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                    <div className="max-w-xl space-y-6">
                        <div className="inline-flex items-center gap-2 text-[#FFF59D] font-bold tracking-[0.2em] text-[10px] uppercase">
                            <Star className="w-4 h-4 fill-current" />
                            Neighborly Support
                        </div>
                        <h2 className="text-4xl md:text-5xl font-playfair font-bold leading-tight text-white">
                            Looking for a <span className="text-[#FFF59D] italic">Special</span> Request?
                        </h2>
                        <p className="text-emerald-50 text-lg font-light leading-relaxed">
                            Need a custom bundle for an event or a recurring delivery schedule? The Boys from Your Next Door are here to make it happen. Talk to us!
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <Button 
                            className="bg-[#FFF59D] text-pb-green-deep hover:bg-[#fff9c4] rounded-2xl h-18 px-10 font-black text-lg h-20 shadow-xl"
                            onClick={() => window.open('https://wa.me/917550346705', '_blank')}
                        >
                            WhatsApp Us
                        </Button>
                        <Button 
                            variant="outline"
                            className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-2xl h-18 px-10 font-black text-lg h-20"
                            onClick={() => window.location.href = 'tel:+917550346705'}
                        >
                            Give Us a Call
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
}
