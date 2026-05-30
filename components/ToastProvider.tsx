"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { ToastContainer } from "./Toast";

type ToastType = "success" | "error" | "info";

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{
    message: string;
    type?: ToastType;
  } | null>(null);

  const showToast = useCallback((message: string, type?: ToastType) => {
    setToast({ message, type });
  }, []);

  return (
    <ToastContext.Provider value={{ toast: showToast }}>
      {children}
      <ToastContainer toast={toast} onClose={() => setToast(null)} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: (msg: string) => {
        if (typeof window !== "undefined") console.log("[toast]", msg);
      },
    };
  }
  return ctx;
}
