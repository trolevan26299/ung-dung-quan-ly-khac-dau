import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { RECENT_ORDERS, DASHBOARD_STATUS_COLORS, DASHBOARD_STATUS_LABELS } from '../../constants/dashboard';

export const RecentOrders: React.FC = () => {
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
                <div className="space-y-4">
                    {RECENT_ORDERS.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">{order.id}</p>
                                <p className="text-sm text-gray-500">{order.customer}</p>
                                <p className="text-xs text-gray-400">{order.date}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium text-gray-900">{order.amount}</p>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                    {getStatusText(order.status)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}; 