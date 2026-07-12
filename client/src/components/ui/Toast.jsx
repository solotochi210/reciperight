import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { subscribeToast } from '../../utils/toastBus';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};
const STYLES = {
  success: 'border-l-[var(--accent-green)]',
  error: 'border-l-red-500',
  info: 'border-l-accent',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message, variant = 'info', duration = 3000) => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, message, variant }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  // Bridge for non-React callers (axios interceptor).
  useEffect(() => subscribeToast(({ message, variant }) => toast(message, variant)), [toast]);

  const api = {
    toast,
    success: (m, d) => toast(m, 'success', d),
    error: (m, d) => toast(m, 'error', d),
    info: (m, d) => toast(m, 'info', d),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[min(92vw,360px)] flex-col gap-2">
          <AnimatePresence>
            {toasts.map((t) => {
              const Icon = ICONS[t.variant] || Info;
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 80 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  className={cn(
                    'pointer-events-auto flex items-start gap-3 rounded-2xl border border-l-4 bg-white p-4 shadow-lg',
                    STYLES[t.variant]
                  )}
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-text-secondary" />
                  <p className="flex-1 text-sm text-text-primary">{t.message}</p>
                  <button onClick={() => dismiss(t.id)} className="text-text-tertiary hover:text-text-primary">
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export default ToastProvider;
