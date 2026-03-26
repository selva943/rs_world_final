import React, { useState, useEffect } from 'react';
import { Offer, Coupon } from '@/types/app';
import { Sparkles, Tag, Zap, Ticket, ArrowRight, Gift, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

interface PromoTickerProps {
  offers: Offer[];
  coupons: Coupon[];
  className?: string;
}

export const PromoTicker: React.FC<PromoTickerProps> = ({ offers, coupons, className }) => {
  const [index, setIndex] = useState(0);
  
  const items = [
    ...(offers || []).map(o => ({ type: 'offer' as const, data: o })),
    ...(coupons || []).map(c => ({ type: 'coupon' as const, data: c }))
  ];

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 4000); // Change every 4 seconds
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[index];

  return (
    <div className={cn("w-full relative h-12 md:h-16 flex items-center overflow-hidden", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ 
            duration: 0.6, 
            ease: [0.22, 1, 0.36, 1] 
          }}
          className="w-full"
        >
          <Link 
            to={current.type === 'offer' ? '/offers' : '/deliverables'}
            className="flex items-center justify-center gap-4 md:gap-8 px-4 h-full group"
          >
            {/* Left Icon Section */}
            <div className={cn(
              "relative w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
              current.type === 'offer' ? "bg-amber-50 text-amber-500 shadow-amber-500/10" : "bg-emerald-50 text-emerald-600 shadow-emerald-600/10"
            )}>
              {current.type === 'offer' ? <Zap className="w-5 h-5 md:w-6 md:h-6 fill-current" /> : <Ticket className="w-5 h-5 md:w-6 md:h-6" />}
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-pb-yellow animate-pulse" />
            </div>

            {/* Content Section */}
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md",
                  current.type === 'offer' ? "bg-amber-500/10 text-amber-700" : "bg-emerald-500/10 text-emerald-700"
                )}>
                  {current.type === 'offer' ? 'Limited Deal' : 'Exclusive Coupon'}
                </span>
                {current.type === 'coupon' && (
                  <span className="text-[12px] md:text-sm font-mono font-black text-slate-900 border-b-2 border-dashed border-pb-green-deep/30">
                    {(current.data as Coupon).code}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm md:text-xl font-black text-pb-green-deep tracking-tight">
                  {current.type === 'offer' ? (current.data as Offer).name : `Extra ₹${(current.data as Coupon).value} OFF`}
                </span>
                
                <div className="bg-pb-green-deep text-[#FFF59D] px-2 md:px-3 py-0.5 md:py-1 rounded-lg md:rounded-xl text-[9px] md:text-[11px] font-black flex items-center gap-1.5 shadow-md">
                  <Gift className="w-3 md:w-3.5 h-3 md:h-3.5" />
                  <span className="hidden xs:inline">SAVE NOW</span>
                </div>
              </div>
            </div>

            {/* Right Action Section */}
            <div className="hidden sm:flex items-center gap-2 text-pb-green-deep font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
              Claim Now
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Progress Dots */}
      {items.length > 1 && (
        <div className="absolute bottom-1 left-0 w-full flex justify-center gap-1.5 pointer-events-none">
          {items.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                index === i ? "w-4 bg-pb-green-deep/40" : "w-1 bg-pb-green-deep/10"
              )} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
