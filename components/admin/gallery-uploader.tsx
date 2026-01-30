"use client";

import { useState } from "react";
import { X, Plus, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GalleryUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  description?: string;
}

export function GalleryUploader({ 
  images, 
  onChange, 
  maxImages = 10,
  label = "Gallery Images",
  description 
}: GalleryUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");

  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url) return;

    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    onChange([...images, url]);
    setUrlInput("");
    setError(null);
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-white/70">
            {label}
          </label>
          <span className="text-xs text-white/40">
            {images.length} / {maxImages}
          </span>
        </div>
      )}

      {/* URL Input */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste image URL (e.g., https://i.imgur.com/image.jpg)"
              className="bg-[#1a1a1a] border-[#262626] text-white placeholder:text-white/30 focus:border-[#dc2626]/50 pl-10"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
              disabled={images.length >= maxImages}
            />
          </div>
          <Button
            type="button"
            onClick={handleAddUrl}
            disabled={!urlInput.trim() || images.length >= maxImages}
            className="bg-[#dc2626] hover:bg-[#ef4444] text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-400 flex items-center gap-2">
            <X className="w-4 h-4" />
            {error}
          </p>
        )}

        {description && (
          <p className="text-xs text-white/40">{description}</p>
        )}
      </div>

      {/* Gallery Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((url, idx) => (
            <div key={idx} className="relative group">
              <div className="relative aspect-video bg-[#0a0a0a] border-2 border-[#262626] rounded-lg overflow-hidden hover:border-[#dc2626]/50 transition-colors">
                <img
                  src={url}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Number Badge */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-white text-xs font-bold">
                  {idx + 1}
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Reorder Buttons */}
                <div className="absolute bottom-2 left-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleReorder(idx, idx - 1)}
                      className="flex-1 px-2 py-1 bg-black/80 hover:bg-black text-white text-xs rounded"
                    >
                      ←
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleReorder(idx, idx + 1)}
                      className="flex-1 px-2 py-1 bg-black/80 hover:bg-black text-white text-xs rounded"
                    >
                      →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
