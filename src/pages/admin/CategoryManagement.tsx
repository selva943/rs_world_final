import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Tag, 
  Image as ImageIcon,
  Loader2,
  LayoutGrid
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Category } from '@/types/app';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export const CategoryManagement: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, loading } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: '',
    image: ''
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setForm({
      name: category.name || '',
      description: category.description || '',
      icon: category.icon || '',
      image: category.image || ''
    });
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setForm({
      name: '',
      description: '',
      icon: '',
      image: ''
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSaving(true);
    try {
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload = {
        name: form.name,
        slug: slug,
        description: form.description,
        icon: form.icon,
        image: form.image,
        display_order: editingCategory?.display_order || 0,
        is_active: editingCategory ? editingCategory.is_active : true
      } as any;

      if (editingCategory) {
        const res = await updateCategory(editingCategory.id, payload);
        if (res.success) {
          toast.success('Category updated successfully');
          setIsFormOpen(false);
        } else {
          toast.error(res.message || 'Failed to update category');
        }
      } else {
        const res = await addCategory(payload);
        if (res.success) {
          toast.success('Category added successfully');
          setIsFormOpen(false);
        } else {
          toast.error(res.message || 'Failed to add category');
        }
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error('An unexpected error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      const res = await deleteCategory(id);
      if (res.success) {
        toast.success(`Category "${name}" deleted`);
      } else {
        toast.error(res.message || 'Failed to delete category');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black text-pb-green-deep tracking-tight font-playfair">Category Management</h2>
          <p className="text-slate-500 font-medium">Organize your store by managing product categories and icons.</p>
        </div>
        <Button 
          onClick={handleAddNew}
          className="bg-pb-green-deep hover:bg-emerald-800 text-white rounded-xl px-6 py-6 h-auto shadow-lg shadow-emerald-900/10 transition-all font-bold text-base"
        >
          <Plus className="w-5 h-5 mr-2" /> Add New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="bg-white border border-slate-100 group overflow-hidden rounded-[2rem] transition-all duration-500 hover:shadow-xl hover:shadow-emerald-900/5">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-pb-green-deep group-hover:bg-pb-green-deep group-hover:text-white transition-all">
                  {category.icon ? (
                    <span className="text-2xl">{category.icon}</span>
                  ) : (
                    <Tag className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 font-playfair">{category.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</p>
                </div>
              </div>
              
              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-6 h-10">
                {category.description || 'No description provided.'}
              </p>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleEdit(category)}
                  variant="outline"
                  className="flex-1 border-slate-100 bg-white text-pb-green-deep hover:bg-emerald-50 rounded-xl transition-all font-bold h-11"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleDelete(category.id, category.name)}
                  className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl h-11 px-4"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pb-green-deep/10 backdrop-blur-xl animate-in fade-in duration-300">
          <form 
            onSubmit={handleSubmit}
            className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-lg overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-2xl font-black text-pb-green-deep font-playfair">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
              <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-red-500"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Category Name</Label>
                <Input 
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="bg-slate-50 border-slate-100 text-pb-green-deep py-6 rounded-xl px-4 font-bold"
                  placeholder="e.g. Vegetables"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Category Icon (Emoji)</Label>
                  <Input 
                    value={form.icon}
                    onChange={(e) => setForm({...form, icon: e.target.value})}
                    className="bg-slate-50 border-slate-100 text-pb-green-deep py-6 rounded-xl px-4 font-bold"
                    placeholder="e.g. 🥦"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Hero Image URL</Label>
                  <Input 
                    value={form.image}
                    onChange={(e) => setForm({...form, image: e.target.value})}
                    className="bg-slate-50 border-slate-100 text-pb-green-deep py-6 rounded-xl px-4 font-bold"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Brief Description</Label>
                <Textarea 
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="bg-slate-50 border-slate-100 text-pb-green-deep rounded-xl min-h-[100px] px-4 py-3 font-medium"
                  placeholder="What's included in this category?"
                />
              </div>
            </div>

            <div className="p-8 bg-slate-50/50 flex gap-4">
              <Button 
                type="submit" 
                disabled={isSaving}
                className="flex-1 bg-pb-green-deep hover:bg-emerald-800 h-14 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-emerald-900/10"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Category'}
              </Button>
              <Button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                variant="ghost" 
                className="h-14 rounded-xl font-black uppercase tracking-widest border border-slate-200"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
