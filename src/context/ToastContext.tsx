"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);

  const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle2 size={18} className="text-emerald-500" />,
    error: <XCircle size={18} className="text-red-500" />,
    warning: <AlertTriangle size={18} className="text-amber-500" />,
    info: <Info size={18} className="text-sky-500" />,
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 lg:bottom-6 right-4 left-4 sm:left-auto sm:w-auto z-[200] flex flex-col items-end gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto w-full sm:w-80 card flex items-start gap-3 px-4 py-3 animate-fade-in-up shadow-lg first:shadow-card-hover"
          >
            <span className="shrink-0 mt-0.5">{icons[toast.type]}</span>
            <p className="flex-1 text-sm text-[rgb(var(--text))]">{toast.message}</p>
            <button
              onClick={() => setToasts((t) => t.filter((x) => x.id !== toast.id))}
              className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}