import { create } from "zustand";

export const useDialogStore = create((set, get) => ({
  isOpen: false,
  type: "confirm", // "confirm" | "alert"
  title: "",
  message: "",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  resolvePromise: null,

  showAlert: (message, title = "Notification") => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        type: "alert",
        title,
        message,
        confirmLabel: "OK",
        cancelLabel: "Cancel",
        resolvePromise: resolve,
      });
    });
  },

  showConfirm: (message, title = "Confirm Action", options = {}) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        type: "confirm",
        title,
        message,
        confirmLabel: options.confirmLabel || "Confirm",
        cancelLabel: options.cancelLabel || "Cancel",
        resolvePromise: resolve,
      });
    });
  },

  confirm: () => {
    const { resolvePromise } = get();
    if (resolvePromise) resolvePromise(true);
    set({ isOpen: false, resolvePromise: null });
  },

  cancel: () => {
    const { resolvePromise } = get();
    if (resolvePromise) resolvePromise(false);
    set({ isOpen: false, resolvePromise: null });
  },
}));
