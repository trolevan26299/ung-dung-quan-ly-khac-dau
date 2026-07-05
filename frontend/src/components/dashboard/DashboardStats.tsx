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

// Pill "so với tháng trước": nền nhạt + chữ đậm theo chiều tăng/giảm.
const CHANGE_TYPE_COLORS = {
    positive: 'bg-green-50 text-green-700',
    negative: 'bg-red-50 text-red-700',
    neutral: 'bg-gray-100 text-gray-500'
} as const;

// Màu chip icon riêng cho từng thẻ (theo thứ tự hiển thị) để bảng số đỡ đơn điệu.
const STAT_ACCENTS = [
    { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { bg: 'bg-blue-50', text: 'text-blue-600' },
    { bg: 'bg-violet-50', text: 'text-violet-600' },
    { bg: 'bg-amber-50', text: 'text-amber-600' },
] as const;

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {dashboardStats.map((stat, index) => {
                const Icon = ICON_MAP[stat.icon as keyof typeof ICON_MAP];
                const accent = STAT_ACCENTS[index] ?? STAT_ACCENTS[0];
                return (
                    <Card key={index} className="transition-shadow hover:shadow-md">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                    <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-gray-900">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.bg}`}>
                                    <Icon className={`h-[22px] w-[22px] ${accent.text}`} />
                                </div>
                            </div>
                            {(stat.change || stat.description) && (
                                <div className="mt-4 flex items-center gap-2">
                                    {stat.change && (
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getChangeColor(stat.changeType)}`}>
                                            {stat.change}
                                        </span>
                                    )}
                                    {stat.description && (
                                        <span className="text-xs text-gray-400">{stat.description}</span>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}; 