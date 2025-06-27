import { useState } from 'react';

interface ConfirmDialogConfig {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export const useConfirmDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<ConfirmDialogConfig>({});
    const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null);

    const showConfirm = (callback: () => void, options?: ConfirmDialogConfig) => {
        setOnConfirmCallback(() => callback);
        setConfig(options || {});
        setIsOpen(true);
    };

    const handleConfirm = () => {
        if (onConfirmCallback) {
            onConfirmCallback();
        }
        setIsOpen(false);
        setOnConfirmCallback(null);
    };

    const handleCancel = () => {
        setIsOpen(false);
        setOnConfirmCallback(null);
    };

    return {
        isOpen,
        config,
        showConfirm,
        handleConfirm,
        handleCancel,
    };
}; 