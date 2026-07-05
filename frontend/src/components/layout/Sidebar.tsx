import React, { useState } from 'react';
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
    Tag,
    ChevronDown,
    ChevronRight
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { cn } from '../../lib/utils';

// Menu items chính
const mainMenuItems = [
    { icon: Home, label: 'Tổng quan', path: '/dashboard' },
    { icon: BarChart3, label: 'Thống kê', path: '/statistics' },
    { icon: ShoppingCart, label: 'Đơn hàng', path: '/orders' },
    { icon: Warehouse, label: 'Kho hàng', path: '/stock' },
    { icon: Package, label: 'Sản phẩm', path: '/products' },
];

// Menu con trong "Cài đặt"
const settingsMenuItems = [
    { icon: Tag, label: 'Danh mục sản phẩm', path: '/categories' },
    { icon: Settings, label: 'Người dùng', path: '/users', adminOnly: true },
    { icon: UserCheck, label: 'Đại lý', path: '/agents' },
    { icon: Users, label: 'Khách hàng', path: '/customers' },
];

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const { user: currentAuthUser } = useSelector((state: RootState) => state.auth);
    const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
    
    // Kiểm tra quyền admin với fallback
    const localStorageUser = JSON.parse(localStorage.getItem('user') || 'null');
    const isAdmin = currentAuthUser?.role === 'admin' || localStorageUser?.role === 'admin';

    // Filter settings menu items based on user role
    const filteredSettingsItems = settingsMenuItems.filter(item => !item.adminOnly || isAdmin);

    // Kiểm tra nếu đang ở trang settings nào đó thì expand menu
    const isInSettingsSection = filteredSettingsItems.some(item => location.pathname === item.path);
    React.useEffect(() => {
        if (isInSettingsSection) {
            setIsSettingsExpanded(true);
        }
    }, [isInSettingsSection]);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        // h-screen + shrink-0: sidebar cao đúng màn hình và không bị co lại.
        <div className="w-64 shrink-0 bg-white border-r border-gray-200 h-screen flex flex-col">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-100 shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-lg shadow-sm">
                    🖋️
                </div>
                <div className="leading-tight">
                    <h1 className="text-[15px] font-bold text-gray-800">Khắc Dấu TT</h1>
                    <p className="text-xs text-gray-400">Quản lý cửa hàng</p>
                </div>
            </div>

            {/* Navigation — cuộn nội bộ nếu menu dài hơn màn hình */}
            <nav className="flex-1 p-3 overflow-y-auto">
                <ul className="space-y-1">
                    {/* Main menu items */}
                    {mainMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    )}
                                >
                                    <Icon className="h-[18px] w-[18px]" />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}

                    {/* Settings menu with expandable submenu */}
                    <li>
                        <button
                            onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                            className={cn(
                                "flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                isInSettingsSection
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <span className="flex items-center gap-3">
                                <Settings className="h-[18px] w-[18px]" />
                                Cài đặt
                            </span>
                            {isSettingsExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </button>

                        {/* Submenu — thụt vào với đường kẻ dẫn hướng bên trái */}
                        {isSettingsExpanded && (
                            <ul className="mt-1 ml-4 space-y-1 border-l border-gray-100 pl-3">
                                {filteredSettingsItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;

                                    return (
                                        <li key={item.path}>
                                            <Link
                                                to={item.path}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                                    isActive
                                                        ? "bg-blue-600 text-white shadow-sm"
                                                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                                )}
                                            >
                                                <Icon className="h-[18px] w-[18px]" />
                                                {item.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </li>
                </ul>
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-gray-100 shrink-0">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                    <LogOut className="h-[18px] w-[18px]" />
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}; 