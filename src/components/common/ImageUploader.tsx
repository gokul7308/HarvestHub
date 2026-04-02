import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxIter?: number;
}

export function ImageUploader({ images, onChange, maxIter = 5 }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Convert File to Base64 (to simulate upload)
  const processFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result && images.length < maxIter) {
          onChange([...images, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    const newImgs = [...images];
    newImgs.splice(index, 1);
    onChange(newImgs);
  };

  return (
    <div className="space-y-4">
      <div 
        className={`relative w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${isDragging ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col items-center justify-center text-center">
           <UploadCloud className={`w-8 h-8 mb-2 ${isDragging ? 'text-[var(--color-primary)] animate-bounce' : 'text-slate-400'}`} />
           <p className="text-sm font-semibold text-slate-700">Click or drag images to upload</p>
           <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG (Max {maxIter})</p>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          multiple
          onChange={(e) => e.target.files && processFiles(e.target.files)} 
        />
      </div>

      <AnimatePresence>
        {images.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200 shadow-sm bg-white"
              >
                <img src={img} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(i); }} 
                    className="p-1.5 bg-white text-red-500 rounded-full hover:bg-red-50 shadow-sm"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
