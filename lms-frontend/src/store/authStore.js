import { create } from "zustand";
import authService from "../services/authService";

/**
 * Zustand auth store — drop-in replacement for AuthContext.
 * Exports `useAuth` so every existing consumer only needs a 1-line import swap.
 */
const useAuthStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  user: (() => {
    const cached = localStorage.getItem("user");
    return cached ? JSON.parse(cached) : null;
  })(),
  loading: true,

  // ── Derived ───────────────────────────────────────────────────────────────
  get isAuthenticated() {
    return !!get().user;
  },

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Called once on app boot to validate the stored token. */
  initializeAuth: async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const profile = await authService.getMe();
        localStorage.setItem("user", JSON.stringify(profile));
        set({ user: profile, loading: false });
      } catch (err) {
        console.error("Token validation failed, logging out...", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ user: null, loading: false });
      }
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null, loading: false });
    }
  },

  /** Handle the global "auth-unauthorized" event dispatched by the axios interceptor. */
  handleUnauthorized: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null });
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const data = await authService.login(email, password);
      if (!data.token) throw new Error("No token returned from authentication service.");
      localStorage.setItem("token", data.token);
      const profile = await authService.getMe();
      localStorage.setItem("user", JSON.stringify(profile));
      set({ user: profile });
      return profile;
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  register: async (name, email, password, role) => {
    set({ loading: true });
    try {
      const data = await authService.register(name, email, password, role);
      if (!data.token) throw new Error("No token returned after registration.");
      localStorage.setItem("token", data.token);
      const profile = await authService.getMe();
      localStorage.setItem("user", JSON.stringify(profile));
      set({ user: profile });
      return profile;
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ user: null });
    await authService.logout();
  },

  updateUserProfileLocal: (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
}));

// ── Re-export as `useAuth` so existing imports are a 1-line swap ─────────────
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    loading: store.loading,
    isAuthenticated: !!store.user,
    login: store.login,
    register: store.register,
    logout: store.logout,
    updateUserProfileLocal: store.updateUserProfileLocal,
    initializeAuth: store.initializeAuth,
    handleUnauthorized: store.handleUnauthorized,
  };
};

export default useAuthStore;
