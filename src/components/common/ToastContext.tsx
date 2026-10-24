// ==============================================================================
// BrightPath CRM — ToastProvider Component
// Accessible, responsive, and animated toast alerts for async feedback
// ==============================================================================

import React, { useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import {
  ToastContext,
  ToastItem,
  ToastType,
} from './toastContextDef';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastItem, 'id'>): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const duration = toast.duration ?? 4000;

      const newToast: ToastItem = { ...toast, id };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'success', title, message });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'error', title, message, duration: 6000 });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'info', title, message });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'warning', title, message, duration: 5000 });
    },
    [addToast]
  );

  const contextValue = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      success,
      error,
      info,
      warning,
    }),
    [toasts, addToast, removeToast, success, error, info, warning]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// ==============================================================================
// Toast Visual Container
// ==============================================================================

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notification alerts"
      className="toast-viewport"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '420px',
        width: 'calc(100% - 40px)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onRemove(toast.id)} />
      ))}
    </div>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const getStyling = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: '#ffffff',
          border: '1px solid #a7f3d0',
          borderLeft: '4px solid #10b981',
          iconColor: '#059669',
          icon: <CheckCircle2 size={18} />,
        };
      case 'error':
        return {
          bg: '#ffffff',
          border: '1px solid #fecdd3',
          borderLeft: '4px solid #e11d48',
          iconColor: '#e11d48',
          icon: <AlertTriangle size={18} />,
        };
      case 'warning':
        return {
          bg: '#ffffff',
          border: '1px solid #fde68a',
          borderLeft: '4px solid #d97706',
          iconColor: '#d97706',
          icon: <AlertCircle size={18} />,
        };
      case 'info':
      default:
        return {
          bg: '#ffffff',
          border: '1px solid #bfdbfe',
          borderLeft: '4px solid #2563eb',
          iconColor: '#2563eb',
          icon: <Info size={18} />,
        };
    }
  };

  const styleConfig = getStyling(toast.type);

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className="animate-slide-down"
      style={{
        pointerEvents: 'auto',
        backgroundColor: styleConfig.bg,
        borderRadius: 'var(--radius-lg)',
        border: styleConfig.border,
        borderLeft: styleConfig.borderLeft,
        boxShadow: 'var(--shadow-lg)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        position: 'relative',
        transition: 'all var(--duration-fast) var(--ease-spring)',
      }}
    >
      <div style={{ color: styleConfig.iconColor, flexShrink: 0, marginTop: '2px' }}>
        {styleConfig.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--slate-900)',
            lineHeight: 1.3,
          }}
        >
          {toast.title}
        </p>
        {toast.message && (
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--slate-600)',
              marginTop: '4px',
              lineHeight: 1.4,
              wordBreak: 'break-word',
            }}
          >
            {toast.message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--slate-400)',
          cursor: 'pointer',
          padding: '8px',
          margin: '-6px -6px 0 0',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '36px',
          minHeight: '36px',
          flexShrink: 0,
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--slate-700)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--slate-400)')}
      >
        <X size={16} />
      </button>
    </div>
  );
};
