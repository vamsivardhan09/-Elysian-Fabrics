"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Heart, ShoppingBag, Truck, Shield, Scissors, ChevronLeft, ChevronRight, Check, Sparkles } from "lucide-react";
import { useShopStore, Product } from "@/store/store";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, toggleFavorite, isFavorite } = useShopStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"description" | "care" | "sizing">("description");

  // Hover Zoom Magnifier state
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

  // Related products state
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    fetch(`/api/products/${params.id}`)
      .then(r => r.json())
      .then(data => { 
        if (data.error) {
          setProduct(null);
        } else {
          setProduct(data);
          // Fetch related products in category
          fetch(`/api/products?category=${encodeURIComponent(data.category)}`)
            .then(res => res.json())
            .then(all => {
              if (Array.isArray(all)) {
                setRelatedProducts(all.filter((p: Product) => p.id !== data.id).slice(0, 4));
              }
            })
            .catch(() => {});
        }
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[var(--color-rosegold)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading product...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl text-gray-600 mb-4 font-serif">Product not found</p>
        <button onClick={() => router.push('/')} className="px-6 py-3 bg-[var(--color-dark-rosegold)] text-white rounded-full">Go Back</button>
      </div>
    </div>
  );

  const images = (() => { try { const arr = JSON.parse(product.images || '[]'); return arr.length > 0 ? arr : [product.image]; } catch { return [product.image]; } })();
  const sizes = (() => { try { return JSON.parse(product.sizes || '[]'); } catch { return []; } })();
  const colors = (() => { try { return JSON.parse(product.colors || '[]'); } catch { return []; } })();
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  const fav = isFavorite(product.id);

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) { showToast("Please select a size"); return; }
    if (colors.length > 0 && !selectedColor) { showToast("Please select a color"); return; }
    
    // Check stock
    if (product.stock !== undefined && product.stock <= 0) {
      showToast("Sorry, this item is out of stock.");
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product, { size: selectedSize || undefined, color: selectedColor || undefined });
    }
    showToast(`Added ${quantity} item(s) to cart! 🛍️`);
  };

  const colorMap: Record<string, string> = {
    Red: "#ef4444", Blue: "#3b82f6", Green: "#22c55e", Pink: "#ec4899",
    Purple: "#a855f7", Yellow: "#eab308", Orange: "#f97316", Black: "#111827",
    White: "#f9fafb", Brown: "#92400e", Gold: "#d97706", Silver: "#9ca3af",
    Teal: "#14b8a6", Maroon: "#7f1d1d", Navy: "#1e3a5f", Beige: "#d4b896",
    Peach: "#ffdab9", Lavender: "#e6e6fa", Rose: "#fb7185", Coral: "#f87171",
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-0 left-1/2 z-[100] flex items-center gap-3 bg-white/95 backdrop-blur-md text-[var(--color-dark-rosegold)] px-6 py-4 rounded-full shadow-2xl border border-[var(--color-rosegold)]/20"
          >
            <Check className="w-5 h-5 text-green-500" />
            <span className="font-medium">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-[var(--color-rosegold)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Back</span>
          </button>
          <span className="font-serif text-xl text-[var(--color-dark-rosegold)] font-bold cursor-pointer" onClick={() => router.push('/')}>
            Elysian Fabrics
          </span>
          <div className="flex items-center gap-4">
            <button onClick={() => { toggleFavorite(product); showToast(fav ? "Removed from favorites" : "Added to favorites ❤️"); }}>
              <Heart className={`w-5 h-5 transition-colors ${fav ? 'text-red-500 fill-current' : 'text-gray-600 hover:text-red-500'}`} />
            </button>
            <button className="relative" onClick={() => router.push('/cart')}>
              <ShoppingBag className="w-5 h-5 text-gray-600 hover:text-[var(--color-rosegold)]" />
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <span className="cursor-pointer hover:text-[var(--color-rosegold)]" onClick={() => router.push('/')}>Home</span>
          <span>/</span>
          <span className="cursor-pointer hover:text-[var(--color-rosegold)]" onClick={() => router.push('/')}>
            {product.category}
          </span>
          <span>/</span>
          <span className="text-gray-700 line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Image Gallery with Magnifier */}
          <div className="space-y-4">
            <motion.div
              className="relative h-[480px] md:h-[580px] rounded-3xl overflow-hidden bg-gray-55 shadow-xl cursor-zoom-in border border-white"
              key={selectedImage}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <Image
                src={images[selectedImage] || product.image}
                alt={product.name}
                fill 
                className="object-cover transition-transform duration-100 ease-out"
                style={{
                  transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
                  transformOrigin: isZoomed ? `${zoomPos.x}% ${zoomPos.y}%` : 'center',
                }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg">
                  -{discount}% OFF
                </div>
              )}
              
              {product.stock !== undefined && product.stock === 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white text-gray-700 font-bold text-lg px-6 py-3 rounded-full">Out of Stock</span>
                </div>
              )}
              
              {product.stock !== undefined && product.stock > 0 && product.stock < 5 && (
                <div className="absolute bottom-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-xl shadow">
                  Only {product.stock} units left!
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(i => (i - 1 + images.length) % images.length); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(i => (i + 1) % images.length); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
            </motion.div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-[var(--color-rosegold)] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="inline-block bg-[var(--color-lightrose)] text-[var(--color-rosegold)] text-xs font-semibold px-3 py-1 rounded-full mb-3">
                {product.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-serif text-gray-950 mb-3">{product.name}</h1>
              {product.fabric && <p className="text-sm text-gray-500 mb-3">Fabric: <span className="font-semibold text-gray-700">{product.fabric}</span></p>}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[var(--color-gold)] text-[var(--color-gold)]" />)}
              </div>
              <span className="text-xs text-gray-400 font-sans">4.8 (24 Verified Reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-extrabold text-[var(--color-dark-rosegold)]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  <span className="bg-green-150 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">
                    Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>

            {/* Color Picker */}
            {colors.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-800">Color</span>
                  {selectedColor && <span className="text-xs text-[var(--color-rosegold)] font-bold">{selectedColor}</span>}
                </div>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color: string) => (
                    <button
                      key={color}
                      title={color}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-9 h-9 rounded-full border-2 transition-all ${selectedColor === color ? 'border-[var(--color-dark-rosegold)] scale-110 shadow-lg' : 'border-gray-200 hover:scale-105'}`}
                      style={{ backgroundColor: colorMap[color] || '#ccc' }}
                    >
                      {selectedColor === color && (
                        <Check className={`w-4 h-4 absolute inset-0 m-auto ${['White', 'Beige', 'Yellow', 'Lavender', 'Peach'].includes(color) ? 'text-gray-700' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Picker */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-800">Size</span>
                  <button className="text-xs text-[var(--color-rosegold)] underline font-medium">Sizing Charts</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${selectedSize === size
                        ? 'border-[var(--color-dark-rosegold)] bg-[var(--color-dark-rosegold)] text-white shadow-md'
                        : 'border-gray-200 text-gray-500 hover:border-[var(--color-rosegold)] hover:text-[var(--color-rosegold)]'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <span className="text-sm font-semibold text-gray-800 block mb-3">Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-[var(--color-rosegold)] hover:text-[var(--color-rosegold)] transition-colors font-bold"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold text-base">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-[var(--color-rosegold)] hover:text-[var(--color-rosegold)] transition-colors font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                disabled={product.stock !== undefined && product.stock <= 0}
                onClick={handleAddToCart}
                className="flex-1 py-4 bg-[var(--color-dark-rosegold)] text-white rounded-full font-semibold hover:bg-[var(--color-deeprose)] transition-all shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                {product.stock !== undefined && product.stock > 0 ? 'Add to Shopping Cart' : 'Out of Stock'}
              </button>
              <button
                onClick={() => router.push(`/tailor?productId=${product.id}`)}
                className="flex-1 py-4 border-2 border-[var(--color-rosegold)] text-[var(--color-dark-rosegold)] rounded-full font-semibold hover:bg-[var(--color-rosegold)] hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Scissors className="w-4 h-4" />
                Bespoke Stitching Fit
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-8 p-4 bg-[var(--color-lightrose)] rounded-2xl">
              {[
                { icon: Truck, text: "COD Available\nFree over ₹999" },
                { icon: Shield, text: "7-Day\nAlteration Guarantees" },
                { icon: Sparkles, text: "Authentic Handpicked\nFabrics" },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1.5">
                  <b.icon className="w-4.5 h-4.5 text-[var(--color-rosegold)]" />
                  <p className="text-[10px] text-gray-600 whitespace-pre-line font-medium leading-relaxed">{b.text}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-t pt-6">
              <div className="flex gap-6 border-b mb-4">
                {(['description', 'care', 'sizing'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-xs font-semibold capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-[var(--color-rosegold)] text-[var(--color-dark-rosegold)]' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                  >
                    {tab === 'description' ? 'Description' : tab === 'care' ? 'Care Instructions' : 'Size Measurements'}
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-600 leading-relaxed font-light font-sans">
                {activeTab === 'description' && (
                  <p>{product.description || "A beautiful, premium quality garment crafted with care. Perfect for any occasion — from casual outings to festive celebrations."}</p>
                )}
                {activeTab === 'care' && (
                  <div>
                    {product.careInstr ? (
                      <p>{product.careInstr}</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {["Dry clean or gentle hand wash only", "Do not wring or tumble dry", "Iron on low heat with a cloth barrier", "Store in a cool, dry place away from sunlight"].map(c => (
                          <li key={c} className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0" />{c}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {activeTab === 'sizing' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-center text-[10px] border-collapse font-sans">
                      <thead>
                        <tr className="bg-[var(--color-lightrose)]">
                          {['Size', 'Chest (in)', 'Waist (in)', 'Hip (in)', 'Length (in)'].map(h => (
                            <th key={h} className="px-3 py-2 border border-[var(--color-rosegold)]/20 text-[var(--color-dark-rosegold)] font-bold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[['XS', '32', '26', '35', '52'], ['S', '34', '28', '37', '53'], ['M', '36', '30', '39', '53'], ['L', '38', '32', '41', '54'], ['XL', '40', '34', '43', '54'], ['XXL', '42', '36', '45', '55']].map(row => (
                          <tr key={row[0]} className={`border border-gray-150 ${selectedSize === row[0] ? 'bg-[var(--color-lightrose)] font-bold' : 'hover:bg-gray-50'}`}>
                            {row.map((cell, ci) => <td key={ci} className="px-3 py-2 border border-gray-100">{cell}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <div className="border-t pt-16">
            <h2 className="text-2xl font-serif text-[var(--color-dark-rosegold)] font-bold mb-8 text-center sm:text-left">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => {
                const disc = Math.round((1 - p.price / p.originalPrice) * 100);
                const isOutOfStock = p.stock !== undefined && p.stock === 0;

                return (
                  <div 
                    key={p.id}
                    onClick={() => { router.push(`/products/${p.id}`); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col card-hover cursor-pointer"
                  >
                    <div className="relative h-56 bg-gray-50">
                      <Image src={p.image} alt={p.name} fill className="object-cover" sizes="180px" />
                      {disc > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          -{disc}%
                        </div>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-white text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] text-[var(--color-rosegold)] font-bold uppercase">{p.category}</span>
                        <h4 className="font-bold text-gray-800 text-xs line-clamp-1 mt-0.5 mb-1">{p.name}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[var(--color-dark-rosegold)] text-xs">₹{p.price.toLocaleString('en-IN')}</span>
                        {p.originalPrice > p.price && (
                          <span className="text-[9px] text-gray-400 line-through">₹{p.originalPrice.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
