import React from 'react';
import { Edit, Eye, Trash2, User, Calendar, Package, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { StatusBadge } from '../common';
import { formatCurrency, formatDate, safeString, safeNumber } from '../../lib/utils';
import { useConfirm } from '../../hooks';
import type { Order } from '../../types';

interface OrderCardProps {
    order: Order;
    onEdit: (order: Order) => void;
    onView: (order: Order) => void;
    onDelete: (id: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
    order,
    onEdit,
    onView,
    onDelete
}) => {
    const { confirm, confirmProps } = useConfirm();

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Xóa đơn hàng',
            message: `Bạn có chắc chắn muốn xóa đơn hàng "${order.orderNumber}"? Hành động này không thể hoàn tác.`,
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            confirmVariant: 'destructive'
        });

        if (confirmed) {
            onDelete(order._id);
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-50';
            case 'debt':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-yellow-600 bg-yellow-50';
        }
    };

    const getPaymentStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Đã thanh toán';
            case 'debt':
                return 'Công nợ';
            default:
                return 'Chờ thanh toán';
        }
    };

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 truncate">
                                {safeString(order.orderNumber)}
                            </h3>
                            <div className="flex items-center space-x-2 mt-2">
                                <StatusBadge type="order" status={order.status} />
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                    {getPaymentStatusText(order.paymentStatus)}
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-1 ml-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onView(order)}
                                className="h-8 w-8 p-0"
                                title="Xem chi tiết"
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(order)}
                                className="h-8 w-8 p-0"
                                title="Chỉnh sửa"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDelete}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Xóa"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        {/* Customer */}
                        <div className="flex items-center text-gray-600">
                            <User className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">
                                {order.customer ? order.customer.name : 'Không có khách hàng'}
                            </span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{formatDate(order.createdAt)}</span>
                        </div>

                        {/* Items count */}
                        <div className="flex items-center text-gray-600">
                            <Package className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{safeNumber(order.items?.length)} sản phẩm</span>
                        </div>

                        {/* Total amount */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <div className="flex items-center text-green-600">
                                <DollarSign className="w-4 h-4 mr-1" />
                                <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes preview */}
                    {order.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 line-clamp-2">
                                Ghi chú: {order.notes}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ConfirmDialog {...confirmProps} />
        </>
    );
}; 