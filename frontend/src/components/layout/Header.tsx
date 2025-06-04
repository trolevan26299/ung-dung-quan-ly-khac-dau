import React from 'react';
import { useSelector } from 'react-redux';
import { Bell, Search, User } from 'lucide-react';
import { RootState } from '../../store';

export const Header: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Search */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* User info */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User profile */}
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-sm">
                            <p className="font-medium text-gray-900">{user?.fullName}</p>
                            <p className="text-gray-500 capitalize">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}; 