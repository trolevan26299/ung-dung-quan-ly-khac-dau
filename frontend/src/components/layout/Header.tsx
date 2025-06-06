import React from 'react';
import { useSelector } from 'react-redux';
import { User } from 'lucide-react';
import { RootState } from '../../store';

export const Header: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-end">
                {/* User info */}
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
        </header>
    );
}; 