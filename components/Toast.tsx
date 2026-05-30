"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export function Toast({ message, type = "info", onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    error: "border-red-500/30 bg-red-500/10 text-red-300",
    info: "border-cinema-accent/30 bg-cinema-accent/10 text-cinema-text",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border px-5 py-3 text-sm shadow-xl ${colors[type]}`}
    >
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss">
        <X className="h-4 w-4 opacity-60 hover:opacity-100" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({
  toast,
  onClose,
}: {
  toast: { message: string; type?: "success" | "error" | "info" } | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={onClose} />
      )}
    </AnimatePresence>
  );
}
