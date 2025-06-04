import React from 'react';
import {
    ORDER_STATUS,
    ORDER_STATUS_LABELS,
    PAYMENT_STATUS,
    PAYMENT_STATUS_LABELS,
    STOCK_TRANSACTION_TYPES,
    STOCK_TRANSACTION_LABELS,
    STATUS_COLORS
} from '../../constants';

type StatusType = 'order' | 'payment' | 'stock' | 'custom';

interface StatusBadgeProps {
    type: StatusType;
    status: string;
    customLabel?: string;
    customColor?: keyof typeof STATUS_COLORS;
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    type,
    status,
    customLabel,
    customColor,
    className = ''
}) => {
    const getStatusLabel = () => {
        if (customLabel) return customLabel;

        switch (type) {
            case 'order':
                return ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] || status;
            case 'payment':
                return PAYMENT_STATUS_LABELS[status as keyof typeof PAYMENT_STATUS_LABELS] || status;
            case 'stock':
                return STOCK_TRANSACTION_LABELS[status as keyof typeof STOCK_TRANSACTION_LABELS] || status;
            default:
                return status;
        }
    };

    const getStatusColor = () => {
        if (customColor) return STATUS_COLORS[customColor];

        switch (type) {
            case 'order':
                switch (status) {
                    case ORDER_STATUS.ACTIVE:
                        return STATUS_COLORS.SUCCESS;
                    case ORDER_STATUS.CANCELLED:
                        return STATUS_COLORS.ERROR;
                    default:
                        return STATUS_COLORS.DEFAULT;
                }
            case 'payment':
                switch (status) {
                    case PAYMENT_STATUS.COMPLETED:
                        return STATUS_COLORS.SUCCESS;
                    case PAYMENT_STATUS.DEBT:
                        return STATUS_COLORS.WARNING;
                    default:
                        return STATUS_COLORS.ERROR;
                }
            case 'stock':
                switch (status) {
                    case STOCK_TRANSACTION_TYPES.IMPORT:
                        return STATUS_COLORS.SUCCESS;
                    case STOCK_TRANSACTION_TYPES.EXPORT:
                        return STATUS_COLORS.WARNING;
                    default:
                        return STATUS_COLORS.INFO;
                }
            default:
                return STATUS_COLORS.DEFAULT;
        }
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()} ${className}`}
        >
            {getStatusLabel()}
        </span>
    );
}; 