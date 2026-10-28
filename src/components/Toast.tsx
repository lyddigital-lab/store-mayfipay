import { useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'loading';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  hideToast: (id: string) => void;
  toasts: ToastItem[];
}

export function ToastContainer(): ToastContextType {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
    loading: <Loader2 className="w-5 h-5 text-mayfipay-orange animate-spin" />,
  };

  const bgColors: Record<ToastType, string> = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    loading: 'bg-mayfipay-border-light border-mayfipay-border',
  };

  const textColors: Record<ToastType, string> = {
    success: 'text-green-700',
    error: 'text-red-700',
    info: 'text-blue-700',
    loading: 'text-mayfipay-orange',
  };

  return (
    <>
      {toasts.map((t, i) => (
        <div
          key={t.id}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl border-l-4 transform transition-all duration-300 translate-y-0 ${bgColors[t.type]}`}
          style={{ transform: `translateY(${i * 80}px)` }}
        >
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 ${textColors[t.type]}`}>{icons[t.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-mayfipay-text">{t.title}</p>
              {t.message && <p className="text-xs text-mayfipay-text-sec mt-0.5">{t.message}</p>}
            </div>
            <button
              onClick={() => hideToast(t.id)}
              className="ml-2 text-gray-400 hover:text-mayfipay-orange transition-colors"
            >
              <span className="sr-only">Fermer</span>
              <span className="text-xs">✕</span>
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

export function useToast(): ToastContextType {
  // Dans ce projet, ToastContainer est placé globalement dans Layout.
  // Ce hook retourne des fonctions vides ; le ToastContainer gère l'affichage.
  // Pour une utilisation directe sans ToastContainer, voir ToastProvider.
  return { showToast: () => {}, hideToast: () => {}, toasts: [] };
}

export default ToastContainer;
