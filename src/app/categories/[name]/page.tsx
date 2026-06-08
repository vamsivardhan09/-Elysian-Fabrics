"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Star, Heart, ShoppingBag, ArrowUpDown, Filter } from "lucide-react";
import { useShopStore, Product } from "@/store/store";
import { motion } from "framer-motion";

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawName = params.name as string;
  const categoryName = decodeURIComponent(rawName);

  const { toggleFavorite, isFavorite } = useShopStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"newest" | "priceLow" | "priceHigh">("newest");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryName) return;
    fetchProducts();
  }, [categoryName]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?category=${encodeURIComponent(categoryName)}`);
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  // Sort logic
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "priceLow") return a.price - b.price;
    if (sortBy === "priceHigh") return b.price - a.price;
    // newest fallback
    return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
  });

  return (
    <div className="min-h-screen bg-[var(--color-cream)] py-6 px-4 md:py-12 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-white/95 backdrop-blur-md text-[var(--color-dark-rosegold)] px-6 py-3 rounded-full shadow-xl border border-[var(--color-rosegold)]/10 text-xs font-semibold">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Back and Navigation */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1 text-gray-500 hover:text-[var(--color-rosegold)] text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-gray-300">/</span>
          <span 
            onClick={() => router.push("/categories")}
            className="text-xs text-gray-500 hover:text-[var(--color-rosegold)] cursor-pointer"
          >
            Categories
          </span>
          <span className="text-gray-300">/</span>
          <span className="text-xs text-gray-800 font-bold">{categoryName}</span>
        </div>

        {/* Category Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-[var(--color-dark-rosegold)] font-bold mb-1">
              {categoryName}
            </h1>
            <p className="text-xs text-gray-400">
              Browse our curated selection of {categoryName.toLowerCase()} ({products.length} Items)
            </p>
          </div>

          {/* Sort bar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border shadow-sm">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <select 
                value={sortBy} 
                onChange={(e: any) => setSortBy(e.target.value)}
                className="outline-none text-xs text-gray-700 bg-transparent font-medium cursor-pointer"
              >
                <option value="newest">Sort: Newest</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-3 rounded-2xl border border-gray-100">
                <div className="h-48 shimmer rounded-xl mb-3" />
                <div className="h-4 shimmer rounded-full mb-1.5" />
                <div className="h-3 shimmer rounded-full w-2/3" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border shadow-sm">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p className="text-lg text-gray-600 font-medium mb-1">No products found</p>
            <p className="text-sm text-gray-400 font-light">We are working on adding premium items to this collection!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sortedProducts.map((product) => {
              const discount = Math.round((1 - product.price / product.originalPrice) * 100);
              const fav = isFavorite(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => router.push(`/products/${product.id}`)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100/60 shadow-sm flex flex-col active:scale-[0.98] transition-transform duration-75 cursor-pointer"
                >
                  <div className="relative h-44 md:h-56 bg-gray-50">
                    <Image
                      src={parseImages(product)[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
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

                    <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm text-[8px] font-bold text-gray-700">
                      <span>4.5</span>
                      <Star className="w-2.5 h-2.5 fill-[var(--color-gold)] text-[var(--color-gold)]" />
                      <span className="text-gray-400 font-normal border-l border-gray-200 pl-1 ml-0.5">18</span>
                    </div>
                  </div>

                  <div className="p-3 flex-1 flex flex-col">
                    <span className="text-[9px] text-[var(--color-rosegold)] uppercase font-bold tracking-tight mb-0.5">{product.category}</span>
                    <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1">{product.name}</h4>
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
  );
}
