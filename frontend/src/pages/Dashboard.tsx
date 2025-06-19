import { Calendar } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Dashboard Components
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { RecentOrders } from '../components/dashboard/RecentOrders';
import { LowStockAlert } from '../components/dashboard/LowStockAlert';

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
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-primary-900 mb-4">Thao tác nhanh</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div 
                        className="text-center cursor-pointer hover:bg-primary-200 rounded-lg p-3 transition-colors"
                        onClick={() => handleQuickAction('add-order')}
                    >
                        <div className="w-12 h-12 bg-primary-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <span className="text-white font-bold">+</span>
                        </div>
                        <p className="text-sm font-medium text-primary-800">Thêm đơn hàng</p>
                    </div>
                    <div 
                        className="text-center cursor-pointer hover:bg-primary-200 rounded-lg p-3 transition-colors"
                        onClick={() => handleQuickAction('manage-stock')}
                    >
                        <div className="w-12 h-12 bg-primary-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <span className="text-white font-bold">📦</span>
                        </div>
                        <p className="text-sm font-medium text-primary-800">Quản lý kho</p>
                    </div>
                    <div 
                        className="text-center cursor-pointer hover:bg-primary-200 rounded-lg p-3 transition-colors"
                        onClick={() => handleQuickAction('add-customer')}
                    >
                        <div className="w-12 h-12 bg-primary-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <span className="text-white font-bold">👥</span>
                        </div>
                        <p className="text-sm font-medium text-primary-800">Thêm khách hàng</p>
                    </div>
                    <div 
                        className="text-center cursor-pointer hover:bg-primary-200 rounded-lg p-3 transition-colors"
                        onClick={() => handleQuickAction('view-reports')}
                    >
                        <div className="w-12 h-12 bg-primary-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <span className="text-white font-bold">📊</span>
                        </div>
                        <p className="text-sm font-medium text-primary-800">Xem báo cáo</p>
                    </div>
                </div>
            </div>
        </div>
    );
};