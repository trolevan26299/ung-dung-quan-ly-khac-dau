import React from 'react';
import { User } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Users as UsersIcon } from 'lucide-react';

interface UserStatsProps {
    users: User[];
    totalUsers: number;
}

export const UserStats: React.FC<UserStatsProps> = ({ users, totalUsers }) => {
    const safeUsers = users || [];
    const adminCount = safeUsers.filter(u => u.role === 'admin').length;
    const employeeCount = safeUsers.filter(u => u.role === 'employee').length;
    const activeCount = safeUsers.filter(u => u.isActive).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Quản trị viên</CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{adminCount}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nhân viên</CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{employeeCount}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeCount}</div>
                </CardContent>
            </Card>
        </div>
    );
}; 