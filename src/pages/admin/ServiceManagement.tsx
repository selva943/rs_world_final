import React, { useState } from 'react';
import {
  Plus, Edit2, Trash2, X, Save, Wrench, Clock,
  Search, Loader2, CheckCircle, Zap, AlertCircle, Image as ImageIcon, Upload
} from 'lucide-react';
import { Service } from '@/types/app';
import { useData } from '@/context/DataContext';
import { storageApi } from '@/lib/services/api';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const SERVICE_CATEGORIES = ['Cleaning', 'Plumbing', 'Electrical', 'Carpentry', 'Pest Control', 'Painting', 'AC Service', 'Other'];

const defaultForm = (): Partial<Service> => ({
  name: '', category: 'Cleaning', price: 0, description: '',
  duration: '2 hours', is_active: true, is_featured: false,
  max_bookings_per_slot: 3, service_pincodes: [],
  peak_multiplier: 1.0, weekend_multiplier: 1.1, same_day_multiplier: 1.15
});

export const ServiceManagement: React.FC = () => {
  const { services, addService, updateService, deleteService, loading } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<Partial<Service>>(defaultForm());
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const openForm = (service?: Service) => {
    if (service) { setEditingService(service); setForm(service); }
    else { setEditingService(null); setForm(defaultForm()); }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || form.price === undefined) return toast.error('Name and price are required');
    setSaving(true);
    try {
      let res;
      if (editingService && editingService.id) {
         res = await updateService(editingService.id, form);
      } else {
         res = await addService(form);
      }

      if (res.success) {
        toast.success(editingService ? 'Service updated!' : 'Service created!');
        setShowForm(false);
      } else {
        toast.error(res.message || 'Failed to save service');
      }
    } catch (error) { 
      console.error('Save error:', error);
      toast.error('An unexpected error occurred'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this service?')) return;
    const res = await deleteService(id);
    if (res.success) {
      toast.success('Service removed');
    } else {
      toast.error(res.message || 'Failed to remove service');
    }
  };

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-playfair font-black text-slate-900 tracking-tight mb-2">Service Studio</h2>
          <p className="text-slate-500 font-medium italic">{services.length} services in your marketplace.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search services..." className="pl-12 w-72 rounded-2xl h-12 border-slate-100" />
          </div>
          <Button onClick={() => openForm()}
            className="bg-pb-green-deep hover:bg-emerald-800 text-white rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-emerald-900/10">
            <Plus className="w-4 h-4" /> Add Service
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-10 h-10 text-pb-green-deep animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((s, idx) => (
              <motion.div key={s.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.02 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all overflow-hidden group">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                      <Wrench className="w-8 h-8 text-pb-green-deep" />
                    </div>
                    <div className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                      s.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400')}>
                      {s.is_active ? 'Active' : 'Hidden'}
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-1">{s.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-pb-green-deep mb-4">{s.category}</p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl">
                      <Clock className="w-3 h-3" /> {s.duration || '2 hours'}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl">
                      <Zap className="w-3 h-3" /> Fixed Price
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl">
                      ₹{s.price}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => openForm(s)} variant="outline"
                      className="flex-1 rounded-2xl h-11 border-slate-100 text-slate-500 hover:text-pb-green-deep hover:bg-emerald-50 font-black text-[10px] uppercase tracking-widest">
                      <Edit2 className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button onClick={() => handleDelete(s.id)} variant="outline"
                      className="h-11 w-11 rounded-2xl border-slate-100 text-slate-300 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 p-20 bg-slate-50 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
              <AlertCircle className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <h5 className="text-2xl font-black text-slate-400 font-playfair italic">No services found</h5>
            </div>
          )}
        </div>
      )}

      {/* Form Drawer */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-screen w-full max-w-xl bg-white z-[101] shadow-2xl flex flex-col overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 font-playfair italic">
                  {editingService ? 'Edit Service' : 'New Service'}
                </h3>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 flex-1 overflow-y-auto space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Service Name</label>
                  <Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Deep Home Cleaning" className="rounded-2xl h-14 border-slate-100 bg-slate-50" />
                </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                    <select value={form.category || 'Cleaning'} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-bold text-slate-700">
                      {SERVICE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price (₹)</label>
                    <Input type="number" value={form.price === 0 ? '' : form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))}
                      placeholder="e.g. 600" className="rounded-2xl h-14 border-slate-100 bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</label>
                    <Input value={form.duration || ''} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                      placeholder="e.g. 2 hours" className="rounded-2xl h-14 border-slate-100 bg-slate-50" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Service Image</label>
                    <label className="cursor-pointer">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          const t = toast.loading('Uploading fresh pixels...');
                          try {
                            const url = await storageApi.uploadFile(file, 'product-images');
                            setForm(f => ({ ...f, image_path: url }));
                            toast.success('Image captured!', { id: t });
                          } catch (err: any) {
                            toast.error(err.message || 'Upload failed', { id: t });
                          }
                        }}
                      />
                      <div className="flex items-center gap-2 text-pb-green-deep hover:text-pb-green-deep/80 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Upload New</span>
                      </div>
                    </label>
                  </div>
                  
                  {form.image_path ? (
                    <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-slate-100 group">
                      <img src={form.image_path} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <Button 
                           variant="danger" 
                           size="sm" 
                           onClick={() => setForm(f => ({ ...f, image_path: '' }))}
                           className="rounded-full"
                         >
                           <Trash2 className="w-4 h-4 mr-2" /> Remove
                         </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center text-slate-300 gap-2">
                       <ImageIcon className="w-12 h-12 stroke-[1]" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">No Image Selected</span>
                    </div>
                  )}
                  
                  <Input value={form.image_path || ''} onChange={e => setForm(f => ({ ...f, image_path: e.target.value }))}
                    placeholder="Or paste image URL here..." className="rounded-2xl h-12 border-slate-100 bg-slate-50 text-xs" />
                </div>
                <div className="space-y-2">
                    <textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="What's included in this service..." rows={4}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>

                {/* Smart Engine Settings */}
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                   <h4 className="text-xs font-black uppercase tracking-[0.2em] text-pb-green-deep flex items-center gap-2">
                     <Zap className="w-4 h-4" /> Smart Engine Settings
                   </h4>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Max Bookings / Slot</label>
                       <Input type="number" value={form.max_bookings_per_slot || 3} 
                         onChange={e => setForm(f => ({ ...f, max_bookings_per_slot: +e.target.value }))}
                         className="rounded-xl h-12 border-slate-100 bg-white" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Peak Multiplier (e.g. 1.2)</label>
                       <Input type="number" step="0.1" value={form.peak_multiplier || 1.0} 
                         onChange={e => setForm(f => ({ ...f, peak_multiplier: +e.target.value }))}
                         className="rounded-xl h-12 border-slate-100 bg-white" />
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Weekend Multiplier</label>
                       <Input type="number" step="0.1" value={form.weekend_multiplier || 1.1} 
                         onChange={e => setForm(f => ({ ...f, weekend_multiplier: +e.target.value }))}
                         className="rounded-xl h-12 border-slate-100 bg-white" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Same-Day Multiplier</label>
                       <Input type="number" step="0.1" value={form.same_day_multiplier || 1.15} 
                         onChange={e => setForm(f => ({ ...f, same_day_multiplier: +e.target.value }))}
                         className="rounded-xl h-12 border-slate-100 bg-white" />
                     </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Service Area Pincodes (Comma separated)</label>
                      <Input value={(form.service_pincodes || []).join(', ')} 
                        onChange={e => setForm(f => ({ ...f, service_pincodes: e.target.value.split(',').map(p => p.trim()).filter(Boolean) }))}
                        placeholder="e.g. 600001, 600002"
                        className="rounded-xl h-12 border-slate-100 bg-white" />
                   </div>
                </div>
                <div className="flex items-center gap-4">
                  {(['is_active', 'is_featured'] as const).map(key => (
                    <button key={key} onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                      className={cn("flex-1 h-12 rounded-2xl border font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                        form[key] ? 'bg-pb-green-deep text-white border-pb-green-deep' : 'border-slate-100 text-slate-400 hover:border-emerald-200')}>
                      <CheckCircle className="w-4 h-4" /> {key === 'is_active' ? 'Active' : 'Featured'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-8 border-t border-slate-50">
                <Button onClick={handleSave} disabled={saving}
                  className="w-full bg-pb-green-deep hover:bg-emerald-800 text-white rounded-2xl h-16 font-black uppercase tracking-widest text-xs shadow-2xl shadow-emerald-900/20">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-3" /> Save Service</>}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
