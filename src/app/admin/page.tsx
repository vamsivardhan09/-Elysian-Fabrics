"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, ShoppingBag, BarChart2, Plus, Edit2, Trash2, X,
  LogOut, Search, ExternalLink, CheckCircle2, Clock, Truck, XCircle,
  RefreshCw, Save, AlertTriangle, Eye, DollarSign, Tag, Upload, AlertCircle, List,
  Scissors, Settings
} from "lucide-react";

type Product = {
  id: string; name: string; price: number; originalPrice: number;
  image: string; images: string; description: string; category: string;
  sizes: string; colors: string; fabric: string; stock: number; inStock: boolean; featured: boolean;
};

type OrderItem = {
  id: string; quantity: number; price: number;
  selectedSize?: string; selectedColor?: string; customization?: string;
  product: Product;
};

type Order = {
  id: string; trackingId: string; status: string; total: number;
  customerName: string; customerEmail: string; customerPhone: string;
  address: string; trackingLink?: string; notes?: string;
  courierName?: string; courierTrackingId?: string; expectedDelivery?: string;
  items: OrderItem[]; createdAt: string;
};

type Category = {
  id: string;
  name: string;
};

const SIZES_DEFAULT = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const COLORS_LIST = ["Red", "Blue", "Green", "Pink", "Purple", "Yellow", "Orange", "Black", "White", "Brown", "Gold", "Silver", "Teal", "Maroon", "Navy", "Beige", "Peach", "Lavender", "Rose", "Coral"];
const STATUS_OPTIONS = ["PENDING", "PROCESSING", "AWAITING_MATERIAL", "MATERIAL_RECEIVED", "STITCHING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

const statusConfig: Record<string, { label: string; badge: string; icon: any }> = {
  PENDING:            { label: "Placed",           badge: "badge-pending",    icon: Clock },
  PROCESSING:         { label: "Processing",       badge: "badge-processing", icon: RefreshCw },
  AWAITING_MATERIAL:  { label: "Awaiting Fabric",  badge: "bg-orange-50 text-orange-700 border-orange-100", icon: Clock },
  MATERIAL_RECEIVED:  { label: "Fabric Received",  badge: "bg-blue-50 text-blue-700 border-blue-100", icon: Package },
  STITCHING:          { label: "Stitching",        badge: "bg-pink-50 text-pink-700 border-pink-100", icon: Scissors },
  PACKED:             { label: "Packed",           badge: "bg-purple-50 text-purple-700 border-purple-100", icon: Package },
  SHIPPED:            { label: "Shipped",          badge: "badge-shipped",    icon: Truck },
  DELIVERED:          { label: "Delivered",        badge: "badge-delivered",  icon: CheckCircle2 },
  CANCELLED:          { label: "Cancelled",        badge: "badge-cancelled",  icon: XCircle },
};

const emptyProduct = {
  name: "", price: "", originalPrice: "", image: "", images: "",
  description: "", category: "", sizes: [] as string[],
  colors: [] as string[], fabric: "", careInstr: "", stock: "10", inStock: true, featured: false,
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "categories" | "orders" | "settings">("dashboard");
  
  // Boutique Settings Form
  const [shopName, setShopName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setShopName(data.shopName || "Elysian Custom Boutique");
        setShopAddress(data.shopAddress || "Plot 42, Shilpa Hills, Madhapur, Hyderabad, Telangana, 500081");
        setContactPhone(data.contactPhone || "+91 98765 43210");
      }
    } catch {}
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName, shopAddress, contactPhone }),
      });
      if (res.ok) {
        showToast("Boutique settings updated!");
      } else {
        showToast("Failed to update boutique settings", "error");
      }
    } catch {
      showToast("Error updating settings", "error");
    } finally {
      setSavingSettings(false);
    }
  };
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({ ...emptyProduct });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [dbConnected, setDbConnected] = useState(true);

  // Category form
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  // Order editing
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [orderTrackingLink, setOrderTrackingLink] = useState("");
  const [orderCourierName, setOrderCourierName] = useState("");
  const [orderCourierTrackingId, setOrderCourierTrackingId] = useState("");
  const [orderExpectedDelivery, setOrderExpectedDelivery] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { 
    fetchProducts(); 
    fetchOrders(); 
    fetchCategories();
    checkDbStatus();
  }, []);

  async function fetchProducts() {
    setLoadingProducts(true);
    try {
      const r = await fetch("/api/products");
      if (r.ok) setProducts(await r.json());
    } finally { setLoadingProducts(false); }
  }

  async function fetchOrders() {
    setLoadingOrders(true);
    try {
      const r = await fetch("/api/orders");
      if (r.ok) setOrders(await r.json());
    } finally { setLoadingOrders(false); }
  }

  async function fetchCategories() {
    setLoadingCategories(true);
    try {
      const r = await fetch("/api/categories");
      if (r.ok) {
        const data = await r.json();
        setCategories(data);
        // Default category form selection to first fetched category if empty
        if (data.length > 0 && !productForm.category) {
          setProductForm(f => ({ ...f, category: data[0].name }));
        }
      }
    } finally { setLoadingCategories(false); }
  }

  async function checkDbStatus() {
    try {
      const res = await fetch("/api/db-status");
      if (res.ok) {
        const data = await res.json();
        setDbConnected(data.connected);
      } else {
        setDbConnected(false);
      }
    } catch {
      setDbConnected(false);
    }
  }

  if (status === "loading") return (
    <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[var(--color-rosegold)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!session || (session.user as any)?.role !== "ADMIN") {
    router.push("/login"); return null;
  }

  // Client-side image compression and Base64 reader helper
  const readAsBase64WithCompression = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // 70% quality JPEG
            resolve(dataUrl);
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => {
          resolve(event.target?.result as string);
        };
      };
      reader.onerror = () => {
        resolve("");
      };
    });
  };

  // File Upload Helper
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "main" | "gallery") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === "main") setUploadingImage(true);
    else setUploadingGallery(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (target === "main") {
          setProductForm(f => ({ ...f, image: data.url }));
          showToast("Main image uploaded!");
        } else {
          const currentUrls = productForm.images ? productForm.images.split(",").map(s => s.trim()).filter(Boolean) : [];
          setProductForm(f => ({ ...f, images: [...currentUrls, data.url].join(", ") }));
          showToast("Gallery image added!");
        }
      } else {
        throw new Error("Upload api failed, falling back to base64");
      }
    } catch (err) {
      console.warn("[Admin Image Upload] Falling back to client-side compressed base64 due to:", err);
      try {
        const base64Url = await readAsBase64WithCompression(file);
        if (base64Url) {
          if (target === "main") {
            setProductForm(f => ({ ...f, image: base64Url }));
            showToast("Main image uploaded (Optimized Base64)!");
          } else {
            const currentUrls = productForm.images ? productForm.images.split(",").map(s => s.trim()).filter(Boolean) : [];
            setProductForm(f => ({ ...f, images: [...currentUrls, base64Url].join(", ") }));
            showToast("Gallery image added (Optimized Base64)!");
          }
        } else {
          showToast("Failed to process image", "error");
        }
      } catch {
        showToast("Upload failed", "error");
      }
    } finally {
      setUploadingImage(false);
      setUploadingGallery(false);
    }
  };

  // Category Submit
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setSavingCategory(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Category added!");
        setNewCategoryName("");
        fetchCategories();
      } else {
        showToast(data.error || "Failed to add category", "error");
      }
    } finally { setSavingCategory(false); }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showToast("Category deleted!");
        fetchCategories();
      } else {
        showToast("Failed to delete category", "error");
      }
    } catch {
      showToast("Failed to delete category", "error");
    }
  };

  // Product Submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Fallback category if none selected
    const categoryName = productForm.category || (categories.length > 0 ? categories[0].name : "Dresses");

    try {
      const payload = {
        ...productForm,
        category: categoryName,
        stock: parseInt(productForm.stock) || 0,
        sizes: JSON.stringify(productForm.sizes),
        colors: JSON.stringify(productForm.colors),
        images: productForm.images
          ? JSON.stringify(productForm.images.split(",").map((s: string) => s.trim()).filter(Boolean))
          : "[]",
      };
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (r.ok) {
        showToast(editingProduct ? "Product updated!" : "Product added!");
        setShowProductForm(false);
        setEditingProduct(null);
        setProductForm({ ...emptyProduct });
        fetchProducts();
      } else { showToast("Failed to save product", "error"); }
    } finally { setSaving(false); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const r = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (r.ok) { showToast("Product deleted!"); fetchProducts(); }
    else showToast("Failed to delete", "error");
  };

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name, price: String(p.price), originalPrice: String(p.originalPrice),
      image: p.image,
      images: (() => { try { return JSON.parse(p.images || '[]').join(', '); } catch { return ''; } })(),
      description: p.description || "", category: p.category,
      sizes: (() => { try { return JSON.parse(p.sizes || '[]'); } catch { return []; } })(),
      colors: (() => { try { return JSON.parse(p.colors || '[]'); } catch { return []; } })(),
      fabric: p.fabric || "", careInstr: "", stock: String(p.stock), inStock: p.inStock, featured: p.featured,
    });
    setShowProductForm(true);
  };

  // Order Save
  const handleSaveOrder = async () => {
    if (!editingOrder) return;
    setSavingOrder(true);
    try {
      const r = await fetch(`/api/orders/${editingOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: orderStatus, 
          trackingLink: orderTrackingLink, 
          courierName: orderCourierName,
          courierTrackingId: orderCourierTrackingId,
          expectedDelivery: orderExpectedDelivery,
          notes: orderNotes 
        }),
      });
      if (r.ok) { 
        showToast("Order updated!"); 
        setEditingOrder(null); 
        fetchOrders(); 
      } else { 
        showToast("Failed to update order", "error"); 
      }
    } finally { setSavingOrder(false); }
  };

  const openEditOrder = (order: Order) => {
    setEditingOrder(order);
    setOrderStatus(order.status);
    setOrderTrackingLink(order.trackingLink || "");
    setOrderCourierName(order.courierName || "");
    setOrderCourierTrackingId(order.courierTrackingId || "");
    setOrderExpectedDelivery(order.expectedDelivery || "");
    setOrderNotes(order.notes || "");
  };

  // Stats Calculations
  const totalRevenue = orders.filter(o => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === "PENDING" || o.status === "PROCESSING" || o.status === "PACKED").length;
  const lowStockProducts = products.filter(p => p.stock < 5).length;
  
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase()));
  const filteredOrders = orders.filter(o => o.trackingId.toLowerCase().includes(orderSearch.toLowerCase()) || (o.customerName || "").toLowerCase().includes(orderSearch.toLowerCase()) || (o.customerEmail || "").toLowerCase().includes(orderSearch.toLowerCase()));

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart2 },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -50, x: "-50%" }}
            className={`fixed top-0 left-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl border text-sm font-medium ${toast.type === "success" ? "bg-white text-green-700 border-green-200" : "bg-white text-red-700 border-red-200"}`}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showProductForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) { setShowProductForm(false); setEditingProduct(null); setProductForm({ ...emptyProduct }); } }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-serif text-[var(--color-dark-rosegold)] font-bold">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button onClick={() => { setShowProductForm(false); setEditingProduct(null); setProductForm({ ...emptyProduct }); }}>
                  <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleProductSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Product Name *</label>
                    <input required type="text" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} className="input-base" placeholder="e.g. Silk Banarasi Saree" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category *</label>
                    <select 
                      required 
                      value={productForm.category} 
                      onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} 
                      className="input-base"
                    >
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      {categories.length === 0 && <option value="Dresses">Dresses</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Fabric</label>
                    <input type="text" value={productForm.fabric} onChange={e => setProductForm(f => ({ ...f, fabric: e.target.value }))} className="input-base" placeholder="e.g. Silk, Cotton, Velvet" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Selling Price (₹) *</label>
                    <input required type="number" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} className="input-base" placeholder="1999" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Original Price (₹) *</label>
                    <input required type="number" value={productForm.originalPrice} onChange={e => setProductForm(f => ({ ...f, originalPrice: e.target.value }))} className="input-base" placeholder="2499" />
                  </div>
                  
                  {/* Stock Quantity */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Stock Count (Units) *</label>
                    <input required type="number" value={productForm.stock} onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))} className="input-base" placeholder="10" />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Main Image</label>
                    <div className="flex gap-2">
                      <input required type="text" value={productForm.image} onChange={e => setProductForm(f => ({ ...f, image: e.target.value }))} className="input-base flex-1" placeholder="Image URL (https://...)" />
                      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl px-4 flex items-center justify-center gap-1.5 text-xs text-gray-600 transition-colors font-medium">
                        {uploadingImage ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Upload
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "main")} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Gallery Images (comma-separated URLs)</label>
                    <div className="flex gap-2 items-start">
                      <textarea value={productForm.images} onChange={e => setProductForm(f => ({ ...f, images: e.target.value }))} className="input-base flex-1 resize-none" rows={2} placeholder="https://url1.com, https://url2.com" />
                      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-center gap-1.5 text-xs text-gray-600 transition-colors font-medium">
                        {uploadingGallery ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Add
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "gallery")} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                    <textarea value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} className="input-base resize-none" rows={3} placeholder="Product description..." />
                  </div>
                  
                  {/* Sizes */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Sizes Available</label>
                    <div className="flex flex-wrap gap-2">
                      {SIZES_DEFAULT.map(s => (
                        <button type="button" key={s}
                          onClick={() => setProductForm(f => ({
                            ...f,
                            sizes: f.sizes.includes(s) ? f.sizes.filter((x: string) => x !== s) : [...f.sizes, s]
                          }))}
                          className={`px-4 py-1.5 rounded-xl border-2 text-xs font-semibold transition-all ${productForm.sizes.includes(s) ? 'border-[var(--color-dark-rosegold)] bg-[var(--color-dark-rosegold)] text-white' : 'border-gray-200 text-gray-500 hover:border-[var(--color-rosegold)]'}`}
                        >{s}</button>
                      ))}
                    </div>
                  </div>
                  {/* Colors */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Colors Available</label>
                    <div className="flex flex-wrap gap-2">
                      {COLORS_LIST.map(c => (
                        <button type="button" key={c}
                          onClick={() => setProductForm(f => ({
                            ...f,
                            colors: f.colors.includes(c) ? f.colors.filter((x: string) => x !== c) : [...f.colors, c]
                          }))}
                          className={`px-3 py-1 rounded-full text-[10px] font-semibold border-2 transition-all ${productForm.colors.includes(c) ? 'border-[var(--color-dark-rosegold)] bg-[var(--color-lightrose)] text-[var(--color-dark-rosegold)]' : 'border-gray-200 text-gray-400'}`}
                        >{c}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={productForm.featured} onChange={e => setProductForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 accent-[var(--color-rosegold)]" />
                      <span className="text-xs font-semibold text-gray-700 font-sans">Featured Sensation</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-4 pt-4 border-t">
                  <button type="submit" disabled={saving} className="flex-1 py-3 bg-[var(--color-dark-rosegold)] text-white rounded-xl font-semibold hover:bg-[var(--color-deeprose)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                  </button>
                  <button type="button" onClick={() => { setShowProductForm(false); setEditingProduct(null); setProductForm({ ...emptyProduct }); }} className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Edit Modal */}
      <AnimatePresence>
        {editingOrder && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setEditingOrder(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-serif text-[var(--color-dark-rosegold)] font-bold">Fulfill Order {editingOrder.trackingId}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Placed on {new Date(editingOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <button onClick={() => setEditingOrder(null)}><X className="w-6 h-6 text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-5">
                
                {/* Customer info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Customer</p>
                    <p className="font-bold text-gray-800 text-sm">{editingOrder.customerName}</p>
                    <p className="text-xs text-gray-500">{editingOrder.customerEmail}</p>
                    <p className="text-xs text-gray-500 font-medium">{editingOrder.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Shipping Address</p>
                    <p className="text-xs text-gray-700 leading-relaxed font-light">{editingOrder.address}</p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Items Ordered</p>
                  <div className="space-y-3">
                    {editingOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                        {item.product?.image && (
                          <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image src={item.product.image} alt={item.product?.name || ''} fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-xs truncate">{item.product?.name || 'Product'}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Qty: {item.quantity}
                            {item.selectedSize && ` · Size: ${item.selectedSize}`}
                            {item.selectedColor && ` · Color: ${item.selectedColor}`}
                          </p>
                          {item.customization && (
                            <div className="text-[9px] bg-[var(--color-lightrose)] text-[var(--color-dark-rosegold)] px-2 py-0.5 rounded font-semibold mt-1.5 inline-block">
                              Custom measurements: {item.customization}
                            </div>
                          )}
                        </div>
                        <p className="font-bold text-[var(--color-dark-rosegold)] text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t font-semibold text-gray-900">
                    <span className="text-xs text-gray-400">COD Total</span>
                    <span className="text-[var(--color-dark-rosegold)] text-base font-bold">₹{editingOrder.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Logistics */}
                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Shipment Details & Tracking</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Order Status</label>
                      <select value={orderStatus} onChange={e => setOrderStatus(e.target.value)} className="input-base">
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Expected Delivery Date</label>
                      <input type="text" value={orderExpectedDelivery} onChange={e => setOrderExpectedDelivery(e.target.value)} className="input-base" placeholder="e.g. 15th June 2026" />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Courier Carrier Name</label>
                      <input type="text" value={orderCourierName} onChange={e => setOrderCourierName(e.target.value)} className="input-base" placeholder="e.g. BlueDart, Delhivery" />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Courier Tracking ID</label>
                      <input type="text" value={orderCourierTrackingId} onChange={e => setOrderCourierTrackingId(e.target.value)} className="input-base" placeholder="e.g. 123456789" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Tracking Link</label>
                      <input type="url" value={orderTrackingLink} onChange={e => setOrderTrackingLink(e.target.value)} className="input-base" placeholder="https://tracking.provider.com/..." />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Admin / Tailoring Notes</label>
                  <textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)} className="input-base resize-none" rows={2} placeholder="Internal measurements verification or notes..." />
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <button onClick={handleSaveOrder} disabled={savingOrder} className="flex-1 py-3 bg-[var(--color-dark-rosegold)] text-white rounded-xl font-semibold hover:bg-[var(--color-deeprose)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    {savingOrder ? "Saving..." : "Save Fulfillments"}
                  </button>
                  <button onClick={() => setEditingOrder(null)} className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col fixed left-0 top-0 z-40 hidden lg:flex">
        <div className="p-6 border-b">
          <span className="font-serif text-2xl text-[var(--color-dark-rosegold)] font-bold">Elysian Admin</span>
          <p className="text-[10px] text-gray-400 mt-1 font-light">{(session.user as any)?.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`admin-sidebar-link w-full ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {item.id === 'orders' && orders.filter(o => o.status === 'PENDING').length > 0 && (
                <span className="ml-auto bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {orders.filter(o => o.status === 'PENDING').length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button onClick={() => router.push('/')} className="admin-sidebar-link w-full mb-2">
            <Eye className="w-5 h-5" /> View Storefront
          </button>
          <button onClick={() => signOut()} className="admin-sidebar-link w-full text-red-500 hover:!text-red-600 hover:!bg-red-50">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="lg:ml-64 flex-1 p-6 min-h-screen">
        {/* Database Offline Warning Banner */}
        {!dbConnected && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between text-amber-800 text-xs shadow-sm"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 animate-bounce" />
              <div>
                <span className="font-bold text-sm block mb-0.5">Supabase Database Offline (Running in Sandbox Mode)</span>
                <p className="text-amber-600 font-light leading-relaxed">
                  Your Supabase PostgreSQL database is currently sleeping, paused, or unreachable. All dashboard modifications (adding/editing/deleting products or categories) are saving to temporary in-memory arrays. <strong>These will reset on page reload.</strong> Please resume your Supabase project to restore persistent saving.
                </p>
              </div>
            </div>
            <a 
              href="https://supabase.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="ml-4 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-bold shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              Supabase Dashboard <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        )}
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <span className="font-serif text-xl text-[var(--color-dark-rosegold)] font-bold">Admin Panel</span>
          <div className="flex gap-2">
            {sidebarItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`p-2.5 rounded-xl ${activeTab === item.id ? 'bg-[var(--color-lightrose)] text-[var(--color-dark-rosegold)]' : 'text-gray-400'}`}
              >
                <item.icon className="w-4 h-4" />
              </button>
            ))}
            <button onClick={() => signOut()} className="p-2.5 text-red-400"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        {/* 1. DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-serif text-[var(--color-dark-rosegold)] font-bold mb-8">Business Dashboard</h1>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Revenue (COD)", value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
                { label: "Total Bookings/Orders", value: orders.length, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Pending Processing", value: pendingOrders, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
                { label: "Low Stock Alert", value: lowStockProducts, icon: AlertCircle, color: lowStockProducts > 0 ? "text-red-600" : "text-purple-600", bg: lowStockProducts > 0 ? "bg-red-50" : "bg-purple-50", click: () => setActiveTab("products") },
              ].map((stat, idx) => (
                <div 
                  key={idx} 
                  onClick={stat.click}
                  className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between ${stat.click ? 'cursor-pointer hover:border-red-200 transition-colors' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                    <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders/Requests */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
                <h2 className="font-semibold text-gray-800 text-sm">Recent Orders & Stitching Requests</h2>
                <button onClick={() => setActiveTab('orders')} className="text-xs text-[var(--color-rosegold)] font-bold hover:underline">View all →</button>
              </div>
              <div className="divide-y divide-gray-50">
                {orders.slice(0, 5).map((order) => {
                  const cfg = statusConfig[order.status] || statusConfig.PENDING;
                  return (
                    <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-[var(--color-lightrose)] rounded-xl flex items-center justify-center flex-shrink-0">
                          <cfg.icon className="w-4 h-4 text-[var(--color-rosegold)]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-xs truncate">{order.trackingId}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{order.customerName} · {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className={`badge border text-[10px] py-0.5 px-2 font-medium ${cfg.badge}`}>{cfg.label}</span>
                        <p className="font-bold text-gray-800 text-xs">₹{order.total.toLocaleString('en-IN')}</p>
                        <button onClick={() => openEditOrder(order)} className="p-1 text-gray-400 hover:text-[var(--color-rosegold)] transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {orders.length === 0 && (
                  <p className="text-center text-xs text-gray-400 py-10 font-light">No customer bookings or requests yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. PRODUCTS TAB */}
        {activeTab === "products" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-3xl font-serif text-[var(--color-dark-rosegold)] font-bold">Products Inventory</h1>
              <button
                onClick={() => { setEditingProduct(null); setProductForm({ ...emptyProduct }); setShowProductForm(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-dark-rosegold)] text-white rounded-xl font-semibold hover:bg-[var(--color-deeprose)] transition-colors shadow-sm text-sm"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" placeholder="Search product catalogue..." value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="w-full max-w-sm pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-rosegold)] bg-white text-xs"
              />
            </div>

            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <div key={i} className="h-64 shimmer rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const isLowStock = product.stock < 5 && product.stock > 0;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                      <div className="relative h-44 bg-gray-50 flex-shrink-0">
                        <Image src={product.image} alt={product.name} fill className="object-cover" sizes="220px" />
                        
                        {/* Stock alert labels */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow">Out of Stock</span>
                          </div>
                        )}
                        {isLowStock && (
                          <div className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                            Low Stock: {product.stock} left
                          </div>
                        )}
                        {!isLowStock && !isOutOfStock && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                            In Stock: {product.stock}
                          </div>
                        )}
                        {product.featured && (
                          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">Featured</div>
                        )}
                      </div>
                      
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-[var(--color-rosegold)] font-bold uppercase tracking-wider">{product.category}</span>
                          <h3 className="font-bold text-gray-800 text-xs line-clamp-1 mt-0.5 mb-1">{product.name}</h3>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="font-extrabold text-[var(--color-dark-rosegold)] text-sm">₹{product.price.toLocaleString('en-IN')}</span>
                            {product.originalPrice > product.price && (
                              <span className="text-[10px] text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => handleEditProduct(product)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-xl hover:border-[var(--color-rosegold)] hover:text-[var(--color-rosegold)] transition-colors">
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-red-100 text-red-500 text-[10px] font-bold rounded-xl hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {filteredProducts.length === 0 && (
                  <div className="col-span-full text-center py-20 text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No products found matching your search.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* 3. CATEGORIES TAB */}
        {activeTab === "categories" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h1 className="text-3xl font-serif text-[var(--color-dark-rosegold)] font-bold mb-8">Category Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Form card */}
              <div className="md:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800 mb-4">Add Custom Category</h2>
                <form onSubmit={handleAddCategory} className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-semibold">Category Name *</label>
                    <input 
                      type="text" 
                      required
                      value={newCategoryName} 
                      onChange={e => setNewCategoryName(e.target.value)} 
                      placeholder="e.g. Kurtis, Blouses"
                      className="input-base text-xs"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={savingCategory}
                    className="w-full py-2 bg-[var(--color-dark-rosegold)] text-white hover:bg-[var(--color-deeprose)] rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {savingCategory ? "Adding..." : "Add Category"}
                  </button>
                </form>
              </div>

              {/* List grid */}
              <div className="md:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50/50 border-b flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 text-xs">Active Storefront Categories</h3>
                  <button onClick={fetchCategories} className="p-1 text-gray-400 hover:text-gray-600 transition-colors"><RefreshCw className="w-3.5 h-3.5" /></button>
                </div>
                
                {loadingCategories ? (
                  <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 shimmer rounded-xl" />)}</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {categories.map((c) => (
                      <div key={c.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-800 text-xs">{c.name}</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteCategory(c.id, c.name)}
                          className="p-1 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {categories.length === 0 && (
                      <p className="text-center text-xs text-gray-400 py-10">No categories found. Adding default templates...</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 4. ORDERS TAB */}
        {activeTab === "orders" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-3xl font-serif text-[var(--color-dark-rosegold)] font-bold">Orders Fulfillment</h1>
              <button onClick={fetchOrders} className="flex items-center gap-2 text-xs text-gray-500 hover:text-[var(--color-rosegold)] transition-colors">
                <RefreshCw className="w-4 h-4" /> Refresh List
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by customer name, tracking ID..." value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                className="w-full max-w-sm pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-rosegold)] bg-white text-xs"
              />
            </div>

            {loadingOrders ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 shimmer rounded-2xl" />)}</div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No orders found.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {filteredOrders.map((order) => {
                      const cfg = statusConfig[order.status] || statusConfig.PENDING;
                      return (
                        <div key={order.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                cfg.badge.includes('pending') ? 'bg-yellow-50' : 
                                cfg.badge.includes('shipped') ? 'bg-indigo-50' : 
                                cfg.badge.includes('delivered') ? 'bg-green-50' : 
                                cfg.badge.includes('cancelled') ? 'bg-red-50' : 'bg-blue-50'
                              }`}>
                                <cfg.icon className="w-4 h-4 text-gray-500" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-bold text-gray-900 text-sm">{order.trackingId}</p>
                                  <span className={`badge border text-[9px] py-0 px-2 font-semibold ${cfg.badge}`}>{cfg.label}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5 truncate">{order.customerName} · {order.customerEmail}</p>
                                <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 flex-wrap flex-shrink-0">
                              <div className="text-right">
                                <p className="font-extrabold text-[var(--color-dark-rosegold)] text-sm">₹{order.total.toLocaleString('en-IN')}</p>
                                <p className="text-[10px] text-gray-400">{order.items.length} item(s)</p>
                              </div>
                              {order.trackingLink && (
                                <a href={order.trackingLink} target="_blank" rel="noreferrer"
                                  className="flex items-center gap-1 text-[10px] px-2.5 py-1 bg-green-50 border border-green-100 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" /> Track
                                </a>
                              )}
                              <button onClick={() => openEditOrder(order)}
                                className="flex items-center gap-1 text-[10px] px-2.5 py-1 bg-[var(--color-lightrose)] border border-[var(--color-rosegold)]/10 text-[var(--color-dark-rosegold)] rounded-lg hover:bg-[var(--color-blush)] transition-colors"
                              >
                                <Edit2 className="w-3 h-3" /> Manage
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* 5. SETTINGS TAB */}
        {activeTab === "settings" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
            <h1 className="text-3xl font-serif text-[var(--color-dark-rosegold)] font-bold mb-8">Boutique Settings</h1>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800 mb-6 border-b pb-3 font-serif">Tailor Shop Details</h2>
              <form onSubmit={handleSettingsSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Shop Name *</label>
                  <input 
                    required 
                    type="text" 
                    value={shopName} 
                    onChange={e => setShopName(e.target.value)} 
                    className="input-base"
                    placeholder="Elysian Custom Boutique"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Physical Shop Address (for Material Shipments) *</label>
                  <textarea 
                    required 
                    value={shopAddress} 
                    onChange={e => setShopAddress(e.target.value)} 
                    className="input-base resize-none" 
                    rows={3}
                    placeholder="Full postal address of the boutique..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Contact Phone Number *</label>
                  <input 
                    required 
                    type="text" 
                    value={contactPhone} 
                    onChange={e => setContactPhone(e.target.value)} 
                    className="input-base"
                    placeholder="+91 98765 43210"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={savingSettings}
                  className="px-6 py-3 bg-[var(--color-dark-rosegold)] hover:bg-[var(--color-deeprose)] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> {savingSettings ? "Saving Settings..." : "Save Shop Settings"}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
