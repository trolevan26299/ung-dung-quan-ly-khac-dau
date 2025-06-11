import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Users as UsersIcon } from 'lucide-react';

interface UserStatsProps {
    stats: {
        totalUsers: number;
        adminCount: number;
        employeeCount: number;
        activeCount: number;
    } | null;
}

export const UserStats: React.FC<UserStatsProps> = ({ stats }) => {
    const safeStats = stats || {
        totalUsers: 0,
        adminCount: 0,
        employeeCount: 0,
        activeCount: 0
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{safeStats.totalUsers}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Quản trị viên</CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{safeStats.adminCount}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nhân viên</CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{safeStats.employeeCount}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{safeStats.activeCount}</div>
                </CardContent>
            </Card>
        </div>
    );
}; 
                