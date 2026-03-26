import React, { useMemo } from 'react';
import { Clock, ChefHat, ArrowRight, ShoppingCart, Sparkles } from 'lucide-react';
import { Recipe } from '@/types/app';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { calculateIngredientPrice } from '@/lib/utils/recipe-logic';
import { getOptimizedImageUrl } from '@/lib/utils/image-optimization';

interface RecipeCardProps {
  recipe: Recipe;
  onView: (recipe: Recipe) => void;
  onBuyIngredients: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onView, onBuyIngredients }) => {
  const { t } = useTranslation();
  const difficultyColor = {
    'Easy': 'text-emerald-500 bg-emerald-50 border-emerald-100',
    'Medium': 'text-amber-500 bg-amber-50 border-amber-100',
    'Hard': 'text-rose-500 bg-rose-50 border-rose-100'
  }[recipe.difficulty];

  const totalKitPrice = useMemo(() => {
    return (recipe.ingredients || []).reduce((sum, ing) => {
      return sum + calculateIngredientPrice(ing as any, ing.product);
    }, 0);
  }, [recipe.ingredients]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500"
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={getOptimizedImageUrl(recipe.image, 600)} 
          alt={recipe.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Badges */}
        <div className="absolute top-6 left-6 flex flex-wrap gap-2">
          {recipe.is_trending && (
            <div className="px-4 py-1.5 bg-[#FFF59D] text-pb-green-deep text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg border border-white/20">
              <Sparkles className="w-3 h-3" /> {t('trending_label')}
            </div>
          )}
          <div className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-pb-green-deep text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border border-white/20">
            {recipe.category}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-widest">
            <Clock className="w-4 h-4 text-emerald-500" />
            {recipe.prep_time}
          </div>
          <div className={cn(
            "px-2.5 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-widest",
            difficultyColor
          )}>
            {recipe.difficulty}
          </div>
        </div>

        <h3 className="text-2xl font-playfair font-black text-slate-800 mb-3 group-hover:text-pb-green-deep transition-colors line-clamp-1">
          {recipe.name}
        </h3>
        
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-6 font-medium italic">
          "{recipe.description}"
        </p>

        <div className="flex items-center justify-between mb-6">
           <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{t('kit_price')}</span>
              <span className="text-xl font-bold text-pb-green-deep">₹{totalKitPrice.toFixed(0)}</span>
           </div>
           <div className="text-right">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{t('ingredients')}</span>
              <span className="block text-xs font-bold text-slate-600">{(recipe.ingredients || []).length} {t('items')}</span>
           </div>
        </div>

        <div className="flex gap-3">
          <Button 
            size="lg"
            onClick={() => onView(recipe)}
            className="flex-[1.5] bg-pb-green-deep hover:bg-emerald-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-900/10 group-hover:translate-y-[-2px] transition-all"
          >
            {t('explore_recipe')} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg"
            onClick={() => onBuyIngredients(recipe)}
            variant="outline"
            className="flex-1 border-slate-100 text-slate-400 hover:text-pb-green-deep hover:bg-emerald-50 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
