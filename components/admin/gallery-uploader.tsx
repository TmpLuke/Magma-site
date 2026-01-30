"use client";

import { useState, useRef } from "react";
import { Upload, X, Plus, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check max images
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError("Please select only image files");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be less than 5MB");
        return;
      }
    }

    setError(null);
    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      onChange([...images, ...urls]);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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

      {/* Upload Controls */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= maxImages}
            className="bg-[#dc2626] hover:bg-[#ef4444] text-white"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Images
              </>
            )}
          </Button>
        </div>

        {/* Manual URL Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Or paste image URL"
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
                <Image
                  src={url}
                  alt={`Gallery ${idx + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
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
