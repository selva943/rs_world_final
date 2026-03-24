import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Image as ImageIcon, 
  Download, 
  ExternalLink,
  FileIcon,
  Filter,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Upload } from '@/types/app';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { storageApi } from '@/lib/services/api';

export const UploadManager: React.FC = () => {
  const { uploads, deleteUpload, loading, refreshUploads } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const filteredUploads = uploads.filter(u => 
    u.file_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      toast.info(`Uploading ${files.length} file(s)...`);
      const urls = await storageApi.uploadMultipleFiles(files);
      if (urls.length > 0) {
        if (urls.length === files.length) {
          toast.success('All files uploaded and registered');
        } else {
          toast.warning(`Uploaded ${urls.length} of ${files.length} files`);
        }
        await refreshUploads();
      } else {
        toast.error('Failed to upload files');
      }
    } catch (error) {
      toast.error('Error during upload');
    } finally {
      setIsUploading(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleDelete = async (upload: Upload) => {
    try {
      // Logic for deleting from storage first
      await storageApi.deleteFile(upload.file_url);
      await deleteUpload(upload.id);
      toast.success('File removed from system');
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('URL copied to clipboard');
  };

  if (loading) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black text-pb-green-deep tracking-tight uppercase italic">Media Library</h2>
          <p className="text-slate-600 font-medium">Manage all your store assets and media.</p>
        </div>
        <div className="relative">
          <input
            type="file"
            id="global-upload"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
            multiple
          />
          <Button 
            asChild
            className="bg-pb-green-deep hover:bg-emerald-800 text-[#FFF59D] rounded-2xl px-8 py-7 h-auto shadow-xl shadow-emerald-900/10 font-black uppercase tracking-widest transition-all border border-pb-green-deep/10"
          >
            <label htmlFor="global-upload" className="cursor-pointer flex items-center">
              {isUploading ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Plus className="w-5 h-5 mr-3" />}
              {isUploading ? 'Uploading...' : 'Direct Upload'}
            </label>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Search by filename or URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 bg-white border-slate-100 text-pb-green-deep py-6 rounded-2xl focus:ring-pb-green-deep/10"
          />
        </div>
        <Button variant="outline" className="border-slate-100 bg-white text-slate-600 py-6 h-auto rounded-2xl px-6 font-bold hover:bg-slate-50">
          <Filter className="w-5 h-5 mr-2" /> All Media
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {filteredUploads.map((upload) => (
          <Card key={upload.id} className="bg-white border-slate-100 group overflow-hidden rounded-2xl transition-all duration-300 border hover:border-pb-green-deep/20 shadow-sm hover:shadow-xl">
            <div className="aspect-square relative group overflow-hidden bg-slate-50">
              {upload.file_type.startsWith('image/') ? (
                <img 
                  src={upload.file_url} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <FileIcon className="w-12 h-12" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => copyToClipboard(upload.file_url)}
                  className="text-white hover:bg-white/10 rounded-lg w-10 h-10 p-0"
                >
                  <ExternalLink className="w-5 h-5" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleDelete(upload)}
                  className="text-red-400 hover:bg-red-500/10 rounded-lg w-10 h-10 p-0"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="absolute bottom-2 right-2 flex gap-1">
                <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[8px] font-bold text-slate-300 uppercase tracking-widest border border-white/5">
                  {upload.file_type.split('/')[1]}
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-slate-50">
              <p className="text-[10px] text-slate-400 truncate font-mono">{upload.file_url.split('-').pop()}</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">{new Date(upload.created_at).toLocaleDateString()}</p>
            </div>
          </Card>
        ))}
      </div>

      {filteredUploads.length === 0 && (
        <div className="text-center py-24 bg-slate-50 rounded-[48px] border border-dashed border-slate-200">
          <ImageIcon className="w-14 h-14 text-slate-200 mx-auto mb-6" />
          <p className="text-slate-400 font-medium italic">No media assets found in the storage bank.</p>
        </div>
      )}
    </div>
  );
};
