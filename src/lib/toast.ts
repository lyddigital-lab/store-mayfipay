/**
 * Système de toast global sans React Context.
 * Permet à n'importe quel composant d'afficher une notification.
 */
type ToastType = 'success' | 'error' | 'info' | 'loading';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

let toasts: ToastItem[] = [];
let listeners: Array<(toasts: ToastItem[]) => void> = [];

export function subscribe(listener: (toasts: ToastItem[]) => void) {
  listeners.push(listener);
  listener(toasts);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

function notify() {
  listeners.forEach(l => l(toasts));
}

let idCounter = 0;

export function showToast(
  type: ToastType,
  title: string,
  message?: string,
  duration = 5000
) {
  const id = `toast-${Date.now()}-${++idCounter}`;
  toasts = [...toasts, { id, type, title, message }];
  notify();
  setTimeout(() => hideToast(id), duration);
}

export function hideToast(id: string) {
  toasts = toasts.filter(t => t.id !== id);
  notify();
}

export function showSuccess(title: string, message?: string) {
  showToast('success', title, message);
}

export function showError(title: string, message?: string) {
  showToast('error', title, message);
}

export function showInfo(title: string, message?: string) {
  showToast('info', title, message);
}

export function showLoading(title: string, message?: string) {
  showToast('loading', title, message);
}
