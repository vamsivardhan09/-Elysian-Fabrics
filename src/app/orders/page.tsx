"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { 
  ClipboardList, Search, ChevronDown, ChevronUp, MapPin, Calendar, Truck, CheckCircle2, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  selectedSize: string | null;
  selectedColor: string | null;
  customization: string | null;
  product: {
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  trackingId: string;
  status: string;
  total: number;
  userId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  address: string | null;
  trackingLink: string | null;
  courierName: string | null;
  courierTrackingId: string | null;
  expectedDelivery: string | null;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
}

function OrdersContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTrackId = searchParams ? searchParams.get("id") : null;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Guest search state
  const [searchQuery, setSearchQuery] = useState(initialTrackId || "");
  const [searchResult, setSearchResult] = useState<Order | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchUserOrders();
    }
  }, [session]);

  useEffect(() => {
    if (initialTrackId) {
      handleSearchTrack(initialTrackId);
    }
  }, [initialTrackId]);

  async function fetchUserOrders() {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const userId = (session?.user as any)?.id;
          const userOrders = data.filter((o: Order) => o.userId === userId);
          setOrders(userOrders);
          
          if (userOrders.length > 0) {
            setExpandedOrder(userOrders[0].id);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  }

  const handleSearchTrack = async (queryId?: string) => {
    const id = queryId || searchQuery.trim();
    if (!id) return;
    setSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.error) {
          setSearchError("No order found with this Tracking ID.");
        } else {
          setSearchResult(data);
        }
      } else {
        setSearchError("No order found with this Tracking ID.");
      }
    } catch {
      setSearchError("Failed to fetch order details. Please check ID format.");
    } finally {
      setSearching(false);
    }
  };

  const getStatusStep = (status: string) => {
    const stages = ["PENDING", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED"];
    return stages.indexOf(status.toUpperCase());
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING": return "Order Placed";
      case "PROCESSING": return "Processing Items";
      case "PACKED": return "Items Packed";
      case "SHIPPED": return "Dispatched & Shipped";
      case "DELIVERED": return "Order Delivered";
      case "CANCELLED": return "Cancelled";
      default: return status;
    }
  };

  const stepsList = [
    { title: "Placed", desc: "We received your order" },
    { title: "Processing", desc: "Sizing details & checks" },
    { title: "Packed", desc: "Outfits sealed & ready" },
    { title: "Shipped", desc: "Handed over to carrier" },
    { title: "Delivered", desc: "Delivered at doorstep" }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cream)] py-6 px-4 md:py-12 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-serif text-[var(--color-dark-rosegold)] font-bold mb-2">
            Track Your Orders
          </h1>
          <p className="text-xs md:text-sm text-gray-500 font-light max-w-sm mx-auto">
            Check real-time delivery timelines, dispatch details, and measurements.
          </p>
        </div>

        {/* Guest Search Box */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100/60 mb-6 max-w-md mx-auto">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 block">Guest Order Tracker</h3>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="Enter Tracking ID (e.g. ELY-XXXX)" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-base text-xs pl-9 py-2.5"
              />
            </div>
            <button 
              onClick={() => handleSearchTrack()}
              disabled={searching}
              className="px-5 py-2.5 bg-[var(--color-dark-rosegold)] text-white text-xs font-bold rounded-xl active:bg-[var(--color-deeprose)] transition-colors cursor-pointer"
            >
              {searching ? "Searching..." : "Track"}
            </button>
          </div>
        </div>

        {/* Guest Search Result Display */}
        {searchResult && (
          <div className="mb-8 bg-white rounded-3xl border border-[var(--color-rosegold)]/30 p-5 shadow-md">
            <h2 className="text-sm font-bold text-[var(--color-dark-rosegold)] mb-4 pb-2 border-b flex justify-between items-center">
              <span>Track Result: {searchResult.trackingId}</span>
              <span className="text-xs font-normal text-gray-400">{new Date(searchResult.createdAt).toLocaleDateString()}</span>
            </h2>
            <OrderTrackerCard order={searchResult} getStatusStep={getStatusStep} stepsList={stepsList} getStatusText={getStatusText} />
          </div>
        )}

        {searchError && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 text-xs font-medium border border-red-100 max-w-md mx-auto">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Logged-In User Orders History */}
        {session?.user ? (
          <div>
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Your Purchase History</h2>
            
            {loadingOrders ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 rounded-2xl bg-white border shimmer" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border shadow-sm max-w-lg mx-auto">
                <ClipboardList className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-base text-gray-655 font-semibold mb-1">No orders found</p>
                <p className="text-xs text-gray-400 font-light">You haven't placed any ethnic fashion orders yet.</p>
                <button onClick={() => router.push("/")} className="mt-5 px-6 py-2.5 bg-[var(--color-dark-rosegold)] text-white text-xs font-bold rounded-full cursor-pointer shadow">
                  Shop Collection
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isExpanded = expandedOrder === order.id;
                  const firstItem = order.items[0];
                  return (
                    <div 
                      key={order.id}
                      className="bg-white rounded-2xl border border-gray-100/60 overflow-hidden shadow-sm"
                    >
                      {/* Order Summary Line */}
                      <div 
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-mono text-xs font-bold text-gray-800">{order.trackingId}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border border-green-100' :
                              order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-100' :
                              'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 line-clamp-1">
                            {firstItem ? firstItem.product.name : "Order item"}
                            {order.items.length > 1 && ` and ${order.items.length - 1} other item(s)`}
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-3 flex-shrink-0">
                          <div>
                            <span className="text-xs font-black text-gray-900 block">₹{order.total.toLocaleString('en-IN')}</span>
                            <span className="text-[9px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>

                      {/* Expanded Tracker Timeline */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden border-t border-gray-50 bg-gray-50/10"
                          >
                            <div className="p-4 border-b border-gray-50">
                              <OrderTrackerCard order={order} getStatusStep={getStatusStep} stepsList={stepsList} getStatusText={getStatusText} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-3xl border shadow-sm max-w-lg mx-auto">
            <ClipboardList className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-base text-gray-655 font-bold mb-1.5">Sign in to check order history</p>
            <p className="text-xs text-gray-450 font-light mb-6 px-4">Registering lets you manage your personal addresses, check visual tracking steppers, and confirm orders directly.</p>
            <button onClick={() => router.push("/login")} className="px-6 py-2.5 bg-[var(--color-dark-rosegold)] text-white text-xs font-bold rounded-full cursor-pointer shadow">
              Login to Account
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// Child Tracker Details component
function OrderTrackerCard({ order, getStatusStep, stepsList, getStatusText }: { 
  order: Order; 
  getStatusStep: (status: string) => number; 
  stepsList: { title: string; desc: string }[];
  getStatusText: (status: string) => string;
}) {
  const currentStep = getStatusStep(order.status);
  const isCancelled = order.status.toUpperCase() === "CANCELLED";

  return (
    <div className="space-y-6">
      
      {/* Stepper Timeline */}
      {!isCancelled ? (
        <div className="relative py-4">
          <div className="absolute top-[28px] left-5 right-5 h-1 bg-gray-200 -z-10 rounded-full">
            <div 
              className="h-full bg-[var(--color-rosegold)] transition-all duration-500 rounded-full"
              style={{ width: `${(currentStep / (stepsList.length - 1)) * 100}%` }}
            />
          </div>

          <div className="flex justify-between">
            {stepsList.map((step, idx) => {
              const active = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={idx} className="flex flex-col items-center text-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCurrent ? "bg-[var(--color-dark-rosegold)] border-[var(--color-dark-rosegold)] text-white scale-110 shadow-md" :
                    active ? "bg-white border-[var(--color-rosegold)] text-[var(--color-rosegold)]" :
                    "bg-white border-gray-200 text-gray-300"
                  }`}>
                    {active ? <CheckCircle2 className="w-4 h-4 fill-current" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                  </div>
                  <span className={`text-[10px] font-bold mt-2 ${active ? "text-[var(--color-dark-rosegold)]" : "text-gray-400"}`}>
                    {step.title}
                  </span>
                  <span className="text-[8px] text-gray-400 hidden sm:block mt-0.5 px-1 leading-snug">{step.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 text-xs font-semibold border border-red-100 mb-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-bold">This order has been cancelled.</p>
            <p className="text-[10px] text-red-500 mt-0.5 font-light">Please check your email or contact support for help.</p>
          </div>
        </div>
      )}

      {/* Courier Logistics */}
      {order.courierTrackingId && (
        <div className="p-4 bg-white rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Shipped via {order.courierName}</p>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">Tracking Number: <span className="font-semibold">{order.courierTrackingId}</span></p>
              {order.expectedDelivery && (
                <p className="text-[9px] text-green-600 font-semibold mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Est. Delivery: {order.expectedDelivery}
                </p>
              )}
            </div>
          </div>
          {order.trackingLink && (
            <a 
              href={order.trackingLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors text-center active:scale-95"
            >
              Track Live Shipment
            </a>
          )}
        </div>
      )}

      {/* Order items details */}
      <div>
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Order Items ({order.items.length})</h4>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 p-3 bg-gray-50/40 rounded-xl border border-gray-100/50">
              <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border">
                <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="48px" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-semibold text-gray-800 truncate leading-snug">{item.product.name}</h5>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {item.selectedSize && <span className="text-[9px] bg-white text-gray-500 border border-gray-200/60 px-1.5 py-0.5 rounded font-bold">Size: {item.selectedSize}</span>}
                  {item.selectedColor && <span className="text-[9px] bg-white text-gray-500 border border-gray-200/60 px-1.5 py-0.5 rounded font-bold">Color: {item.selectedColor}</span>}
                </div>
                {item.customization && (
                  <p className="text-[9px] text-[var(--color-rosegold)] mt-1.5 font-semibold leading-normal">
                    Measurements: <span className="font-medium text-gray-500">{item.customization}</span>
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-bold text-gray-800 block">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-gray-400">Qty: {item.quantity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Address */}
      {order.address && (
        <div className="p-4 bg-gray-50/20 border rounded-2xl text-xs space-y-2 font-sans">
          <h4 className="font-semibold text-gray-800 flex items-center gap-1.5 mb-2">
            <MapPin className="w-4.5 h-4.5 text-[var(--color-rosegold)]" /> Shipping Destination
          </h4>
          <p className="font-semibold text-gray-700">{order.customerName}</p>
          <p className="text-gray-500 leading-relaxed font-light">{order.address}</p>
          <p className="text-gray-500">Contact Phone: <span className="font-semibold">{order.customerPhone}</span></p>
        </div>
      )}
    </div>
  );
}

// Main Suspense Boundary Wrapper export
export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--color-rosegold)]/30 border-t-[var(--color-rosegold)] rounded-full animate-spin" />
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
