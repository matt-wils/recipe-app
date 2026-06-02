import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { ImagePlus, X } from 'lucide-react';

interface PhotoUploadProps {
  value: string | undefined; // base64 data URL
  onChange: (next: string | undefined) => void;
}

const OPTIONS = { maxSizeMB: 0.2, maxWidthOrHeight: 800, useWebWorker: true };

export function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File) => {
    setBusy(true);
    try {
      const compressed = await imageCompression(file, OPTIONS);
      const dataUrl = await imageCompression.getDataUrlFromFile(compressed);
      onChange(dataUrl);
    } finally {
      setBusy(false);
    }
  };

  if (value) {
    return (
      <div className="relative">
        <img src={value} alt="Recipe" className="h-48 w-full rounded-xl object-cover" />
        <button
          type="button"
          aria-label="Remove photo"
          onClick={() => onChange(undefined)}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 active:bg-gray-50">
      <ImagePlus size={28} />
      <span className="text-sm">{busy ? 'Processing…' : 'Add photo'}</span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onFile(file);
        }}
      />
    </label>
  );
}
