"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors, ArrowLeft, ArrowRight, Check, Sparkles, CheckCircle2,
  Info, Shield, Truck, Heart, ShoppingBag, Ruler, FileText, ChevronRight
} from "lucide-react";
import { useShopStore, Product } from "@/store/store";

const STYLES = [
  { id: "blouse", name: "Saree Blouse", desc: "Traditional or modern designer blouses", basePrice: 999, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80" },
  { id: "kurti", name: "Kurti / Kameez", desc: "Custom fit long or short tunics", basePrice: 1199, img: "https://images.unsplash.com/photo-1594938298603-c8148c4b44f0?w=400&q=80" },
  { id: "anarkali", name: "Anarkali Suit", desc: "Grand flared floor-length ethnic suits", basePrice: 1999, img: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80" },
  { id: "lehenga", name: "Lehenga Gown", desc: "Wedding or party wear lehenga-cholis", basePrice: 2999, img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80" },
  { id: "gown", name: "Western Gown / Dress", desc: "Flowing gowns, evening wear, maxi dresses", basePrice: 1799, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80" },
];

const FABRICS = [
  "Silk (Banarasi / Raw)",
  "Georgette / Chiffon",
  "Premium Cotton / Linen",
  "Velvet",
  "Organza",
  "Crepe / Satin",
  "I will provide my own fabric (+ Free Pickup)"
];

const MEASUREMENTS_GUIDE: Record<string, { label: string; placeholder: string; desc: string }> = {
  bust: { label: "Bust (inches)", placeholder: "e.g. 36", desc: "Measure around the fullest part of your chest, keeping the tape level." },
  waist: { label: "Waist (inches)", placeholder: "e.g. 30", desc: "Measure around your natural waistline, typically the narrowest part." },
  hips: { label: "Hips (inches)", placeholder: "e.g. 40", desc: "Measure around the widest part of your hips/buttocks." },
  shoulders: { label: "Shoulder Width (inches)", placeholder: "e.g. 14.5", desc: "Measure from the edge of one shoulder bone to the other across your back." },
  sleeveLength: { label: "Sleeve Length (inches)", placeholder: "e.g. 15", desc: "Measure from the shoulder tip down to the desired sleeve length." },
  outfitLength: { label: "Total Length (inches)", placeholder: "e.g. 54", desc: "Measure from the collarbone down to where you want the hem to end." },
  neckDepthFront: { label: "Front Neck Depth (inches)", placeholder: "e.g. 6.5", desc: "Measure from the shoulder tip diagonally to the center front neckline." },
  neckDepthBack: { label: "Back Neck Depth (inches)", placeholder: "e.g. 7", desc: "Measure from the shoulder tip diagonally to the center back neckline." }
};

function TailorBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  // Form State
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedFabric, setSelectedFabric] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [measurements, setMeasurements] = useState<Record<string, string>>({
    bust: "", waist: "", hips: "", shoulders: "", sleeveLength: "", outfitLength: "", neckDepthFront: "", neckDepthBack: ""
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // Customization preferences
  const [liningNeeded, setLiningNeeded] = useState(true);
  const [sleeveStyle, setSleeveStyle] = useState("Regular Sleeves");
  const [necklineStyle, setNecklineStyle] = useState("V-Neck");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Contact Info
  const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "", address: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Fetch product if ID is provided
  useEffect(() => {
    if (!productId) return;
    setLoadingProduct(true);
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setTargetProduct(data);
          setSelectedStyle(data.name);
          // Set fabric and colors if possible
          if (data.fabric) setSelectedFabric(data.fabric);
          try {
            const colors = JSON.parse(data.colors || "[]");
            if (colors.length > 0) setSelectedColor(colors[0]);
          } catch {}
        }
        setLoadingProduct(false);
      })
      .catch(() => setLoadingProduct(false));
  }, [productId]);

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!productId && !selectedStyle) { alert("Please select a style type"); return false; }
      if (!selectedFabric) { alert("Please select a fabric"); return false; }
      if (!selectedColor) { alert("Please specify a color preference"); return false; }
      return true;
    }
    if (currentStep === 2) {
      const missing = Object.entries(measurements).filter(([_, v]) => !v.trim());
      if (missing.length > 0) {
        alert("Please fill in all the measurement fields for a perfect fit.");
        return false;
      }
      return true;
    }
    if (currentStep === 3) {
      if (!contactInfo.name.trim()) { alert("Please enter your name"); return false; }
      if (!contactInfo.phone.trim()) { alert("Please enter your phone number"); return false; }
      if (!contactInfo.email.trim()) { alert("Please enter your email"); return false; }
      if (!contactInfo.address.trim()) { alert("Please enter your shipping address"); return false; }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => (s + 1) as any);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setStep(s => (s - 1) as any);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    const customizationPayload = {
      measurements,
      styling: {
        sleeveStyle,
        necklineStyle,
        liningNeeded,
        fabric: selectedFabric,
        color: selectedColor,
      },
      instructions: specialInstructions,
      bookingType: targetProduct ? "Product Customization" : "Design from Scratch"
    };

    const orderPayload = {
      items: [
        {
          productId: targetProduct ? targetProduct.id : "custom-tailoring-scratch",
          quantity: 1,
          price: targetProduct ? targetProduct.price : 1499, // Base tailoring estimate or product price
          selectedSize: "Custom Fit",
          selectedColor: selectedColor,
          customization: JSON.stringify(customizationPayload)
        }
      ],
      customerName: contactInfo.name,
      customerEmail: contactInfo.email,
      customerPhone: contactInfo.phone,
      address: contactInfo.address,
      total: targetProduct ? targetProduct.price : 1499, // For scratch design, ₹1499 is base tailoring service charge
      notes: `Tailoring Booking - ${targetProduct ? 'Customizing ' + targetProduct.name : 'Garment from Scratch (' + selectedStyle + ')'}`
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      if (res.ok) {
        const order = await res.json();
        setCreatedOrder(order);
        setStep(4);
      } else {
        alert("Failed to submit booking. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 4 && createdOrder) {
    const whatsappMsg = encodeURIComponent(
      `Hello Elysian Fabrics! 🌸\n\nI just booked a Custom Tailoring service.\n*Tracking ID:* ${createdOrder.trackingId}\n*Name:* ${contactInfo.name}\n*Service Type:* ${targetProduct ? 'Customizing ' + targetProduct.name : 'Design from Scratch (' + selectedStyle + ')'}\n\n*Measurements Submitted:*\n` +
      Object.entries(measurements).map(([k, v]) => `- ${k.toUpperCase()}: ${v} inches`).join("\n") +
      `\n\n*Fabric Choice:* ${selectedFabric}\n*Color:* ${selectedColor}\n*Neckline Style:* ${necklineStyle}\n*Sleeve Style:* ${sleeveStyle}\n*Lining:* ${liningNeeded ? 'Required' : 'Not Needed'}\n\nPlease confirm my booking and schedule design alignment. Thank you!`
    );
    const shopPhone = "919000000000";

    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-serif text-[var(--color-dark-rosegold)] mb-3">Booking Submitted!</h1>
          <p className="text-gray-500 mb-8 font-light">Your custom measurements have been saved under Tracking ID:</p>
          
          <div className="bg-[var(--color-lightrose)] rounded-2xl p-6 mb-8 max-w-sm mx-auto">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 font-semibold">Your Tracking ID</p>
            <p className="text-3xl font-bold text-[var(--color-dark-rosegold)] font-mono">{createdOrder.trackingId}</p>
            <p className="text-xs text-gray-500 mt-2">Check progress anytime using our order tracker.</p>
          </div>

          <p className="text-sm text-gray-600 mb-8 leading-relaxed max-w-md mx-auto">
            🌸 <span className="font-semibold">Important Next Step:</span> To speed up design confirmation, click the button below to share your custom specification directly with our designers on WhatsApp.
          </p>

          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <a
              href={`https://wa.me/${shopPhone}?text=${whatsappMsg}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Confirm on WhatsApp
            </a>
            <button
              onClick={() => router.push(`/track?id=${createdOrder.trackingId}`)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-[var(--color-dark-rosegold)] rounded-full font-semibold transition-colors"
            >
              Track Order Status
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 text-gray-400 hover:text-gray-600 transition-colors text-sm"
            >
              Back to Homepage
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-[var(--color-lightrose)] border border-[var(--color-rosegold)]/20 rounded-full px-4 py-2 mb-4">
          <Scissors className="w-4 h-4 text-[var(--color-rosegold)]" />
          <span className="text-xs text-[var(--color-dark-rosegold)] font-medium">Bespoke Custom Tailoring</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-dark-rosegold)] mb-3">Custom Fit Boutique</h1>
        <p className="text-gray-500 font-light max-w-lg mx-auto leading-relaxed">
          Provide your style preference and exact measurements. Our artisan tailors will craft the outfit to look and fit flawlessly.
        </p>
      </div>

      {/* Stepper progress */}
      <div className="flex items-center justify-center mb-12 max-w-xl mx-auto">
        {[
          { num: 1, label: "Style & Fabric" },
          { num: 2, label: "Measurements" },
          { num: 3, label: "Contact Details" }
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                step === s.num
                  ? "bg-[var(--color-dark-rosegold)] text-white ring-4 ring-[var(--color-lightrose)]"
                  : step > s.num
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-400"
              }`}>
                {step > s.num ? <Check className="w-5 h-5" /> : s.num}
              </div>
              <span className={`text-xs mt-2 font-medium absolute -bottom-6 whitespace-nowrap ${step === s.num ? "text-[var(--color-dark-rosegold)] font-semibold" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
            {idx < 2 && (
              <div className={`flex-1 h-1 mx-4 rounded ${step > s.num ? "bg-green-300" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* Form area */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
          
          {/* STEP 1: STYLE & FABRIC */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-2xl font-serif text-gray-900 border-b pb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--color-rosegold)]" /> Style & Fabric Selections
              </h2>
              
              {loadingProduct ? (
                <div className="h-28 shimmer rounded-2xl" />
              ) : targetProduct ? (
                // Customizing a specific product
                <div className="flex gap-4 p-4 bg-[var(--color-lightrose)]/40 rounded-2xl border border-[var(--color-rosegold)]/10">
                  <div className="relative w-24 h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image src={targetProduct.image} alt={targetProduct.name} fill className="object-cover" />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--color-rosegold)] font-medium">Customizing Product</span>
                    <h3 className="font-semibold text-gray-800 text-lg">{targetProduct.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">We will tailor this specific item to your custom size measurements.</p>
                    <p className="font-bold text-[var(--color-dark-rosegold)] mt-2">₹{targetProduct.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ) : (
                // From scratch selections
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">1. Select Garment Style *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {STYLES.map(style => (
                      <div
                        key={style.id}
                        onClick={() => setSelectedStyle(style.name)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                          selectedStyle === style.name
                            ? "border-[var(--color-dark-rosegold)] bg-[var(--color-lightrose)]/40 shadow-md"
                            : "border-gray-100 hover:border-gray-300"
                        }`}
                      >
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={style.img} alt={style.name} fill className="object-cover" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-800 text-sm">{style.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{style.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fabric Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">2. Fabric Choice *</label>
                <select
                  value={selectedFabric}
                  onChange={e => setSelectedFabric(e.target.value)}
                  className="input-base"
                >
                  <option value="">-- Choose Fabric --</option>
                  {FABRICS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <p className="text-xs text-gray-400 mt-1">If choosing 'Provide My Own Fabric', we will arrange a complimentary pickup.</p>
              </div>

              {/* Color preference */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">3. Preferred Color / Shades *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Blue, Crimson Red, Light Pink with gold borders"
                  value={selectedColor}
                  onChange={e => setSelectedColor(e.target.value)}
                  className="input-base"
                />
              </div>

              {/* Additional Styling choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Neckline Style</label>
                  <select value={necklineStyle} onChange={e => setNecklineStyle(e.target.value)} className="input-base">
                    {["V-Neck", "Round Neck", "Boat Neck", "Square Neck", "Sweetheart", "High Collar / Mandarin", "Custom"].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sleeve Style</label>
                  <select value={sleeveStyle} onChange={e => setSleeveStyle(e.target.value)} className="input-base">
                    {["Sleeveless", "Short Sleeves (4-6 in)", "Elbow Length (10-12 in)", "3/4th Sleeves", "Full Sleeves", "Puff Sleeves", "Custom"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2 flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="lining"
                    checked={liningNeeded}
                    onChange={e => setLiningNeeded(e.target.checked)}
                    className="w-4 h-4 accent-[var(--color-rosegold)] rounded"
                  />
                  <label htmlFor="lining" className="text-sm text-gray-700 font-medium cursor-pointer">
                    Include inner lining fabric (recommeneded for sheer fabrics like georgette/net)
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-[var(--color-dark-rosegold)] hover:bg-[var(--color-deeprose)] text-white rounded-full font-medium shadow-md flex items-center gap-2"
                >
                  Enter Measurements <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: MEASUREMENTS */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-2xl font-serif text-gray-900 border-b pb-3 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-[var(--color-rosegold)]" /> Enter Measurements (inches)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(MEASUREMENTS_GUIDE).map(([key, data]) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{data.label} *</label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      placeholder={data.placeholder}
                      value={measurements[key]}
                      onFocus={() => setFocusedField(key)}
                      onChange={e => setMeasurements(f => ({ ...f, [key]: e.target.value }))}
                      className="input-base"
                    />
                  </div>
                ))}
              </div>

              <div className="p-4 bg-yellow-50/70 border border-yellow-100 rounded-2xl flex gap-3 text-sm text-yellow-800">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <span className="font-semibold">Need Help?</span> Please make measurements comfortable. Do not pull the tape too tight. If you need assistance, you can leave approximations and our tailoring coordinator will align over WhatsApp.
                </p>
              </div>

              <div className="pt-6 border-t flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-200 text-gray-600 rounded-full font-medium hover:bg-gray-50 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-[var(--color-dark-rosegold)] hover:bg-[var(--color-deeprose)] text-white rounded-full font-medium shadow-md flex items-center gap-2"
                >
                  Contact Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CONTACT DETAILS */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-2xl font-serif text-gray-900 border-b pb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--color-rosegold)]" /> Contact & Delivery Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="Enter your name"
                      value={contactInfo.name}
                      onChange={e => setContactInfo(c => ({ ...c, name: e.target.value }))}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number (WhatsApp) *</label>
                    <input
                      required
                      type="tel"
                      placeholder="e.g. +91 90000 00000"
                      value={contactInfo.phone}
                      onChange={e => setContactInfo(c => ({ ...c, phone: e.target.value }))}
                      className="input-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                  <input
                    required
                    type="email"
                    placeholder="you@email.com"
                    value={contactInfo.email}
                    onChange={e => setContactInfo(c => ({ ...c, email: e.target.value }))}
                    className="input-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Shipping Address *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="House No, Street, City, State, PIN Code"
                    value={contactInfo.address}
                    onChange={e => setContactInfo(c => ({ ...c, address: e.target.value }))}
                    className="input-base resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Special Instructions / Requests</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. border embroidery preferences, pocket placements, back zip or hooks, etc."
                    value={specialInstructions}
                    onChange={e => setSpecialInstructions(e.target.value)}
                    className="input-base resize-none"
                  />
                </div>

                <div className="pt-6 border-t flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 border border-gray-200 text-gray-600 rounded-full font-medium hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-10 py-3 bg-[var(--color-dark-rosegold)] hover:bg-[var(--color-deeprose)] text-white rounded-full font-semibold shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                    ) : (
                      <><Check className="w-5 h-5" /> Book Tailor Session</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

        </div>

        {/* Sidebar helper */}
        <div className="space-y-6">
          {/* Measurement Helper Card */}
          {step === 2 && focusedField && MEASUREMENTS_GUIDE[focusedField] && (
            <motion.div
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-xl border-2 border-[var(--color-rosegold)]/40 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-[var(--color-lightrose)] text-[var(--color-dark-rosegold)] text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl">
                Live Guide
              </div>
              <h3 className="font-serif text-lg text-[var(--color-dark-rosegold)] mb-2 flex items-center gap-2">
                <Ruler className="w-4 h-4" /> How to measure: {MEASUREMENTS_GUIDE[focusedField].label}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed font-light">
                {MEASUREMENTS_GUIDE[focusedField].desc}
              </p>
              <div className="mt-4 p-3 bg-gray-50 rounded-xl flex items-center gap-2 text-xs text-gray-400">
                <Info className="w-4 h-4 text-gray-400" /> Use a flexible cloth measuring tape. Keep it level and snug, but not tight.
              </div>
            </motion.div>
          )}

          {/* General info card */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <h3 className="font-serif text-lg text-gray-900 mb-4">Our Tailoring Process</h3>
            <div className="space-y-4 text-sm">
              {[
                { title: "1. Digital Booking", desc: "Submit details & measurements online." },
                { title: "2. Design Alignment", desc: "Our coordinator contacts you via WhatsApp to finalise styles." },
                { title: "3. Precision Crafting", desc: "Expert tailors draft pattern & handcraft your outfit." },
                { title: "4. Doorstep Delivery", desc: "We ship the final custom-tailored dress to you." }
              ].map(p => (
                <div key={p.title}>
                  <p className="font-semibold text-[var(--color-dark-rosegold)]">{p.title}</p>
                  <p className="text-gray-500 font-light text-xs mt-0.5">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quality badge card */}
          <div className="bg-[var(--color-lightrose)]/50 rounded-3xl p-6 border border-[var(--color-rosegold)]/20 space-y-4">
            {[
              { icon: Shield, title: "Perfect Fit Guarantee", desc: "Free alteration within 7 days if the fit is not perfectly to your measurements." },
              { icon: Truck, title: "Express Custom Delivery", desc: "Custom outfits crafted and dispatched within 10-12 business days." }
            ].map((badge, bi) => (
              <div key={bi} className="flex gap-3">
                <badge.icon className="w-5 h-5 text-[var(--color-rosegold)] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-800 text-xs">{badge.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed font-light">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TailorPage() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)] pt-32 pb-24">
      <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
        <TailorBookingContent />
      </Suspense>
    </div>
  );
}
