import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Star,
  MessageSquare,
  User,
  X,
  Check,
  Filter,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Testimonial } from '@/types/app';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { storageApi } from '@/lib/services/api';

export const TestimonialManagement: React.FC = () => {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Form State (User Request: Centralized structure)
  const [form, setForm] = useState({
    name: '',
    message: '',
    rating: 5,
    media: null as File | string | null
  });

  const [isSaving, setIsSaving] = useState(false);

  const filteredTestimonials = testimonials.filter(t => 
    (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.message || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setForm({
      name: testimonial.name || '',
      message: testimonial.message || '',
      rating: testimonial.rating || 5,
      media: testimonial.media || null
    });
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingTestimonial(null);
    setForm({
      name: '',
      message: '',
      rating: 5,
      media: null
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSaving(true);
    try {
      // STEP 3: FIX IMAGE UPLOAD (Upload only on submit)
      let finalMediaUrl = typeof form.media === 'string' ? form.media : '';

      if (form.media instanceof File) {
        console.log("UPLOADING TESTIMONIAL IMAGE:", form.media.name);
        const uploadedUrl = await storageApi.uploadFile(form.media);
        if (uploadedUrl) {
          finalMediaUrl = uploadedUrl;
        } else {
          throw new Error("Failed to upload image");
        }
      }

      const payload = {
        name: form.name,
        message: form.message,
        rating: form.rating,
        media: finalMediaUrl,
        updated_at: new Date().toISOString()
      };

      let res;
      if (editingTestimonial) {
        res = await updateTestimonial(editingTestimonial.id, payload as any);
      } else {
        res = await addTestimonial({ ...payload, isTestimonial: true } as any);
      }

      if (res.success) {
        toast.success(editingTestimonial ? 'Review updated!' : 'Review added to the wall of love!');
        setIsFormOpen(false);
      } else {
        toast.error(res.message || 'Failed to save review');
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || 'Failed to save review');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black text-pb-green-deep tracking-tight uppercase italic">Fresh Reviews</h2>
          <p className="text-slate-600 font-medium">Managing the proof of your local impact.</p>
        </div>
        <Button 
          onClick={handleAddNew}
          className="bg-pb-green-deep hover:bg-emerald-800 text-[#FFF59D] rounded-2xl px-8 py-7 h-auto font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/10 border border-pb-green-deep/10"
        >
          <Plus className="w-5 h-5 mr-2" /> Add New Review
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Search by name or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 bg-white border-slate-100 text-pb-green-deep py-6 rounded-2xl focus:ring-pb-green-deep/10"
          />
        </div>
        <Button variant="outline" className="border-slate-100 bg-white text-slate-600 py-6 h-auto rounded-2xl px-6 font-bold hover:bg-slate-50">
          <Filter className="w-5 h-5 mr-2" /> All Reviews
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTestimonials.map((testimonial) => (
          <Card key={testimonial.id} className="bg-white border-slate-100 hover:border-pb-green-deep/20 transition-all duration-500 rounded-3xl overflow-hidden group shadow-md hover:shadow-xl relative border">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-100 bg-[#F7F9F7]">
                    {testimonial.media ? (
                      <img src={testimonial.media} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 group-hover:text-pb-green-deep transition-colors uppercase tracking-widest text-sm">{testimonial.name}</h3>
                    <div className="flex text-amber-400 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("w-3 h-3 fill-current", i >= (testimonial.rating || 5) && "text-slate-100")} />
                      ))}
                    </div>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-pb-green-deep transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <MessageSquare className="absolute -left-2 -top-2 w-8 h-8 text-pb-green-deep/5" />
                <p className="text-slate-600 text-sm italic relative leading-relaxed">
                  "{testimonial.message}"
                </p>
              </div>

              <div className="mt-8 flex gap-3">
                <Button 
                  onClick={() => handleEdit(testimonial)}
                  size="sm"
                  variant="ghost" 
                  className="flex-1 bg-[#F7F9F7] hover:bg-pb-green-deep hover:text-white text-pb-green-deep rounded-xl font-bold"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button 
                  onClick={async () => {
                    if (!confirm("Delete this review?")) return;
                    const res = await deleteTestimonial(testimonial.id);
                    if (res.success) toast.success("Review deleted");
                    else toast.error(res.message || "Failed to delete review");
                  }}
                  size="sm"
                  variant="ghost" 
                  className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTestimonials.length === 0 && (
        <div className="text-center py-24 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
          <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-6" />
          <p className="text-slate-400 font-medium italic">No one has shared their experience yet. Keep delivering freshness!</p>
        </div>
      )}

      {/* Testimonial Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pb-green-deep/10 backdrop-blur-xl animate-in fade-in duration-300">
          <form 
            onSubmit={handleSubmit}
            className="bg-white border border-slate-100 rounded-[32px] w-full max-w-2xl shadow-[0_32px_128px_-16px_rgba(27,94,32,0.2)] overflow-hidden flex flex-col"
          >
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-3xl font-black text-pb-green-deep uppercase tracking-tight">Capture Feedback</h3>
                <p className="text-slate-500 font-medium">Add a customer review to showcase your impact.</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-pb-green-deep transition-colors shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-10 space-y-8 overflow-y-auto max-h-[60vh] no-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name</Label>
                  <Input 
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="bg-slate-50 border-slate-100 text-pb-green-deep py-7 rounded-2xl focus:ring-pb-green-deep/10 px-6 font-bold"
                    placeholder="Rahul S."
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rating (Stars)</Label>
                  <Select 
                    value={String(form.rating)} 
                    onValueChange={(val) => setForm({...form, rating: Number(val)})}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-100 text-pb-green-deep rounded-2xl h-14 font-bold px-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-100 text-pb-green-deep">
                      {[5, 4, 3, 2, 1].map(r => (
                        <SelectItem key={r} value={String(r)}>{r} Stars</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Their Experience</Label>
                <Textarea 
                  value={form.message}
                  onChange={(e) => setForm({...form, message: e.target.value})}
                  className="bg-slate-50 border-slate-100 text-pb-green-deep rounded-3xl min-h-[140px] p-6 lg:text-lg italic font-light leading-relaxed"
                  placeholder="What was their experience like?"
                />
              </div>

              <ImageUpload 
                label="Customer Avatar / Order Photo"
                currentImage={form.media}
                onFileSelect={(file) => setForm({...form, media: file})}
                onRemove={() => setForm({...form, media: null})}
              />
            </div>

            <div className="p-10 border-t border-slate-50 bg-slate-50/50 flex gap-4">
              <Button 
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-pb-green-deep hover:bg-emerald-800 text-[#FFF59D] rounded-2xl py-7 h-auto font-black text-xl uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/10"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Handling Data...</span>
                  </div>
                ) : (
                  'Post Review'
                )}
              </Button>
              <Button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                variant="ghost"
                className="px-10 bg-white border border-slate-100 text-slate-500 rounded-2xl py-7 h-auto font-black uppercase tracking-widest hover:text-red-500 hover:bg-white"
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

