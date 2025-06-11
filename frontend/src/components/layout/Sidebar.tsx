import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
    Home,
    Users,
    UserCheck,
    Package,
    ShoppingCart,
    Warehouse,
    BarChart3,
    LogOut,
    Settings,
    Tag
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { cn } from '../../lib/utils';

const allMenuItems = [
    { icon: Home, label: 'Tổng quan', path: '/dashboard' },
    { icon: Users, label: 'Khách hàng', path: '/customers' },
    { icon: UserCheck, label: 'Đại lý', path: '/agents' },
    { icon: Package, label: 'Sản phẩm', path: '/products' },
    { icon: Tag, label: 'Danh mục sản phẩm', path: '/categories' },
    { icon: ShoppingCart, label: 'Đơn hàng', path: '/orders' },
    { icon: Warehouse, label: 'Kho hàng', path: '/stock' },
    { icon: BarChart3, label: 'Thống kê', path: '/statistics' },
    { icon: Settings, label: 'Người dùng', path: '/users', adminOnly: true },
];

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const { user: currentAuthUser } = useSelector((state: RootState) => state.auth);
    
    console.log('Sidebar render - current location:', location.pathname);
    
    // Kiểm tra quyền admin với fallback
    const localStorageUser = JSON.parse(localStorage.getItem('user') || 'null');
    const isAdmin = currentAuthUser?.role === 'admin' || localStorageUser?.role === 'admin';

    // Filter menu items based on user role
    const menuItems = allMenuItems.filter(item => !item.adminOnly || isAdmin);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col sticky top-0">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-800">
                    🖋️ Khắc Dấu Pro
                </h1>
                <p className="text-sm text-gray-500 mt-1">Quản lý cửa hàng</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    onClick={() => {
                                        console.log('Navigation clicked:', item.path, item.label);
                                    }}
                                    className={cn(
                                        "flex items-center px-4 py-3 rounded-lg transition-colors duration-200",
                                        isActive
                                            ? "bg-primary-50 text-primary-600 border-r-2 border-primary-600"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="font-medium">Đăng xuất</span>
                </button>
            </div>
        </div>
    );
}; 