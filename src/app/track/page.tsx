"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, CheckCircle2, Clock, Package, Truck, 
  MapPin, Phone, Mail, ArrowLeft, ExternalLink, MessageCircle, AlertCircle
} from 'lucide-react';
import Image from 'next/image';

const STATUS_STEPS = [
  { status: 'PENDING', label: 'Order Placed', desc: 'We have received your order request.' },
  { status: 'CONFIRMED', label: 'Confirmed', desc: 'Design details and payment verified.' },
  { status: 'PROCESSING', label: 'Tailoring', desc: 'Your outfit is being precision crafted.' },
  { status: 'SHIPPED', label: 'Shipped', desc: 'Dispatched from our boutique.' },
  { status: 'DELIVERED', label: 'Delivered', desc: 'Outfit successfully delivered to your doorstep.' },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get('id');
  const router = useRouter();

  const [trackingId, setTrackingId] = useState(idFromUrl || '');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (idFromUrl) {
      fetchOrder(idFromUrl);
    }
  }, [idFromUrl]);

  const fetchOrder = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        setError('Order not found. Please double-check your Tracking ID.');
        setOrder(null);
      }
    } catch (err) {
      setError('An error occurred while tracking your order.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId) return;
    fetchOrder(trackingId.trim());
  };

  const parseImages = (product: any) => {
    try {
      const arr = JSON.parse(product.images || '[]');
      return arr.length > 0 ? arr : [product.image];
    } catch {
      return [product.image];
    }
  };

  const getActiveStepIndex = (currentStatus: string) => {
    if (currentStatus === 'CANCELLED') return -1;
    return STATUS_STEPS.findIndex(step => step.status === currentStatus);
  };

  const activeIndex = order ? getActiveStepIndex(order.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Back Button */}
      <button 
        onClick={() => router.push('/')} 
        className="inline-flex items-center text-gray-500 hover:text-[var(--color-rosegold)] transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Store
      </button>

      <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-dark-rosegold)] text-center mb-4">Track Order</h1>
      <p className="text-gray-500 font-light text-center mb-10 max-w-md mx-auto leading-relaxed">
        Check your custom dress progress, shipping updates, and carrier tracking links.
      </p>

      {/* Search Input */}
      <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-12">
        <input 
          type="text" 
          value={trackingId} 
          onChange={e => setTrackingId(e.target.value)} 
          placeholder="Enter Tracking ID (e.g. ELY-A1B2C3D4)" 
          className="flex-1 px-6 py-4 rounded-full border shadow-sm focus:ring-3 focus:ring-[var(--color-rosegold)]/30 outline-none bg-white text-gray-800 text-lg transition-all"
          required
        />
        <button 
          type="submit" 
          disabled={loading} 
          className="px-10 py-4 bg-[var(--color-dark-rosegold)] hover:bg-[var(--color-deeprose)] text-white rounded-full font-semibold transition-colors flex items-center justify-center shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-base"
        >
          <Search className="w-5 h-5 mr-2" /> {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <div className="p-5 bg-red-50 border border-red-100 text-red-600 rounded-3xl mb-8 flex items-center gap-3 justify-center text-sm font-medium shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Order Info Display */}
      {order && (
        <div className="space-y-8">
          
          {/* Status Stepper */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-50">
            <h3 className="text-lg font-serif text-gray-900 mb-6">Delivery Progress</h3>
            
            {order.status === 'CANCELLED' ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="font-semibold">This order has been cancelled.</span>
              </div>
            ) : (
              <div className="relative">
                {/* Mobile Stepper (Vertical) */}
                <div className="block md:hidden space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= activeIndex;
                    const isActive = idx === activeIndex;
                    return (
                      <div key={step.status} className="flex gap-4 relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isActive
                            ? 'bg-[var(--color-dark-rosegold)] text-white ring-4 ring-[var(--color-lightrose)]'
                            : isCompleted
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-400'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div className="text-left">
                          <p className={`font-semibold text-sm ${isActive ? 'text-[var(--color-dark-rosegold)]' : 'text-gray-800'}`}>{step.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Stepper (Horizontal) */}
                <div className="hidden md:block">
                  <div className="flex items-center justify-between relative mb-4">
                    {/* Line behind steps */}
                    <div className="absolute left-1/10 right-1/10 top-1/2 -translate-y-1/2 h-1 bg-gray-100 rounded z-0" />
                    <div 
                      className="absolute left-1/10 top-1/2 -translate-y-1/2 h-1 bg-green-500 rounded z-0 transition-all duration-500"
                      style={{ width: `${(activeIndex / (STATUS_STEPS.length - 1)) * 80}%` }}
                    />

                    {STATUS_STEPS.map((step, idx) => {
                      const isCompleted = idx <= activeIndex;
                      const isActive = idx === activeIndex;
                      return (
                        <div key={step.status} className="flex flex-col items-center relative z-10 w-1/5">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                            isActive
                              ? 'bg-[var(--color-dark-rosegold)] text-white ring-4 ring-[var(--color-lightrose)] scale-110 shadow-md'
                              : isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-400'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                          </div>
                          <span className={`text-xs mt-3 font-semibold text-center ${isActive ? 'text-[var(--color-dark-rosegold)] font-bold' : 'text-gray-600'}`}>
                            {step.label}
                          </span>
                          <span className="text-[10px] text-gray-400 text-center mt-1 px-2 font-light hidden lg:block">
                            {step.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Core Info & Tracking Link */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Items */}
            <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-xl border border-gray-50 space-y-5">
              <h3 className="text-lg font-serif text-gray-900 border-b pb-3">Items Ordered</h3>
              <div className="space-y-4">
                {order.items.map((item: any) => {
                  const images = parseImages(item.product);
                  return (
                    <div key={item.id} className="flex gap-4 items-center p-3 border border-gray-50 rounded-2xl hover:bg-gray-50/50 transition-colors">
                      <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image src={images[0]} alt={item.product?.name || 'Product'} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm truncate">{item.product?.name || 'Custom Outfit'}</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          Qty: {item.quantity} 
                          {item.selectedSize && ` · Size: ${item.selectedSize}`} 
                          {item.selectedColor && ` · Color: ${item.selectedColor}`}
                        </p>
                        {item.customization && (
                          <div className="text-[10px] bg-[var(--color-lightrose)] text-[var(--color-dark-rosegold)] font-medium px-2 py-0.5 rounded-md mt-1.5 inline-block">
                            Tailor Custom Fit
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[var(--color-dark-rosegold)]">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Customization Details if tailor booking */}
              {order.items.some((i: any) => i.customization) && (
                <div className="bg-[var(--color-lightrose)]/30 rounded-2xl p-4 border border-[var(--color-rosegold)]/10">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-dark-rosegold)] mb-2">Submitted Tailoring Details</h4>
                  {order.items.map((item: any) => {
                    if (!item.customization) return null;
                    try {
                      const cust = JSON.parse(item.customization);
                      return (
                        <div key={item.id} className="text-xs text-gray-600 space-y-2">
                          {cust.measurements && (
                            <div>
                              <span className="font-medium text-gray-700 block mb-1">Measurements (inches):</span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/60 p-2.5 rounded-xl border">
                                {Object.entries(cust.measurements).map(([k, v]) => (
                                  <div key={k} className="flex justify-between border-b border-gray-50 pb-0.5">
                                    <span className="text-gray-400 capitalize">{k}:</span>
                                    <span className="font-semibold text-gray-800">{String(v)}"</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {cust.styling && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100">
                              <p><span className="text-gray-400">Neckline:</span> <span className="font-medium text-gray-700">{cust.styling.necklineStyle || 'Standard'}</span></p>
                              <p><span className="text-gray-400">Sleeves:</span> <span className="font-medium text-gray-700">{cust.styling.sleeveStyle || 'Standard'}</span></p>
                            </div>
                          )}
                        </div>
                      );
                    } catch { return null; }
                  })}
                </div>
              )}

              {/* Order total */}
              <div className="border-t pt-4 flex justify-between items-center text-gray-900 font-semibold">
                <span className="text-sm text-gray-500 font-normal">Order Total</span>
                <span className="text-2xl font-bold text-[var(--color-dark-rosegold)]">₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Logistics & Meta */}
            <div className="space-y-6">
              
              {/* Active Tracking Link */}
              {order.trackingLink && (
                <div className="bg-gradient-to-br from-[var(--color-dark-rosegold)] to-[var(--color-rosegold)] text-white p-5 rounded-3xl shadow-xl flex flex-col justify-between h-full">
                  <div>
                    <Truck className="w-8 h-8 opacity-80 mb-4" />
                    <h4 className="font-serif text-lg font-bold">Courier Dispatched</h4>
                    <p className="text-xs text-white/80 mt-1 font-light leading-relaxed">
                      Your packet has been handed over to our delivery partner. Click below to view real-time tracking from the carrier.
                    </p>
                  </div>
                  <a 
                    href={order.trackingLink} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full mt-6 py-3 bg-white text-[var(--color-dark-rosegold)] text-sm font-semibold rounded-full text-center hover:bg-[var(--color-cream)] transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" /> Track Carrier Package
                  </a>
                </div>
              )}

              {/* Customer Info Card */}
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-50 space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Delivery Address</h4>
                <div className="space-y-3 text-xs text-gray-600 leading-relaxed font-light">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-800 text-[13px]">{order.customerName}</p>
                      <p className="mt-0.5">{order.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{order.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{order.customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              {order.notes && (
                <div className="bg-white p-5 rounded-3xl shadow-md border border-gray-50">
                  <h4 className="text-xs font-semibold text-gray-900 mb-1.5">Order Notes</h4>
                  <p className="text-xs text-gray-500 font-light leading-relaxed">{order.notes}</p>
                </div>
              )}

              {/* Helpline WhatsApp link */}
              <a 
                href={`https://wa.me/919000000000?text=${encodeURIComponent(`Hello Elysian Fabrics! I would like to inquire about my order status.\n*Tracking ID:* ${order.trackingId}`)}`}
                target="_blank" 
                rel="noreferrer"
                className="w-full py-3.5 border-2 border-green-500 text-green-600 hover:bg-green-50 transition-colors font-semibold rounded-2xl flex items-center justify-center gap-2 text-sm"
              >
                <MessageCircle className="w-5 h-5 fill-current" /> Ask Support on WhatsApp
              </a>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)] pt-32 pb-24">
      <Suspense fallback={<div className="text-center py-20">Loading order tracker...</div>}>
        <TrackOrderContent />
      </Suspense>
    </div>
  );
}
