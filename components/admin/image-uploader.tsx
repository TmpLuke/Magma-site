"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
}

export function ImageUploader({ value, onChange, label = "Image", description }: ImageUploaderProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white/70">
          {label}
        </label>
      )}
      
      <div className="space-y-3">
        {/* Preview */}
        {value && (
          <div className="relative group">
            <div className="relative w-full aspect-video bg-[#0a0a0a] border-2 border-[#262626] rounded-lg overflow-hidden">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* URL Input */}
        <div className="relative">
          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste image URL (e.g., https://i.imgur.com/image.jpg)"
            className="w-full px-4 py-2.5 pl-10 bg-[#1a1a1a] border border-[#262626] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#dc2626]/50 transition-colors"
          />
        </div>

        {description && (
          <p className="text-xs text-white/40">{description}</p>
        )}
      </div>
    </div>
  );
}
