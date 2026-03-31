import { create } from 'zustand';
import { persist } from 'zustand/middleware';


const categoryStore = create(
  persist(
    (set) => ({
      // State
      categories: [],
      loading: false,
      error: null,

      // Fetch categories from backend
      fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
          // You'll need to create this backend route
          const response = await fetch('${baseUrl}/api/categories');
          const data = await response.json();
          set({ categories: data, loading: false });
        } catch (err) {
          console.error('Error fetching categories:', err);
          // Fallback to hardcoded categories if backend not ready
          set({ 
            categories: [
              { value: 'herb-seeds', label: 'Herb Seeds' },
              { value: 'flower-seeds', label: 'Flower Seeds' },
              { value: 'garden-pots', label: 'Garden Pots' },
              { value: 'garden-books', label: 'Garden Books' },
              { value: 'digital-guides', label: 'Digital Guides' },
            ],
            loading: false 
          });
        }
      },

      // Set categories manually
      setCategories: (categories) => set({ categories }),

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'category-storage',
      getStorage: () => localStorage,
    }
  )
);

export default categoryStore;