import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const typeStyles = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
  warning: 'bg-amber-500 text-black',
};

const typeIcon = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const ToastItem = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const Icon = typeIcon[toast.type] || Info;

  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 10);
    const autoTimer = setTimeout(() => setVisible(false), toast.duration - 300);
    const exitTimer = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(autoTimer);
      clearTimeout(exitTimer);
    };
  }, [toast, onDismiss]);

  return (
    <div
      className={`pointer-events-auto shadow-lg rounded-lg px-4 py-3 mb-3 flex items-start gap-3 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${typeStyles[toast.type] || typeStyles.info}`}
      role="status"
      aria-live="polite"
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1">
        {toast.title && <div className="font-semibold">{toast.title}</div>}
        <div className="text-sm">{toast.message}</div>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        className="ml-2 text-white/80 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed z-50 top-4 right-4 left-4 sm:left-auto sm:right-4 pointer-events-none">
      <div className="max-w-sm sm:max-w-md ml-auto">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
