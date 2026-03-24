import React, { useMemo, useState, useEffect } from 'react';
import { calculateIngredientPrice, convertToTargetUom, formatIngredientQuantity } from '@/lib/utils/recipe-logic';
import { 
  X, 
  ShoppingBasket, 
  Clock, 
  ChefHat, 
  Plus, 
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
import { Recipe, RecipeIngredient } from '@/types/app';
import { Button } from '@/components/ui/button';
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
      toast.error("No ingredients mapped to this recipe yet.");
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

    toast.success(`Ingredients for ${servings} servings of ${recipe.name} added to cart!`);
    onClose();
    navigate('/checkout');
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
            <div className="relative h-[300px] shrink-0">
              <img 
                src={recipe.image} 
                className="w-full h-full object-cover" 
                alt={recipe.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pb-bg via-black/20 to-transparent" />
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white transition-all border border-white/20"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-4 py-1 bg-[#FFF59D] text-pb-green-deep text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-black/10">
                    {recipe.category}
                  </div>
                  {recipe.is_trending && (
                    <div className="px-4 py-1 bg-amber-400 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-black/10">
                      Trending
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-white/90 text-[10px] font-black uppercase tracking-widest font-mono">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    {recipe.prep_time}
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-playfair font-black text-white tracking-tight leading-none drop-shadow-2xl">
                  {recipe.name}
                </h2>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="bg-white border-b border-slate-50 px-10 py-6 grid grid-cols-3 gap-4 shrink-0 shadow-sm relative z-10">
               <div className="flex flex-col items-center border-r border-slate-100">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-1">Portions</span>
                  <div className="flex items-center gap-4 text-pb-green-deep">
                     <button onClick={() => setServings(s => Math.max(1, s - 1))} className="hover:text-emerald-400"><Users className="w-3.5 h-3.5" /></button>
                     <span className="text-sm font-black">{servings}</span>
                     <button onClick={() => setServings(s => s + 1)} className="hover:text-emerald-400"><Users className="w-3.5 h-3.5" /></button>
                  </div>
               </div>
               <div className="flex flex-col items-center border-r border-slate-100">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-1">Energy</span>
                  <div className="flex items-center gap-1.5 text-orange-500">
                     <Flame className="w-3.5 h-3.5" />
                     <span className="text-sm font-black">{Math.round((recipe.calories || 450) * scalingFactor)} kcal</span>
                  </div>
               </div>
               <div className="flex flex-col items-center">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-1">Masterclass</span>
                  <div className="flex items-center gap-1.5 text-blue-500">
                     <Play className="w-3.5 h-3.5" />
                     <span className="text-sm font-black">Video</span>
                  </div>
               </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
              <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-pb-green-deep flex items-center gap-2">
                    <Info className="w-4 h-4" /> The Chef's Story
                </h3>
                <p className="text-xl text-slate-500 font-medium leading-relaxed italic border-l-4 border-emerald-100 pl-6">
                  "{recipe.description}"
                </p>
              </section>

              <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-800">Ingredients Kit</h3>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                        <span className="text-[10px] font-black text-pb-green-deep uppercase tracking-widest">Total Kit Value:</span>
                        <span className="text-lg font-bold text-pb-green-deep">₹{totalPrice.toFixed(2)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {recipe.ingredients?.map((ing, idx) => (
                    <div 
                        key={ing.id} 
                        className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl hover:border-emerald-200 transition-colors shadow-sm group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden shadow-inner border border-slate-100 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                            {ing.product?.image ? (
                                <img src={ing.product.image} className="w-full h-full object-cover" alt="Ingredient" />
                            ) : (
                                <ShoppingBasket className="w-6 h-6 text-slate-200" />
                            )}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 tracking-tight text-lg leading-none mb-1">{ing.product?.name || 'Loading...'}</p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-pb-green-deep opacity-60">Req: {renderIngredientQty(ing)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-lg font-bold text-slate-800">
                           ₹{(calculateIngredientPrice(ing, ing.product) * scalingFactor).toFixed(0)}
                         </p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Added to kit</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Cooking Methodology Section */}
              <section className="space-y-10 border-t border-slate-100 pt-12">
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-800 font-playfair italic">Cooking Methodology</h3>
                 </div>

                 {recipe.video_url && (
                    <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-2xl">
                       <iframe 
                          src={recipe.video_url.includes('youtube.com/watch?v=') 
                             ? recipe.video_url.replace('watch?v=', 'embed/') 
                             : recipe.video_url.includes('youtu.be/')
                             ? recipe.video_url.replace('youtu.be/', 'youtube.com/embed/')
                             : recipe.video_url} 
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
                          <p className="text-xs font-black uppercase tracking-widest text-slate-300">Detailed steps to be published soon</p>
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
                    <h4 className="text-2xl font-playfair font-black tracking-tight">One-Click Feast</h4>
                </div>
                <p className="text-emerald-100/70 font-medium leading-relaxed mb-8 max-w-md">
                   We've matched these ingredients with our freshest local inventory. Adding this kit ensures you have exactly what's needed for the perfect {recipe.name}.
                </p>
                <div className="flex flex-wrap gap-3">
                   <div className="px-4 py-2 bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-white/5">
                      <Check className="w-3 h-3" /> Pre-portioned
                   </div>
                   <div className="px-4 py-2 bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-white/5">
                      <Check className="w-3 h-3" /> Zero Waste
                   </div>
                </div>
              </section>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-8 md:p-12 bg-white border-t border-slate-100 flex flex-col md:flex-row gap-6 items-center shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)]">
              <div className="flex-1 text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Estimated Prep Kit Total</p>
                <p className="text-4xl font-bold text-slate-900 leading-none">₹{totalPrice.toFixed(2)}</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                 <Button 
                    size="lg"
                    onClick={handleAddAllToCart}
                    className="flex-1 md:w-[300px] bg-pb-green-deep hover:bg-emerald-800 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-emerald-900/20"
                 >
                    Add All Ingredients <ArrowRight className="w-5 h-5 ml-4" />
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
