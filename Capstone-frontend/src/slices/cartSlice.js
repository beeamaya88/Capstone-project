import { create } from 'zustand';

const cartStore = create((set) => ({  // Removed 'get' since it's not used
  // State
  cart: null,
  items: [],
  loading: false,
  error: null,
  itemCount: 0,
  subtotal: 0,

  // Clear error
  clearError: () => set({ error: null }),

  // FETCH CART
  fetchCart: async (userId) => {
    if (!userId) return;
    
    set({ loading: true, error: null });
    try {
      const response = await fetch(`http://localhost:3500/api/cart/${userId}`);
      const data = await response.json();
      
      // Calculate item count and subtotal
      const items = data.items || [];
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      set({ 
        cart: data,
        items,
        itemCount,
        subtotal,
        loading: false 
      });
      
      return { success: true };
    } catch (err) {
      console.error('Error fetching cart:', err);
      set({ 
        error: 'Failed to fetch cart', 
        loading: false 
      });
      return { success: false, error: err.message };
    }
  },

  // ADD TO CART
  addToCart: async (userId, productData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`http://localhost:3500/api/cart/${userId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to cart');
      }

      // Update cart state
      const items = data.cart.items || [];
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      set({ 
        cart: data.cart,
        items,
        itemCount,
        subtotal,
        loading: false 
      });

      // Dispatch event for navbar to update
      window.dispatchEvent(new Event('cartUpdated'));

      return { 
        success: true, 
        message: data.message 
      };
    } catch (err) {
      console.error('Error adding to cart:', err);
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

  // UPDATE CART ITEM
  updateCartItem: async (userId, itemId, quantity) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`http://localhost:3500/api/cart/${userId}/item/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update cart');
      }

      // Update cart state
      const items = data.cart.items || [];
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      set({ 
        cart: data.cart,
        items,
        itemCount,
        subtotal,
        loading: false 
      });

      // Dispatch event for navbar to update
      window.dispatchEvent(new Event('cartUpdated'));

      return { 
        success: true, 
        message: 'Cart updated' 
      };
    } catch (err) {
      console.error('Error updating cart:', err);
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

  // REMOVE FROM CART
  removeFromCart: async (userId, itemId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`http://localhost:3500/api/cart/${userId}/item/${itemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove from cart');
      }

      // Update cart state
      const items = data.cart.items || [];
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      set({ 
        cart: data.cart,
        items,
        itemCount,
        subtotal,
        loading: false 
      });

      // Dispatch event for navbar to update
      window.dispatchEvent(new Event('cartUpdated'));

      return { 
        success: true, 
        message: 'Item removed from cart' 
      };
    } catch (err) {
      console.error('Error removing from cart:', err);
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

  // CLEAR CART
  clearCart: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`http://localhost:3500/api/cart/${userId}/clear`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear cart');
      }

      set({ 
        cart: data.cart,
        items: [],
        itemCount: 0,
        subtotal: 0,
        loading: false 
      });

      // Dispatch event for navbar to update
      window.dispatchEvent(new Event('cartUpdated'));

      return { 
        success: true, 
        message: 'Cart cleared' 
      };
    } catch (err) {
      console.error('Error clearing cart:', err);
      set({ 
        error: err.message, 
        loading: false 
      });
      return { 
        success: false, 
        error: err.message 
      };
    }
  }
}));

export default cartStore;