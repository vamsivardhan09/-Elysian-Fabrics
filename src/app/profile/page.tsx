"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, ShoppingBag, LogOut, ArrowRight, Clock, CheckCircle2, 
  RefreshCw, Truck, XCircle, Search, Scissors, Heart, Calendar, Mail, Shield
} from "lucide-react";
import Image from "next/image";

const statusConfig: Record<string, { label: string; badge: string; icon: any }> = {
  PENDING:    { label: "Placed",      badge: "bg-yellow-50 text-yellow-700 border-yellow-100",    icon: Clock },
  PROCESSING: { label: "Processing",  badge: "bg-blue-50 text-blue-700 border-blue-100",          icon: RefreshCw },
  PACKED:     { label: "Packed",      badge: "bg-purple-50 text-purple-700 border-purple-100",      icon: ShoppingBag },
  SHIPPED:    { label: "Shipped",     badge: "bg-indigo-50 text-indigo-700 border-indigo-100",      icon: Truck },
  DELIVERED:  { label: "Delivered",   badge: "bg-green-50 text-green-700 border-green-100",        icon: CheckCircle2 },
  CANCELLED:  { label: "Cancelled",   badge: "bg-red-50 text-red-700 border-red-100",            icon: XCircle },
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "settings">("orders");

  useEffect(() => {
    if (session?.user) {
      fetchUserOrders((session.user as any).id);
    }
  }, [session]);

  const fetchUserOrders = async (userId: string) => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to load user orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--color-rosegold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in UI
  if (!session) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center border border-gray-50"
        >
          <div className="w-16 h-16 bg-[var(--color-lightrose)] rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-[var(--color-rosegold)]" />
          </div>
          <h2 className="text-3xl font-serif text-[var(--color-dark-rosegold)] mb-3">Sign In Required</h2>
          <p className="text-gray-500 font-light text-sm mb-8 leading-relaxed">
            Please log in to view your profile dashboard, order history, and custom tailor bookings.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/login')}
              className="w-full py-3.5 bg-[var(--color-dark-rosegold)] text-white rounded-full font-semibold hover:bg-[var(--color-deeprose)] transition-colors shadow-lg"
            >
              Sign In
            </button>
            <button 
              onClick={() => router.push('/register')}
              className="w-full py-3.5 border-2 border-[var(--color-rosegold)] text-[var(--color-dark-rosegold)] rounded-full font-semibold hover:bg-gray-50 transition-colors"
            >
              Create Free Account
            </button>
            <Link href="/" className="block text-xs text-gray-400 hover:text-gray-600 pt-2 transition-colors">
              ← Return to homepage
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const parseImages = (product: any) => {
    try {
      const arr = JSON.parse(product.images || '[]');
      return arr.length > 0 ? arr : [product.image];
    } catch {
      return [product.image];
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4 flex-col md:flex-row text-center md:text-left">
            <div className="w-20 h-20 bg-[var(--color-lightrose)] text-[var(--color-dark-rosegold)] rounded-full flex items-center justify-center font-serif text-3xl font-bold border border-[var(--color-rosegold)]/10">
              {session.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl md:text-3xl font-serif text-gray-900 font-bold">{session.user?.name}</h1>
                {(session.user as any).role === 'ADMIN' && (
                  <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-gray-400 mt-1.5 font-light">
                <span className="flex items-center justify-center md:justify-start gap-1"><Mail className="w-3.5 h-3.5" />{session.user?.email}</span>
                <span className="hidden sm:inline">·</span>
                <span className="flex items-center justify-center md:justify-start gap-1"><Calendar className="w-3.5 h-3.5" />Registered Account</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            {(session.user as any).role === 'ADMIN' && (
              <button 
                onClick={() => router.push('/admin')}
                className="flex-1 md:flex-none px-6 py-2.5 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Admin Panel
              </button>
            )}
            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex-1 md:flex-none px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-semibold border transition-all ${
                activeTab === "orders" 
                  ? "bg-white text-[var(--color-dark-rosegold)] border-[var(--color-rosegold)]/30 shadow-sm"
                  : "bg-transparent text-gray-500 border-transparent hover:bg-white/50"
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> My Orders ({orders.length})
            </button>
            <button 
              onClick={() => router.push("/favorites")}
              className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-white/50 transition-all"
            >
              <Heart className="w-4 h-4" /> Saved Wishlist
            </button>
            <button 
              onClick={() => router.push("/tailor")}
              className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-white/50 transition-all"
            >
              <Scissors className="w-4 h-4" /> Book Tailoring
            </button>
          </div>

          {/* Tab Contents */}
          <div className="lg:col-span-3">
            
            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif text-gray-900 font-bold mb-4">Your Order History</h2>

                {loadingOrders ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-32 shimmer rounded-2xl" />)}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                    <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-lg text-gray-600 font-medium mb-1">No orders found</p>
                    <p className="text-gray-400 font-light text-sm mb-6">You haven't placed any ethnic fashion orders yet.</p>
                    <button 
                      onClick={() => router.push("/")}
                      className="px-8 py-3 bg-[var(--color-dark-rosegold)] text-white rounded-full font-semibold hover:bg-[var(--color-deeprose)] transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const cfg = statusConfig[order.status] || statusConfig.PENDING;
                      return (
                        <div key={order.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 overflow-hidden flex flex-col gap-4">
                          
                          {/* Order Header */}
                          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-gray-50 pb-3 text-xs text-gray-500">
                            <div>
                              <span className="font-semibold text-gray-900 text-sm block md:inline mr-2">{order.trackingId}</span>
                              <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`badge border ${cfg.badge} flex items-center gap-1`}>
                                <cfg.icon className="w-3.5 h-3.5" />
                                {cfg.label}
                              </span>
                              <span className="font-bold text-gray-800 text-sm">₹{order.total.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          {/* Items Grid */}
                          <div className="space-y-3">
                            {order.items.map((item: any) => {
                              const imgs = parseImages(item.product || {});
                              return (
                                <div key={item.id} className="flex gap-4 items-center">
                                  {imgs[0] && (
                                    <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                      <Image src={imgs[0]} alt={item.product?.name || 'Product'} fill className="object-cover" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-800 text-xs truncate">{item.product?.name || 'Custom Outfit'}</h4>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                      Qty: {item.quantity} 
                                      {item.selectedSize && ` · Size: ${item.selectedSize}`} 
                                      {item.selectedColor && ` · Color: ${item.selectedColor}`}
                                    </p>
                                    {item.customization && (
                                      <span className="text-[9px] bg-[var(--color-lightrose)] text-[var(--color-dark-rosegold)] px-1.5 py-0.5 rounded font-medium mt-1 inline-block">
                                        Custom Fit Tailoring
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Order Action Footer */}
                          <div className="flex justify-end pt-2 border-t border-gray-50 mt-1">
                            <Link 
                              href={`/track?id=${order.trackingId}`}
                              className="text-xs font-semibold text-[var(--color-rosegold)] hover:text-[var(--color-dark-rosegold)] transition-colors flex items-center gap-1"
                            >
                              Track Live Progress <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
