"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Store,
  BarChart3,
  BookOpen,
  Heart,
  Shield,
  X,
  Menu,
  Home,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { mockProducts } from "@/lib/admin-mock-data";
import { AuthDropdown } from "@/components/auth-dropdown";
import { useCart } from "@/lib/cart-context";
import { CartDropdown } from "@/components/cart-dropdown";

export function Header() {
  const router = useRouter();
  const { getItemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof mockProducts>([]);
  const [showResults, setShowResults] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const cartCount = getItemCount();

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = mockProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.game.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  // Close search results on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (slug: string) => {
    setSearchQuery("");
    setShowResults(false);
    setMobileMenuOpen(false);
    router.push(`/store/${slug}`);
  };

  // Close mobile menu when clicking outside or on route change
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { icon: Home, label: "HOME", href: "/", mobileOnly: true },
    { icon: Store, label: "STORE", href: "/store" },
    { icon: BarChart3, label: "STATUS", href: "/status" },
    { icon: BookOpen, label: "GUIDES", href: "/guides" },
    { icon: Heart, label: "REVIEWS", href: "/reviews" },
    {
      icon: Shield,
      label: "SUPPORT",
      href: "https://discord.gg/magmacheats",
      external: true,
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/images/magma-logo.png"
                alt="Magma Cheats"
                width={140}
                height={40}
                className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]"
              />
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.filter(item => !item.mobileOnly).map((item, i) =>
              item.external ? (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white/70 hover:text-[#dc2626] text-sm font-medium transition-all duration-300 relative group"
                >
                  <item.icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  <span>{item.label}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#dc2626] transition-all duration-300 group-hover:w-full" />
                </a>
              ) : (
                <Link
                  key={i}
                  href={item.href}
                  className="flex items-center gap-1.5 text-white/70 hover:text-[#dc2626] text-sm font-medium transition-all duration-300 relative group"
                >
                  <item.icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  <span>{item.label}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#dc2626] transition-all duration-300 group-hover:w-full" />
                </Link>
              )
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-[#1a1a1a] text-white/70 hover:text-white hover:bg-[#262626] transition-all duration-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Search - Desktop */}
            <div ref={searchRef} className="relative hidden md:block">
              <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#dc2626]/50 focus-within:bg-[#1a1a1a]/80 hover:bg-[#1f1f1f]">
                <Search className="w-4 h-4 text-white/50 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search for products.."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-white/80 placeholder:text-white/50 outline-none w-32 transition-all duration-300 focus:w-48"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setShowResults(false);
                    }}
                    className="text-white/50 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#111111] border border-[#1a1a1a] rounded-lg shadow-xl overflow-hidden z-50">
                  {searchResults.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleResultClick(product.slug)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] overflow-hidden flex-shrink-0">
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">
                              {product.name}
                            </p>
                            <p className="text-white/50 text-xs">
                              {product.game}
                            </p>
                          </div>
                          <span
                            className={`ml-auto px-2 py-0.5 rounded text-xs ${
                              product.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {product.status === "active"
                              ? "Undetected"
                              : "Updating"}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-white/50 text-sm">No products found</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart & Auth Dropdown */}
            <div className="hidden md:flex items-center gap-3">
              <CartDropdown />
              <AuthDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Full Screen with explicit dimensions */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden bg-[#0a0a0a]"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
          }}
        >
          {/* Menu Content */}
          <div className="w-full h-full flex flex-col">
            {/* Menu Header with Logo and Close */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <Image
                  src="/images/magma-logo.png"
                  alt="Magma Cheats"
                  width={140}
                  height={40}
                />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#262626] text-white/70 hover:text-white hover:bg-[#1a1a1a] transition-all"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="px-5 py-4 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-4 py-3">
                <Search className="w-5 h-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-white/80 placeholder:text-white/50 outline-none flex-1 text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setShowResults(false);
                    }}
                    className="text-white/50 hover:text-white p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {/* Mobile Search Results */}
              {showResults && searchResults.length > 0 && (
                <div className="mt-3 bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleResultClick(product.slug)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors text-left active:bg-[#262626]"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] overflow-hidden flex-shrink-0">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{product.name}</p>
                        <p className="text-white/50 text-sm">{product.game}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs flex-shrink-0 ${
                          product.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {product.status === "active" ? "Undetected" : "Updating"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Cart & Auth Section */}
            <div className="px-5 py-4 border-b border-[#1a1a1a] space-y-3">
              <Link
                href="/cart"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-white/60" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#dc2626] text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-white/80 font-medium">Cart ({cartCount})</span>
              </Link>
              <AuthDropdown />
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-5 py-4 overflow-y-auto">
              <ul className="space-y-1">
                {navItems.map((item, i) => (
                  <li key={i}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 py-4 px-4 rounded-xl text-white/80 hover:text-white hover:bg-[#1a1a1a] transition-colors active:bg-[#262626]"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1a1a1a]">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="text-lg font-medium">{item.label}</span>
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-4 py-4 px-4 rounded-xl transition-colors active:bg-[#262626] ${
                          item.label === "ADMIN"
                            ? "text-[#dc2626] hover:bg-[#dc2626]/10"
                            : "text-white/80 hover:text-white hover:bg-[#1a1a1a]"
                        }`}
                      >
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                          item.label === "ADMIN" ? "bg-[#dc2626]/20" : "bg-[#1a1a1a]"
                        }`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="text-lg font-medium">{item.label}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile Quick Actions */}
            <div className="px-5 py-4 border-t border-[#1a1a1a] bg-[#0a0a0a]">
              <Link
                href="/store"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-4 bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-xl font-semibold text-lg transition-colors active:scale-[0.98]"
              >
                <Store className="w-5 h-5" />
                Browse Store
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
