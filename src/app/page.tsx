"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Heart, ShoppingBag, User, Menu, X, Star, ArrowRight,
  CheckCircle2, Sparkles, Scissors, Truck, Shield, ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useShopStore, Product } from "@/store/store";

const CATEGORIES = ["All", "Sarees", "Kurtis", "Western Wear", "Dresses", "Party Wear", "Bridal Collection", "Anarkali"];

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: session } = useSession();
  const { addToCart, toggleFavorite, getCartCount, favorites, isFavorite } = useShopStore();

  useEffect(() => {
    fetchProducts();
  }, [activeCategory]);

  async function fetchProducts() {
    setLoadingProducts(true);
    try {
      const url = activeCategory === "All" ? "/api/products" : `/api/products?category=${encodeURIComponent(activeCategory)}`;
      const res = await fetch(url);
      if (res.ok) setProducts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  }

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredProducts = searchQuery
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Collections", href: "#categories" },
    { name: "New Arrivals", href: "#products" },
    { name: "Tailor Booking", href: "/tailor" },
    { name: "Track Order", href: "/track" },
  ];

  const categoryImages: Record<string, string> = {
    "Sarees": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
    "Kurtis": "https://images.unsplash.com/photo-1594938298603-c8148c4b44f0?w=600&q=80",
    "Western Wear": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    "Dresses": "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&q=80",
    "Party Wear": "https://images.unsplash.com/photo-1566206091558-f3d32ab7423e?w=600&q=80",
    "Bridal Collection": "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
    "Anarkali": "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80",
  };

  const features = [
    { icon: Scissors, title: "Custom Tailoring", desc: "Get your outfit tailored to perfect measurements" },
    { icon: Truck, title: "Free Delivery", desc: "Free shipping on orders above ₹999" },
    { icon: Shield, title: "Authentic Fabrics", desc: "Premium quality fabrics, verified & certified" },
    { icon: Sparkles, title: "Exclusive Designs", desc: "Unique designs you won't find elsewhere" },
  ];

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/')) return;
    e.preventDefault();
    setMobileMenuOpen(false);
    const elem = document.getElementById(href.replace(/.*#/, ""));
    elem?.scrollIntoView({ behavior: "smooth" });
  };

  const parseImages = (product: Product) => {
    try {
      const arr = JSON.parse(product.images || '[]');
      return arr.length > 0 ? arr : [product.image];
    } catch {
      return [product.image];
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)] text-[var(--foreground)] overflow-x-hidden font-sans">
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-0 left-1/2 z-[100] flex items-center gap-3 bg-white/95 backdrop-blur-md text-[var(--color-dark-rosegold)] px-6 py-4 rounded-full shadow-2xl border border-[var(--color-rosegold)]/20"
          >
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-28 px-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setSearchOpen(false); setSearchQuery(""); } }}
          >
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-4 p-6 border-b">
                <Search className="w-5 h-5 text-[var(--color-rosegold)]" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search for dresses, sarees, kurtis..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 text-lg outline-none text-gray-800 placeholder-gray-400"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              {searchQuery && (
                <div className="p-4 max-h-80 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <p className="text-center text-gray-500 py-6">No products found for "{searchQuery}"</p>
                  ) : (
                    filteredProducts.slice(0, 6).map(p => (
                      <button
                        key={p.id}
                        onClick={() => { router.push(`/products/${p.id}`); setSearchOpen(false); setSearchQuery(""); }}
                        className="w-full flex items-center gap-4 p-3 hover:bg-[var(--color-lightrose)] rounded-xl transition-colors"
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={parseImages(p)[0]} alt={p.name} fill className="object-cover" sizes="48px" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-800">{p.name}</p>
                          <p className="text-sm text-[var(--color-rosegold)]">₹{p.price.toLocaleString('en-IN')}</p>
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

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => router.push('/')}>
              <span className="font-serif text-3xl text-[var(--color-dark-rosegold)] font-bold tracking-tight">
                Elysian Fabrics
              </span>
            </div>

            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    if (link.href.startsWith('/')) { e.preventDefault(); router.push(link.href); }
                    else handleScroll(e, link.href);
                  }}
                  className="text-gray-700 hover:text-[var(--color-rosegold)] px-3 py-2 text-sm font-medium transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-5 text-gray-700">
              <button onClick={() => setSearchOpen(true)}>
                <Search className="w-5 h-5 cursor-pointer hover:text-[var(--color-rosegold)] transition-colors" />
              </button>
              <button className="relative" onClick={() => router.push('/favorites')}>
                <Heart className="w-5 h-5 cursor-pointer hover:text-[var(--color-rosegold)] transition-colors" />
                {favorites.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[var(--color-rosegold)] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>
              <button className="relative" onClick={() => router.push('/cart')}>
                <ShoppingBag className="w-5 h-5 cursor-pointer hover:text-[var(--color-rosegold)] transition-colors" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[var(--color-rosegold)] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </button>
              <User onClick={() => router.push(session ? '/profile' : '/login')} className="w-5 h-5 cursor-pointer hover:text-[var(--color-rosegold)] transition-colors" />
            </div>

            {/* Mobile */}
            <div className="md:hidden flex items-center gap-4">
              <button className="relative" onClick={() => router.push('/cart')}>
                <ShoppingBag className="w-6 h-6 text-gray-700" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[var(--color-rosegold)] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass-dark border-t border-[var(--color-rosegold)]/10 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      if (link.href.startsWith('/')) { e.preventDefault(); router.push(link.href); setMobileMenuOpen(false); }
                      else handleScroll(e, link.href);
                    }}
                    className="block px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:text-[var(--color-dark-rosegold)] hover:bg-[var(--color-rosegold)]/10 transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="flex gap-6 px-3 py-4 mt-2 border-t border-[var(--color-rosegold)]/20">
                  <button onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }}><Search className="w-6 h-6 text-gray-600" /></button>
                  <button onClick={() => { router.push('/favorites'); setMobileMenuOpen(false); }}><Heart className="w-6 h-6 text-gray-600" /></button>
                  <button onClick={() => { router.push(session ? '/profile' : '/login'); setMobileMenuOpen(false); }}><User className="w-6 h-6 text-gray-600" /></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--color-blush)] pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-blush)] via-[var(--color-cream)] to-[var(--color-lavender)] opacity-70" />
        <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-[var(--color-rosegold)]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[var(--color-peach)]/20 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12 lg:gap-20 py-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="w-full md:w-1/2 text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-[var(--color-rosegold)]/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-[var(--color-rosegold)]" />
              <span className="text-sm text-[var(--color-dark-rosegold)] font-medium">New Season Collection 2026</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[var(--color-dark-rosegold)] leading-tight mb-6">
              Redefining<br className="hidden lg:block" /> Women's Fashion<br className="hidden lg:block" />
              <span className="text-[var(--color-rosegold)]">with Elegance</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-lg font-light leading-relaxed">
              Discover our premium collection of ethnic and western outfits, or get a custom-tailored dress crafted just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-[var(--color-dark-rosegold)] text-white rounded-full font-medium shadow-lg hover:bg-[var(--color-deeprose)] transition-all hover:-translate-y-1 active:translate-y-0"
              >
                Shop Collection
              </button>
              <button
                onClick={() => router.push('/tailor')}
                className="px-8 py-4 border-2 border-[var(--color-rosegold)] text-[var(--color-dark-rosegold)] rounded-full font-medium hover:bg-[var(--color-rosegold)] hover:text-white transition-all hover:-translate-y-1"
              >
                Book a Tailor
              </button>
            </div>
            <div className="flex items-center gap-6 mt-10 justify-center md:justify-start">
              <div className="text-center"><p className="font-bold text-2xl text-[var(--color-dark-rosegold)]">500+</p><p className="text-xs text-gray-500">Designs</p></div>
              <div className="w-px h-8 bg-gray-300" />
              <div className="text-center"><p className="font-bold text-2xl text-[var(--color-dark-rosegold)]">2000+</p><p className="text-xs text-gray-500">Happy Clients</p></div>
              <div className="w-px h-8 bg-gray-300" />
              <div className="text-center"><p className="font-bold text-2xl text-[var(--color-dark-rosegold)]">100%</p><p className="text-xs text-gray-500">Authentic</p></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="w-full md:w-1/2 relative flex justify-center"
          >
            <div className="relative w-full max-w-md lg:max-w-lg h-[500px] lg:h-[650px] rounded-t-full rounded-b-[40px] overflow-hidden shadow-2xl border-4 border-white/60">
              <Image
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80"
                alt="Elegant Indian Fashion Model"
                fill className="object-cover object-top" priority sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <motion.div
              animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}
              className="absolute top-8 -left-4 md:-left-12 bg-white rounded-2xl p-4 shadow-xl"
            >
              <p className="text-xs text-gray-500 mb-1">Today's Pick</p>
              <p className="font-serif font-semibold text-[var(--color-dark-rosegold)]">Silk Saree</p>
              <p className="text-[var(--color-rosegold)] font-bold text-sm mt-1">₹2,499</p>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 4, delay: 1 }}
              className="absolute bottom-16 -right-4 md:-right-10 bg-white rounded-2xl p-4 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--color-blush)] flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-[var(--color-rosegold)]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Custom Fit</p>
                  <p className="font-semibold text-gray-800 text-sm">Book Tailor</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="flex flex-col items-center text-center gap-3 p-4"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--color-lightrose)] flex items-center justify-center">
                <f.icon className="w-5 h-5 text-[var(--color-rosegold)]" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-24 bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-serif text-[var(--color-dark-rosegold)] mb-4">Featured Categories</h2>
            <div className="w-24 h-1 bg-[var(--color-rosegold)] mx-auto rounded-full mb-4" />
            <p className="text-gray-500 font-light">Explore our curated collections tailored just for you</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categoryImages).slice(0, 4).map(([name, img], i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                onClick={() => { setActiveCategory(name); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="group relative h-56 md:h-72 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all"
              >
                <Image src={img} alt={name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 768px) 50vw, 25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-base md:text-lg font-serif mb-1">{name}</h3>
                  <p className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    Shop Now <ChevronRight className="w-3 h-3 ml-1" />
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            {Object.entries(categoryImages).slice(4).map(([name, img], i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.4 }} viewport={{ once: true }}
                onClick={() => { setActiveCategory(name); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="group relative h-44 md:h-56 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all"
              >
                <Image src={img} alt={name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 768px) 33vw, 25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-sm md:text-base font-serif">{name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-4xl font-serif text-[var(--color-dark-rosegold)] mb-4">New Arrivals</h2>
            <div className="w-24 h-1 bg-[var(--color-rosegold)] rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Freshly curated styles for the modern woman</p>
          </motion.div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                  ? 'bg-[var(--color-dark-rosegold)] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-[var(--color-lightrose)] hover:text-[var(--color-dark-rosegold)]'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="h-72 shimmer rounded-2xl mb-4" />
                  <div className="h-4 shimmer rounded-full mb-2" />
                  <div className="h-4 shimmer rounded-full w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No products in this category yet.</p>
              <p className="text-sm mt-2">Check back soon or browse another category!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => {
                const discount = Math.round((1 - product.price / product.originalPrice) * 100);
                const fav = isFavorite(product.id);
                const mainImg = parseImages(product)[0];
                const sizes = (() => { try { return JSON.parse(product.sizes || '[]'); } catch { return []; } })();
                const colors = (() => { try { return JSON.parse(product.colors || '[]'); } catch { return []; } })();

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: (index % 8) * 0.07 }} viewport={{ once: true }}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all group flex flex-col overflow-hidden border border-gray-100 card-hover"
                  >
                    <div
                      className="relative h-64 bg-gray-100 cursor-pointer overflow-hidden"
                      onClick={() => router.push(`/products/${product.id}`)}
                    >
                      <Image src={mainImg} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />

                      {discount > 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">
                          -{discount}%
                        </div>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-white text-gray-700 text-sm font-semibold px-4 py-2 rounded-full">Out of Stock</span>
                        </div>
                      )}

                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(product); showToast(fav ? "Removed from favorites" : "Added to favorites ❤️"); }}
                        className={`absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow transition-colors ${fav ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                      >
                        <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
                      </button>

                      {product.inStock && (
                        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (sizes.length > 0 || colors.length > 0) {
                                router.push(`/products/${product.id}`);
                              } else {
                                addToCart(product);
                                showToast(`${product.name} added to cart! 🛍️`);
                              }
                            }}
                            className="w-full py-2.5 bg-white/95 backdrop-blur-md text-[var(--color-dark-rosegold)] font-medium rounded-xl shadow-lg hover:bg-[var(--color-dark-rosegold)] hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            {sizes.length > 0 || colors.length > 0 ? 'View Options' : 'Quick Add'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col" onClick={() => router.push(`/products/${product.id}`)} style={{ cursor: 'pointer' }}>
                      <span className="text-xs text-[var(--color-rosegold)] font-medium mb-1">{product.category}</span>
                      <h3 className="font-medium text-gray-800 line-clamp-2 text-sm mb-2">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-[var(--color-gold)] text-[var(--color-gold)]" />)}
                        <span className="text-xs text-gray-400 ml-1">(24)</span>
                      </div>
                      {sizes.length > 0 && (
                        <div className="flex gap-1 mb-2 flex-wrap">
                          {sizes.slice(0, 4).map((s: string) => (
                            <span key={s} className="text-xs border border-gray-200 rounded px-1.5 py-0.5 text-gray-500">{s}</span>
                          ))}
                          {sizes.length > 4 && <span className="text-xs text-gray-400">+{sizes.length - 4}</span>}
                        </div>
                      )}
                      <div className="mt-auto flex items-center gap-2">
                        <span className="font-bold text-[var(--color-dark-rosegold)]">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Tailor CTA */}
      <section className="py-24 bg-gradient-to-r from-[var(--color-dark-rosegold)] to-[var(--color-rosegold)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Scissors className="w-12 h-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl font-serif mb-6">Can't Find Your Perfect Fit?</h2>
            <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto">
              Book our expert tailors and get a completely custom-made outfit. You choose the fabric, style, measurements — we craft it to perfection.
            </p>
            <button
              onClick={() => router.push('/tailor')}
              className="px-10 py-4 bg-white text-[var(--color-dark-rosegold)] rounded-full font-semibold hover:bg-[var(--color-cream)] transition-all shadow-2xl hover:-translate-y-1 text-lg"
            >
              Book a Custom Tailor
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--color-cream)] pt-16 pb-8 border-t border-[var(--color-rosegold)]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <span className="font-serif text-2xl text-[var(--color-dark-rosegold)] font-bold mb-4 block">Elysian Fabrics</span>
              <p className="text-gray-500 text-sm font-light leading-relaxed mb-4">
                Redefining elegance with our curated collection of premium women's fashion.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                {['Home', 'Collections', 'New Arrivals', 'About Us'].map(l => (
                  <li key={l}><a href="#" className="hover:text-[var(--color-rosegold)] transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                {['Track Order', 'Returns & Exchange', 'Size Guide', 'Contact Us'].map(l => (
                  <li key={l}><a href="#" className="hover:text-[var(--color-rosegold)] transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <p>📞 +91 90000 00000</p>
                <p>✉️ hello@elysianfabrics.in</p>
                <p>📍 Hyderabad, Telangana</p>
              </div>
            </div>
          </div>
          <div className="border-t border-[var(--color-rosegold)]/20 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">© 2026 Elysian Fabrics. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-[var(--color-rosegold)]">Privacy Policy</a>
              <a href="#" className="hover:text-[var(--color-rosegold)]">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
