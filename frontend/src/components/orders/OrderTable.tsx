import React from 'react';
import { Eye, Edit, Trash2, ShoppingCart, Calendar, DollarSign, Package } from 'lucide-react';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { formatCurrency, safeString, safeNumber } from '../../lib/utils';
import { useConfirm } from '../../hooks';
import type { Order } from '../../types';

interface OrderTableProps {
    orders?: Order[];
    isLoading?: boolean;
    onView: (order: Order) => void;
    onEdit: (order: Order) => void;
    onDelete: (id: string) => void;
    onAdd?: () => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({
    orders,
    isLoading = false,
    onView,
    onEdit,
    onDelete,
    onAdd
}) => {
    const { confirm, confirmProps } = useConfirm();

    const handleDelete = async (order: Order) => {
        const confirmed = await confirm({
            title: 'Xóa đơn hàng',
            message: `Bạn có chắc chắn muốn xóa đơn hàng "#${order.orderNumber}"?`,
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            confirmVariant: 'destructive'
        });

        if (confirmed) {
            onDelete(order._id);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'text-green-600 bg-green-50';
            case 'cancelled':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'text-green-600 bg-green-50';
            case 'partial':
                return 'text-yellow-600 bg-yellow-50';
            case 'pending':
                return 'text-orange-600 bg-orange-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Hoạt động';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return 'Không xác định';
        }
    };

    const getPaymentStatusText = (status: string) => {
        switch (status) {
            case 'paid':
                return 'Đã thanh toán';
            case 'partial':
                return 'Thanh toán 1 phần';
            case 'pending':
                return 'Chờ thanh toán';
            default:
                return 'Không xác định';
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="animate-pulse">
                    <div className="h-12 bg-gray-200 rounded-t-lg"></div>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="h-16 bg-gray-100 border-t border-gray-200"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                    <ShoppingCart className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
                <p className="text-gray-500 mb-4">Bắt đầu bằng cách tạo đơn hàng đầu tiên</p>
                {onAdd && (
                    <Button onClick={onAdd}>
                        Tạo đơn hàng
                    </Button>
                )}
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Đơn hàng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Khách hàng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sản phẩm
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tổng tiền
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thanh toán
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(orders || []).map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                #{order.orderNumber}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ID: {order._id.slice(-6)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {safeString(order.customer?.name || 'N/A')}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {safeString(order.customer?.phone || '')}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-900">
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Package className="w-4 h-4 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-900">
                                                {safeNumber(order.items?.length || 0)} sản phẩm
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                                            <span className="text-sm font-semibold text-green-600">
                                                {formatCurrency(order.totalAmount)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                                            {getPaymentStatusText(order.paymentStatus)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex space-x-1">
                                            <Button
                                                variant="light"
                                                size="xs"
                                                onClick={() => onView(order)}
                                                className="h-7 w-7 p-0"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="light"
                                                size="xs"
                                                onClick={() => onEdit(order)}
                                                className="h-7 w-7 p-0"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="xs"
                                                onClick={() => handleDelete(order)}
                                                className="h-7 w-7 p-0"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmDialog {...confirmProps} />
        </>
    );
}; 