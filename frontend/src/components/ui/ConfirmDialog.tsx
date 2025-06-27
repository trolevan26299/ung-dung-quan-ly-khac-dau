import React from 'react';
import { Button } from './Button';
import { Portal } from './Portal';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose?: () => void;
    onCancel?: () => void; // Backward compatibility
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    confirmVariant?: 'default' | 'destructive'; // Backward compatibility
    isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onCancel, // Backward compatibility
    onConfirm,
    title = 'Xác nhận',
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    type = 'danger',
    confirmVariant, // Backward compatibility
    isLoading = false
}) => {
    if (!isOpen) return null;

    // Handle backward compatibility
    const handleClose = onClose || onCancel || (() => {});
    
    // Map old confirmVariant to new type system
    let finalType = type;
    if (confirmVariant && !type) {
        finalType = confirmVariant === 'destructive' ? 'danger' : 'info';
    }

    const getTypeConfig = () => {
        switch (finalType) {
            case 'danger':
                return {
                    iconColor: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    buttonVariant: 'danger' as const
                };
            case 'warning':
                return {
                    iconColor: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    buttonVariant: 'secondary' as const
                };
            case 'info':
                return {
                    iconColor: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    buttonVariant: 'default' as const
                };
            default:
                return {
                    iconColor: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    buttonVariant: 'danger' as const
                };
        }
    };

    const config = getTypeConfig();

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <Portal>
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100vw',
                    height: '100vh'
                }}
                onClick={handleClose}
            >
                <div 
                    className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${config.bgColor} ${config.borderColor} border`}>
                                <AlertTriangle className={`w-5 h-5 ${config.iconColor}`} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {title}
                            </h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            className="h-8 w-8 p-0"
                            disabled={isLoading}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {message}
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                        <Button
                            variant="secondary"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={config.buttonVariant}
                            onClick={handleConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang xử lý...' : confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </Portal>
    );
}; 