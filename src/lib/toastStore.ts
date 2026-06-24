import { create } from 'zustand';

export type ToastType = 'success' | 'info' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
}

/**
 * Tiny global toast queue. Components call `toast(...)` (the convenience export
 * below) from anywhere — stores, event handlers, async callbacks — and the
 * <Toaster /> mounted in App renders them bottom-right with auto-dismiss.
 */
export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (message, type = 'success') => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    // Auto-dismiss after 3.2s
    window.setTimeout(() => get().dismiss(id), 3200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Fire a toast from non-component code (stores, utils). */
export const toast = (message: string, type: ToastType = 'success') =>
  useToastStore.getState().push(message, type);
