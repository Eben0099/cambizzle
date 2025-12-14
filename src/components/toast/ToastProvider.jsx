import React, { useState, useCallback, useMemo } from 'react';
import ToastContext from './ToastContext';
import ToastContainer from './ToastContainer';

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback((opts) => {
    const { message, title, type = 'info', duration = 3500 } = opts || {};
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, title, type, duration }]);
  }, []);

  const value = useMemo(() => ({ showToast, removeToast, clearToasts }), [showToast, removeToast, clearToasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
