import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  console.error('Missing Supabase env vars. Check .env file.');
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  mrp: number | null;
  category_id: string | null;
  stock: number;
  sku: string | null;
  color: string | null;
  material: string | null;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  created_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
};

export type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
};

export type Address = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
};

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type Order = {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  gst_amount: number;
  shipping_amount: number;
  total: number;
  gst_number: string | null;
  billing_name: string;
  billing_address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  shipping_address: {
    full_name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  payment_id: string | null;
  payment_status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  price: number;
  quantity: number;
  gst_rate: number;
  gst_amount: number;
  image_url: string | null;
};

export const GST_RATE = 5.0;
export const FREE_SHIPPING_THRESHOLD = 2999;
export const SHIPPING_FLAT = 149;
export const WHATSAPP_NUMBER = '919876543210';
export const STORE_GSTIN = '29ABCDE1234F1Z5';
export const STORE_NAME = 'Marisol';
