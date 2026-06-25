"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Link as LinkIcon } from "lucide-react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  icon?: "check" | "copy" | "link";
}

const icons = {
  check: Check,
  copy: Copy,
  link: LinkIcon,
};

export default function Toast({
  message,
  isVisible,
  onClose,
  duration = 3000,
  icon = "check",
}: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const Icon = icons[icon];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-5 py-3 rounded-xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-sm font-medium text-white">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for easy toast usage
export function useToast() {
  const [toast, setToast] = useState({ message: "", isVisible: false, icon: "check" as "check" | "copy" | "link" });

  const showToast = (message: string, icon: "check" | "copy" | "link" = "check") => {
    setToast({ message, isVisible: true, icon });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  return { toast, showToast, hideToast };
}
