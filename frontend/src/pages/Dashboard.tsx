import { Calendar, Plus, Package, Users, BarChart3 } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Dashboard Components
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { RecentOrders } from '../components/dashboard/RecentOrders';
import { LowStockAlert } from '../components/dashboard/LowStockAlert';

// Thao tác nhanh — mỗi ô một icon + màu chip riêng cho dễ nhận biết.
const QUICK_ACTIONS = [
    { action: 'add-order', label: 'Thêm đơn hàng', icon: Plus, bg: 'bg-blue-50', text: 'text-blue-600' },
    { action: 'manage-stock', label: 'Quản lý kho', icon: Package, bg: 'bg-amber-50', text: 'text-amber-600' },
    { action: 'add-customer', label: 'Thêm khách hàng', icon: Users, bg: 'bg-violet-50', text: 'text-violet-600' },
    { action: 'view-reports', label: 'Xem báo cáo', icon: BarChart3, bg: 'bg-emerald-50', text: 'text-emerald-600' },
] as const;

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'add-order':
                navigate('/orders?action=create');
                break;
            case 'manage-stock':
                navigate('/stock');
                break;
            case 'add-customer':
                navigate('/customers?action=create');
                break;
            case 'view-reports':
                navigate('/statistics');
                break;
            default:
                break;
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
                    <p className="text-gray-500 mt-1">Chào mừng bạn quay trở lại!</p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date().toLocaleDateString('vi-VN', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </div>

            {/* Stats Cards */}
            <DashboardStats />

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentOrders />
                <LowStockAlert />
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-soft">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Thao tác nhanh</h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {QUICK_ACTIONS.map((qa) => {
                        const Icon = qa.icon;
                        return (
                            <button
                                key={qa.action}
                                onClick={() => handleQuickAction(qa.action)}
                                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 text-left transition-all hover:border-blue-200 hover:bg-blue-50"
                            >
                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${qa.bg}`}>
                                    <Icon className={`h-5 w-5 ${qa.text}`} />
                                </span>
                                <span className="text-sm font-medium text-gray-800">{qa.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};