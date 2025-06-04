import { useState, useCallback } from 'react';

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'default' | 'destructive';
}

interface ConfirmState {
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
}

export const useConfirm = () => {
    const [state, setState] = useState<ConfirmState>({
        isOpen: false,
        options: { message: '' },
        resolve: null
    });

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                isOpen: true,
                options,
                resolve
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (state.resolve) {
            state.resolve(true);
        }
        setState({
            isOpen: false,
            options: { message: '' },
            resolve: null
        });
    }, [state.resolve]);

    const handleCancel = useCallback(() => {
        if (state.resolve) {
            state.resolve(false);
        }
        setState({
            isOpen: false,
            options: { message: '' },
            resolve: null
        });
    }, [state.resolve]);

    return {
        confirm,
        confirmProps: {
            isOpen: state.isOpen,
            ...state.options,
            onConfirm: handleConfirm,
            onCancel: handleCancel
        }
    };
}; 