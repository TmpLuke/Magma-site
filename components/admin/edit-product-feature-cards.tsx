"use client";

import { useState } from "react";
import { Shield, Zap, Users, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

interface EditProductFeatureCardsProps {
  featureCards: FeatureCard[];
  onChange: (cards: FeatureCard[]) => void;
}

const iconOptions = [
  { value: "Shield", label: "Shield", Icon: Shield },
  { value: "Zap", label: "Zap (Lightning)", Icon: Zap },
  { value: "Users", label: "Users (Support)", Icon: Users },
];

export function EditProductFeatureCards({
  featureCards,
  onChange,
}: EditProductFeatureCardsProps) {
  const updateCard = (index: number, field: keyof FeatureCard, value: string) => {
    const updated = [...featureCards];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addCard = () => {
    if (featureCards.length < 3) {
      onChange([
        ...featureCards,
        { icon: "Shield", title: "New Feature", description: "Description" },
      ]);
    }
  };

  const removeCard = (index: number) => {
    onChange(featureCards.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-white text-base font-semibold">
          Feature Cards (Max 3)
        </Label>
        {featureCards.length < 3 && (
          <Button
            type="button"
            onClick={addCard}
            size="sm"
            className="bg-[#dc2626] hover:bg-[#ef4444]"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Card
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featureCards.map((card, index) => {
          const IconComponent = iconOptions.find((opt) => opt.value === card.icon)?.Icon || Shield;
          
          return (
            <div
              key={index}
              className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4 space-y-3"
            >
              {/* Preview */}
              <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3 text-center">
                <IconComponent className="w-8 h-8 text-[#dc2626] mx-auto mb-2" />
                <p className="text-white text-sm font-semibold mb-1">{card.title}</p>
                <p className="text-white/50 text-xs">{card.description}</p>
              </div>

              {/* Icon Selector */}
              <div>
                <Label className="text-white/70 text-xs mb-1">Icon</Label>
                <select
                  value={card.icon}
                  onChange={(e) => updateCard(index, "icon", e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white text-sm focus:border-[#dc2626] focus:outline-none"
                >
                  {iconOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <Label className="text-white/70 text-xs mb-1">Title</Label>
                <Input
                  value={card.title}
                  onChange={(e) => updateCard(index, "title", e.target.value)}
                  placeholder="Feature Title"
                  className="bg-[#0a0a0a] border-[#1a1a1a] text-white text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <Label className="text-white/70 text-xs mb-1">Description</Label>
                <Input
                  value={card.description}
                  onChange={(e) => updateCard(index, "description", e.target.value)}
                  placeholder="Short description"
                  className="bg-[#0a0a0a] border-[#1a1a1a] text-white text-sm"
                />
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                onClick={() => removeCard(index)}
                variant="outline"
                size="sm"
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          );
        })}
      </div>

      {featureCards.length === 0 && (
        <div className="text-center py-8 text-white/50">
          <p className="mb-2">No feature cards added</p>
          <Button
            type="button"
            onClick={addCard}
            size="sm"
            className="bg-[#dc2626] hover:bg-[#ef4444]"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add First Card
          </Button>
        </div>
      )}
    </div>
  );
}
