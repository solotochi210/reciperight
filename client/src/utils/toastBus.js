/**
 * Tiny pub/sub bridge so non-React code (axios interceptors) can trigger toasts.
 * ToastProvider subscribes; axios publishes.
 */
const listeners = new Set();

export function emitToast(message, variant = 'info') {
  listeners.forEach((fn) => fn({ message, variant }));
}

export function subscribeToast(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
