
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

export function AddProductModal({
  isOpen,
  onClose,
  onProductAdded,
}: AddProductModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [game, setGame] = useState("");
  const [provider, setProvider] = useState("");
  const [status, setStatus] = useState("Undetected");
  const [image, setImage] = useState("");
  const [features, setFeatures] = useState("");
  const [requirements, setRequirements] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddProduct = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("products").insert([
        {
          name,
          slug,
          game,
          provider,
          status,
          image,
          features: features.split(",").map((s) => s.trim()),
          requirements: requirements.split(",").map((s) => s.trim()),
        },
      ]);

      if (error) throw error;

      onProductAdded();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#1a1a1a] border-[#262626] text-white"
          />
          <Input
            placeholder="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="bg-[#1a1a1a] border-[#262626] text-white"
          />
          <Input
            placeholder="Game"
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="bg-[#1a1a1a] border-[#262626] text-white"
          />
          <Input
            placeholder="Provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="bg-[#1a1a1a] border-[#262626] text-white"
          />
          <Input
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="bg-[#1a1a1a] border-[#262626] text-white"
          />
          <Textarea
            placeholder="Features (comma-separated)"
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            className="bg-[#1a1a1a] border-[#262626] text-white"
          />
          <Textarea
            placeholder="Requirements (comma-separated)"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="bg-[#1a1a1a] border-[#262626] text-white"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            onClick={handleAddProduct}
            disabled={loading}
            className="bg-[#dc2626] hover:bg-[#ef4444] text-white"
          >
            {loading ? "Adding..." : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
