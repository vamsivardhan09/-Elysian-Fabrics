"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Star, Heart, ShoppingBag, Truck, Shield, Scissors, 
  ChevronLeft, ChevronRight, Check, Sparkles, Plus, Minus, ChevronDown, ChevronUp
} from "lucide-react";
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
  
  // Custom Fit States
  const [fitType, setFitType] = useState<"standard" | "custom" | "send_material">("standard");
  const [customBust, setCustomBust] = useState("");
  const [customWaist, setCustomWaist] = useState("");
  const [customHips, setCustomHips] = useState("");
  const [customSleeve, setCustomSleeve] = useState("");
  const [customShoulder, setCustomShoulder] = useState("");
  const [customLength, setCustomLength] = useState("");
  const [customNeckline, setCustomNeckline] = useState("Round Neck");
  const [courierName, setCourierName] = useState("");
  const [courierTracking, setCourierTracking] = useState("");
  const [shopSettings, setShopSettings] = useState({
    shopName: "Elysian Custom Boutique",
    shopAddress: "Plot 42, Shilpa Hills, Madhapur, Hyderabad, Telangana, 500081",
    contactPhone: "+91 98765 43210"
  });

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (!data.error) setShopSettings(data);
      })
      .catch(() => {});
  }, []);

  const renderFitSelection = (isMobile: boolean) => {
    return (
      <div className="space-y-4 border-t border-gray-150 pt-4 mt-4 text-left">
        <div>
          <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-gray-800 block mb-2`}>Choose Fit Option</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "standard", label: "Standard Size", price: "" },
              { id: "custom", label: "Custom Stitching", price: "+₹499" },
              { id: "send_material", label: "Send Material", price: "+₹399" }
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFitType(opt.id as any)}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                  fitType === opt.id
                    ? "border-[var(--color-dark-rosegold)] bg-[var(--color-lightrose)] text-[var(--color-dark-rosegold)] font-bold shadow-sm"
                    : "border-gray-200 text-gray-500 bg-white hover:border-[var(--color-rosegold)]"
                }`}
              >
                <span className="text-[10px] sm:text-xs block leading-tight">{opt.label}</span>
                {opt.price && <span className="text-[9px] mt-0.5 text-gray-400 block">{opt.price}</span>}
              </button>
            ))}
          </div>
        </div>

        {fitType === "standard" && sizes.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-gray-600">Select Standard Size</span>
              <span className="text-[9px] text-[var(--color-rosegold)] font-semibold underline cursor-pointer">Size Chart</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {sizes.map((size: string) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    selectedSize === size
                      ? "border-[var(--color-dark-rosegold)] bg-[var(--color-dark-rosegold)] text-white shadow-sm"
                      : "border-gray-200 text-gray-500 bg-white hover:border-[var(--color-rosegold)]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {fitType === "custom" && (
          <div className="bg-[var(--color-lightrose)]/40 p-4 rounded-2xl border border-[var(--color-rosegold)]/10 space-y-3">
            <h4 className="text-xs font-bold text-[var(--color-dark-rosegold)] flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5" /> Bespoke Measurements (inches)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label className="block text-gray-500 mb-0.5 font-medium">Bust *</label>
                <input type="number" placeholder="e.g. 36" value={customBust} onChange={e => setCustomBust(e.target.value)} className="w-full bg-white border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--color-rosegold)]" />
              </div>
              <div>
                <label className="block text-gray-500 mb-0.5 font-medium">Waist *</label>
                <input type="number" placeholder="e.g. 30" value={customWaist} onChange={e => setCustomWaist(e.target.value)} className="w-full bg-white border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--color-rosegold)]" />
              </div>
              <div>
                <label className="block text-gray-500 mb-0.5 font-medium">Hips *</label>
                <input type="number" placeholder="e.g. 40" value={customHips} onChange={e => setCustomHips(e.target.value)} className="w-full bg-white border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--color-rosegold)]" />
              </div>
              <div>
                <label className="block text-gray-500 mb-0.5 font-medium">Sleeve *</label>
                <input type="number" placeholder="e.g. 15" value={customSleeve} onChange={e => setCustomSleeve(e.target.value)} className="w-full bg-white border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--color-rosegold)]" />
              </div>
              <div>
                <label className="block text-gray-500 mb-0.5 font-medium">Shoulders *</label>
                <input type="number" placeholder="e.g. 14.5" value={customShoulder} onChange={e => setCustomShoulder(e.target.value)} className="w-full bg-white border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--color-rosegold)]" />
              </div>
              <div>
                <label className="block text-gray-500 mb-0.5 font-medium">Outfit Length *</label>
                <input type="number" placeholder="e.g. 54" value={customLength} onChange={e => setCustomLength(e.target.value)} className="w-full bg-white border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--color-rosegold)]" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1 font-medium">Neckline Style *</label>
              <select value={customNeckline} onChange={e => setCustomNeckline(e.target.value)} className="w-full bg-white border rounded-lg px-2 py-1.5 focus:outline-none focus:border-[var(--color-rosegold)] text-xs">
                {["Round Neck", "V-Neck", "Boat Neck", "Square Neck", "Sweetheart", "High Collar / Mandarin"].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {fitType === "send_material" && (
          <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50 space-y-3">
            <div>
              <h4 className="text-[10px] font-bold text-[var(--color-dark-rosegold)] uppercase tracking-wider mb-0.5">Boutique Shipping Address</h4>
              <p className="text-[11px] text-gray-800 font-semibold">{shopSettings.shopName}</p>
              <p className="text-[11px] text-gray-500 font-light leading-relaxed mt-0.5">{shopSettings.shopAddress}</p>
              <p className="text-[10px] text-gray-400 mt-1">Phone: {shopSettings.contactPhone}</p>
            </div>
            
            <div className="border-t border-rose-100/40 pt-3 space-y-2 text-[11px]">
              <div>
                <label className="block text-gray-500 mb-0.5 font-medium">Outgoing Courier/Carrier *</label>
                <input type="text" placeholder="e.g. India Post, BlueDart" value={courierName} onChange={e => setCourierName(e.target.value)} className="w-full bg-white border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--color-rosegold)]" />
              </div>
              <div>
                <label className="block text-gray-500 mb-0.5 font-medium">Outgoing Tracking ID *</label>
                <input type="text" placeholder="e.g. EM123456789IN" value={courierTracking} onChange={e => setCourierTracking(e.target.value)} className="w-full bg-white border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--color-rosegold)]" />
              </div>
            </div>
            <p className="text-[10px] text-rose-800 bg-rose-50 p-2 rounded-lg leading-snug">
              <strong>Note:</strong> Write the Order ID (provided after checkout) on your package and place a printed order slip inside the package.
            </p>
          </div>
        )}
      </div>
    );
  };

  // Tabs for desktop
  const [activeTab, setActiveTab] = useState<"description" | "care" | "sizing">("description");

  // Mobile Accordion state
  const [accordions, setAccordions] = useState({
    description: true,
    care: false,
    sizing: false
  });

  // Hover Zoom Magnifier state (desktop)
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
    if (fitType === "standard" && sizes.length > 0 && !selectedSize) { showToast("Please select a size"); return false; }
    if (colors.length > 0 && !selectedColor) { showToast("Please select a color"); return false; }
    
    // Check stock
    if (product.stock !== undefined && product.stock <= 0) {
      showToast("Sorry, this item is out of stock.");
      return false;
    }

    let itemPrice = product.price;
    let customizationData = null;

    if (fitType === "custom") {
      itemPrice += 499;
      if (!customBust || !customWaist || !customHips || !customSleeve || !customShoulder || !customLength) {
        showToast("Please fill all measurements for Custom Stitching");
        return false;
      }
      customizationData = JSON.stringify({
        type: "custom_stitching",
        measurements: {
          bust: customBust,
          waist: customWaist,
          hips: customHips,
          sleeveLength: customSleeve,
          shoulders: customShoulder,
          outfitLength: customLength,
          necklineStyle: customNeckline
        }
      });
    } else if (fitType === "send_material") {
      itemPrice += 399;
      if (!courierName || !courierTracking) {
        showToast("Please fill courier name and tracking ID");
        return false;
      }
      customizationData = JSON.stringify({
        type: "send_material",
        courierName,
        courierTracking
      });
    }

    const productToCart = {
      ...product,
      price: itemPrice
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(productToCart, { 
        size: fitType === "standard" ? selectedSize : "Custom Fit", 
        color: selectedColor || undefined,
        customization: customizationData || undefined
      });
    }
    showToast(`Added to cart! 🛍️`);
    return true;
  };

  const handleBuyNow = () => {
    const success = handleAddToCart();
    if (success) {
      router.push("/cart");
    }
  };

  const toggleAccordion = (tab: "description" | "care" | "sizing") => {
    setAccordions(prev => ({ ...prev, [tab]: !prev[tab] }));
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
            className="fixed top-0 left-1/2 z-[100] flex items-center gap-3 bg-white/95 backdrop-blur-md text-[var(--color-dark-rosegold)] px-6 py-4 rounded-full shadow-2xl border border-[var(--color-rosegold)]/20 text-xs font-semibold"
          >
            <Check className="w-4 h-4 text-green-500" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MOBILE DETAIL VIEW (Visible on md:hidden viewport)             */}
      {/* ============================================================== */}
      <div className="block md:hidden pb-24">
        {/* Floating Back Button & Wishlist on image */}
        <div className="relative w-full h-[400px] bg-white">
          <Image 
            src={images[selectedImage] || product.image} 
            alt={product.name} 
            fill 
            className="object-cover" 
            sizes="100vw"
            priority
          />
          
          {/* Floating Back Icon */}
          <button 
            onClick={() => router.back()}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Floating Wishlist Icon */}
          <button 
            onClick={() => { toggleFavorite(product); showToast(fav ? "Removed from wishlist" : "Added to wishlist ❤️"); }}
            className={`absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer ${
              fav ? "text-red-500" : "text-gray-400"
            }`}
          >
            <Heart className={`w-5 h-5 ${fav ? "fill-current" : ""}`} />
          </button>

          {/* Carousel dots */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/35 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {images.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    selectedImage === idx ? "bg-white w-3" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          {discount > 0 && (
            <span className="absolute bottom-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              -{discount}% OFF
            </span>
          )}
        </div>

        {/* Thumbnail Selector */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-4 py-2.5 bg-white border-b border-gray-100">
            {images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 transition-all ${
                  selectedImage === idx ? "border-[var(--color-rosegold)] ring-1 ring-[var(--color-rosegold)]" : "border-gray-200"
                }`}
              >
                <Image src={img} alt="" width={56} height={56} className="object-cover h-full" />
              </button>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-white p-4 mb-3 border-b">
          <span className="text-[10px] bg-[var(--color-lightrose)] text-[var(--color-rosegold)] uppercase font-extrabold px-2.5 py-0.5 rounded-full mb-2.5 inline-block">
            {product.category}
          </span>
          <h1 className="text-lg font-bold text-gray-900 leading-tight mb-1">{product.name}</h1>
          
          {product.fabric && (
            <span className="text-[10px] text-gray-400 block mb-2">
              Fabric: <span className="font-semibold text-gray-600">{product.fabric}</span>
            </span>
          )}

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[var(--color-gold)] text-[var(--color-gold)]" />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">(24 Verified Reviews)</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[var(--color-dark-rosegold)]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-md">
                  Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Selectors */}
        <div className="bg-white p-4 mb-3 border-b space-y-4">
          {/* Colors */}
          {colors.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-800">Select Color</span>
                {selectedColor && <span className="text-xs text-[var(--color-rosegold)] font-bold">{selectedColor}</span>}
              </div>
              <div className="flex gap-3 flex-wrap">
                {colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`relative w-8 h-8 rounded-full border border-gray-200 transition-all ${
                      selectedColor === color ? "ring-2 ring-[var(--color-dark-rosegold)] scale-105" : ""
                    }`}
                    style={{ backgroundColor: colorMap[color] || '#ccc' }}
                  >
                    {selectedColor === color && (
                      <Check className={`w-3.5 h-3.5 absolute inset-0 m-auto ${['White', 'Beige', 'Yellow', 'Lavender', 'Peach'].includes(color) ? "text-gray-700" : "text-white"}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Fit / Size Picker */}
          {renderFitSelection(true)}

          {/* Quantity */}
          <div>
            <span className="text-xs font-bold text-gray-800 block mb-2">Quantity</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-gray-500 bg-gray-50"
              >
                −
              </button>
              <span className="font-semibold text-sm w-4 text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-gray-500 bg-gray-50"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Accordions */}
        <div className="bg-white border-t border-b mb-3">
          {/* Description */}
          <div className="border-b">
            <button 
              onClick={() => toggleAccordion("description")}
              className="w-full py-3.5 px-4 flex justify-between items-center text-xs font-bold text-gray-800"
            >
              <span>Product Description</span>
              {accordions.description ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {accordions.description && (
              <div className="px-4 pb-4 text-[11px] text-gray-500 leading-relaxed font-light">
                {product.description || "A beautiful, premium quality garment crafted with care. Perfect for any occasion — from casual outings to festive celebrations."}
              </div>
            )}
          </div>

          {/* Fabric details & Care */}
          <div className="border-b">
            <button 
              onClick={() => toggleAccordion("care")}
              className="w-full py-3.5 px-4 flex justify-between items-center text-xs font-bold text-gray-800"
            >
              <span>Fabric & Care Instructions</span>
              {accordions.care ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {accordions.care && (
              <div className="px-4 pb-4 text-[11px] text-gray-500 leading-relaxed font-light">
                {product.careInstr ? (
                  <p>{product.careInstr}</p>
                ) : (
                  <ul className="space-y-1">
                    <li>• Dry clean or gentle hand wash only</li>
                    <li>• Do not wring or tumble dry</li>
                    <li>• Iron on low heat with a cloth barrier</li>
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Sizing Chart */}
          <div>
            <button 
              onClick={() => toggleAccordion("sizing")}
              className="w-full py-3.5 px-4 flex justify-between items-center text-xs font-bold text-gray-800"
            >
              <span>Sizing Measurements</span>
              {accordions.sizing ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {accordions.sizing && (
              <div className="px-4 pb-4 overflow-x-auto">
                <table className="w-full text-center text-[10px] border-collapse font-sans">
                  <thead>
                    <tr className="bg-[var(--color-lightrose)]">
                      {['Size', 'Chest (in)', 'Waist (in)', 'Hip (in)'].map(h => (
                        <th key={h} className="px-2 py-1.5 border border-[var(--color-rosegold)]/15 text-[var(--color-dark-rosegold)] font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[['XS', '32', '26', '35'], ['S', '34', '28', '37'], ['M', '36', '30', '39'], ['L', '38', '32', '41'], ['XL', '40', '34', '43']].map(row => (
                      <tr key={row[0]} className={`border border-gray-100 ${selectedSize === row[0] ? 'bg-[var(--color-lightrose)] font-bold' : ''}`}>
                        {row.map((cell, ci) => <td key={ci} className="px-2 py-1.5 border border-gray-50">{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Tailor booking quick redirect */}
        <div className="px-4 py-2 mb-6">
          <div 
            onClick={() => router.push(`/tailor?productId=${product.id}`)}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-[var(--color-dark-rosegold)]/10 to-[var(--color-rosegold)]/5 border border-[var(--color-rosegold)]/20 rounded-2xl cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-rosegold)]/25 flex items-center justify-center">
                <Scissors className="w-4.5 h-4.5 text-[var(--color-dark-rosegold)]" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">Request Custom Stitching</p>
                <p className="text-[10px] text-gray-500">Provide bespoke tailor measurements</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Related Products list */}
        {relatedProducts.length > 0 && (
          <div className="px-4 pt-4">
            <h3 className="font-serif text-base font-bold text-[var(--color-dark-rosegold)] mb-3">You May Also Like</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {relatedProducts.map(p => {
                const disc = Math.round((1 - p.price / p.originalPrice) * 100);
                return (
                  <div 
                    key={p.id} 
                    onClick={() => { router.push(`/products/${p.id}`); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="w-36 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0 cursor-pointer"
                  >
                    <div className="relative h-36 bg-gray-50">
                      <Image src={p.image} alt={p.name} fill className="object-cover" sizes="140px" />
                      {disc > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded shadow-sm">
                          -{disc}%
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <h4 className="text-[10px] font-bold text-gray-800 line-clamp-1 mb-0.5">{p.name}</h4>
                      <p className="text-xs font-extrabold text-[var(--color-dark-rosegold)]">₹{p.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. FIXED BOTTOM BUTTON BAR ON MOBILE */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 px-4 py-2.5 z-40 flex gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <button 
            onClick={handleAddToCart}
            className="flex-1 h-full bg-white border border-[var(--color-rosegold)] text-[var(--color-dark-rosegold)] font-bold rounded-xl text-xs active:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" /> Add to Bag
          </button>
          <button 
            onClick={handleBuyNow}
            className="flex-1 h-full bg-[var(--color-dark-rosegold)] text-white font-bold rounded-xl text-xs active:bg-[var(--color-deeprose)] flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[var(--color-rosegold)]/20"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* DESKTOP DETAIL VIEW (Visible on md:block viewport)            */}
      {/* ============================================================== */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

              {/* Custom Fit / Size Picker */}
              {renderFitSelection(false)}

              {/* Quantity */}
              <div className="mb-6">
                <span className="text-sm font-semibold text-gray-800 block mb-3">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-655 hover:border-[var(--color-rosegold)] hover:text-[var(--color-rosegold)] transition-colors font-bold"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-655 hover:border-[var(--color-rosegold)] hover:text-[var(--color-rosegold)] transition-colors font-bold"
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
                  className="flex-1 py-4 border-2 border-[var(--color-rosegold)] text-[var(--color-dark-rosegold)] rounded-full font-semibold hover:bg-[var(--color-rosegold)] hover:text-white transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
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
                            <span className="text-[9px] text-gray-405 line-through">₹{p.originalPrice.toLocaleString('en-IN')}</span>
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
    </div>
  );
}
