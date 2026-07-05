import React from 'react';
import { useSelector } from 'react-redux';
import { User } from 'lucide-react';
import { RootState } from '../../store';

export const Header: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    // Chữ cái đầu của tên để hiển thị trong avatar (fallback về icon nếu không có)
    const initial = user?.fullName?.trim()?.charAt(0)?.toUpperCase();

    return (
        // h-16 + shrink-0: header cao đúng bằng logo sidebar và không cuộn theo nội dung.
        <header className="flex h-16 shrink-0 items-center justify-end border-b border-gray-200 bg-white px-6">
            {/* User info */}
            <div className="flex items-center gap-3">
                <div className="text-right text-sm leading-tight">
                    <p className="font-semibold text-gray-900">{user?.fullName}</p>
                    <p className="text-xs capitalize text-gray-400">{user?.role}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold text-white shadow-sm">
                    {initial || <User className="h-4 w-4" />}
                </div>
            </div>
        </header>
    );
}; 