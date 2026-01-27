import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#dc2626] animate-spin" />
    </div>
  );
}
