import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-[#dc2626] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
        <p className="text-white/60 mb-8">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/store"
          className="inline-flex items-center gap-2 bg-[#dc2626] hover:bg-[#ef4444] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>
      </div>
    </div>
  );
}
