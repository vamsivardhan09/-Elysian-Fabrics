"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronRight, Sparkles, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const DEFAULT_CATEGORIES = ["Kurtis", "Blouses", "Fabrics"];

const CATEGORY_IMAGES: Record<string, string> = {
  "Kurtis": "https://images.unsplash.com/photo-1594938298603-c8148c4b44f0?w=600&q=80",
  "Blouses": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
  "Fabrics": "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80",
};

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data.map((c: any) => c.name));
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch {
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)] py-6 px-4 md:py-12 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-[var(--color-rosegold)]/10 shadow-sm mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-rosegold)]" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-dark-rosegold)]">
              Our Collections
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif text-[var(--color-dark-rosegold)] font-bold mb-2">
            Browse Categories
          </h1>
          <p className="text-xs md:text-sm text-gray-500 font-light max-w-md mx-auto">
            Find the perfect outfit from our dynamic catalogs. Each piece is designed for elegance and comfort.
          </p>
        </div>

        {/* Grid list */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 md:h-60 rounded-2xl shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat, i) => {
              const image = CATEGORY_IMAGES[cat] || "https://images.unsplash.com/photo-1594938298603-c8148c4b44f0?w=600&q=80";
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/categories/${encodeURIComponent(cat)}`)}
                  className="group relative h-40 md:h-64 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg active:scale-[0.98] transition-all duration-200 border border-white"
                >
                  <Image 
                    src={image} 
                    alt={cat} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-serif text-base md:text-xl font-bold mb-0.5 leading-tight">{cat}</h3>
                    <p className="text-[10px] text-gray-300 opacity-90 flex items-center md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      Shop Now <ChevronRight className="w-3 h-3 ml-0.5" />
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
