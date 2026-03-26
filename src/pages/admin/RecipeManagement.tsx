import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  ChefHat, 
  Clock, 
  ShoppingBasket,
  Search,
  Loader2,
  Check,
  ChevronRight,
  Sparkles,
  Utensils,
  Play,
  Copy,
  TrendingUp,
  Scale,
  Zap,
  Flame, 
  Globe, 
  Eye,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { storageApi } from '@/lib/services/api';
import { Recipe, RecipeIngredient, Experience, RecipeDifficulty } from '@/types/app';
import { calculateIngredientPrice, SUPPORTED_UOMS, formatIngredientQuantity } from '@/lib/utils/recipe-logic';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const RecipeManagement: React.FC = () => {
  const { recipes, experiences, addRecipe, updateRecipe, deleteRecipe, saveRecipeIngredients, loading } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    category: 'Veg' as Recipe['category'],
    cuisine: '',
    prep_time: '30 mins',
    difficulty: 'Medium' as RecipeDifficulty,
    image: '',
    description: '',
    is_trending: false,
    is_featured: false,
    is_seasonal: false,
    instructions: [] as string[],
    video_url: '',
    portion_size: 2,
    calories: 0,
    tags: [] as string[],
    ingredients: [] as { product_id: string; quantity: number; uom: string; price_override?: number; display_order: number }[]
  });

  const [activeTab, setActiveTab] = useState('general');

  // Auto-calculation logic for total cost
  const totalKitCost = useMemo(() => {
    return form.ingredients.reduce((total: number, ing: any) => {
      const product = experiences.find(e => e.id === ing.product_id);
      return total + calculateIngredientPrice(ing, product);
    }, 0);
  }, [form.ingredients, experiences]);

  const [productSearch, setProductSearch] = useState('');

  const filteredProducts = useMemo(() => {
    return experiences.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
    ).slice(0, 5);
  }, [experiences, productSearch]);

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setForm({
      name: recipe.name,
      category: recipe.category,
      cuisine: recipe.cuisine || '',
      prep_time: recipe.prep_time,
      difficulty: recipe.difficulty,
      image: recipe.image,
      description: recipe.description,
      is_trending: !!recipe.is_trending,
      is_featured: !!recipe.is_featured,
      is_seasonal: !!recipe.is_seasonal,
      instructions: recipe.instructions || [],
      video_url: recipe.video_url || '',
      portion_size: recipe.portion_size || 2,
      calories: recipe.calories || 0,
      tags: recipe.tags || [],
      ingredients: (recipe.ingredients || []).map(ing => ({
        product_id: ing.product_id,
        quantity: ing.quantity,
        uom: ing.uom,
        price_override: ing.price_override,
        display_order: ing.display_order
      }))
    });
    setActiveTab('general');
    setIsFormOpen(true);
  };

  const handleDuplicate = (recipe: Recipe) => {
    handleEdit(recipe);
    setEditingRecipe(null);
    setForm(prev => ({ ...prev, name: `${prev.name} (Copy)`, slug: '' }));
    toast.info("Recipe duplicated! Save to persist.");
  };

  const handleAddNew = () => {
    setEditingRecipe(null);
    setForm({
      name: '',
      category: 'Veg',
      cuisine: '',
      prep_time: '30 mins',
      difficulty: 'Medium',
      image: '',
      description: '',
      is_trending: false,
      is_featured: false,
      is_seasonal: false,
      instructions: [],
      video_url: '',
      portion_size: 2,
      calories: 0,
      tags: [],
      ingredients: []
    });
    setActiveTab('general');
    setIsFormOpen(true);
  };

  const addIngredient = (product: Experience) => {
    if (form.ingredients.find(i => i.product_id === product.id)) {
        toast.error("Ingredient already added!");
        return;
    }
    setForm((prev: any) => ({
      ...prev,
      ingredients: [...prev.ingredients, { 
        product_id: product.id, 
        quantity: 1,
        uom: product.unit || 'pcs',
        display_order: prev.ingredients.length 
      }]
    }));
    setProductSearch('');
  };

  const handleAddInstruction = () => {
    setForm((prev: any) => ({ ...prev, instructions: [...prev.instructions, ''] }));
  };

  const updateInstruction = (index: number, text: string) => {
    const newInstructions = [...form.instructions];
    newInstructions[index] = text;
    setForm((prev: any) => ({ ...prev, instructions: newInstructions }));
  };

  const removeInstruction = (index: number) => {
    setForm((prev: any) => ({ ...prev, instructions: prev.instructions.filter((_: string, i: number) => i !== index) }));
  };

  const removeIngredient = (productId: string) => {
    setForm((prev: any) => ({
      ...prev,
      ingredients: prev.ingredients.filter((i: any) => i.product_id !== productId)
    }));
  };

  const updateIngredient = (productId: string, updates: Partial<any>) => {
    setForm((prev: any) => ({
      ...prev,
      ingredients: prev.ingredients.map((i: any) => i.product_id === productId ? { ...i, ...updates } : i)
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setIsSaving(true);
        const publicUrl = await storageApi.uploadFile(file, 'product-images');
        setForm(prev => ({ ...prev, image: publicUrl }));
        toast.success("Image uploaded successfully!");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload image. Is the bucket set up?");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Recipe name required");

    setIsSaving(true);
    try {
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const recipePayload = {
        name: form.name,
        slug,
        category: form.category,
        cuisine: form.cuisine,
        prep_time: form.prep_time,
        difficulty: form.difficulty,
        image: form.image,
        description: form.description,
        is_trending: form.is_trending,
        is_featured: form.is_featured,
        is_seasonal: form.is_seasonal,
        instructions: form.instructions,
        video_url: form.video_url,
        portion_size: form.portion_size,
        calories: form.calories,
        tags: form.tags
      };

      if (editingRecipe) {
        const res = await updateRecipe(editingRecipe.id, recipePayload);
        if (res.success && res.data) {
          await saveRecipeIngredients(editingRecipe.id, form.ingredients);
          toast.success("Recipe and ingredients updated!");
          setIsFormOpen(false);
        } else {
          toast.error(res.message || "Failed to update recipe");
        }
      } else {
        const res = await addRecipe(recipePayload);
        if (res.success && res.data) {
          await saveRecipeIngredients(res.data.id, form.ingredients);
          toast.success("Recipe saved and mapped!");
          setIsFormOpen(false);
        } else {
          toast.error(res.message || "Failed to add recipe");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save recipe");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-pb-green-deep tracking-tight font-playfair mb-2">Recipe Kit Studio</h2>
          <p className="text-slate-500 font-medium italic">Craft delicious experiences by mapping dishes to your fresh inventory.</p>
        </div>
        <Button 
          onClick={handleAddNew}
          className="bg-pb-green-deep hover:bg-emerald-800 text-white rounded-[1.5rem] px-8 h-16 shadow-xl shadow-emerald-900/10 font-black uppercase tracking-widest text-xs"
        >
          <Utensils className="w-5 h-5 mr-3" /> Create New Dish
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="bg-white border-slate-100 group overflow-hidden rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-900/5">
            <div className="relative aspect-video overflow-hidden">
               <img src={recipe.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={recipe.name} />
               <div className="absolute top-4 left-4 flex gap-2">
                 <div className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-pb-green-deep">
                  {recipe.category}
                 </div>
                 {recipe.is_trending && (
                   <div className="px-3 py-1 bg-amber-400 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-amber-900/10">
                    Trending
                   </div>
                 )}
               </div>
               <div className="absolute bottom-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    onClick={() => handleDuplicate(recipe)}
                    className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border-none text-slate-600 hover:bg-white hover:text-pb-green-deep"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
               </div>
            </div>
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest font-mono">
                      <Clock className="w-3.5 h-3.5" /> {recipe.prep_time}
                  </div>
                  <div className="px-2 py-0.5 bg-slate-50 text-slate-400 border border-slate-100 rounded text-[9px] font-black uppercase tracking-widest">
                      {recipe.difficulty}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-pb-green-deep/50 text-[10px] font-black">
                   <TrendingUp className="w-3.5 h-3.5" /> {recipe.views_count || 0}
                </div>
              </div>
              
              <h3 className="text-xl font-black text-slate-800 font-playfair mb-2 leading-tight group-hover:text-pb-green-deep transition-colors">{recipe.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-6 font-medium italic">"{recipe.description}"</p>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleEdit(recipe)}
                  variant="outline"
                  className="flex-1 border-slate-100 bg-white text-pb-green-deep hover:bg-emerald-50 rounded-xl transition-all font-black uppercase tracking-widest text-[10px] h-12"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Design Kit
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={async () => {
                    if (!confirm(`Delete recipe "${recipe.name}"?`)) return;
                    const res = await deleteRecipe(recipe.id);
                    if (res.success) toast.success("Recipe deleted");
                    else toast.error(res.message || "Failed to delete recipe");
                  }}
                  className="text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl h-12 px-5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recipe Editor Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pb-green-deep/10 backdrop-blur-xl animate-in fade-in duration-300">
          <form 
            onSubmit={handleSubmit}
            className="bg-white border border-slate-100 rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-10 border-b border-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl text-pb-green-deep">
                    <ChefHat className="w-8 h-8" />
                </div>
                <div>
                   <h3 className="text-3xl font-black text-pb-green-deep font-playfair">{editingRecipe ? 'Edit Masterpiece' : 'Design New Dish'}</h3>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Recipe & Ingredient Mapping</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsFormOpen(false)} className="w-12 h-12 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-10 py-6 border-b border-slate-50 shrink-0 bg-slate-50/50">
               <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-white p-1.5 rounded-[1.5rem] w-full max-w-2xl mx-auto border border-slate-100 h-16 shadow-inner shadow-slate-100">
                    <TabsTrigger value="general" className="rounded-xl font-black uppercase tracking-widest text-[10px] flex-1 data-[state=active]:bg-pb-green-deep data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-900/20 transition-all duration-300">General</TabsTrigger>
                    <TabsTrigger value="ingredients" className="rounded-xl font-black uppercase tracking-widest text-[10px] flex-1 data-[state=active]:bg-pb-green-deep data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-900/20 transition-all duration-300">Ingredients</TabsTrigger>
                    <TabsTrigger value="instructions" className="rounded-xl font-black uppercase tracking-widest text-[10px] flex-1 data-[state=active]:bg-pb-green-deep data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-900/20 transition-all duration-300">Instructions</TabsTrigger>
                    <TabsTrigger value="logistics" className="rounded-xl font-black uppercase tracking-widest text-[10px] flex-1 data-[state=active]:bg-pb-green-deep data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-900/20 transition-all duration-300">Logistics</TabsTrigger>
                  </TabsList>
               </Tabs>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-10">
                {activeTab === 'general' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Dish Name</Label>
                        <Input 
                          value={form.name}
                          onChange={(e) => setForm({...form, name: e.target.value})}
                          className="bg-slate-50 border-slate-100 text-pb-green-deep py-8 rounded-2xl px-6 font-bold text-lg"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category</Label>
                          <Select value={form.category} onValueChange={(v: any) => setForm({...form, category: v})}>
                            <SelectTrigger className="bg-slate-50 border-slate-100 h-[64px] rounded-2xl px-6 font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {['Veg', 'Non-Veg', 'Chicken', 'Mutton', 'Fish', 'Quick Meals'].map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Cuisine</Label>
                          <Input 
                            value={form.cuisine}
                            onChange={(e) => setForm({...form, cuisine: e.target.value})}
                            className="bg-slate-50 border-slate-100 h-[64px] rounded-2xl px-6 font-bold"
                            placeholder="e.g. South Indian"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Chef's Description</Label>
                        <Textarea 
                          value={form.description}
                          onChange={(e) => setForm({...form, description: e.target.value})}
                          className="bg-slate-50 border-slate-100 rounded-2xl min-h-[150px] px-6 py-4 font-medium italic"
                        />
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Cover Masterpiece</Label>
                          {form.image && (
                             <button 
                               type="button" 
                               onClick={() => setForm({...form, image: ''})}
                               className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                             >
                               Clear Image
                             </button>
                          )}
                        </div>
                        
                        <div className="relative group">
                          {form.image ? (
                            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl transition-all group-hover:shadow-emerald-900/10">
                              <img src={form.image} className="w-full h-full object-cover" alt="Preview" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <label className="cursor-pointer bg-white text-pb-green-deep px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                  <Upload className="w-4 h-4" />
                                  Replace Dish Image
                                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center aspect-video rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-slate-50/50 hover:bg-emerald-50/50 hover:border-pb-green-deep/30 transition-all cursor-pointer group/upload">
                              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4 group-hover/upload:scale-110 group-hover/upload:rotate-6 transition-all duration-500">
                                <ImageIcon className="w-10 h-10 text-pb-green-deep stroke-[1.5]" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover/upload:text-pb-green-deep transform transition-colors">Click to Upload Dish</span>
                              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                          )}
                        </div>

                        <div className="pt-2">
                           <Label className="text-[9px] font-black uppercase text-slate-300 ml-1 mb-2 block">Direct URL (Optional)</Label>
                           <Input 
                            value={form.image}
                            onChange={(e) => setForm({...form, image: e.target.value})}
                            className="bg-slate-50 border-slate-100 h-12 rounded-xl px-4 text-xs font-bold text-slate-400 placeholder:text-slate-200"
                            placeholder="https://... (or leave empty after upload)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'ingredients' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h4 className="text-xl font-black text-slate-800 font-playfair">Ingredient Mapping</h4>
                         <div className="px-4 py-2 bg-emerald-50 rounded-xl text-pb-green-deep font-black text-xs">
                            Total Kit: ₹{totalKitCost}
                         </div>
                      </div>
                      
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <Input 
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="pl-12 h-14 bg-white border-slate-100 rounded-2xl font-bold shadow-sm focus:ring-2 focus:ring-pb-green-deep/20 transition-all"
                          placeholder="Search products to add..."
                        />
                        {productSearch && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                            {filteredProducts.map((p: Experience) => (
                              <div key={p.id} onClick={() => addIngredient(p)} className="p-4 hover:bg-emerald-50 cursor-pointer flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden">
                                      <img src={p.image} className="w-full h-full object-cover" />
                                   </div>
                                   <p className="font-bold text-sm text-slate-800">{p.name} <span className="text-[10px] opacity-30 ml-2">₹{p.price}</span></p>
                                </div>
                                <Plus className="w-5 h-5 text-slate-200 group-hover:text-pb-green-deep" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {form.ingredients.map((ing: any) => {
                          const product = experiences.find(e => e.id === ing.product_id);
                          const calculatedPrice = calculateIngredientPrice(ing, product);
                          
                          return (
                            <div key={ing.product_id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-emerald-200 transition-all group">
                              <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-pb-green-deep">
                                      <ShoppingBasket className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-800 text-sm leading-none">{product?.name}</p>
                                      <p className="text-[9px] font-black uppercase text-slate-400 mt-1">
                                        Base: {product?.price}/{product?.unit || 'unit'}
                                      </p>
                                    </div>
                                  </div>
                                  <button type="button" onClick={() => removeIngredient(ing.product_id)} className="p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-[8px] font-black uppercase text-slate-300 ml-1">Qty</Label>
                                    <Input 
                                      type="number"
                                      value={ing.quantity}
                                      onChange={(e) => updateIngredient(ing.product_id, { quantity: parseFloat(e.target.value) || 0 })}
                                      className="h-10 bg-slate-50 border-none rounded-xl text-xs font-bold"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[8px] font-black uppercase text-slate-300 ml-1">UOM</Label>
                                    <Select value={ing.uom} onValueChange={(v) => updateIngredient(ing.product_id, { uom: v })}>
                                      <SelectTrigger className="h-10 bg-slate-50 border-none rounded-xl text-xs font-bold">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="rounded-xl">
                                        {SUPPORTED_UOMS.map(u => (
                                          <SelectItem key={u} value={u} className="text-xs uppercase font-bold">{u}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[8px] font-black uppercase text-slate-300 ml-1">Manual ₹</Label>
                                    <Input 
                                      type="number"
                                      value={ing.price_override || ''}
                                      onChange={(e) => updateIngredient(ing.product_id, { price_override: e.target.value ? parseFloat(e.target.value) : undefined })}
                                      placeholder="Auto"
                                      className="h-10 bg-slate-50 border-none rounded-xl text-xs font-bold"
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                   <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Ingredient Cost</span>
                                   </div>
                                   <span className="text-sm font-black text-pb-green-deep">₹{calculatedPrice.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-pb-green-deep/5 p-10 rounded-[3rem] border border-emerald-100 border-dashed flex flex-col items-center justify-center text-center">
                       <ShoppingBasket className="w-16 h-16 text-pb-green-deep/20 mb-6" />
                       <h5 className="text-2xl font-black text-pb-green-deep font-playfair mb-2 italic">Smart Kit Pricing</h5>
                       <p className="text-slate-500 text-sm max-w-[200px] mb-8 leading-relaxed">Total cost is automatically synced with your live product inventory prices.</p>
                       <div className="text-5xl font-black text-pb-green-deep">₹{totalKitCost}</div>
                       <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-2">Combined Retail Value</p>
                    </div>
                  </div>
                )}

                {activeTab === 'instructions' && (
                  <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-500">
                     <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                        <div>
                          <h4 className="text-2xl font-black text-slate-800 font-playfair">Cooking Steps</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Detailed guide for the home chef</p>
                        </div>
                        <Button 
                          type="button" 
                          onClick={handleAddInstruction}
                          className="h-12 px-6 bg-pb-green-deep text-white hover:bg-emerald-800 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 shadow-lg shadow-emerald-900/10 transition-all active:scale-95"
                        >
                          <Plus className="w-4 h-4" /> Add Step
                        </Button>
                     </div>

                     <div className="space-y-6">
                        {form.instructions.map((step: string, idx: number) => (
                           <div key={idx} className="flex gap-6 group">
                              <div className="w-14 h-14 bg-white border-4 border-slate-50 shadow-sm rounded-2xl flex items-center justify-center shrink-0 text-xl font-black text-pb-green-deep font-playfair italic">
                                 {idx + 1}
                              </div>
                              <div className="flex-1 relative">
                                 <Textarea 
                                    value={step}
                                    onChange={(e) => updateInstruction(idx, e.target.value)}
                                    className="bg-slate-50 border-slate-100 rounded-3xl min-h-[100px] px-8 py-6 font-medium text-slate-700 leading-relaxed"
                                    placeholder={`Describe step ${idx+1}...`}
                                 />
                                 <button 
                                  type="button" 
                                  onClick={() => removeInstruction(idx)}
                                  className="absolute -right-3 -top-3 w-8 h-8 bg-white border border-slate-100 shadow-lg rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                 >
                                    <X className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                        ))}
                        {form.instructions.length === 0 && (
                           <div className="text-center py-20 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-100">
                              <ChefHat className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Begin by adding step 1</p>
                           </div>
                        )}
                     </div>

                     <div className="p-8 bg-black rounded-[3rem] text-white">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
                              <Play className="w-6 h-6" />
                           </div>
                           <h4 className="text-xl font-black font-playfair italic">Video Tutorial Link</h4>
                        </div>
                        <Input 
                          value={form.video_url}
                          onChange={(e) => setForm({...form, video_url: e.target.value})}
                          className="bg-white/10 border-white/10 h-16 rounded-2xl px-8 font-bold text-emerald-100 placeholder:text-white/20"
                          placeholder="YouTube or Vimeo URL"
                        />
                     </div>
                  </div>
                )}

                {activeTab === 'logistics' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
                     <div className="space-y-12">
                        <div className="grid grid-cols-2 gap-8">
                           <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Base Portions</Label>
                              <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                 <Button 
                                  type="button" 
                                  variant="ghost" 
                                  onClick={() => setForm({...form, portion_size: Math.max(1, form.portion_size - 1)})}
                                  className="w-12 h-12 rounded-xl bg-white shadow-sm"
                                 >-</Button>
                                 <div className="flex-1 text-center font-black text-pb-green-deep">{form.portion_size} People</div>
                                 <Button 
                                  type="button" 
                                  variant="ghost" 
                                  onClick={() => setForm({...form, portion_size: form.portion_size + 1})}
                                  className="w-12 h-12 rounded-xl bg-white shadow-sm"
                                 >+</Button>
                              </div>
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Difficulty Rating</Label>
                              <Select value={form.difficulty} onValueChange={(v: any) => setForm({...form, difficulty: v})}>
                                <SelectTrigger className="bg-slate-50 border-slate-100 h-16 rounded-2xl px-6 font-bold">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                  {['Easy', 'Medium', 'Hard'].map(d => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                           <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nutrient Score (Kcal)</Label>
                              <div className="relative">
                                 <Flame className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                                 <Input 
                                  type="number"
                                  value={form.calories}
                                  onChange={(e) => setForm({...form, calories: Number(e.target.value)})}
                                  className="bg-slate-50 border-slate-100 h-16 pl-14 rounded-2xl font-bold"
                                />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Total Prep Time</Label>
                              <div className="relative">
                                 <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                 <Input 
                                  value={form.prep_time}
                                  onChange={(e) => setForm({...form, prep_time: e.target.value})}
                                  className="bg-slate-50 border-slate-100 h-16 pl-14 rounded-2xl font-bold"
                                />
                              </div>
                           </div>
                        </div>

                        <div className="p-8 bg-emerald-50 rounded-[3rem] border border-emerald-100 space-y-6">
                           <h4 className="text-sm font-black text-pb-green-deep uppercase tracking-widest">Visibility & Tags</h4>
                           <div className="grid grid-cols-2 gap-6">
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={form.is_trending} onChange={(e) => setForm({...form, is_trending: e.target.checked})} className="w-6 h-6 rounded-lg text-pb-green-deep" />
                                <span className="text-xs font-bold text-slate-600">Mark as Trending</span>
                              </label>
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({...form, is_featured: e.target.checked})} className="w-6 h-6 rounded-lg text-pb-green-deep" />
                                <span className="text-xs font-bold text-slate-600">Featured Placement</span>
                              </label>
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={form.is_seasonal} onChange={(e) => setForm({...form, is_seasonal: e.target.checked})} className="w-6 h-6 rounded-lg text-pb-green-deep" />
                                <span className="text-xs font-bold text-slate-600">Seasonal Availability</span>
                              </label>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <h4 className="text-xl font-black text-slate-800 font-playfair">Performance Metrics</h4>
                        <div className="grid grid-cols-1 gap-4">
                           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                                    <Eye className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Total Views</p>
                                    <p className="text-2xl font-black text-slate-800">{editingRecipe?.views_count || 0}</p>
                                 </div>
                              </div>
                              <div className="text-blue-500 bg-blue-50 px-3 py-1 rounded-full text-[9px] font-black">LIFETIME</div>
                           </div>
                           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                                    <Zap className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Conversion Rate</p>
                                    <p className="text-2xl font-black text-slate-800">
                                       {editingRecipe?.views_count ? ((editingRecipe.orders_count || 0) / editingRecipe.views_count * 100).toFixed(1) : 0}%
                                    </p>
                                 </div>
                              </div>
                              <div className="text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full text-[9px] font-black">HIGH</div>
                           </div>
                           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                                    <ShoppingBasket className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Total Orders</p>
                                    <p className="text-2xl font-black text-slate-800">{editingRecipe?.orders_count || 0}</p>
                                 </div>
                              </div>
                              <div className="text-rose-500 bg-rose-50 px-3 py-1 rounded-full text-[9px] font-black">SALES</div>
                           </div>
                        </div>
                     </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-10 bg-slate-50/80 border-t border-slate-100 flex items-center gap-6 shrink-0">
              <Button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                variant="ghost" 
                className="h-16 rounded-2xl px-12 font-black uppercase tracking-widest text-xs border border-slate-200 text-slate-400 hover:bg-white hover:text-slate-600 transition-all"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
                className="flex-1 bg-pb-green-deep hover:bg-emerald-800 h-16 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <span className="flex items-center gap-3">
                    <Save className="w-5 h-5" /> Save Masterpiece
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
