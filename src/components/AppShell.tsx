"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useShopStore, Product } from "@/store/store";
import { 
  Home, Grid, ShoppingBag, ClipboardList, User, Search, Heart, LogOut, LayoutDashboard, X, Star
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { data: session } = useSession();
  const { getCartCount, favorites } = useShopStore();
  
  const [cartCount, setCartCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Sync cart count client-side to prevent hydration mismatch
  useEffect(() => {
    setCartCount(getCartCount());
  }, [getCartCount()]);

  // Register PWA Service Worker
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered on scope:", reg.scope);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    }
  }, []);

  // Fetch all products once for search suggestions
  useEffect(() => {
    if (searchOpen) {
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAllProducts(data);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [searchOpen]);

  // Don't show header/footer on admin routes
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Categories", path: "/categories", icon: Grid },
    { name: "Cart", path: "/cart", icon: ShoppingBag, badge: cartCount },
    { name: "Orders", path: "/orders", icon: ClipboardList },
    { name: "Profile", path: "/profile", icon: User }
  ];

  const desktopNavLinks = [
    { name: "Home", href: "/" },
    { name: "Categories", href: "/categories" },
    { name: "Custom Tailoring", href: "/tailor" },
    { name: "Track Order", href: "/track" }
  ];

  const filteredProducts = searchQuery
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const parseImages = (product: Product) => {
    try {
      const arr = JSON.parse(product.images || '[]');
      return arr.length > 0 ? arr : [product.image];
    } catch {
      return [product.image];
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ============================================================== */}
      {/* GLOBAL SEARCH OVERLAY                                          */}
      {/* ============================================================== */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-10 md:pt-28 px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSearchOpen(false);
                setSearchQuery("");
              }
            }}
          >
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-4 p-5 md:p-6 border-b">
                <Search className="w-5 h-5 text-[var(--color-rosegold)]" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search for blouses, kurtis, fabrics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-base md:text-lg outline-none text-gray-800 placeholder-gray-400"
                />
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {searchQuery && (
                <div className="p-4 max-h-96 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <p className="text-center text-gray-500 py-6 text-sm">
                      No products found for "{searchQuery}"
                    </p>
                  ) : (
                    filteredProducts.slice(0, 8).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          router.push(`/products/${p.id}`);
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="w-full flex items-center gap-4 p-3 hover:bg-[var(--color-lightrose)] rounded-xl transition-colors text-left cursor-pointer border-b border-gray-50 last:border-0"
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={parseImages(p)[0]}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm line-clamp-1">
                            {p.name}
                          </p>
                          <span className="text-xs text-gray-400">
                            in {p.category}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[var(--color-rosegold)]">
                            ₹{p.price.toLocaleString('en-IN')}
                          </p>
                          {p.originalPrice > p.price && (
                            <p className="text-xs text-gray-450 line-through">
                              ₹{p.originalPrice.toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* DESKTOP NAVBAR (Visible on medium and larger viewports)         */}
      {/* ============================================================== */}
      <nav className="hidden md:block fixed top-0 w-full z-50 glass border-b border-[var(--color-rosegold)]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex-shrink-0 flex items-center cursor-pointer">
              <span className="font-serif text-3xl text-[var(--color-dark-rosegold)] font-bold tracking-tight">
                Elysian Fabrics
              </span>
            </Link>

            <div className="flex space-x-8">
              {desktopNavLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === link.href 
                      ? "text-[var(--color-dark-rosegold)] border-b-2 border-[var(--color-rosegold)]" 
                      : "text-gray-600 hover:text-[var(--color-rosegold)]"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-6 text-gray-700">
              <button onClick={() => setSearchOpen(true)} className="p-1 cursor-pointer hover:text-[var(--color-rosegold)] transition-colors">
                <Search className="w-5.5 h-5.5" />
              </button>

              <Link href="/favorites" className="relative p-1">
                <Heart className="w-5.5 h-5.5 hover:text-[var(--color-rosegold)] transition-colors cursor-pointer" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {favorites.length}
                  </span>
                )}
              </Link>

              <Link href="/cart" className="relative p-1">
                <ShoppingBag className="w-5.5 h-5.5 hover:text-[var(--color-rosegold)] transition-colors cursor-pointer" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--color-rosegold)] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {session ? (
                <div className="flex items-center gap-4">
                  {(session.user as any)?.role === "ADMIN" && (
                    <Link href="/admin">
                      <LayoutDashboard className="w-5 h-5 text-gray-600 hover:text-[var(--color-rosegold)] cursor-pointer" />
                    </Link>
                  )}
                  <Link href="/profile" className="flex items-center gap-1.5 text-sm font-medium hover:text-[var(--color-rosegold)] transition-colors">
                    <User className="w-4.5 h-4.5" />
                    <span className="max-w-[100px] truncate">{session.user?.name || "Profile"}</span>
                  </Link>
                  <button onClick={() => signOut()} className="text-gray-550 hover:text-red-500 cursor-pointer p-1">
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              ) : (
                <Link href="/login" className="flex items-center gap-1.5 text-sm font-medium hover:text-[var(--color-rosegold)] transition-colors">
                  <User className="w-4.5 h-4.5" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ============================================================== */}
      {/* MOBILE HEADER BAR (Visible on small devices)                   */}
      {/* ============================================================== */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 z-50 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-xl text-[var(--color-dark-rosegold)] font-bold tracking-tight">
            Elysian Fabrics
          </span>
        </Link>
        <div className="flex items-center gap-3 text-gray-700">
          <button onClick={() => setSearchOpen(true)} className="p-1 active:scale-90 transition-transform">
            <Search className="w-5.2 h-5.2 text-gray-600" />
          </button>
          <Link href="/favorites" className="relative p-1">
            <Heart className="w-5.2 h-5.2 text-gray-600" />
            {favorites.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                {favorites.length}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative p-1">
            <ShoppingBag className="w-5.2 h-5.2 text-gray-600" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-[var(--color-rosegold)] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN CONTENT PORT (Scrollable and offset appropriately)        */}
      {/* ============================================================== */}
      <main className="flex-1 pt-14 pb-16 md:pt-20 md:pb-0 min-h-screen bg-[var(--color-cream)]">
        {children}
      </main>

      {/* ============================================================== */}
      {/* DESKTOP FOOTER (Desktop only)                                  */}
      {/* ============================================================== */}
      <footer className="hidden md:block bg-neutral-900 text-neutral-400 py-12 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <span className="font-serif text-2xl text-white font-bold block mb-4">Elysian Fabrics</span>
              <p className="text-sm">Premium traditional fashion boutique offering custom tailored blouses, kurtis, and fabrics.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/categories" className="hover:text-white transition-colors">Collections</Link></li>
                <li><Link href="/tailor" className="hover:text-white transition-colors">Custom Tailoring</Link></li>
                <li><Link href="/track" className="hover:text-white transition-colors">Track Order</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Customer Care</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/profile" className="hover:text-white transition-colors">My Account</Link></li>
                <li><Link href="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
                <li><span className="text-neutral-500">Call Support: +91 98765 43210</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Info</h4>
              <p className="text-sm">123, Rosegold Lane,<br />Mumbai, MH, India</p>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-800 text-center text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} Elysian Fabrics. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* MOBILE BOTTOM NAVIGATION (Fixed bottom, visible on mobile)      */}
      {/* ============================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex justify-around items-center z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors active:scale-95 duration-75"
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5.5 h-5.5 transition-colors ${
                  isActive ? "text-[var(--color-dark-rosegold)]" : "text-gray-400"
                }`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[var(--color-rosegold)] text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold mt-1 tracking-tight ${
                isActive ? "text-[var(--color-dark-rosegold)]" : "text-gray-400"
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
