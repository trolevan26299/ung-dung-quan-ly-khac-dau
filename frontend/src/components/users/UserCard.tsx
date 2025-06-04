import React from 'react';
import { User, Settings, Eye, Edit, Trash2, Shield, UserX } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import type { User as UserType } from '../../types';

interface UserCardProps {
    user: UserType;
    onView: (user: UserType) => void;
    onEdit: (user: UserType) => void;
    onDelete: (user: UserType) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
    user,
    onView,
    onEdit,
    onDelete
}) => {
    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin':
                return <Shield className="w-4 h-4 text-blue-600" />;
            case 'employee':
                return <User className="w-4 h-4 text-green-600" />;
            default:
                return <User className="w-4 h-4 text-gray-600" />;
        }
    };

    const getRoleText = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Quản trị viên';
            case 'employee':
                return 'Nhân viên';
            default:
                return 'Không xác định';
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-blue-100 text-blue-800';
            case 'employee':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        {user.isActive ? (
                            <div className="w-3 h-3 bg-green-400 rounded-full" title="Đang hoạt động" />
                        ) : (
                            <div className="w-3 h-3 bg-red-400 rounded-full" title="Đã vô hiệu hóa" />
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Vai trò:</span>
                        <div className="flex items-center">
                            {getRoleIcon(user.role)}
                            <span className={`ml-1 px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                                {getRoleText(user.role)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Trạng thái:</span>
                        <div className="flex items-center">
                            {user.isActive ? (
                                <>
                                    <User className="w-4 h-4 text-green-600 mr-1" />
                                    <span className="text-sm text-green-600 font-medium">Hoạt động</span>
                                </>
                            ) : (
                                <>
                                    <UserX className="w-4 h-4 text-red-600 mr-1" />
                                    <span className="text-sm text-red-600 font-medium">Vô hiệu hóa</span>
                                </>
                            )}
                        </div>
                    </div>

                    {user.createdAt && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Tạo lúc:</span>
                            <span className="text-sm text-gray-700">
                                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                    <Button
                        variant="light"
                        size="xs"
                        onClick={() => onView(user)}
                        title="Xem chi tiết"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="light"
                        size="xs"
                        onClick={() => onEdit(user)}
                        title="Chỉnh sửa"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="danger"
                        size="xs"
                        onClick={() => onDelete(user)}
                        title="Xóa"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}; 