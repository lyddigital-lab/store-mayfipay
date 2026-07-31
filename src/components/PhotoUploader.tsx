import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  produitId: string;
}

export default function PhotoUploader({ photos, onChange, produitId }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = 4 - photos.length;
    const toUpload = files.slice(0, remaining);
    if (toUpload.length === 0) {
      alert('Maximum 4 photos');
      return;
    }

    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `${produitId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from('produits').upload(filename, file, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from('produits').getPublicUrl(filename);
        urls.push(data.publicUrl);
      }
      onChange([...photos, ...urls]);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removePhoto(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleSelect}
        accept="image/*"
        multiple
        className="hidden"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {photos.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
            <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {photos.length < 4 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square border-2 border-dashed border-mayfipay-border rounded-lg flex flex-col items-center justify-center gap-1 hover:border-mayfipay-orange hover:bg-orange-50/50 transition disabled:opacity-50"
          >
            <Camera size={20} className="text-mayfipay-text-muted" />
            <span className="text-xs text-mayfipay-text-muted">
              {uploading ? 'Upload...' : 'Ajouter'}
            </span>
          </button>
        )}
      </div>

      <p className="text-xs text-mayfipay-text-muted mt-2">
        {photos.length}/4 photos — La première sera l'image principale
      </p>
    </div>
  );
}