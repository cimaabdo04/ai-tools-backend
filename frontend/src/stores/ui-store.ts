import { create } from "zustand";

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
  duration?: number;
}

interface Modal {
  id: string;
  isOpen: boolean;
  data?: unknown;
}

interface UiState {
  sidebarOpen: boolean;
  mobileNavOpen: boolean;
  toasts: Toast[];
  modals: Modal[];
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  openModal: (id: string, data?: unknown) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
}

let toastCounter = 0;

export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: true,
  mobileNavOpen: false,
  toasts: [],
  modals: [],

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  toggleMobileNav: () =>
    set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),

  addToast: (toast) => {
    const id = `toast-${++toastCounter}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),

  openModal: (id, data) =>
    set((state) => {
      const existing = state.modals.find((m) => m.id === id);
      if (existing) {
        return {
          modals: state.modals.map((m) =>
            m.id === id ? { ...m, isOpen: true, data } : m
          ),
        };
      }
      return { modals: [...state.modals, { id, isOpen: true, data }] };
    }),

  closeModal: (id) =>
    set((state) => ({
      modals: state.modals.map((m) =>
        m.id === id ? { ...m, isOpen: false } : m
      ),
    })),

  closeAllModals: () =>
    set((state) => ({
      modals: state.modals.map((m) => ({ ...m, isOpen: false })),
    })),
}));
