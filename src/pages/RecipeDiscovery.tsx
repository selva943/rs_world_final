import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ChefHat, 
  Clock, 
  Utensils, 
  Quote, 
  ArrowRight, 
  Sparkles,
  Zap,
  Filter,
  Flame,
  LayoutGrid
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Recipe } from '@/types/app';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeDetailSheet } from '@/components/RecipeDetailSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function RecipeDiscovery() {
  const { recipes, loading } = useData();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const categories = ['All', 'Veg', 'Non-Veg', 'Chicken', 'Mutton', 'Fish', 'Quick Meals'];

  const cookTodaySuggestion = useMemo(() => {
    const hour = new Date().getHours();
    let mealType = 'Dinner';
    if (hour < 11) mealType = 'Breakfast';
    else if (hour < 16) mealType = 'Lunch';

    const suggestions = recipes.filter(r => {
        if (mealType === 'Breakfast') return r.category === 'Veg' || r.category === 'Quick Meals';
        return true; // Simple logic for now
    });

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      // Category filter
      if (selectedCategory !== 'All' && recipe.category !== selectedCategory) return false;

      // Search query
      const name = recipe.name.toLowerCase();
      const query = searchQuery.toLowerCase();
      return name.includes(query);
    });
  }, [recipes, selectedCategory, searchQuery]);

  const handleQuickAdd = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsSheetOpen(true);
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsSheetOpen(true);
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-pb-bg pt-32 px-4 flex items-center justify-center">
             <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center animate-bounce">
                    <ChefHat className="w-10 h-10 text-pb-green-deep" />
                </div>
                <p className="font-playfair font-black text-2xl text-pb-green-deep animate-pulse">Sharpening the Knives...</p>
             </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-pb-bg pb-32">
      {/* Cinematic Hero - Refined and Separated */}
      <div className="relative h-[65vh] min-h-[550px] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1600" 
            className="w-full h-full object-cover scale-105"
            alt="Chef Background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-pb-bg via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10 pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 mb-8 px-6 py-2 bg-emerald-500/20 backdrop-blur-md rounded-full text-emerald-400 text-[10px] font-black tracking-[0.3em] uppercase border border-emerald-500/20">
              <Sparkles className="w-4 h-4" /> Discover Your Inner Chef
            </div>
            <h1 className="text-7xl md:text-[10rem] font-playfair font-black text-white leading-[0.85] tracking-tighter mb-10 drop-shadow-2xl">
              Fresh Ingredients,<br />
              <span className="text-emerald-400 italic">Chef's Magic.</span>
            </h1>
            <p className="text-xl text-white/80 font-medium leading-relaxed mb-12 max-w-xl">
              Elevate your home cooking with farm-fresh ingredients and masterhouse recipes, delivered straight to your door.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <Button className="h-20 px-12 bg-white text-pb-green-deep hover:bg-emerald-50 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl transition-transform hover:scale-105 active:scale-95">
                Explore All Recipes
              </Button>
              {cookTodaySuggestion && (
                <Button 
                  onClick={() => handleQuickAdd(cookTodaySuggestion)}
                  className="h-20 px-12 bg-emerald-600/20 backdrop-blur-md hover:bg-emerald-600/30 text-emerald-50 rounded-2xl font-black uppercase tracking-widest text-xs border border-emerald-500/30 transition-transform hover:scale-105 active:scale-95"
                >
                  <Zap className="w-5 h-5 mr-3" /> Cook Today: {cookTodaySuggestion.name}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-12 relative z-30">
        {/* Search & Filter Bar - Clean Separated UI */}
        <div className="bg-white p-8 rounded-[3.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 mb-16 overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative group flex-1">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-pb-green-deep transition-colors" />
              <Input
                type="text"
                placeholder="What do you want to cook today?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-20 bg-emerald-50/30 border-none text-xl rounded-[2.5rem] py-10 focus:ring-4 focus:ring-emerald-500/5 font-bold placeholder:text-slate-400 placeholder:italic transition-all"
              />
            </div>
          </div>
        </div>

        {/* Categories Scroller */}
        <div className="mb-16 overflow-x-auto pb-6 scrollbar-hide">
          <div className="flex gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-8 py-5 rounded-[1.5rem] whitespace-nowrap text-sm font-black uppercase tracking-widest transition-all",
                  selectedCategory === cat 
                    ? "bg-pb-green-deep text-[#FFF59D] shadow-xl shadow-emerald-900/20 scale-105" 
                    : "bg-white text-slate-400 border border-slate-100 hover:text-pb-green-deep hover:border-pb-green-deep/30"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="space-y-20">
          <section>
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                    <Flame className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                   <h2 className="text-4xl font-playfair font-black text-slate-800 tracking-tight leading-none mb-1">Trending Dishes</h2>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Popular amongst your neighbors</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
              {filteredRecipes.filter(r => r.is_trending).map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  onView={handleViewRecipe} 
                  onBuyIngredients={handleQuickAdd} 
                />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <Utensils className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                   <h2 className="text-4xl font-playfair font-black text-slate-800 tracking-tight leading-none mb-1">New Arrivals</h2>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fresh from our kitchen partners</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
              {filteredRecipes.filter(r => !r.is_trending).map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  onView={handleViewRecipe} 
                  onBuyIngredients={handleQuickAdd} 
                />
              ))}
            </div>

            {filteredRecipes.length === 0 && (
                <div className="text-center py-32 bg-white rounded-[4rem] border border-slate-100 shadow-sm mt-12">
                     <Quote className="w-16 h-16 text-slate-100 mx-auto mb-8 rotate-180" />
                     <h3 className="text-4xl font-playfair font-black text-pb-green-deep mb-4">No Recipes Found</h3>
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-sm max-w-sm mx-auto mb-10">
                        Maybe you should try searching for another dish or resetting filters?
                     </p>
                     <Button 
                        onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setTimeFilter(null); setDifficultyFilter([]); }}
                        className="bg-pb-green-deep hover:bg-emerald-800 h-16 rounded-2xl px-12 font-black uppercase tracking-widest text-xs"
                     >
                        Reset All Explorer
                     </Button>
                </div>
            )}
          </section>
        </div>
      </div>

      <RecipeDetailSheet 
        recipe={selectedRecipe}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}
