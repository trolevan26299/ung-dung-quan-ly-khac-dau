import React, { useEffect } from 'react';
import {
    DollarSign,
    Package,
    ShoppingCart,
    Users
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent } from '../ui/Card';
import { RootState, AppDispatch } from '../../store';
import { 
    fetchDashboardStats, 
    fetchTotalCustomers, 
    fetchTotalAgents, 
    fetchTotalProducts,
    fetchCustomerStats
} from '../../store/slices/dashboardSlice';
import { formatCurrency } from '../../lib/utils';

type ChangeType = 'positive' | 'negative' | 'neutral';

const ICON_MAP = {
    DollarSign,
    ShoppingCart,
    Users,
    Package
} as const;

const CHANGE_TYPE_COLORS = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
} as const;

export const DashboardStats: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { 
        stats, 
        totalCustomers, 
        totalProducts, 
        customerStats,
        isLoading 
    } = useSelector((state: RootState) => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardStats());
        dispatch(fetchTotalCustomers());
        dispatch(fetchTotalAgents());
        dispatch(fetchTotalProducts());
        dispatch(fetchCustomerStats());
    }, [dispatch]);

    const getChangeColor = (changeType: ChangeType) => {
        return CHANGE_TYPE_COLORS[changeType] || CHANGE_TYPE_COLORS.neutral;
    };

    // Helper function to determine change type from percentage
    const getChangeType = (value: string): ChangeType => {
        if (value.startsWith('+')) return 'positive';
        if (value.startsWith('-')) return 'negative';
        return 'neutral';
    };

    // Create dynamic stats array from real data
    const dashboardStats = [
        {
            title: 'Tổng doanh thu',
            value: formatCurrency(stats?.totalRevenue || 0),
            change: stats?.changes?.revenueChangeFormatted || '+0%',
            changeType: getChangeType(stats?.changes?.revenueChangeFormatted || '+0%'),
            icon: 'DollarSign',
            description: 'So với tháng trước'
        },
        {
            title: 'Đơn hàng',
            value: stats?.totalOrders?.toString() || '0',
            change: stats?.changes?.ordersChangeFormatted || '+0%',
            changeType: getChangeType(stats?.changes?.ordersChangeFormatted || '+0%'),
            icon: 'ShoppingCart',
            description: 'So với tháng trước'
        },
        {
            title: 'Khách hàng',
            value: customerStats?.totalCustomers?.toString() || totalCustomers?.toString() || '0',
            change: customerStats?.customersChangeFormatted || '+0%',
            changeType: getChangeType(customerStats?.customersChangeFormatted || '+0%'),
            icon: 'Users',
            description: 'So với tháng trước'
        },
        {
            title: 'Sản phẩm',
            value: totalProducts?.toString() || '0',
            change: '', // Products don't change frequently, keep static
            changeType: 'neutral' as const,
            icon: 'Package',
            description: ''
        }
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-8 bg-gray-200 rounded"></div>
                                </div>
                                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                            </div>
                            <div className="mt-4">
                                <div className="h-4 bg-gray-200 rounded"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardStats.map((stat, index) => {
                const Icon = ICON_MAP[stat.icon as keyof typeof ICON_MAP];
                return (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                </div>
                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                    <Icon className="w-6 h-6 text-primary-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center">
                                <span className={`text-sm font-medium ${getChangeColor(stat.changeType)}`}>
                                    {stat.change}
                                </span>
                                <span className="text-sm text-gray-500 ml-2">{stat.description}</span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}; 