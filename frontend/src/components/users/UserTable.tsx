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
    onViewUser: (user: User) => void;
    onEditUser: (user: User) => void;
    onDeleteUser: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
    users,
    isLoading,
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
                        <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onViewUser(user)}
                                >
                                    <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEditUser(user)}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDeleteUser(user)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}; 