// Extended Zustand store with full product type, cart customization, and more
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  images: string; // JSON string of string[]
  description?: string | null;
  category: string;
  sizes: string; // JSON string of string[]
  colors: string; // JSON string of string[]
  fabric?: string | null;
  careInstr?: string | null;
  stock?: number;
  inStock: boolean;
  featured: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  customization?: string; // JSON string
}

interface ShopState {
  cart: CartItem[];
  favorites: Product[];
  addToCart: (product: Product, options?: { size?: string; color?: string; customization?: string }) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleFavorite: (product: Product) => void;
  isInCart: (productId: string) => boolean;
  isFavorite: (productId: string) => boolean;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      favorites: [],

      addToCart: (product, options = {}) =>
        set((state) => {
          const cartItemId = `${product.id}-${options.size || 'nosize'}-${options.color || 'nocolor'}`;
          const existing = state.cart.find((item) => item.id === cartItemId);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
              ),
            };
          }
          return {
            cart: [
              ...state.cart,
              {
                id: cartItemId,
                productId: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.image,
                quantity: 1,
                selectedSize: options.size,
                selectedColor: options.color,
                customization: options.customization,
              },
            ],
          };
        }),

      removeFromCart: (cartItemId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== cartItemId),
        })),

      updateQuantity: (cartItemId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === cartItemId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        })),

      clearCart: () => set({ cart: [] }),

      toggleFavorite: (product) =>
        set((state) => {
          const exists = state.favorites.some((item) => item.id === product.id);
          if (exists) {
            return { favorites: state.favorites.filter((item) => item.id !== product.id) };
          }
          return { favorites: [...state.favorites, product] };
        }),

      isInCart: (productId) => get().cart.some((item) => item.productId === productId),
      isFavorite: (productId) => get().favorites.some((item) => item.id === productId),
      getCartTotal: () =>
        get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getCartCount: () =>
        get().cart.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'elysian-storage-v2',
    }
  )
);
