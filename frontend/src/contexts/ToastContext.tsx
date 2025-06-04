import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer, ToastItem, ToastType } from '../components/ui/ToastContainer';

interface ToastContextType {
    addToast: (type: ToastType, title: string, message?: string, duration?: number) => string;
    removeToast: (id: string) => void;
    clearToasts: () => void;
    success: (title: string, message?: string, duration?: number) => string;
    error: (title: string, message?: string, duration?: number) => string;
    warning: (title: string, message?: string, duration?: number) => string;
    info: (title: string, message?: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const addToast = useCallback((
        type: ToastType,
        title: string,
        message?: string,
        duration = 5000
    ) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: ToastItem = {
            id,
            type,
            title,
            message,
            duration
        };

        setToasts(prev => [...prev, newToast]);
        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const clearToasts = useCallback(() => {
        setToasts([]);
    }, []);

    // Convenience methods
    const success = useCallback((title: string, message?: string, duration?: number) => {
        return addToast('success', title, message, duration);
    }, [addToast]);

    const error = useCallback((title: string, message?: string, duration?: number) => {
        return addToast('error', title, message, duration);
    }, [addToast]);

    const warning = useCallback((title: string, message?: string, duration?: number) => {
        return addToast('warning', title, message, duration);
    }, [addToast]);

    const info = useCallback((title: string, message?: string, duration?: number) => {
        return addToast('info', title, message, duration);
    }, [addToast]);

    const value: ToastContextType = {
        addToast,
        removeToast,
        clearToasts,
        success,
        error,
        warning,
        info
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}; 