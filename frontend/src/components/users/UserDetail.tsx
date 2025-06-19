import React from 'react';
import { User } from '../../types';
import { Button } from '../ui/Button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { formatTableDate } from '../../lib/utils';

interface UserDetailProps {
    user: User;
    onClose: () => void;
}

export const UserDetail: React.FC<UserDetailProps> = ({ user, onClose }) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-sm font-medium text-gray-500">Tên đăng nhập</Label>
                    <p className="text-sm">{user.username}</p>
                </div>
                <div>
                    <Label className="text-sm font-medium text-gray-500">Họ tên</Label>
                    <p className="text-sm">{user.fullName}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-sm font-medium text-gray-500">Vai trò</Label>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                    </Badge>
                </div>
                <div>
                    <Label className="text-sm font-medium text-gray-500">Trạng thái</Label>
                    <Badge variant={user.isActive ? 'default' : 'destructive'}>
                        {user.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-sm font-medium text-gray-500">Ngày tạo</Label>
                    <p className="text-sm">{formatTableDate(user.createdAt)}</p>
                </div>
                <div>
                    <Label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</Label>
                    <p className="text-sm">{formatTableDate(user.updatedAt)}</p>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={onClose}>Đóng</Button>
            </div>
        </div>
    );
}; 