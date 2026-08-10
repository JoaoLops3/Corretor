"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface ToastItem {
  id: number;
  message: string;
}

const ToastContext = createContext<(message: string) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-toast-in flex items-stretch overflow-hidden rounded-[10px] bg-ink shadow-[var(--shadow-lg-brand)]"
          >
            <span aria-hidden className="w-1 shrink-0 bg-brass" />
            <div className="px-4 py-2.5 text-sm font-semibold text-white">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
