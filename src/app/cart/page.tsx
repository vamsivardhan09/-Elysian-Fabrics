"use client";

import { useState, useEffect } from "react";
import { useShopStore } from "@/store/store";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ArrowLeft, ShoppingBag, Tag, Truck, CheckCircle2, Scissors } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useShopStore();
  const { data: session } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    address: "", 
    city: "", 
    state: "", 
    pincode: "" 
  });
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [placedOrder, setPlacedOrder] = useState<{ trackingId: string; total: number } | null>(null);

  // Auto-fill user details if logged in
  useEffect(() => {
    if (session?.user) {
      setFormData(f => ({
        ...f,
        name: session.user?.name || "",
        email: session.user?.email || ""
      }));
    }
  }, [session]);

  const subtotal = getCartTotal();
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);

    const combinedAddress = `${formData.address.trim()}, ${formData.city.trim()}, ${formData.state.trim()} - ${formData.pincode.trim()}`;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
            customization: item.customization,
          })),
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          address: combinedAddress,
          total,
          userId: session?.user ? (session.user as any).id : null, // Link order to customer profile
        }),
      });

      if (res.ok) {
        const order = await res.json();
        clearCart();
        setPlacedOrder({ trackingId: order.trackingId, total: order.total });
        setStep("success");
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "success" && placedOrder) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-green-55 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-50"
          >
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </motion.div>
          <h1 className="text-3xl font-serif text-[var(--color-dark-rosegold)] mb-3 font-bold">Order Confirmed!</h1>
          <p className="text-gray-400 mb-6 font-light text-sm">Thank you for your order. Payment mode is Cash on Delivery (COD).</p>
          
          <div className="bg-[var(--color-lightrose)] rounded-2xl p-5 mb-6">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-semibold">Your Tracking ID</p>
            <p className="text-2xl font-bold text-[var(--color-dark-rosegold)] font-mono">{placedOrder.trackingId}</p>
            <p className="text-xs text-gray-500 mt-2 font-medium">Order Total: <span>₹{placedOrder.total.toLocaleString('en-IN')}</span></p>
          </div>

          <p className="text-xs text-gray-400 mb-8 font-light">Please save this tracking ID. You can check progress inside your account profile or on the tracker page.</p>

          <div className="space-y-3">
            <button
              onClick={() => router.push(`/track?id=${placedOrder.trackingId}`)}
              className="w-full py-3 bg-[var(--color-dark-rosegold)] text-white rounded-full font-semibold hover:bg-[var(--color-deeprose)] transition-colors shadow-md text-sm"
            >
              Track Order Status
            </button>
            <button
              onClick={() => {
                const shopPhone = "919000000000";
                const text = encodeURIComponent(`Hello Elysian Fabrics! 🌸\n\nI just placed a COD order.\n*Tracking ID:* ${placedOrder.trackingId}\n*Total:* ₹${placedOrder.total.toLocaleString('en-IN')}\n*Name:* ${formData.name}\n\nPlease verify my order. Thank you!`);
                window.open(`https://wa.me/${shopPhone}?text=${text}`, "_blank");
              }}
              className="w-full py-3 border-2 border-green-500 text-green-600 rounded-full font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              Confirm on WhatsApp
            </button>
            <button onClick={() => router.push("/")} className="w-full py-3 text-gray-400 hover:text-gray-650 transition-colors text-xs font-medium">
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb nav */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.push("/")} className="flex items-center text-gray-400 hover:text-[var(--color-rosegold)] transition-colors text-xs font-semibold">
            <ArrowLeft className="w-4 h-4 mr-1" /> Continue Shopping
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-xs text-gray-700 font-semibold">Shopping Bag</span>
          {step === "checkout" && <><span className="text-gray-300">/</span><span className="text-xs text-[var(--color-rosegold)] font-bold">Secure Checkout</span></>}
        </div>

        <h1 className="text-3xl md:text-4xl font-serif text-[var(--color-dark-rosegold)] font-bold mb-8">
          {step === "checkout" ? "Secure Checkout" : "Shopping Bag"}
          {cart.length > 0 && step === "cart" && <span className="text-sm text-gray-400 ml-3 font-sans font-normal">({cart.reduce((s, i) => s + i.quantity, 0)} Items)</span>}
        </h1>

        {cart.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24 bg-white rounded-3xl shadow-sm border">
            <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-6" />
            <p className="text-xl text-gray-600 mb-2 font-medium">Your shopping bag is empty</p>
            <p className="text-gray-400 mb-8 font-light text-sm">Save products to wishlist or browse the collections</p>
            <button onClick={() => router.push("/")} className="px-10 py-3.5 bg-[var(--color-dark-rosegold)] text-white rounded-full font-semibold hover:bg-[var(--color-deeprose)] transition-colors shadow-lg">
              Explore Collection
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items / Checkout Form */}
            <div className="lg:col-span-2">
              {step === "cart" ? (
                <div className="space-y-4">
                  <AnimatePresence>
                    {cart.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-4"
                      >
                        <div
                          className="relative w-20 h-28 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 cursor-pointer"
                          onClick={() => router.push(`/products/${item.productId}`)}
                        >
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="font-semibold text-gray-900 cursor-pointer hover:text-[var(--color-rosegold)] text-sm" onClick={() => router.push(`/products/${item.productId}`)}>
                            {item.name}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1.5 justify-center sm:justify-start">
                            {item.selectedSize && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">Size: {item.selectedSize}</span>}
                            {item.selectedColor && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">Color: {item.selectedColor}</span>}
                          </div>
                          {item.customization && <p className="text-[10px] text-[var(--color-rosegold)] mt-2 font-medium">Bespoke: {item.customization}</p>}
                          <p className="font-extrabold text-[var(--color-dark-rosegold)] mt-2 text-sm">₹{item.price.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-gray-200 rounded-full px-2 py-0.5 bg-gray-50">
                            <button onClick={() => {
                              if (item.quantity === 1) removeFromCart(item.id);
                              else updateQuantity(item.id, item.quantity - 1);
                            }} className="px-2 text-gray-500 hover:text-black font-bold text-sm">−</button>
                            <span className="px-2 font-semibold w-6 text-center text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 text-gray-500 hover:text-black font-bold text-sm">+</button>
                          </div>
                          <span className="font-extrabold text-gray-800 w-20 text-right text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">Delivery Address Details (Cash on Delivery)</h2>
                  <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="input-base text-sm" placeholder="Recipient's name" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mobile Number (WhatsApp) *</label>
                        <input required type="tel" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} className="input-base text-sm" placeholder="Mobile / WhatsApp number" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address *</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} className="input-base text-sm" placeholder="you@email.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Flat/House No, Building, Street Address *</label>
                      <textarea required value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} className="input-base text-sm resize-none" rows={2} placeholder="Door No, Street Name, Locality" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">City *</label>
                        <input required type="text" value={formData.city} onChange={e => setFormData(f => ({ ...f, city: e.target.value }))} className="input-base text-sm" placeholder="City" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">State *</label>
                        <input required type="text" value={formData.state} onChange={e => setFormData(f => ({ ...f, state: e.target.value }))} className="input-base text-sm" placeholder="State" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Pincode *</label>
                        <input required type="text" pattern="[0-9]{6}" title="6 digit Indian pincode" value={formData.pincode} onChange={e => setFormData(f => ({ ...f, pincode: e.target.value }))} className="input-base text-sm" placeholder="6-digit PIN" />
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-serif font-bold text-gray-900 mb-5">Order Summary</h2>

                {/* Items preview */}
                <div className="space-y-3 mb-5 max-h-48 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-9 h-12 rounded-lg overflow-hidden bg-gray-55 flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400">×{item.quantity}</p>
                      </div>
                      <p className="text-xs font-bold text-gray-700">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2 text-xs font-sans">
                  <div className="flex justify-between text-gray-500">
                    <span>Bag Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery Charge</span>
                    <span className={shipping === 0 ? "text-green-600 font-bold" : ""}>
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-[10px] text-gray-400 font-light mt-1 text-right">
                      Add ₹{(999 - subtotal).toLocaleString('en-IN')} more for free delivery
                    </p>
                  )}
                </div>
                <div className="border-t mt-4 pt-4 flex justify-between font-bold text-base">
                  <span>Payable Amount</span>
                  <span className="text-[var(--color-dark-rosegold)]">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="bg-white rounded-2xl p-4 border border-gray-150 space-y-3">
                {[
                  { icon: Truck, text: "Free delivery on orders above ₹999", color: "text-green-500" },
                  { icon: Tag, text: "Bespoke tailoring alteration checks", color: "text-blue-500" },
                  { icon: CheckCircle2, text: "100% Secure cash on delivery orders", color: "text-purple-500" },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs text-gray-500">
                    <b.icon className={`w-4 h-4 ${b.color} flex-shrink-0`} />
                    {b.text}
                  </div>
                ))}
              </div>

              {/* CTA */}
              {step === "cart" ? (
                <button
                  onClick={() => setStep("checkout")}
                  className="w-full py-4 bg-[var(--color-dark-rosegold)] text-white rounded-2xl font-semibold hover:bg-[var(--color-deeprose)] transition-all shadow-lg hover:-translate-y-0.5 text-sm"
                >
                  Proceed to checkout Address →
                </button>
              ) : (
                <button
                  form="checkout-form"
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[var(--color-dark-rosegold)] text-white rounded-2xl font-semibold hover:bg-[var(--color-deeprose)] transition-all shadow-lg disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Placing COD Order...</>
                  ) : (
                    <><CheckCircle2 className="w-5 h-5" /> Confirm COD Order</>
                  )}
                </button>
              )}

              {step === "checkout" && (
                <button onClick={() => setStep("cart")} className="w-full py-3 text-gray-400 text-xs hover:text-gray-600 transition-colors font-medium">
                  ← Back to Shopping Bag
                </button>
              )}

              <button
                onClick={() => router.push('/tailor')}
                className="w-full py-3 border-2 border-[var(--color-rosegold)] text-[var(--color-dark-rosegold)] rounded-2xl font-semibold hover:bg-[var(--color-lightrose)] transition-colors flex items-center justify-center gap-1.5 text-xs"
              >
                <Scissors className="w-4 h-4" /> Custom Fit Tailoring Quote?
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
