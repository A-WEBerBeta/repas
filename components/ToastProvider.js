"use client";

import { createContext, useContext, useState } from "react";

import { CheckCircle2, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div className="fixed bottom-24 right-4 z-9999 w-[calc(100%-2rem)] max-w-sm sm:bottom-6 sm:right-6">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#18242D]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                toast.type === "success"
                  ? "bg-accent/15 text-peach"
                  : "bg-white/5 text-neutral-400"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={19} />
              ) : (
                <Info size={19} />
              )}
            </div>

            <p className="flex-1 text-sm font-medium text-neutral-200">
              {toast.message}
            </p>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-white/5 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast doit être utilisé dans ToastProvider");
  }

  return context;
}
