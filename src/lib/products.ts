import { supabase, Product, Category, ProductImage } from './supabase';

export type { Category, Product, ProductImage } from './supabase';

export type ProductWithImage = Product & {
  image_url: string;
  images: ProductImage[];
};

export type ProductWithCategory = ProductWithImage & {
  category: Category | null;
};

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data as Category[]) || [];
}

export async function fetchProducts(opts?: {
  category?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
}): Promise<ProductWithCategory[]> {
  let q = supabase
    .from('products')
    .select('*, category:categories(*), images:product_images(*)')
    .eq('is_active', true);

  if (opts?.category) {
    q = q.eq('category_id', opts.category);
  }
  if (opts?.featured) {
    q = q.eq('is_featured', true);
  }
  if (opts?.search) {
    q = q.or(`name.ilike.%${opts.search}%,description.ilike.%${opts.search}%`);
  }
  if (typeof opts?.minPrice === 'number') {
    q = q.gte('price', opts.minPrice);
  }
  if (typeof opts?.maxPrice === 'number') {
    q = q.lte('price', opts.maxPrice);
  }
  if (opts?.colors && opts.colors.length > 0) {
    q = q.in('color', opts.colors);
  }

  switch (opts?.sort) {
    case 'price-asc':
      q = q.order('price', { ascending: true });
      break;
    case 'price-desc':
      q = q.order('price', { ascending: false });
      break;
    case 'rating':
      q = q.order('rating', { ascending: false });
      break;
    case 'newest':
      q = q.order('created_at', { ascending: false });
      break;
    default:
      q = q.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
  }

  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) throw error;
  return ((data || []) as any[]).map((p) => ({
    ...p,
    images: (p.images as ProductImage[]).sort((a, b) => a.sort_order - b.sort_order),
    image_url: (p.images as ProductImage[])?.[0]?.url || '',
    category: p.category as Category | null,
  }));
}

export async function fetchProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), images:product_images(*)')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...data,
    images: ((data.images as ProductImage[]) || []).sort((a, b) => a.sort_order - b.sort_order),
    image_url: ((data.images as ProductImage[]) || [])[0]?.url || '',
    category: data.category as Category | null,
  };
}

export async function fetchRelatedProducts(categoryId: string, excludeId: string, limit = 4): Promise<ProductWithCategory[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), images:product_images(*)')
    .eq('is_active', true)
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .limit(limit);
  if (error) throw error;
  return ((data || []) as any[]).map((p) => ({
    ...p,
    images: (p.images as ProductImage[]).sort((a, b) => a.sort_order - b.sort_order),
    image_url: (p.images as ProductImage[])?.[0]?.url || '',
    category: p.category as Category | null,
  }));
}
