import { create } from 'zustand';
import { persist } from 'zustand/middleware';


const baseUrl = import.meta.env.VITE_API_URL;
const userStore = create(
  persist(
    (set) => ({
      // State
      user: null,
      isLoggedIn: false,
      isAdmin: false,
      loading: false,
      error: null,

      // Actions
      setUser: (user) => set({ 
        user, 
        isLoggedIn: !!user,
        isAdmin: user?.role === 'admin'
      }),

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`${baseUrl}/user/signin`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (data.success) {
            set({ 
              user: data.user,
              isLoggedIn: true,
              isAdmin: data.user?.role === 'admin',
              loading: false,
              error: null
            });
            return { success: true };
          } else {
            set({ 
              loading: false, 
              error: data.error || "Login failed" 
            });
            return { success: false, error: data.error };
          }
        } catch (err) {
          console.error("Login error:", err);
          set({ 
            loading: false, 
            error: "Network error. Please try again." 
          });
          return { success: false, error: "Network error" };
        }
      },

      signup: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`${baseUrl}/user/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          });

          const data = await response.json();

          if (data.success) {
            // After successful signup, log the user in
            return await userStore.getState().login(userData.email, userData.password);
          } else {
            set({ 
              loading: false, 
              error: data.error || "Signup failed" 
            });
            return { success: false, error: data.error };
          }
        } catch (err) {
          console.error("Signup error:", err);
          set({ 
            loading: false, 
            error: "Network error. Please try again." 
          });
          return { success: false, error: "Network error" };
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isLoggedIn: false, 
          isAdmin: false,
          error: null 
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'user-storage',
      getStorage: () => localStorage,
    }
  )
);

export default userStore;