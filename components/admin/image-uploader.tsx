"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Upload, X, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
}

export function ImageUploader({ value, onChange, label = "Image", description }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        onChange(data.url);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white/70">
          {label}
        </label>
      )}
      
      <div className="space-y-3">
        {/* Preview */}
        {value ? (
          <div className="relative group">
            <div className="relative w-full aspect-video bg-[#0a0a0a] border-2 border-[#262626] rounded-lg overflow-hidden">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`relative w-full aspect-video border-2 border-dashed rounded-lg transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer ${
              dragActive
                ? "border-[#dc2626] bg-[#dc2626]/5"
                : "border-[#262626] bg-[#0a0a0a] hover:border-[#dc2626]/50 hover:bg-[#1a1a1a]"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleChange}
            />
            
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-[#dc2626] animate-spin" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white/40" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white/80">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    SVG, PNG, JPG or GIF (max. 5MB)
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Manual URL Input */}
        <div className="relative">
          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste image URL..."
            className="w-full px-4 py-2.5 pl-10 bg-[#1a1a1a] border border-[#262626] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#dc2626]/50 transition-colors text-sm"
          />
        </div>

        {description && (
          <p className="text-xs text-white/40">{description}</p>
        )}
      </div>
    </div>
  );
}
