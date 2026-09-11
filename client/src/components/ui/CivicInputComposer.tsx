import React, { useState } from 'react';
import { Button } from './Button';
import { ImageUploader } from './ImageUploader';
import { VoiceRecorder } from './VoiceRecorder';
import { LocationPicker } from './LocationPicker';
import { PenTool, Mic, Camera } from 'lucide-react';

interface ComposerProps {
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
}

export const CivicInputComposer: React.FC<ComposerProps> = ({ onSubmit, isSubmitting }) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const [mode, setMode] = useState<'TEXT' | 'VOICE'>('TEXT');
  const [showImageUploader, setShowImageUploader] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && images.length === 0) return;

    const formData = new FormData();
    const inputType = images.length > 0 ? (text ? 'MULTIMODAL' : 'IMAGE') : 'TEXT';
    
    formData.append('inputType', inputType);
    if (text) formData.append('text', text);
    if (location) {
      formData.append('location', JSON.stringify({
        type: 'Point',
        coordinates: [location.lng, location.lat]
      }));
    }

    images.forEach(img => {
      formData.append('images', img);
    });

    await onSubmit(formData);
    // Reset form after submit
    setText('');
    setImages([]);
    setLocation(null);
    setShowImageUploader(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-lg border shadow-sm">
      <div className="flex space-x-2 border-b pb-4">
        <Button 
          type="button" 
          variant={mode === 'TEXT' ? 'default' : 'ghost'} 
          onClick={() => setMode('TEXT')}
          size="sm"
        >
          <PenTool size={16} className="mr-2" /> Write
        </Button>
        <Button 
          type="button" 
          variant={mode === 'VOICE' ? 'default' : 'ghost'} 
          onClick={() => setMode('VOICE')}
          size="sm"
        >
          <Mic size={16} className="mr-2" /> Speak
        </Button>
        <Button 
          type="button" 
          variant={showImageUploader ? 'default' : 'ghost'} 
          onClick={() => setShowImageUploader(!showImageUploader)}
          size="sm"
        >
          <Camera size={16} className="mr-2" /> Add Photo
        </Button>
      </div>

      <div>
        {mode === 'TEXT' ? (
          <textarea
            className="w-full min-h-[150px] p-4 rounded-md border bg-transparent focus:ring-2 focus:ring-primary outline-none resize-y"
            placeholder="Describe what your community needs..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        ) : (
          <VoiceRecorder onTranscript={(t) => setText(text ? text + ' ' + t : t)} />
        )}
      </div>

      {showImageUploader && (
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Attach Photos</h4>
          <ImageUploader onImagesChange={setImages} />
        </div>
      )}

      <div className="pt-4 border-t">
        <LocationPicker onLocationSelect={setLocation} />
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isSubmitting || (!text && images.length === 0)} size="lg">
          {isSubmitting ? 'Submitting...' : 'Submit Need'}
        </Button>
      </div>
    </form>
  );
};
