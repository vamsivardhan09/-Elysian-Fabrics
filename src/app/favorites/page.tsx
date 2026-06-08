"use client";

import { useShopStore } from "@/store/store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, ArrowLeft, Star, Trash2 } from "lucide-react";
import { useState } from "react";

export default function FavoritesPage() {
  const { favorites, toggleFavorite, addToCart } = useShopStore();
  const router = useRouter();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const parseImages = (product: any) => {
    try {
      const arr = JSON.parse(product.images || '[]');
      return arr.length > 0 ? arr : [product.image];
    } catch {
      return [product.image];
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-0 left-1/2 z-[100] bg-white text-[var(--color-dark-rosegold)] px-6 py-4 rounded-full shadow-2xl border border-[var(--color-rosegold)]/20 text-sm font-medium"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center text-gray-500 hover:text-[var(--color-rosegold)] transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Continue Shopping
        </button>

        <h1 className="text-4xl font-serif text-[var(--color-dark-rosegold)] mb-10 flex items-center gap-3">
          Saved Favorites <Heart className="w-8 h-8 text-red-500 fill-current" />
        </h1>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-white rounded-3xl shadow-sm max-w-lg mx-auto"
          >
            <Heart className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <p className="text-xl text-gray-600 mb-2 font-medium">Your wishlist is empty</p>
            <p className="text-gray-400 mb-8 font-light text-sm">Save your favorite dresses to view them later</p>
            <button
              onClick={() => router.push("/")}
              className="px-10 py-3.5 bg-[var(--color-dark-rosegold)] text-white rounded-full font-semibold hover:bg-[var(--color-deeprose)] transition-colors shadow-lg"
            >
              Browse Collections
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {favorites.map((product) => {
                const discount = Math.round((1 - product.price / product.originalPrice) * 100);
                const images = parseImages(product);
                const sizes = (() => { try { return JSON.parse(product.sizes || '[]'); } catch { return []; } })();
                const colors = (() => { try { return JSON.parse(product.colors || '[]'); } catch { return []; } })();

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all group overflow-hidden border border-gray-100 flex flex-col card-hover"
                  >
                    <div
                      className="relative h-64 bg-gray-50 cursor-pointer overflow-hidden"
                      onClick={() => router.push(`/products/${product.id}`)}
                    >
                      <Image
                        src={images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />

                      {discount > 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                          -{discount}%
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product);
                          showToast("Removed from Wishlist 💔");
                        }}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow text-red-500 hover:bg-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
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
                            className="w-full py-2.5 bg-white/95 backdrop-blur-md text-[var(--color-dark-rosegold)] font-medium rounded-xl shadow-lg hover:bg-[var(--color-dark-rosegold)] hover:text-white transition-colors flex items-center justify-center gap-2 text-xs"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            {sizes.length > 0 || colors.length > 0 ? 'View Options' : 'Quick Add'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col cursor-pointer" onClick={() => router.push(`/products/${product.id}`)}>
                      <span className="text-xs text-[var(--color-rosegold)] font-semibold mb-1">{product.category}</span>
                      <h3 className="font-medium text-gray-800 text-sm line-clamp-1 mb-2">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-[var(--color-gold)] text-[var(--color-gold)]" />
                        ))}
                        <span className="text-[10px] text-gray-400 ml-1">(24)</span>
                      </div>
                      <div className="mt-auto flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[var(--color-dark-rosegold)]">₹{product.price.toLocaleString('en-IN')}</span>
                          {product.originalPrice > product.price && (
                            <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
