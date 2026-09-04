import { db } from './database';
import { User, Product, Order, Artisan } from '../types';

const API_BASE = 'http://localhost:5000/api';
let isBackendReachable: boolean | null = null;

// Probe backend health to see if Python Flask is running
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      isBackendReachable = true;
      return true;
    }
  } catch (e) {
    // Backend offline / GitHub Pages mode
  }
  isBackendReachable = false;
  return false;
}

export const api = {
  async register(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword?: string;
    role: 'artisan' | 'customer' | 'b2b_buyer' | 'admin';
    location: string;
    craftType?: string;
    avatar?: string;
  }): Promise<{ success: boolean; message?: string; user?: User; token?: string }> {
    const reachable = isBackendReachable ?? (await checkBackendHealth());
    if (reachable) {
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        const data = await res.json();
        if (data.success) {
          // Sync with local client DB for seamless hybrid operation
          db.syncUserFromBackend(data.user);
          return { success: true, message: data.message, user: data.user, token: data.token };
        }
        return { success: false, message: data.message || 'Registration failed.' };
      } catch (err) {
        console.warn('Flask API error, falling back to local DB', err);
      }
    }

    // Client-side fallback (GitHub Pages / Standalone)
    return await db.registerUser(userData);
  },

  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string; user?: User; token?: string }> {
    const reachable = isBackendReachable ?? (await checkBackendHealth());
    if (reachable) {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
          db.syncUserFromBackend(data.user);
          return { success: true, message: data.message, user: data.user, token: data.token };
        }
        return { success: false, message: data.message || 'Invalid credentials.' };
      } catch (err) {
        console.warn('Flask API error, falling back to local DB', err);
      }
    }

    // Client-side fallback
    return await db.loginUser(email, password);
  },

  async getProducts(filters?: {
    category?: string;
    location?: string;
    artisan_id?: string;
    search?: string;
  }): Promise<Product[]> {
    const reachable = isBackendReachable ?? (await checkBackendHealth());
    if (reachable) {
      try {
        const params = new URLSearchParams();
        if (filters?.category) params.append('category', filters.category);
        if (filters?.location) params.append('location', filters.location);
        if (filters?.artisan_id) params.append('artisan_id', filters.artisan_id);
        if (filters?.search) params.append('search', filters.search);

        const res = await fetch(`${API_BASE}/products?${params.toString()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          return data.products;
        }
      } catch (e) {
        console.warn('Flask fetch products error, using local products', e);
      }
    }

    let products = db.getProducts();
    if (filters?.category && filters.category.toLowerCase() !== 'all') {
      products = products.filter(p => p.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.artisan_id) {
      products = products.filter(p => p.artisanId === filters.artisan_id);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      products = products.filter(
        p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    return products;
  },

  async addProduct(
    productData: any,
    userId: string
  ): Promise<{ success: boolean; product?: Product; message?: string }> {
    const reachable = isBackendReachable ?? (await checkBackendHealth());
    if (reachable) {
      try {
        const res = await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userId}`
          },
          body: JSON.stringify(productData)
        });
        const data = await res.json();
        if (data.success) {
          // Also sync to local DB so offline/state triggers stay reactive
          const localProd = db.addProduct(productData);
          return { success: true, product: localProd, message: data.message };
        }
        return { success: false, message: data.message };
      } catch (err) {
        console.warn('Flask add product error, using local fallback', err);
      }
    }

    const newProd = db.addProduct(productData);
    return { success: true, product: newProd };
  },

  async updateProduct(
    productId: string,
    updates: Partial<Product>,
    userId: string
  ): Promise<{ success: boolean; message?: string }> {
    const reachable = isBackendReachable ?? (await checkBackendHealth());
    if (reachable) {
      try {
        const res = await fetch(`${API_BASE}/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userId}`
          },
          body: JSON.stringify(updates)
        });
        const data = await res.json();
        if (!data.success) {
          return { success: false, message: data.message };
        }
      } catch (err) {
        console.warn('Flask update product error', err);
      }
    }

    const updated = db.updateProduct(productId, updates);
    return { success: !!updated, message: updated ? 'Product updated' : 'Product not found' };
  },

  async deleteProduct(
    productId: string,
    userId: string
  ): Promise<{ success: boolean; message?: string }> {
    const reachable = isBackendReachable ?? (await checkBackendHealth());
    if (reachable) {
      try {
        const res = await fetch(`${API_BASE}/products/${productId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${userId}` }
        });
        const data = await res.json();
        if (!data.success) {
          return { success: false, message: data.message };
        }
      } catch (err) {
        console.warn('Flask delete product error', err);
      }
    }

    const deleted = db.deleteProduct(productId);
    return { success: deleted, message: deleted ? 'Product removed' : 'Product not found' };
  }
};
