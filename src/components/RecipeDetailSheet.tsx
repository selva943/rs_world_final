import React, { useMemo, useState, useEffect } from 'react';
import { calculateIngredientPrice, convertToTargetUom, formatIngredientQuantity } from '@/lib/utils/recipe-logic';
import { 
  X, 
  ShoppingBasket, 
  Clock, 
  ChefHat, 
  Plus, 
  Minus,
  Check, 
  ArrowRight,
  Info,
  Zap,
  Star,
  Play,
  Flame,
  Globe,
  Users
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Recipe, RecipeIngredient } from '@/types/app';
import { Button } from '@/components/ui/button';
import { getOptimizedImageUrl } from '@/lib/utils/image-optimization';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router';

interface RecipeDetailSheetProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RecipeDetailSheet: React.FC<RecipeDetailSheetProps> = ({ recipe, isOpen, onClose }) => {
  const { t } = useTranslation();
  const [servings, setServings] = useState(2);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Sync servings with recipe default when it changes
  useEffect(() => {
    if (recipe) setServings(recipe.portion_size || 2);
  }, [recipe]);

  const scalingFactor = recipe ? servings / (recipe.portion_size || 2) : 1;

  const totalPrice = useMemo(() => {
    if (!recipe) return 0;
    return (recipe.ingredients || []).reduce((sum: number, ing: RecipeIngredient) => {
        // Calculate price for 1 portion unit first, then scale by servings
        const ingredientPriceAtBasePortions = calculateIngredientPrice(ing, ing.product);
        return sum + (ingredientPriceAtBasePortions * scalingFactor);
    }, 0);
  }, [recipe, scalingFactor]);

  if (!recipe) return null;

  const handleAddAllToCart = () => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      toast.error(t('no_ingredients_error', 'No ingredients mapped to this recipe yet.'));
      return;
    }

    // Add each ingredient to cart with scaled quantities
    recipe.ingredients.forEach(ing => {
      if (ing.product) {
        // 1. Calculate the raw quantity required for the current servings
        const requiredQty = ing.quantity * scalingFactor;
        
        // 2. Convert that quantity into the product's sellable unit (e.g. g -> kg)
        // If product is sold in 'kg' and we need 250g, we add 0.25 to cart.
        const scaledQtyForCart = convertToTargetUom(requiredQty, ing.uom, ing.product.unit);
        
        addToCart(ing.product as any, scaledQtyForCart);
      }
    });

    toast.success(t('added_to_basket_recipe', { count: servings, name: recipe.name }));
    onClose();
    navigate('/checkout');
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url;
  };

  const renderIngredientQty = (ing: RecipeIngredient) => {
    const scaledQty = ing.quantity * scalingFactor;
    return formatIngredientQuantity(scaledQty, ing.uom);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Sheet */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full max-w-2xl bg-pb-bg z-[101] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header / Hero */}
            <div className="relative h-[200px] md:h-[240px] shrink-0">
              <img 
                src={getOptimizedImageUrl(recipe.image, 1000)} 
                className="w-full h-full object-cover" 
                alt={recipe.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pb-bg via-black/40 to-transparent" />
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-8 right-8">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="px-3 py-0.5 bg-[#FFF59D] text-pb-green-deep text-[9px] font-black uppercase tracking-[0.2em] rounded-md shadow-sm">
                    {recipe.category}
                  </div>
                  {recipe.is_trending && (
                    <div className="px-3 py-0.5 bg-amber-400 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-md shadow-sm">
                      {t('trending_label')}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-white/90 text-[10px] font-black uppercase tracking-widest font-mono">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    {recipe.prep_time}
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-playfair font-black text-white tracking-tight leading-none drop-shadow-md">
                  {recipe.name}
                </h2>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="bg-slate-50/80 backdrop-blur-xl border-y border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 relative z-10">
               <div className="flex items-center gap-8">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 pl-1">{t('servings')}</span>
                    <div className="flex items-center gap-4 bg-white border border-slate-300 rounded-full p-1.5 shadow-sm">
                       <button 
                          onClick={() => setServings(s => Math.max(1, s - 1))} 
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 shadow-sm hover:bg-emerald-50 hover:border-emerald-200 text-slate-600 hover:text-emerald-700 transition-all active:scale-95"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                       <span className="text-lg font-black w-6 text-center text-slate-800">{servings}</span>
                       <button 
                          onClick={() => setServings(s => s + 1)} 
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 shadow-sm hover:bg-emerald-100 hover:border-emerald-300 text-emerald-700 transition-all active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                    </div>
                 </div>
                 
                 <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>

                 <div className="flex flex-col hidden sm:flex">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{t('energy')}</span>
                    <div className="flex items-center gap-1.5 text-orange-500 font-bold text-sm h-8">
                       <Flame className="w-4 h-4" />
                       {Math.round((recipe.calories || 450) * scalingFactor)} kcal
                    </div>
                 </div>
               </div>

               {recipe.video_url && (
                 <a href="#methodology" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-colors">
                    <Play className="w-3.5 h-3.5" /> {t('watch_video')}
                 </a>
               )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
              <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-pb-green-deep flex items-center gap-2">
                    <Info className="w-4 h-4" /> {t('the_chefs_story')}
                </h3>
                <p className="text-xl text-slate-500 font-medium leading-relaxed italic border-l-4 border-emerald-100 pl-6">
                  "{recipe.description}"
                </p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-800">{t('ingredients')}</h3>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{t('kit_total')}</span>
                        <span className="text-xl font-black text-pb-green-deep">₹{totalPrice.toFixed(0)}</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                  {recipe.ingredients?.map((ing, idx) => (
                    <div 
                        key={ing.id} 
                        className={cn(
                          "flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors",
                          idx !== (recipe.ingredients?.length || 0) - 1 && "border-b border-slate-50"
                        )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center shrink-0">
                            {ing.product?.image ? (
                                <img src={getOptimizedImageUrl(ing.product.image, 200)} className="w-full h-full object-cover p-1 rounded-xl" alt={ing.product.name} />
                            ) : (
                                <ShoppingBasket className="w-5 h-5 text-slate-200" />
                            )}
                        </div>
                        <div className="flex flex-col">
                          <p className="font-bold text-slate-800 text-sm">{ing.product?.name || 'Loading...'}</p>
                          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{renderIngredientQty(ing)}</p>
                        </div>
                      </div>
                      <div className="font-black text-slate-800">
                        ₹{(calculateIngredientPrice(ing, ing.product) * scalingFactor).toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Cooking Methodology Section */}
              <section className="space-y-10 border-t border-slate-100 pt-12">
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-800 font-playfair italic">{t('cooking_methodology')}</h3>
                 </div>

                 {recipe.video_url && (
                    <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-2xl">
                       <iframe 
                          src={getEmbedUrl(recipe.video_url)} 
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                       />
                    </div>
                 )}

                 <div className="space-y-8">
                    {(recipe.instructions || []).map((step, idx) => (
                       <div key={idx} className="flex gap-8 group">
                          <div className="w-12 h-12 bg-white border-2 border-slate-100 shadow-sm rounded-2xl flex items-center justify-center shrink-0 text-xl font-black text-pb-green-deep font-playfair italic transition-all group-hover:scale-110 group-hover:bg-pb-green-deep group-hover:text-white">
                             {idx + 1}
                          </div>
                          <p className="text-lg text-slate-600 font-medium leading-relaxed pt-2">
                             {step}
                          </p>
                       </div>
                    ))}
                    {!recipe.instructions?.length && (
                       <div className="p-10 bg-slate-50 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200">
                          <ChefHat className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                           <p className="text-xs font-black uppercase tracking-widest text-slate-300">{t('steps_soon', 'Detailed steps to be published soon')}</p>
                        </div>
                     )}
                 </div>
              </section>

              <section className="bg-emerald-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                <Quote className="absolute -top-4 -right-4 w-32 h-32 text-white/5" />
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-[#FFF59D]" />
                    </div>
                    <h4 className="text-2xl font-playfair font-black tracking-tight">{t('one_click_feast')}</h4>
                </div>
                <p className="text-emerald-100/70 font-medium leading-relaxed mb-8 max-w-md">
                   {t('one_click_feast_description', { recipeName: recipe.name })}
                </p>
                <div className="flex flex-wrap gap-3">
                   <div className="px-4 py-2 bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-white/5">
                      <Check className="w-3 h-3" /> {t('pre_portioned')}
                   </div>
                   <div className="px-4 py-2 bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-white/5">
                      <Check className="w-3 h-3" /> {t('zero_waste')}
                   </div>
                </div>
              </section>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-8 md:p-12 bg-white border-t border-slate-100 flex flex-col md:flex-row gap-6 items-center shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)]">
              <div className="flex-1 text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">{t('estimated_prep_kit_total')}</p>
                <p className="text-4xl font-bold text-slate-900 leading-none">₹{totalPrice.toFixed(2)}</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                 <Button 
                    size="lg"
                    variant="outline"
                    onClick={handleAddAllToCart}
                    className="flex-1 md:w-auto border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px]"
                 >
                    {t('add_all_ingredients')}
                 </Button>
                 <Button 
                    size="lg"
                    onClick={() => {
                      addToCart(recipe, 1);
                      toast.success(t('recipe_kit_added', 'Recipe Kit added to basket!'));
                      onClose();
                      navigate('/checkout');
                    }}
                    className="flex-1 md:w-[240px] bg-pb-green-deep hover:bg-emerald-800 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-emerald-900/20"
                 >
                    {t('add_kit_to_basket', 'Add Kit to Basket')} <ArrowRight className="w-5 h-5 ml-4" />
                 </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Quote = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017V14C19.017 11.2386 16.7784 9 14.017 9V7C17.8829 7 21.017 10.134 21.017 14V21H14.017ZM3.0166 21L3.0166 18C3.0166 16.8954 3.91203 16 5.0166 16H8.0166V14C8.0166 11.2386 5.77801 9 3.0166 9V7C6.88259 7 10.0166 10.134 10.0166 14V21H3.0166Z" />
    </svg>
);
