import React, { useState, useMemo, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  X,
  ShoppingBasket,
  Loader2,
  Package,
  CalendarDays,
  ShieldCheck,
  ArrowUpDown,
  FileUp,
  Activity,
  ImageIcon,
  Upload,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '@/context/DataContext';
import { Experience } from '@/types/app';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, safeString } from '@/lib/utils';
import { toast } from 'sonner';
import { storageApi, experiencesApi } from '@/lib/services/api';

// ============================================================
// PRODUCT FORM STATE TYPE
// ============================================================
interface ProductFormState {
  name: string;
  description: string;
  price: string;
  category: string;
  unit: string;
  stock: string;
  is_active: boolean;
  is_featured: boolean;
  is_veg: boolean;
  is_subscription_available: boolean;
  allowed_frequencies: string[];
  image: File | string | null;
}

const DEFAULT_FORM: ProductFormState = {
  name: '',
  description: '',
  price: '0',
  category: '',
  unit: 'kg',
  stock: '100',
  is_active: true,
  is_featured: false,
  is_veg: true,
  is_subscription_available: false,
  allowed_frequencies: ['daily', 'weekly'],
  image: null,
};

// ============================================================
// CLEAN PRODUCT FORM MODAL
// ============================================================
interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Experience | null;
  categories: { id: string; name: string }[];
  onSaved: () => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  editingProduct,
  categories,
  onSaved,
}) => {
  const [form, setForm] = useState<ProductFormState>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form when editing
  React.useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        price: String(editingProduct.price || 0),
        category: editingProduct.category || '',
        unit: editingProduct.unit || 'kg',
        stock: String(editingProduct.stock || 0),
        is_active: editingProduct.is_active !== false,
        is_featured: !!editingProduct.is_featured,
        is_veg: editingProduct.is_veg !== false,
        is_subscription_available: !!editingProduct.is_subscription_available,
        allowed_frequencies: editingProduct.allowed_frequencies || ['daily', 'weekly'],
        image: editingProduct.image || null,
      });
      setImagePreview(typeof editingProduct.image === 'string' ? editingProduct.image : null);
    } else {
      const defaultCat = categories[0]?.name?.toLowerCase() || 'vegetables';
      setForm({ ...DEFAULT_FORM, category: defaultCat });
      setImagePreview(null);
    }
  }, [editingProduct, isOpen, categories]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setForm(prev => ({ ...prev, image: file }));
    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── Validation ─────────────────────────────────────────
    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (Number(form.price) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    if (!form.category) {
      toast.error('Please select a category');
      return;
    }

    setIsSaving(true);
    try {
      // ── STEP 1: Upload image FIRST if a new file was selected ──
      let finalImageUrl: string = typeof form.image === 'string' ? form.image : '';

      if (form.image instanceof File) {
        console.log('[ProductForm] Uploading image:', form.image.name);
        toast.loading('Uploading image...', { id: 'img-upload' });
        finalImageUrl = await storageApi.uploadFile(form.image);
        toast.dismiss('img-upload');
        console.log('[ProductForm] Image uploaded:', finalImageUrl);
      }

      // ── STEP 2: Build clean DB payload ──────────────────────
      const timestamp = Date.now();
      const slug =
        form.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') +
        '-' +
        timestamp;

      const payload = {
        name: form.name.trim(),
        slug,
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        unit: form.unit || 'kg',
        stock: Number(form.stock) || 0,
        is_active: form.is_active,
        is_featured: form.is_featured,
        is_veg: form.is_veg,
        is_subscription_available: form.is_subscription_available,
        allowed_frequencies: form.is_subscription_available ? form.allowed_frequencies : [],
        subscription_options: form.is_subscription_available ? {
          daily: form.allowed_frequencies.includes('daily'),
          weekly: form.allowed_frequencies.includes('weekly'),
          alternate: form.allowed_frequencies.includes('alternate'),
          monthly: form.allowed_frequencies.includes('monthly'),
        } : {},
        type: 'product',
        image: finalImageUrl,
        image_url: finalImageUrl,
      };

      console.log('[ProductForm] Saving payload:', payload);

      // ── STEP 3: Insert or Update ─────────────────────────────
      // ── STEP 3: Insert or Update ─────────────────────────────
      if (editingProduct) {
        const res = await experiencesApi.update(editingProduct.id, payload);
        if (res.success) {
          toast.success(`✅ "${form.name}" updated successfully!`);
          onSaved();
          onClose();
        } else {
          toast.error(res.message || 'Failed to update product');
        }
      } else {
        const res = await experiencesApi.add(payload);
        if (res.success) {
          toast.success(`✅ "${form.name}" added to catalog!`);
          onSaved();
          onClose();
        } else {
          toast.error(res.message || 'Failed to add product');
        }
      }
    } catch (err: any) {
      console.error('[ProductForm] Save failed:', err);
      toast.dismiss('img-upload');
      toast.error(err.message || 'Failed to save product. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* ── Modal Header ─────────────────── */}
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-pb-green-deep font-playfair tracking-tight">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {editingProduct ? 'Update existing catalog item' : 'Fill all required fields and save'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-slate-400 hover:text-red-500 border border-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Form Body ────────────────────── */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left column */}
                <div className="space-y-6">

                  {/* Product Name */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-pb-green-deep">
                      Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Fresh Tomatoes"
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl px-4 font-semibold text-slate-800 focus:ring-2 focus:ring-pb-green-deep/20"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-pb-green-deep">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={form.category}
                      onValueChange={(val) => setForm(f => ({ ...f, category: val }))}
                    >
                      <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl px-4 font-semibold text-slate-700">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length > 0 ? (
                          categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.name.toLowerCase()}>
                              {cat.name}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="vegetables">Vegetables</SelectItem>
                            <SelectItem value="fruits">Fruits</SelectItem>
                            <SelectItem value="dairy">Dairy</SelectItem>
                            <SelectItem value="meat">Meat</SelectItem>
                            <SelectItem value="grocery">Grocery</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price + Unit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-pb-green-deep">
                        Price (₹) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                        className="h-12 bg-slate-50 border-slate-200 rounded-xl px-4 font-bold text-slate-800"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-pb-green-deep">
                        Unit
                      </Label>
                      <Select
                        value={form.unit}
                        onValueChange={(val) => setForm(f => ({ ...f, unit: val }))}
                      >
                        <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl px-4 font-semibold text-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="g">g (grams)</SelectItem>
                          <SelectItem value="litre">litre</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="piece">piece</SelectItem>
                          <SelectItem value="dozen">dozen</SelectItem>
                          <SelectItem value="bunch">bunch</SelectItem>
                          <SelectItem value="packet">packet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-pb-green-deep">
                      Stock Quantity
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))}
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl px-4 font-bold text-slate-800"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-pb-green-deep">
                      Description
                    </Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Describe the product..."
                      className="bg-slate-50 border-slate-200 rounded-xl px-4 py-3 min-h-[100px] font-medium text-slate-700 resize-none"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Options</p>
                    {[
                      { key: 'is_active', label: 'Active (visible to customers)' },
                      { key: 'is_featured', label: 'Featured on Home page' },
                      { key: 'is_veg', label: 'Vegetarian product' },
                      { key: 'is_subscription_available', label: 'Available for subscription' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() => setForm(f => ({ ...f, [key]: !f[key as keyof ProductFormState] }))}
                          className={cn(
                            'w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all cursor-pointer',
                            (form[key as keyof ProductFormState] as boolean)
                              ? 'bg-pb-green-deep border-pb-green-deep'
                              : 'border-slate-300 bg-white'
                          )}
                        >
                          {(form[key as keyof ProductFormState] as boolean) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-slate-600 group-hover:text-pb-green-deep transition-colors">
                          {label}
                        </span>
                      </label>
                    ))}

                    {/* Subscription Frequency Picker */}
                    {form.is_subscription_available && (
                      <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-pb-green-deep">Allowed Frequencies</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'daily', label: 'Daily' },
                            { id: 'alternate', label: 'Alternate Days' },
                            { id: 'weekly', label: 'Weekly' },
                            { id: 'monthly', label: 'Monthly' },
                          ].map((freq) => {
                            const isSelected = form.allowed_frequencies.includes(freq.id);
                            return (
                              <button
                                key={freq.id}
                                type="button"
                                onClick={() => setForm(f => ({
                                  ...f,
                                  allowed_frequencies: isSelected
                                    ? f.allowed_frequencies.filter(x => x !== freq.id)
                                    : [...f.allowed_frequencies, freq.id]
                                }))}
                                className={cn(
                                  'flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all',
                                  isSelected
                                    ? 'border-pb-green-deep bg-emerald-50 text-pb-green-deep'
                                    : 'border-slate-200 text-slate-400 hover:border-slate-300'
                                )}
                              >
                                <div className={cn(
                                  'w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center flex-shrink-0',
                                  isSelected ? 'border-pb-green-deep bg-pb-green-deep' : 'border-slate-300'
                                )}>
                                  {isSelected && <Check className="w-2 h-2 text-white" />}
                                </div>
                                {freq.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right column — Image Upload */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-pb-green-deep">
                    Product Image
                  </Label>

                  <div
                    className={cn(
                      'relative border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-300',
                      imagePreview
                        ? 'border-pb-green-deep/30 bg-white'
                        : 'border-slate-200 bg-slate-50 hover:border-pb-green-deep/50 cursor-pointer'
                    )}
                    style={{ minHeight: '280px' }}
                    onClick={() => !imagePreview && fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          style={{ minHeight: '280px' }}
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            className="px-4 py-2 bg-white text-pb-green-deep rounded-xl text-xs font-black uppercase tracking-widest shadow-lg"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                            className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-4 p-10 text-center" style={{ minHeight: '280px' }}>
                        <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
                          <Upload className="w-7 h-7 text-pb-green-deep" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-600 mb-1">Click to upload image</p>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                            PNG, JPG, WebP • Max 5MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {imagePreview && (
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                      <Check className="w-3.5 h-3.5" />
                      Image ready — will upload on save
                    </p>
                  )}

                  {/* Upload sequence reminder */}
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-black text-pb-green-deep uppercase tracking-widest mb-2">Save Sequence</p>
                    <ol className="text-xs text-emerald-700 font-medium space-y-1 list-decimal list-inside">
                      <li>Image uploads to Supabase Storage first</li>
                      <li>Product is saved to database with image URL</li>
                      <li>Product appears in catalog instantly</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* ── Footer ─────────────────────── */}
              <div className="px-10 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSaving}
                  className="text-slate-400 hover:text-red-500"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSaving}
                  size="lg"
                  className="bg-pb-green-deep hover:bg-emerald-800 text-white font-black uppercase tracking-widest px-10 shadow-lg shadow-emerald-900/20"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    editingProduct ? '✓ Update Product' : '✓ Save Product'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


// ============================================================
// PRODUCT MANAGEMENT PAGE
// ============================================================
export const ProductManagement: React.FC = () => {
  const { experiences, categories, deleteExperience, loading, refreshExperiences } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Experience | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    let result = [...experiences].filter(p => {
      const name = safeString(p?.name).toLowerCase();
      const category = safeString(p?.category).toLowerCase();
      const query = searchTerm.toLowerCase();
      const matchesSearch = name.includes(query) || category.includes(query);
      const matchesCategory = activeCategory === 'all' || category === activeCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });

    return result.sort((a, b) => {
      const valA = a[sortBy] ?? '';
      const valB = b[sortBy] ?? '';
      const comparison = valA > valB ? 1 : -1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [experiences, searchTerm, activeCategory, sortBy, sortOrder]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Experience) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    const res = await experiencesApi.delete(id);
    if (res.success) {
      toast.success(`"${name}" removed from catalog`);
      refreshExperiences();
    } else {
      toast.error(res.message || 'Failed to delete product');
    }
    setDeletingId(null);
  };

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const rows = text.split('\n').slice(1);
        const items = rows.map(row => {
          const [name, category, price, stock, unit] = row.split(',');
          if (!name?.trim()) return null;
          return { name: name.trim(), category: category?.trim() || 'grocery', price: Number(price) || 0, stock: Number(stock) || 0, unit: unit?.trim() || 'kg', type: 'product', is_active: true, is_featured: false };
        }).filter(Boolean);
        if (items.length > 0) {
          const { experiencesApi: api } = await import('@/lib/services/api');
          const ok = await api.importData(items as any);
          if (ok) { toast.success(`Imported ${items.length} products`); refreshExperiences(); }
          else toast.error('CSV import failed');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-3xl" />
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Page Header ─────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg text-pb-green-deep text-[10px] font-black uppercase tracking-widest border border-emerald-100">
            <Package className="w-3.5 h-3.5" /> Product Catalog
          </div>
          <h2 className="text-4xl font-black text-pb-green-deep tracking-tighter font-playfair">Product Portfolio</h2>
          <p className="text-slate-500 font-medium max-w-md text-sm">
            Manage your farm-to-table consumables. Add, edit, and organize your products.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleImportCSV}
            variant="outline"
            size="md"
            className="gap-2 border-slate-200"
          >
            <FileUp className="w-4 h-4" /> Import CSV
          </Button>
          <Button
            onClick={handleOpenAdd}
            size="lg"
            className="bg-pb-green-deep hover:bg-emerald-800 text-white font-black uppercase tracking-widest gap-2 shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-5 h-5" /> New Product
          </Button>
        </div>
      </div>

      {/* ── Filters ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="lg:col-span-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 bg-slate-50 border-none h-11 rounded-xl font-medium text-slate-700"
          />
        </div>
        <div className="lg:col-span-4">
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger className="h-11 rounded-xl border-slate-100 bg-slate-50 font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-pb-green-deep" />
                <SelectValue placeholder="All Categories" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.name.toLowerCase()}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="lg:col-span-2">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
            className="w-full gap-2 text-slate-500"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
          </Button>
        </div>
      </div>

      {/* ── Products Table ─────────────── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Image</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Product</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Stock</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Price</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.tr
                  key={product.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="group hover:bg-[#F7F9F7]/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{product.name}</p>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'w-2 h-2 rounded-full',
                        product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'
                      )} />
                      <span className="text-sm font-bold text-slate-700">
                        {product.stock} {product.unit || 'units'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-lg font-black text-pb-green-deep">₹{product.price}</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">per {product.unit || 'unit'}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                      product.is_active
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-slate-100 text-slate-400'
                    )}>
                      {product.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleOpenEdit(product)}
                        className="w-9 h-9 rounded-xl border-slate-200 text-pb-green-deep hover:bg-pb-green-deep hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={deletingId === product.id}
                        onClick={() => handleDelete(product.id, product.name)}
                        className="w-9 h-9 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50"
                      >
                        {deletingId === product.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-300 font-playfair">No Products Found</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
              Adjust filters or add a new product
            </p>
            <Button onClick={handleOpenAdd} className="mt-6 bg-pb-green-deep text-white" size="md">
              <Plus className="w-4 h-4 mr-2" /> Add First Product
            </Button>
          </div>
        )}
      </div>

      {/* Summary */}
      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-right">
        Showing {filteredProducts.length} of {experiences.length} products
      </p>

      {/* ── Product Form Modal ─────────── */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editingProduct={editingProduct}
        categories={categories}
        onSaved={refreshExperiences}
      />
    </div>
  );
};
