import { create } from "zustand";
import { api } from "../api/client";

const storedToken = localStorage.getItem("phinuxtv-token");

export const useAuthStore = create((set, get) => ({
  token: storedToken,
  user: null,
  isReady: false,
  isLoading: false,
  error: null,
  bootstrap: async () => {
    if (!get().token) {
      set({ isReady: true });
      return;
    }

    try {
      const { user } = await api.me();
      set({ user, isReady: true, error: null });
    } catch (error) {
      localStorage.removeItem("phinuxtv-token");
      set({ token: null, user: null, isReady: true, error: error.message });
    }
  },
  login: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const { token, user } = await api.login(payload);
      localStorage.setItem("phinuxtv-token", token);
      set({ token, user, isLoading: false });
      return user;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  register: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const { token, user } = await api.register(payload);
      localStorage.setItem("phinuxtv-token", token);
      set({ token, user, isLoading: false });
      return user;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  forgotPassword: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.forgotPassword(payload);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  resetPassword: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.resetPassword(payload);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem("phinuxtv-token");
    set({ token: null, user: null, error: null });
  },
}));
