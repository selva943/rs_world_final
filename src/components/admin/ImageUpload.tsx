import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { storageApi } from '@/lib/services/api';
import { toast } from 'sonner';

interface ImageUploadProps {
  onUploadComplete?: (url: string) => void;
  onFileSelect?: (file: File) => void;
  onRemove: () => void;
  currentImage?: string | File | null;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onUploadComplete, 
  onFileSelect,
  onRemove, 
  currentImage,
  label = "Image"
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate local preview if currentImage is a File
  React.useEffect(() => {
    if (currentImage instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalPreview(reader.result as string);
      };
      reader.readAsDataURL(currentImage);
    } else {
      setLocalPreview(null);
    }
  }, [currentImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    // If onFileSelect is provided, we skip immediate upload
    if (onFileSelect) {
      onFileSelect(file);
      return;
    }

    // Otherwise, upload immediately
    if (onUploadComplete) {
      setIsUploading(true);
      try {
        const url = await storageApi.uploadFile(file);
        if (url) {
          onUploadComplete(url);
          toast.success('Image uploaded successfully');
        } else {
          toast.error('Failed to upload image');
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Error uploading image');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemove = () => {
    onRemove();
    setLocalPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = currentImage instanceof File ? localPreview : currentImage;

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>}
      
      <div className="relative group overflow-hidden rounded-[2rem] bg-slate-50 border border-slate-100 transition-all duration-300 hover:border-pb-green-deep/30 aspect-video flex items-center justify-center shadow-inner">
        {displayImage ? (
          <>
            <img 
              src={displayImage as string} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-2xl text-red-500 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full cursor-pointer flex flex-col items-center justify-center gap-4 p-8 group/link"
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-pb-green-deep animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-pb-green-deep">Compressing...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center group-hover/link:scale-110 transition-transform duration-500 shadow-sm">
                  <Upload className="w-7 h-7 text-pb-green-deep" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-600">Click to upload product image</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-2">PNG, JPG or WebP • Max 5MB</p>
                </div>
              </>
            )}
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};
