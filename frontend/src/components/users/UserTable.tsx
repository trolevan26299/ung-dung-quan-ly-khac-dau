import React from 'react';
import { User } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface UserTableProps {
    users: User[];
    isLoading: boolean;
    isAdmin?: boolean;
    currentUserId?: string;
    onViewUser: (user: User) => void;
    onEditUser: (user: User) => void;
    onDeleteUser: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
    users,
    isLoading,
    isAdmin = false,
    currentUserId,
    onViewUser,
    onEditUser,
    onDeleteUser
}) => {
    if (isLoading) {
        return (
            <div className="text-center py-8">Đang tải...</div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                Không tìm thấy người dùng nào
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Tên đăng nhập</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user._id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant={user.isActive ? 'default' : 'destructive'}>
                                {user.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'}
                            </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>
                            <div className="flex justify-end space-x-2">
                                <div className="flex space-x-1">
                                    <Button
                                        variant="light"
                                        size="xs"
                                        onClick={() => onViewUser(user)}
                                        className="h-7 w-7 p-0"
                                        title="Xem chi tiết"
                                    >
                                        <Eye className="w-3 h-3" />
                                    </Button>
                                    {isAdmin && (
                                        <>
                                            <Button
                                                variant="light"
                                                size="xs"
                                                onClick={() => onEditUser(user)}
                                                className="h-7 w-7 p-0"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="w-3 h-3" />
                                            </Button>
                                            {user._id !== currentUserId && (
                                                <Button
                                                    variant="danger"
                                                    size="xs"
                                                    onClick={() => onDeleteUser(user)}
                                                    className="h-7 w-7 p-0"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}; 