import React, { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastContextValue {
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Provider para toasts globales.
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const value: ToastContextValue = {
    showSuccess: (msg) => addToast(msg, 'success'),
    showError: (msg) => addToast(msg, 'error'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(<ToastContainer toasts={toasts} />, document.body)}
    </ToastContext.Provider>
  );
};

/**
 * Hook para exponer la API de toasts.
 */
export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>');
  }
  return ctx;
};

/* COMPONENTES INTERNOS */
const ToastContainer: React.FC<{ toasts: Toast[] }> = ({ toasts }) => (
  <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        role="alert"
        className={clsx(
          'px-4 py-2 rounded shadow-lg text-sm text-white animate-slide-in',
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600',
        )}
      >
        {toast.message}
      </div>
    ))}
  </div>
);

/* Animación personalizada */
const style = document.createElement('style');
style.innerHTML = `
@keyframes slide-in { from { opacity: 0; transform: translateX(100%);} to { opacity:1; transform: translateX(0);} }
.animate-slide-in { animation: slide-in 0.3s ease-out; }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
} 