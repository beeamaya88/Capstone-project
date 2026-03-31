import { create } from 'zustand';

const baseUrl = import.meta.env.VITE_API_URL;
const productStore = create((set, get) => ({
  // State
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  totalProducts: 0,

  // Clear error
  clearError: () => set({ error: null }),

  // FETCH ALL PRODUCTS
  fetchProducts: async (category = 'all', search = '') => {
    set({ loading: true, error: null });
    try {
      let url = `${baseUrl}/api/products/api/products`;
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();
      
      set({ 
        products: data, 
        loading: false, 
        totalProducts: data.length 
      });
      return { success: true };
    } catch (err) {
      console.error('Error fetching products:', err);
      set({ 
        error: 'Failed to fetch products', 
        loading: false 
      });
      return { success: false, error: err.message };
    }
  },

  // FETCH SINGLE PRODUCT
  fetchProductById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch (`${baseUrl}/api/products/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      const data = await response.json();
      set({ 
        currentProduct: data, 
        loading: false 
      });
      return { success: true, product: data };
    } catch (err) {
      console.error('Error fetching product:', err);
      set({ 
        error: err.message, 
        loading: false,
        currentProduct: null 
      });
      return { success: false, error: err.message };
    }
  },

  // ADD PRODUCT
  addProduct: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch (`${baseUrl}/api/products/`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add product');
      }

      // Update local state with new product
      set((state) => ({ 
        products: [data.product, ...state.products],
        loading: false 
      }));

      return { 
        success: true, 
        product: data.product 
      };
    } catch (err) {
      console.error('Error adding product:', err);
      set({ 
        error: err.message, 
        loading: false 
      });
      return { 
        success: false, 
        error: err.message 
      };
    }
  },

  // UPDATE PRODUCT
  updateProduct: async (id, productData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${baseUrl}/api/products/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update product');
      }

      // Update in products array
      set((state) => ({
        products: state.products.map(p => 
          p._id === id ? data : p
        ),
        currentProduct: data,
        loading: false
      }));

      return { success: true, product: data };
    } catch (err) {
      console.error('Error updating product:', err);
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  // DELETE PRODUCT
  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${baseUrl}/api/products/api/products${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }

      // Remove from state
      set((state) => ({
        products: state.products.filter(p => p._id !== id),
        loading: false
      }));

      return { success: true };
    } catch (err) {
      console.error('Error deleting product:', err);
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  // Get products by category (helper)
  getProductsByCategory: (category) => {
    return get().products.filter(p => p.category === category);
  },

  // Search products (client-side)
  searchProducts: (searchTerm) => {
    const term = searchTerm.toLowerCase();
    return get().products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.description.toLowerCase().includes(term)
    );
  }
}));

export default productStore;