import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Plus } from 'lucide-react';
import { storageApi } from '@/lib/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MediaGalleryUploadProps {
  onUploadComplete?: (urls: string[]) => void;
  onFileSelect?: (file: File) => void;
  onRemove: (url: string | File) => void;
  media?: (string | File)[];
  label?: string;
  onUploadingStatusChange?: (isUploading: boolean) => void;
}

export const MediaGalleryUpload: React.FC<MediaGalleryUploadProps> = ({ 
  onUploadComplete,
  onFileSelect,
  onRemove, 
  media = [],
  label = "Media Gallery",
  onUploadingStatusChange
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validation
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    if (onFileSelect) {
      // DEFERRED MODE: Just pass the files back
      validFiles.forEach(file => onFileSelect(file));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // IMMEDIATE MODE (Fallback)
    setIsUploading(true);
    onUploadingStatusChange?.(true);
    
    try {
      toast.info(`Uploading ${validFiles.length} image(s)...`);
      const urls = await storageApi.uploadMultipleFiles(validFiles);
      
      if (urls.length > 0) {
        onUploadComplete?.(urls);
        if (urls.length === validFiles.length) {
          toast.success('All images uploaded successfully');
        } else {
          toast.warning(`Uploaded ${urls.length} of ${validFiles.length} images`);
        }
      } else {
        toast.error('Failed to upload images');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading images');
    } finally {
      setIsUploading(false);
      onUploadingStatusChange?.(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getPreviewUrl = (item: string | File) => {
    if (item instanceof File) {
      return URL.createObjectURL(item);
    }
    return item;
  };

  return (
    <div className="space-y-4">
      {label && <label className="text-sm font-black uppercase tracking-widest text-pb-green-deep/60 ml-1">{label}</label>}
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Existing Media & New Files Previews */}
        {media.map((item, idx) => (
          <div key={idx} className="relative aspect-square rounded-[2rem] overflow-hidden border border-slate-100 group bg-slate-50 shadow-sm transition-all hover:shadow-xl">
            <img 
              src={getPreviewUrl(item)} 
              alt={`Gallery ${idx}`} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            {item instanceof File && (
              <div className="absolute top-3 left-3 bg-pb-green-deep text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">
                NEW
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="p-3 bg-red-500 rounded-full text-white shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 hover:bg-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {/* Upload Button */}
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={cn(
            "relative aspect-square rounded-[1.5rem] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer",
            isUploading 
              ? "border-pb-green-deep/50 bg-pb-green-deep/5 cursor-wait" 
              : "border-white/10 bg-white/5 hover:border-pb-green-deep/50 hover:bg-pb-green-deep/5"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-[#66BB6A] animate-spin" />
              <span className="text-[10px] font-black text-[#66BB6A] uppercase tracking-widest">Uploading...</span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-pb-green-deep/10 flex items-center justify-center group-hover:bg-pb-green-deep/20 transition-colors">
                <Plus className="w-5 h-5 text-[#66BB6A]" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Add Media</span>
            </>
          )}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
      
      <p className="text-[10px] text-slate-500 uppercase tracking-widest italic">
        Tip: You can select multiple files at once. Max 5MB per file.
      </p>
    </div>
  );
};
