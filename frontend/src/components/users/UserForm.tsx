import React, { useState } from 'react';
import { User } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';

interface UserFormProps {
    user?: User;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isLoading: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState({
        username: user?.username || '',
        fullName: user?.fullName || '',
        role: user?.role || 'employee' as 'admin' | 'employee',
        isActive: user?.isActive ?? true,
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Tên đăng nhập là bắt buộc';
        }

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Họ tên là bắt buộc';
        }

        if (!user && !formData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        }

        if (!user && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            const submitData: any = {
                username: formData.username,
                fullName: formData.fullName,
                role: formData.role,
                isActive: formData.isActive,
            };

            if (formData.password) {
                submitData.password = formData.password;
            }

            onSubmit(submitData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="username">Tên đăng nhập *</Label>
                    <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className={errors.username ? 'border-red-500' : ''}
                        disabled={!!user} // Không cho phép sửa username
                    />
                    {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
                </div>

                <div>
                    <Label htmlFor="fullName">Họ tên *</Label>
                    <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={errors.fullName ? 'border-red-500' : ''}
                    />
                    {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="role">Vai trò</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as 'admin' | 'employee' })}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Quản trị viên</SelectItem>
                            <SelectItem value="employee">Nhân viên</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                    <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Kích hoạt</Label>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="password">{user ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}</Label>
                    <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={errors.password ? 'border-red-500' : ''}
                    />
                    {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                </div>

                <div>
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                    />
                    {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Hủy
                </Button>
                <Button type="submit" variant="default" disabled={isLoading}>
                    {isLoading ? 'Đang xử lý...' : user ? 'Cập nhật' : 'Tạo mới'}
                </Button>
            </div>
        </form>
    );
}; 