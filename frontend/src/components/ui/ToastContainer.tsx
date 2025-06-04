import React from 'react';
import { Toast, ToastType } from './Toast';

export type { ToastType } from './Toast';

export interface ToastItem {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContainerProps {
    toasts: ToastItem[];
    onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
    toasts,
    onRemove
}) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] space-y-2">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    className="animate-in slide-in-from-right-full"
                    style={{
                        animationDelay: `${index * 100}ms`,
                        animationFillMode: 'both'
                    }}
                >
                    <Toast
                        id={toast.id}
                        type={toast.type}
                        title={toast.title}
                        message={toast.message}
                        duration={toast.duration}
                        onClose={onRemove}
                    />
                </div>
            ))}
        </div>
    );
}; 