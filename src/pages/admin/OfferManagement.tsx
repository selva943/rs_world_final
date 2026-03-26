import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  Star,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { offersApi, storageApi } from '@/lib/services/api';
import { Offer, AdminApiResponse } from '@/types/app';
import { useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';

export const OfferManagement = () => {
  const { offers, addOffer, updateOffer, deleteOffer, refreshOffers, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State aligned with Perfect Palani Schema
  const [form, setForm] = useState({
    name: '',
    description: '',
    slug: '',
    offer_type: 'product' as 'product' | 'category' | 'combo',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '0',
    min_quantity: '1',
    max_discount: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    banner_image: null as File | string | null,
    badge: '',
    is_active: true,
    is_featured: false
  });

  // Deleting local fetch logic as useData handles it

  const handleOpenModal = (offer: Offer | null = null) => {
    if (offer) {
      setEditingOfferId(offer.id);
      setForm({
        name: offer.name || '',
        description: offer.description || '',
        slug: offer.slug || '',
        offer_type: offer.offer_type || 'product',
        discount_type: offer.discount_type || 'percentage',
        discount_value: String(offer.discount_value || 0),
        min_quantity: String(offer.min_quantity || 1),
        max_discount: String(offer.max_discount || ''),
        start_date: offer.start_date ? offer.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
        end_date: offer.end_date ? offer.end_date.split('T')[0] : '',
        banner_image: offer.banner_image || null,
        badge: offer.badge || '',
        is_active: offer.is_active !== false,
        is_featured: !!offer.is_featured
      });
    } else {
      setEditingOfferId(null);
      setForm({
        name: '',
        description: '',
        slug: '',
        offer_type: 'product',
        discount_type: 'percentage',
        discount_value: '0',
        min_quantity: '1',
        max_discount: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        banner_image: null,
        badge: '',
        is_active: true,
        is_featured: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOfferId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || isUploading) return;

    if (!form.name.trim()) {
      toast.error("Offer name is required");
      return;
    }

    setIsSaving(true);
    try {
      // STEP 7: ADD DEBUG LOGS (Master Fix)
      console.log("OFFER FORM STATE:", form);
      console.log("OFFER BANNER FILE:", form.banner_image);

      let bannerImageUrl = typeof form.banner_image === 'string' ? form.banner_image : '';
      if (form.banner_image instanceof File) {
        setIsUploading(true);
        console.log("UPLOADING OFFER BANNER:", form.banner_image.name);
        const url = await storageApi.uploadFile(form.banner_image);
        if (url) {
          bannerImageUrl = url;
        } else {
          throw new Error("Image upload failed");
        }
        setIsUploading(false);
      }

      // STEP 6: FIX PAYLOAD NORMALIZATION (Master Fix)
      const payload = {
        name: form.name,
        title: form.name, // Added per Master Fix request
        description: form.description,
        slug: form.slug || form.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''),
        offer_type: form.offer_type,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value) || 0,
        min_quantity: Number(form.min_quantity) || 1,
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        start_date: new Date(form.start_date).toISOString(),
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        banner_image: bannerImageUrl,
        badge: form.badge,
        is_active: form.is_active,
        is_featured: form.is_featured
      };

      console.log("FINAL OFFER PAYLOAD:", payload);

      const res = editingOfferId 
        ? await updateOffer(editingOfferId, payload as any)
        : await addOffer(payload as any);

      if (res.success) {
        toast.success(editingOfferId ? 'Offer updated!' : 'Offer created!');
        handleCloseModal();
      } else {
        toast.error(res.message || 'Failed to save offer');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save offer');
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      const res = await deleteOffer(id);
      if (res.success) {
        toast.success('Offer deleted');
      } else {
        toast.error(res.message || "Failed to delete offer");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting offer");
    }
  };

  const toggleStatus = async (offer: Offer) => {
    try {
      const newActive = !offer.is_active;
      const res = await updateOffer(offer.id, { is_active: newActive } as any);
      if (res.success) {
        toast.success(`Offer ${newActive ? 'activated' : 'deactivated'}`);
      } else {
        toast.error(res.message || 'Failed to update status');
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      toast.error('Failed to update status');
    }
  };

  const toggleFeatured = async (offer: Offer) => {
    try {
      const newFeatured = !offer.is_featured;
      const res = await updateOffer(offer.id, { is_featured: newFeatured } as any);
      if (res.success) {
        toast.success(newFeatured ? 'Featured!' : 'Unfeatured');
      } else {
        toast.error(res.message || 'Failed to update featured status');
      }
    } catch (error) {
      console.error("Toggle featured error:", error);
      toast.error('Failed to update featured status');
    }
  };

  const filteredOffers = offers.filter(o => 
    (o.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-pb-green-deep tracking-tight uppercase italic font-playfair">Market Deals</h2>
          <p className="text-slate-600 font-medium">Create and manage fresh deals for your customers.</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="bg-pb-green-deep hover:bg-emerald-800 text-[#FFF59D] gap-2 h-14 px-8 rounded-2xl shadow-xl shadow-emerald-900/10 border border-pb-green-deep/10 font-black uppercase tracking-widest"
        >
          <Plus className="w-5 h-5" />
          Create New Offer
        </Button>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-pb-green-deep transition-colors" />
        <Input 
          placeholder="Search offers by name..." 
          className="bg-white border-slate-100 pl-14 h-16 rounded-3xl text-pb-green-deep focus:ring-pb-green-deep/10 transition-all placeholder:text-slate-400 shadow-sm border"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <Loader2 className="w-12 h-12 text-pb-green-deep animate-spin" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Syncing market deals...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => (
            <Card key={offer.id} className="bg-white border-slate-100 hover:border-pb-green-deep/20 transition-all duration-300 group overflow-hidden rounded-[32px] shadow-sm hover:shadow-xl border">
              <div className="aspect-video relative overflow-hidden">
                {offer.banner_image ? (
                  <img src={offer.banner_image} alt={offer.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-slate-200" />
                  </div>
                )}
                
                <div className="absolute top-4 right-4">
                  <div className={cn(
                    "backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                    offer.is_active ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : "bg-red-500/10 text-red-600 border-red-200"
                  )}>
                    {offer.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                </div>

                {offer.is_featured && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-amber-500 text-white border border-white/20 shadow-lg px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> FEATURED
                    </div>
                  </div>
                )}

                {offer.badge && (
                  <div className="absolute bottom-4 left-4 bg-[#FFF59D] text-pb-green-deep text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl border border-pb-green-deep/10">
                    {offer.badge}
                  </div>
                )}
              </div>
              
              <CardContent className="p-8">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-pb-green-deep transition-colors truncate tracking-tight font-playfair">{offer.name}</h3>
                </div>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10 leading-relaxed font-medium">
                  {offer.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center gap-6 mb-8">
                   <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Type</span>
                      <span className="text-sm font-bold text-slate-700 capitalize">{offer.offer_type}</span>
                   </div>
                   <div className="w-px h-8 bg-slate-100" />
                   <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Discount</span>
                      <span className="text-sm font-bold text-pb-green-deep">{offer.discount_type === 'percentage' ? `${offer.discount_value}%` : `₹${offer.discount_value}`}</span>
                   </div>
                </div>

                <div className="flex items-center gap-3 border-t border-slate-50 pt-6">
                  <Button 
                    variant="ghost" 
                    className="flex-1 bg-slate-50 hover:bg-pb-green-deep hover:text-white text-pb-green-deep rounded-2xl h-12 font-bold"
                    onClick={() => handleOpenModal(offer)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={offer.is_featured ? "text-amber-500 bg-amber-50 rounded-2xl w-12 h-12" : "text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-2xl w-12 h-12"}
                    onClick={() => toggleFeatured(offer)}
                  >
                    <Star className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={offer.is_active ? "text-emerald-500 hover:bg-emerald-50 rounded-2xl w-12 h-12" : "text-red-500 hover:bg-red-50 rounded-2xl w-12 h-12"}
                    onClick={() => toggleStatus(offer)}
                  >
                    {offer.is_active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl w-12 h-12"
                    onClick={() => handleDelete(offer.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredOffers.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 bg-slate-50 rounded-[48px] border border-dashed border-slate-200">
              <Activity className="w-14 h-14 text-slate-200 mb-6" />
              <p className="text-slate-400 font-medium italic">No offers found.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pb-green-deep/10 backdrop-blur-xl animate-in fade-in duration-300">
          <form 
            onSubmit={handleSave} 
            className="bg-white border border-slate-100 rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_32px_128px_-16px_rgba(27,94,32,0.2)]"
          >
            <div className="px-10 py-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-3xl font-black text-pb-green-deep font-playfair">{editingOfferId ? 'Edit Offer' : 'New Offer'}</h3>
                <p className="text-slate-500 font-medium">Configure your fresh deals.</p>
              </div>
              <button 
                type="button"
                onClick={handleCloseModal} 
                className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-pb-green-deep transition-colors shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Title</Label>
                    <Input 
                      required
                      className="bg-slate-50 border-slate-100 text-pb-green-deep py-7 rounded-2xl focus:ring-pb-green-deep/10 px-6 font-bold text-lg"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Slug</Label>
                        <Input 
                          placeholder="auto-generated"
                          className="bg-slate-50 border-slate-100 text-pb-green-deep py-7 rounded-2xl px-6 font-bold"
                          value={form.slug}
                          onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        />
                    </div>
                    <div className="space-y-3">
                        <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Badge</Label>
                        <Input 
                          placeholder="e.g. HOT DEAL"
                          className="bg-slate-50 border-slate-100 text-pb-green-deep py-7 rounded-2xl px-6 font-bold uppercase"
                          value={form.badge}
                          onChange={(e) => setForm({ ...form, badge: e.target.value })}
                        />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Offer Type</Label>
                      <select 
                        className="w-full bg-slate-50 border-slate-100 text-pb-green-deep h-14 rounded-2xl px-6 font-bold focus:ring-pb-green-deep/10"
                        value={form.offer_type}
                        onChange={(e) => setForm({ ...form, offer_type: e.target.value as any })}
                      >
                        <option value="product">Product</option>
                        <option value="category">Category</option>
                        <option value="combo">Combo</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Discount Type</Label>
                      <select 
                        className="w-full bg-slate-50 border-slate-100 text-pb-green-deep h-14 rounded-2xl px-6 font-bold focus:ring-pb-green-deep/10"
                        value={form.discount_type}
                        onChange={(e) => setForm({ ...form, discount_type: e.target.value as any })}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Discount Value</Label>
                        <Input 
                          type="number"
                          className="bg-slate-50 border-slate-100 text-pb-green-deep py-7 rounded-2xl px-6 font-bold"
                          value={form.discount_value}
                          onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                        />
                    </div>
                    <div className="space-y-3">
                        <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Min Quantity</Label>
                        <Input 
                          type="number"
                          className="bg-slate-50 border-slate-100 text-pb-green-deep py-7 rounded-2xl px-6 font-bold"
                          value={form.min_quantity}
                          onChange={(e) => setForm({ ...form, min_quantity: e.target.value })}
                        />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Banner Image</Label>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-4">
                      {form.banner_image ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
                          <img 
                            src={typeof form.banner_image === 'string' ? form.banner_image : URL.createObjectURL(form.banner_image)} 
                            className="w-full h-full object-cover"
                            alt="Preview"
                          />
                          <button 
                            type="button"
                            onClick={() => setForm({ ...form, banner_image: null })}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-full aspect-video flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                          <ImageIcon className="w-10 h-10 text-slate-300 mb-2" />
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Image</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setForm({ ...form, banner_image: file });
                            }}
                            accept="image/*"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Description</Label>
                    <Textarea 
                      className="bg-slate-50 border-slate-100 text-pb-green-deep min-h-[120px] rounded-[1.5rem] p-6 font-medium leading-relaxed"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-slate-50">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Start Date</Label>
                    <Input 
                      type="date"
                      className="bg-slate-50 border-slate-100 text-pb-green-deep py-7 rounded-2xl px-6 font-bold"
                      value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">End Date</Label>
                    <Input 
                      type="date"
                      className="bg-slate-50 border-slate-100 text-pb-green-deep py-7 rounded-2xl px-6 font-bold"
                      value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-6 items-end">
                   <div className="flex-1 space-y-3">
                    <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Featured</Label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, is_featured: !form.is_featured })}
                      className={cn(
                        "w-full flex items-center justify-center gap-3 h-14 rounded-2xl border transition-all font-bold",
                        form.is_featured ? "bg-amber-500/10 border-amber-500 text-amber-600" : "bg-white border-slate-100 text-slate-300"
                      )}
                    >
                      <Star className={cn("w-5 h-5", form.is_featured && "fill-current")} />
                      Featured deal
                    </button>
                  </div>
                  <div className="flex-1 space-y-3">
                    <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Status</Label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, is_active: !form.is_active })}
                      className={cn(
                        "w-full flex items-center justify-center gap-3 h-14 rounded-2xl border transition-all font-bold",
                        form.is_active ? "bg-emerald-500/10 border-emerald-500 text-emerald-600" : "bg-red-500/10 border-red-500 text-red-600"
                      )}
                    >
                      {form.is_active ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      {form.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-slate-50 bg-slate-50/50 flex gap-6">
              <Button 
                type="submit"
                disabled={isSaving || isUploading}
                className="flex-1 bg-pb-green-deep hover:bg-emerald-800 text-white rounded-[1.5rem] py-8 h-auto font-black text-xl transition-all shadow-xl shadow-emerald-900/10"
              >
                {isSaving ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  editingOfferId ? 'Save Changes' : 'Create Offer'
                )}
              </Button>
              <Button 
                onClick={handleCloseModal}
                variant="ghost" 
                className="px-12 bg-white border border-slate-100 text-slate-500 rounded-[1.5rem] py-8 h-auto font-black text-lg"
                type="button"
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
