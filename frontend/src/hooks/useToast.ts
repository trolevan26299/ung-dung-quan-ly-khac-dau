import { useState, useCallback } from 'react';
import { ToastItem, ToastType } from '../components/ui/ToastContainer';

export const useToast = () => {
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

    return {
        toasts,
        addToast,
        removeToast,
        clearToasts,
        success,
        error,
        warning,
        info
    };
}; 