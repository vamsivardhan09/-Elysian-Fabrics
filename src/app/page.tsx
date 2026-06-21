"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Heart, ShoppingBag, Star, ArrowRight,
  CheckCircle2, Sparkles, Scissors, Truck, Shield, ChevronRight, ChevronLeft, Grid
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useShopStore, Product } from "@/store/store";

const CATEGORIES = ["All", "Kurtis", "Blouses", "Fabrics"];

export default function Home() {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  const { data: session } = useSession();
  const { addToCart, toggleFavorite, favorites, isFavorite } = useShopStore();

  useEffect(() => {
    fetchProducts();
  }, [activeCategory]);

  // Auto-swipe banner timer for mobile promo slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % promoBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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

  const parseImages = (product: Product) => {
    try {
      const arr = JSON.parse(product.images || '[]');
      return arr.length > 0 ? arr : [product.image];
    } catch {
      return [product.image];
    }
  };

  const categoryImages: Record<string, string> = {
    "Kurtis": "https://images.unsplash.com/photo-1594938298603-c8148c4b44f0?w=600&q=80",
    "Blouses": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
    "Fabrics": "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80",
  };

  const features = [
    { icon: Scissors, title: "Custom Tailoring", desc: "Get your outfit tailored to perfect measurements" },
    { icon: Truck, title: "Free Delivery", desc: "Free shipping on orders above ₹999" },
    { icon: Shield, title: "Authentic Fabrics", desc: "Premium quality fabrics, verified & certified" },
    { icon: Sparkles, title: "Exclusive Designs", desc: "Unique designs you won't find elsewhere" },
  ];

  const promoBanners = [
    {
      title: "Desi Couture Collection",
      subtitle: "Get up to 40% Off on Designer Blouses & Kurtis",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80",
      link: "/categories/Blouses"
    },
    {
      title: "Bespoke Custom Tailoring",
      subtitle: "Perfect fit crafting from expert tailors. Send your material or customize ours.",
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4b44f0?w=1200&q=80",
      link: "/tailor"
    },
    {
      title: "Premium Custom Fabrics",
      subtitle: "Explore high-quality raw silks, brocades, and cotton fabrics",
      image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1200&q=80",
      link: "/categories/Fabrics"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cream)] text-[var(--foreground)] overflow-x-hidden font-sans">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-0 left-1/2 z-[100] flex items-center gap-3 bg-white/95 backdrop-blur-md text-[var(--color-dark-rosegold)] px-6 py-4 rounded-full shadow-2xl border border-[var(--color-rosegold)]/20"
          >
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="font-medium text-xs md:text-sm">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MOBILE APPLICATION LAYOUT (Visible on md:hidden viewport)     */}
      {/* ============================================================== */}
      <div className="block md:hidden bg-gray-50/50 pb-8">
        
        {/* 1. MOCK SEARCH BAR AT TOP */}
        <div className="px-4 pt-3 pb-2 bg-white sticky top-14 z-30 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          {/* We trigger the global AppShell search open by clicking this mock bar */}
          <div 
            onClick={() => {
              // Click the search trigger on top header
              const searchBtn = document.querySelector('header button');
              if (searchBtn) (searchBtn as HTMLButtonElement).click();
            }}
            className="flex items-center gap-3 bg-gray-100/90 px-4 py-2.5 rounded-full border border-gray-100/60 cursor-pointer active:bg-gray-200/50 transition-colors"
          >
            <Search className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-xs font-normal">Search for sarees, blouses, kurtis, gowns...</span>
          </div>
        </div>

        {/* 2. PROMOTIONAL BANNER SLIDER (Swipeable) */}
        <div className="px-4 py-3 bg-white">
          <div className="relative h-44 rounded-2xl overflow-hidden shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBanner}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                onClick={() => router.push(promoBanners[currentBanner].link)}
                className="absolute inset-0 cursor-pointer"
              >
                <Image 
                  src={promoBanners[currentBanner].image} 
                  alt={promoBanners[currentBanner].title} 
                  fill 
                  className="object-cover" 
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent flex flex-col justify-end p-4 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-peach)] mb-1">
                    Special Offer
                  </span>
                  <h3 className="font-serif text-lg font-bold leading-tight mb-1">
                    {promoBanners[currentBanner].title}
                  </h3>
                  <p className="text-[10px] text-gray-200 line-clamp-1 opacity-90 max-w-[220px]">
                    {promoBanners[currentBanner].subtitle}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Dots */}
            <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
              {promoBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    currentBanner === index ? "bg-white w-3" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 3. CATEGORIES CAROUSEL (Horizontal Scroll) */}
        <div className="bg-white py-3 border-b border-gray-100">
          <div className="flex gap-4 overflow-x-auto px-4 scrollbar-hide py-1">
            <button
              onClick={() => { setActiveCategory("All"); router.push("/categories"); }}
              className="flex flex-col items-center flex-shrink-0 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[var(--color-rosegold)]/30 p-0.5 shadow-sm bg-[var(--color-lightrose)] flex items-center justify-center">
                <Grid className="w-6 h-6 text-[var(--color-dark-rosegold)]" />
              </div>
              <span className="text-[10px] font-bold mt-1 text-gray-700">All Categories</span>
            </button>
            {Object.entries(categoryImages).map(([name, img]) => (
              <button
                key={name}
                onClick={() => {
                  router.push(`/categories/${encodeURIComponent(name)}`);
                }}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[var(--color-rosegold)]/20 p-0.5 shadow-sm active:scale-95 transition-transform">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image src={img} alt={name} fill className="object-cover" sizes="56px" />
                  </div>
                </div>
                <span className="text-[10px] font-medium mt-1 text-gray-700 text-center tracking-tight truncate max-w-[64px]">
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. NEW ARRIVALS & TRENDING (Mobile product grids) */}
        <div className="px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[var(--color-dark-rosegold)]">New Arrivals</h2>
              <span className="text-[10px] text-gray-400">Recently uploaded boutique styles</span>
            </div>
            <button 
              onClick={() => router.push("/categories")}
              className="text-xs font-semibold text-[var(--color-rosegold)] flex items-center gap-1 cursor-pointer"
            >
              See All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-3 rounded-2xl border border-gray-100">
                  <div className="h-44 shimmer rounded-xl mb-3" />
                  <div className="h-3.5 shimmer rounded-full mb-1.5" />
                  <div className="h-3 shimmer rounded-full w-2/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-500 py-6 text-sm">No items found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {products.slice(0, 4).map((product) => {
                const discount = Math.round((1 - product.price / product.originalPrice) * 100);
                const fav = isFavorite(product.id);
                return (
                  <div 
                    key={product.id}
                    onClick={() => router.push(`/products/${product.id}`)}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100/60 shadow-sm flex flex-col active:scale-[0.98] transition-transform duration-75"
                  >
                    <div className="relative h-44 bg-gray-50">
                      <Image 
                        src={parseImages(product)[0]} 
                        alt={product.name} 
                        fill 
                        className="object-cover" 
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      {discount > 0 && (
                        <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg shadow-sm">
                          -{discount}%
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product);
                          showToast(fav ? "Removed from wishlist" : "Added to wishlist ❤️");
                        }}
                        className={`absolute top-2.5 right-2.5 p-1.5 bg-white/95 rounded-full shadow-sm ${
                          fav ? "text-red-500" : "text-gray-400"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${fav ? "fill-current" : ""}`} />
                      </button>
                      
                      {/* Rating Badge */}
                      <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm text-[8px] font-bold text-gray-700">
                        <span>4.5</span>
                        <Star className="w-2.5 h-2.5 fill-[var(--color-gold)] text-[var(--color-gold)]" />
                        <span className="text-gray-400 font-normal border-l border-gray-200 pl-1 ml-0.5">24</span>
                      </div>
                    </div>
                    
                    <div className="p-3 flex-1 flex flex-col">
                      <span className="text-[9px] text-[var(--color-rosegold)] uppercase font-bold tracking-tight mb-0.5">{product.category}</span>
                      <h4 className="text-xs font-semibold text-gray-800 line-clamp-1 mb-1">{product.name}</h4>
                      <div className="mt-auto flex items-baseline gap-1.5">
                        <span className="text-sm font-extrabold text-[var(--color-dark-rosegold)]">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-[10px] text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. TAILOR BOOKING BANNER */}
        <div className="px-4 py-2">
          <div 
            onClick={() => router.push("/tailor")}
            className="relative h-28 rounded-2xl overflow-hidden shadow-sm cursor-pointer flex items-center bg-gradient-to-r from-[var(--color-dark-rosegold)] to-[var(--color-rosegold)]"
          >
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="relative p-5 text-white flex-1 z-10">
              <span className="text-[9px] bg-white/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-2 inline-block">
                Bespoke Fit
              </span>
              <h3 className="font-serif text-base font-bold mb-0.5">Need a perfect tailored fit?</h3>
              <p className="text-[10px] text-white/80">Book an appointment online with custom sketches</p>
            </div>
            <div className="pr-6 z-10 text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center active:scale-90 transition-transform">
                <Scissors className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* 6. BEST SELLERS & RECOMMENDED */}
        <div className="px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[var(--color-dark-rosegold)]">Best Sellers</h2>
              <span className="text-[10px] text-gray-400">Our customer favorites this week</span>
            </div>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-3 rounded-2xl border border-gray-100">
                  <div className="h-44 shimmer rounded-xl mb-3" />
                  <div className="h-3.5 shimmer rounded-full mb-1.5" />
                  <div className="h-3 shimmer rounded-full w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {products.slice(2, 6).map((product) => {
                const discount = Math.round((1 - product.price / product.originalPrice) * 100);
                const fav = isFavorite(product.id);
                return (
                  <div 
                    key={product.id}
                    onClick={() => router.push(`/products/${product.id}`)}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100/60 shadow-sm flex flex-col active:scale-[0.98] transition-transform duration-75"
                  >
                    <div className="relative h-44 bg-gray-55">
                      <Image 
                        src={parseImages(product)[0]} 
                        alt={product.name} 
                        fill 
                        className="object-cover" 
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      {discount > 0 && (
                        <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg shadow-sm">
                          -{discount}%
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product);
                          showToast(fav ? "Removed from wishlist" : "Added to wishlist ❤️");
                        }}
                        className={`absolute top-2.5 right-2.5 p-1.5 bg-white/95 rounded-full shadow-sm ${
                          fav ? "text-red-500" : "text-gray-400"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${fav ? "fill-current" : ""}`} />
                      </button>
                      
                      {/* Rating Badge */}
                      <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm text-[8px] font-bold text-gray-700">
                        <span>4.7</span>
                        <Star className="w-2.5 h-2.5 fill-[var(--color-gold)] text-[var(--color-gold)]" />
                        <span className="text-gray-400 font-normal border-l border-gray-200 pl-1 ml-0.5">38</span>
                      </div>
                    </div>
                    
                    <div className="p-3 flex-1 flex flex-col">
                      <span className="text-[9px] text-[var(--color-rosegold)] uppercase font-bold tracking-tight mb-0.5">{product.category}</span>
                      <h4 className="text-xs font-semibold text-gray-800 line-clamp-1 mb-1">{product.name}</h4>
                      <div className="mt-auto flex items-baseline gap-1.5">
                        <span className="text-sm font-extrabold text-[var(--color-dark-rosegold)]">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-[10px] text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* DESKTOP VIEWPORT LAYOUT (Visible on md:block viewport)        */}
      {/* ============================================================== */}
      <div className="hidden md:block">
        
        {/* Desktop Hero */}
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {Object.entries(categoryImages).map(([name, img], i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  onClick={() => { setActiveCategory(name); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="group relative h-56 md:h-80 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all"
                >
                  <Image src={img} alt={name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 768px) 100vw, 33vw" />
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
            ) : products.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No products in this category yet.</p>
                <p className="text-sm mt-2">Check back soon or browse another category!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product, index) => {
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
                        className="relative h-72 bg-gray-100 cursor-pointer overflow-hidden"
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

      </div>
    </div>
  );
}
