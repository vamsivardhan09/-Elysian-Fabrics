"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  User, ShoppingBag, LogOut, ArrowRight, Heart, Scissors, Mail, Shield, MapPin, Plus, Trash2, Home
} from "lucide-react";

interface SavedAddress {
  id: string;
  label: string; // Home, Work, etc.
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Address Manager state
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: ""
  });

  // Load addresses from local storage client-side
  useEffect(() => {
    const saved = localStorage.getItem("elysian_addresses");
    if (saved) {
      try {
        setAddresses(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

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
          className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center border border-gray-150"
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
              className="w-full py-3.5 bg-[var(--color-dark-rosegold)] text-white rounded-xl font-semibold hover:bg-[var(--color-deeprose)] transition-colors shadow-lg cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => router.push('/register')}
              className="w-full py-3.5 border-2 border-[var(--color-rosegold)] text-[var(--color-dark-rosegold)] rounded-xl font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Create Free Account
            </button>
            <Link href="/" className="block text-xs text-gray-400 hover:text-gray-650 pt-2 transition-colors">
              ← Return to homepage
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.name || !addressForm.phone || !addressForm.addressLine) return;

    const newAddr: SavedAddress = {
      id: 'addr-' + Date.now(),
      ...addressForm
    };

    const updated = [...addresses, newAddr];
    setAddresses(updated);
    localStorage.setItem("elysian_addresses", JSON.stringify(updated));

    // Reset form
    setShowAddressForm(false);
    setAddressForm({
      label: "Home",
      name: "",
      phone: "",
      addressLine: "",
      city: "",
      state: "",
      pincode: ""
    });
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter(addr => addr.id !== id);
    setAddresses(updated);
    localStorage.setItem("elysian_addresses", JSON.stringify(updated));
  };

  const menuItems = [
    { name: "My Orders", icon: ShoppingBag, path: "/orders", desc: "Track shipping status & history" },
    { name: "My Wishlist", icon: Heart, path: "/favorites", desc: "View bookmarked styling designs" },
    { name: "Custom Tailoring", icon: Scissors, path: "/tailor", desc: "Book sizing appointments" }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cream)] py-6 px-4 md:py-12 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Profile Info Header */}
        <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[var(--color-lightrose)] text-[var(--color-dark-rosegold)] rounded-full flex items-center justify-center font-serif text-2xl md:text-3xl font-bold border border-[var(--color-rosegold)]/10">
              {session.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl md:text-2xl font-serif text-gray-900 font-bold">{session.user?.name}</h1>
                {(session.user as any).role === 'ADMIN' && (
                  <span className="bg-red-50 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 text-xs text-gray-400 mt-1 font-light">
                <span className="flex items-center justify-center sm:justify-start gap-1"><Mail className="w-3.5 h-3.5" />{session.user?.email}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            {(session.user as any).role === 'ADMIN' && (
              <button 
                onClick={() => router.push('/admin')}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-gray-150 text-gray-800 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Admin Panel
              </button>
            )}
            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left Panel: Native menu links */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Quick Links</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.path)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 active:bg-gray-50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-lightrose)] text-[var(--color-rosegold)] flex items-center justify-center">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{item.name}</p>
                        <p className="text-[9px] text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Address Manager */}
          <div className="md:col-span-3 space-y-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saved Addresses ({addresses.length})</h3>
              <button 
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs text-[var(--color-rosegold)] hover:text-[var(--color-dark-rosegold)] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="bg-white p-5 rounded-2xl border border-[var(--color-rosegold)]/20 shadow-md space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Address Label</label>
                    <select 
                      value={addressForm.label} 
                      onChange={e => setAddressForm(a => ({ ...a, label: e.target.value }))}
                      className="input-base text-xs py-2"
                    >
                      <option>Home</option>
                      <option>Work</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Recipient Name *</label>
                    <input required type="text" value={addressForm.name} onChange={e => setAddressForm(a => ({ ...a, name: e.target.value }))} className="input-base text-xs py-2" placeholder="Name" />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Phone Number *</label>
                  <input required type="tel" value={addressForm.phone} onChange={e => setAddressForm(a => ({ ...a, phone: e.target.value }))} className="input-base text-xs py-2" placeholder="Phone" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Street Address *</label>
                  <input required type="text" value={addressForm.addressLine} onChange={e => setAddressForm(a => ({ ...a, addressLine: e.target.value }))} className="input-base text-xs py-2" placeholder="House/Flat No, Street Name" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">City *</label>
                    <input required type="text" value={addressForm.city} onChange={e => setAddressForm(a => ({ ...a, city: e.target.value }))} className="input-base text-xs py-2" placeholder="City" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">State *</label>
                    <input required type="text" value={addressForm.state} onChange={e => setAddressForm(a => ({ ...a, state: e.target.value }))} className="input-base text-xs py-2" placeholder="State" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Pincode *</label>
                    <input required type="text" pattern="[0-9]{6}" value={addressForm.pincode} onChange={e => setAddressForm(a => ({ ...a, pincode: e.target.value }))} className="input-base text-xs py-2" placeholder="Pincode" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 py-2 bg-[var(--color-dark-rosegold)] text-white text-xs font-bold rounded-xl active:bg-[var(--color-deeprose)] cursor-pointer">Save Address</button>
                  <button type="button" onClick={() => setShowAddressForm(false)} className="flex-1 py-2 bg-gray-100 text-gray-500 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
                </div>
              </form>
            )}

            {/* Address List */}
            {addresses.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center shadow-sm">
                <MapPin className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-500">No saved addresses</p>
                <p className="text-[10px] text-gray-400 font-light mt-0.5">Add shipping addresses for faster checkout.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between gap-4">
                    <div className="flex gap-2.5 items-start">
                      <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mt-0.5 flex-shrink-0">
                        {addr.label === "Home" ? <Home className="w-4 h-4 text-[var(--color-rosegold)]" /> : <MapPin className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-bold text-gray-800">{addr.name}</span>
                          <span className="text-[8px] bg-gray-100 text-gray-500 border px-1.5 py-0.5 rounded-full font-bold uppercase">{addr.label}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-normal font-light">{addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-[10px] text-gray-400 mt-1">Phone: <span className="font-semibold">{addr.phone}</span></p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
