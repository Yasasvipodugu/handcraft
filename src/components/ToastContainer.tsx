import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-emerald-500/80 bg-white text-stone-800 shadow-xl';
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;

        if (toast.type === 'error') {
          borderClass = 'border-rose-500/80 bg-white text-stone-800 shadow-xl';
          icon = <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
        } else if (toast.type === 'info') {
          borderClass = 'border-blue-500/80 bg-white text-stone-800 shadow-xl';
          icon = <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/80 bg-white text-stone-800 shadow-xl';
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border-l-4 shadow-lg border-y border-r border-stone-200 transition-all duration-300 transform translate-y-0 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-stone-900 leading-snug">{toast.title}</h4>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
