import React, { useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { RootState, AppDispatch } from '../../store';
import { fetchRecentOrders } from '../../store/slices/dashboardSlice';
import { formatCurrency } from '../../lib/utils';

const DASHBOARD_STATUS_COLORS = {
    completed: 'text-green-600 bg-green-100',
    pending: 'text-yellow-600 bg-yellow-100',
    debt: 'text-red-600 bg-red-100',
    default: 'text-gray-600 bg-gray-100'
} as const;

const DASHBOARD_STATUS_LABELS = {
    completed: 'Đã thanh toán',
    pending: 'Chưa thanh toán',
    debt: 'Công nợ'
} as const;

export const RecentOrders: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { recentOrders, isLoading } = useSelector((state: RootState) => state.dashboard);

    useEffect(() => {
        dispatch(fetchRecentOrders());
    }, [dispatch]);

    const getStatusColor = (status: string) => {
        return DASHBOARD_STATUS_COLORS[status as keyof typeof DASHBOARD_STATUS_COLORS] || DASHBOARD_STATUS_COLORS.default;
    };

    const getStatusText = (status: string) => {
        return DASHBOARD_STATUS_LABELS[status as keyof typeof DASHBOARD_STATUS_LABELS] || status;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Đơn hàng gần đây
                </CardTitle>
                <CardDescription>
                    Các đơn hàng mới nhất trong hệ thống
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded mb-1 w-2/3"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div className="text-right">
                                    <div className="h-4 bg-gray-200 rounded mb-2 w-20"></div>
                                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentOrders.length > 0 ? recentOrders.map((order: any) => (
                            <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                                    <p className="text-sm text-gray-500">{order.customer?.name || 'N/A'}</p>
                                    <p className="text-xs text-gray-400">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '-'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.paymentStatus)}`}>
                                        {getStatusText(order.paymentStatus)}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-gray-500">
                                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>Chưa có đơn hàng nào</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}; 