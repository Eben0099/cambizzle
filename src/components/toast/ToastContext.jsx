import { createContext } from 'react';

const ToastContext = createContext({
  showToast: () => {},
  removeToast: () => {},
  clearToasts: () => {},
});

export default ToastContext;
