import React from 'react';
import { Eye, Edit, Trash2, ShoppingCart, Calendar, DollarSign, Package } from 'lucide-react';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/tooltip';
import { formatCurrency, safeString, safeNumber, formatTableDate } from '../../lib/utils';
import type { Order } from '../../types';

interface OrderTableProps {
    orders?: Order[];
    isLoading?: boolean;
    onView: (order: Order) => void;
    onEdit: (order: Order) => void;
    onDelete: (id: string) => void;
    onAdd?: () => void;
    currentPage?: number;
    pageSize?: number;
    selectedOrders?: string[];
    onSelectAll?: (checked: boolean) => void;
    onSelectOrder?: (orderId: string, checked: boolean) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({
    orders,
    isLoading = false,
    onView,
    onEdit,
    onDelete,
    onAdd,
    currentPage = 1,
    pageSize = 20,
    selectedOrders = [],
    onSelectAll,
    onSelectOrder
}) => {
    const handleDelete = (order: Order) => {
        onDelete(order._id);
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
            case 'completed':
                return 'text-green-600 bg-green-50';
            case 'debt':
                return 'text-red-600 bg-red-50';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Hoàn thành';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return 'Không xác định';
        }
    };

    const getPaymentStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Đã thanh toán';
            case 'debt':
                return 'Công nợ';
            case 'pending':
                return 'COD';
            default:
                return 'Không xác định';
        }
    };

    const getPaymentMethodText = (method?: string) => {
        switch (method) {
            case 'company_account':
                return 'Tài khoản Cty';
            case 'personal_account':
                return 'TK cá nhân chị Hậu';
            case 'cash':
                return 'Tiền mặt';
            default:
                return 'TK cá nhân chị Hậu';
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 shadow-soft">
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
            <div className="bg-white rounded-xl border border-gray-100 shadow-soft p-12 text-center">
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
            <div className="bg-white rounded-xl border border-gray-100 shadow-soft flex flex-col h-full overflow-hidden">
                {/* Single Table with Fixed Header */}
                <div className="overflow-x-auto overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 293px)' }}>
                    <table className="min-w-full table-fixed">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                    <input
                                        type="checkbox"
                                        checked={orders && orders.length > 0 && selectedOrders.length === orders.length}
                                        onChange={(e) => onSelectAll?.(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                                    STT
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                    Đơn hàng
                                </th>
                                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                                    Khách hàng
                                </th>
                                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                    Đại lý
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                    Ngày lên đơn
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                    Sản phẩm
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                    Tổng tiền
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                    Thanh toán
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                                    Khách thanh toán
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(orders || []).map((order, index) => {
                                const stt = (currentPage - 1) * pageSize + index + 1;
                                return (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 whitespace-nowrap w-12 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order._id)}
                                                onChange={(e) => onSelectOrder?.(order._id, e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap w-16 text-center">
                                            <span className="text-sm text-gray-600 font-medium">
                                                {stt}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap w-32">
                                        <div className="text-sm font-medium text-gray-900">
                                            {order.orderNumber}
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 w-36">
                                        <div className="max-w-36 overflow-hidden">
                                            <Tooltip 
                                                content={`SĐT: ${safeString(order.customer?.phone || 'Chưa có')}`}
                                                side="top"
                                            >
                                                <div className="text-sm font-medium text-gray-900 truncate cursor-help overflow-hidden">
                                                    {safeString(order.customer?.name || 'N/A')}
                                                </div>
                                            </Tooltip>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 w-32">
                                        <div className="max-w-32 overflow-hidden">
                                            <Tooltip 
                                                content={`SĐT: ${safeString(order.agent?.phone || 'Chưa có')}`}
                                                side="top"
                                            >
                                                <div className="text-sm font-medium text-gray-900 truncate cursor-help overflow-hidden">
                                                    {safeString(order.agent?.name || 'N/A')}
                                                </div>
                                            </Tooltip>
                                        </div>
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap w-24">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-900">
                                                {formatTableDate(order.deliveryDate || order.createdAt)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap w-20">
                                        <div className="flex items-center">
                                            <Package className="w-4 h-4 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-900">
                                                {safeNumber(order.items?.length || 0)} sản phẩm
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap w-24">
                                        <div className="flex items-center">
                                            <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                                            <span className="text-sm font-semibold text-green-600">
                                                {formatCurrency(order.totalAmount)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap w-24">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap w-24">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                                            {getPaymentStatusText(order.paymentStatus)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap w-28">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                                            {getPaymentMethodText(order.paymentMethod)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium w-24">
                                        <div className="flex justify-end items-center space-x-1">
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
                                                disabled={order.status === 'cancelled'}
                                                className={`h-7 w-7 p-0 ${order.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title={order.status === 'cancelled' ? 'Không thể chỉnh sửa đơn hàng đã hủy' : 'Chỉnh sửa'}
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
                            );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}; 