import React, { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

interface ImageUploaderProps {
  onImagesChange: (files: File[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesChange }) => {
  const [previews, setPreviews] = useState<{ url: string; file: File }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newPreviews = newFiles.map(file => ({
        url: URL.createObjectURL(file),
        file
      }));
      const updatedPreviews = [...previews, ...newPreviews].slice(0, 3); // Max 3 images
      setPreviews(updatedPreviews);
      onImagesChange(updatedPreviews.map(p => p.file));
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onImagesChange(newPreviews.map(p => p.file));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {previews.map((preview, idx) => (
          <div key={idx} className="relative w-24 h-24 rounded border overflow-hidden">
            <img src={preview.url} alt="Preview" className="object-cover w-full h-full" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {previews.length < 3 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed rounded text-gray-500 hover:text-gray-700 hover:border-gray-400"
          >
            <Camera size={24} />
            <span className="text-xs mt-1">Add Photo</span>
          </button>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        multiple
        className="hidden"
      />
    </div>
  );
};
