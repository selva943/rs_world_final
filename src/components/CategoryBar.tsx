import React, { useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { 
  ChevronRight, 
  ChevronLeft,
  ShoppingBasket
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Category } from '@/types/app';

interface CategoryBarProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string, name: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({ 
  categories, 
  selectedCategoryId, 
  onSelectCategory 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="sticky top-[80px] z-40 bg-[#F7F9F7]/80 backdrop-blur-md border-b border-emerald-900/5 py-4 mb-8">
      <div className="container mx-auto px-4 relative group">
        {/* Scroll Buttons (Desktop only) */}
        <button 
          type="button"
          onClick={() => scroll('left')}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-pb-green-deep opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex border border-slate-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div 
          ref={scrollRef}
          className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 px-2 scroll-smooth"
        >
          {categories.map((cat) => {
            // Dynamic icon mapping from Lucide
            const Icon = (LucideIcons as any)[cat.icon || 'ShoppingBasket'] || ShoppingBasket;
            const isActive = selectedCategoryId === cat.id;

            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectCategory(cat.id, cat.name)}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-300",
                  "border font-bold text-sm tracking-tight shrink-0",
                  isActive 
                    ? "bg-pb-green-deep text-white border-pb-green-deep shadow-xl shadow-emerald-900/20" 
                    : "bg-white text-slate-500 border-slate-100 hover:border-pb-green-deep/30 hover:text-pb-green-deep shadow-sm"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl transition-colors",
                  isActive ? "bg-white/10" : "bg-emerald-50 text-pb-green-deep"
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                {cat.name}
              </motion.button>
            );
          })}
        </div>

        <button 
          type="button"
          onClick={() => scroll('right')}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-pb-green-deep opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex border border-slate-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
