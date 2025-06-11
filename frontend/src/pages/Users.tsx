import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    fetchUserStats,
    clearError,
    setCurrentUser,
    clearCurrentUser,
} from '../store/slices/usersSlice';
import type { User } from '../types';

// UI Components
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { Card, CardContent } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Pagination } from '../components/ui/Pagination';

// User Components
import { UserForm } from '../components/users/UserForm';
import { UserDetail } from '../components/users/UserDetail';
import { UserTable } from '../components/users/UserTable';
import { UserCard } from '../components/users/UserCard';
import { UserStats } from '../components/users/UserStats';

// Hooks
import { useConfirm } from '../hooks';
import { useToast } from '../contexts/ToastContext';

// Icons
import { Plus, Search, Users as UsersIcon, Grid, List, Lock } from 'lucide-react';

type ViewMode = 'grid' | 'table';

// Main Users Component
const Users: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { users, currentUser, isLoading, error, pagination, stats } = useSelector((state: RootState) => state.users);
    const { user: currentAuthUser } = useSelector((state: RootState) => state.auth);
    const { confirm, confirmProps } = useConfirm();
    const { success, error: showError } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>();
    const [viewMode, setViewMode] = useState<ViewMode>('table'); // Mặc định là table view
    const [pageSize, setPageSize] = useState(10);

    // Kiểm tra quyền admin với fallback
    const localStorageUser = JSON.parse(localStorage.getItem('user') || 'null');
    const isAdmin = currentAuthUser?.role === 'admin' || localStorageUser?.role === 'admin';

    // Redirect employee to dashboard
    useEffect(() => {
        if (!isAdmin) {
            navigate('/', { replace: true });
            showError('Không có quyền truy cập', 'Chỉ admin mới có thể quản lý người dùng');
            return;
        }
    }, [isAdmin, navigate, showError]);

    // Load users and stats on component mount
    useEffect(() => {
        if (isAdmin) {
            const params: any = {
                page: currentPage,
                limit: pageSize,
                search: searchTerm,
            };

            // Add role filter if not 'all'
            if (roleFilter !== 'all') {
                params.role = roleFilter;
            }

            // Add isActive filter if not 'all'
            if (statusFilter !== 'all') {
                params.isActive = statusFilter === 'active';
            }

            dispatch(fetchUsers(params));
            dispatch(fetchUserStats());
        }
    }, [dispatch, currentPage, searchTerm, pageSize, roleFilter, statusFilter, isAdmin]);

    // If not admin, show forbidden page
    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
                    <p className="text-gray-600 mb-4">Chỉ quản trị viên mới có thể truy cập trang này</p>
                    <Button onClick={() => navigate('/')}>
                        Về trang chủ
                    </Button>
                </div>
            </div>
        );
    }

    // Filter users
    const filteredUsers = users || [];

    const handleCreateUser = async (data: any) => {
        try {
            await dispatch(createUser(data)).unwrap();
            setIsFormOpen(false);
            setEditingUser(undefined);
            success('Tạo thành công', `Người dùng "${data.fullName}" đã được tạo`);
        } catch (error: any) {
            showError('Tạo thất bại', error.message || 'Có lỗi xảy ra khi tạo người dùng');
        }
    };

    const handleUpdateUser = async (data: any) => {
        if (!editingUser) return;

        try {
            await dispatch(updateUser({ id: editingUser._id, data })).unwrap();
            setIsFormOpen(false);
            setEditingUser(undefined);
            success('Cập nhật thành công', `Người dùng "${data.fullName}" đã được cập nhật`);
        } catch (error: any) {
            showError('Cập nhật thất bại', error.message || 'Có lỗi xảy ra khi cập nhật người dùng');
        }
    };

    const handleDeleteUser = async (user: User) => {
        const confirmed = await confirm({
            title: 'Xóa người dùng',
            message: `Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"?`,
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            confirmVariant: 'destructive'
        });

        if (confirmed) {
            try {
                await dispatch(deleteUser(user._id)).unwrap();
                success('Đã xóa', `Người dùng "${user.fullName}" đã được xóa`);
            } catch (error: any) {
                showError('Lỗi', error.message || 'Có lỗi xảy ra khi xóa người dùng');
            }
        }
    };

    const handleViewUser = (user: User) => {
        dispatch(setCurrentUser(user));
        setIsDetailOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingUser(undefined);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        dispatch(clearCurrentUser());
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        
        const params: any = {
            page: 1,
            limit: pageSize,
            search: searchTerm,
        };

        // Add role filter if not 'all'
        if (roleFilter !== 'all') {
            params.role = roleFilter;
        }

        // Add isActive filter if not 'all'
        if (statusFilter !== 'all') {
            params.isActive = statusFilter === 'active';
        }

        dispatch(fetchUsers(params));
    };

    const renderUsersGrid = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-200 rounded"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (filteredUsers.length === 0) {
            return (
                <div className="text-center py-12">
                    <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có người dùng nào</h3>
                    <p className="text-gray-500 mb-4">
                        {isAdmin ? 'Bắt đầu bằng cách thêm người dùng đầu tiên' : 'Chỉ có admin mới có thể thêm người dùng'}
                    </p>
                    {isAdmin && (
                        <Button onClick={() => setIsFormOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm người dùng
                        </Button>
                    )}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                    <UserCard
                        key={user._id}
                        user={user}
                        isAdmin={isAdmin}
                        currentUserId={currentAuthUser?._id || localStorageUser?._id}
                        onView={handleViewUser}
                        onEdit={handleEditUser}
                        onDelete={handleDeleteUser}
                    />
                ))}
            </div>
        );
    };

    const renderContent = () => {
        if (viewMode === 'table') {
            return (
                <Card>
                    <CardContent className="pt-6">
                        <UserTable
                            users={filteredUsers}
                            isLoading={isLoading}
                            isAdmin={isAdmin}
                            currentUserId={currentAuthUser?._id || localStorageUser?._id}
                            onViewUser={handleViewUser}
                            onEditUser={handleEditUser}
                            onDeleteUser={handleDeleteUser}
                        />
                    </CardContent>
                </Card>
            );
        }

        return renderUsersGrid();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <UsersIcon className="w-8 h-8 mr-3 text-primary-600" />
                        Quản lý người dùng
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Quản lý tài khoản người dùng hệ thống
                    </p>
                </div>
                {isAdmin && (
                    <>
                        {/* Nút chính */}
                        <Button onClick={() => {
                            setEditingUser(undefined);
                            setIsFormOpen(true);
                        }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm người dùng
                        </Button>
                        
                        {/* Dialog riêng biệt */}
                        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                            <DialogContent >
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}
                                    </DialogTitle>
                                </DialogHeader>
                                <UserForm
                                    user={editingUser}
                                    onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
                                    onCancel={handleCloseForm}
                                    isLoading={isLoading}
                                />
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </div>

            {/* Stats Cards */}
            <UserStats stats={stats} />

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 max-w-md">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <Input
                                    placeholder="Tìm kiếm theo tên đăng nhập hoặc họ tên..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" variant="secondary">
                                    <Search className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                                    <SelectItem value="admin">Quản trị viên</SelectItem>
                                    <SelectItem value="employee">Nhân viên</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="active">Kích hoạt</SelectItem>
                                    <SelectItem value="inactive">Vô hiệu hóa</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* View Toggle */}
                            <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                                <Button
                                    variant={viewMode === 'grid' ? 'active' : 'inactive'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="h-8 w-8 p-0 rounded-md"
                                    title="Xem dạng lưới"
                                >
                                    <Grid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'table' ? 'active' : 'inactive'}
                                    size="sm"
                                    onClick={() => setViewMode('table')}
                                    className="h-8 w-8 p-0 rounded-md ml-1"
                                    title="Xem dạng bảng"
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="text-sm text-gray-500">
                                Tổng: {pagination.total} người dùng
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                    <Button
                        variant="light"
                        size="sm"
                        onClick={() => dispatch(clearError())}
                        className="ml-2"
                    >
                        Đóng
                    </Button>
                </div>
            )}

            {/* Users Content */}
            {renderContent()}

            {/* Pagination */}
            {pagination.total > 0 && (
                <Card>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(pageSize) => {
                            setPageSize(pageSize);
                            setCurrentPage(1);
                        }}
                    />
                </Card>
            )}

            {/* User Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chi tiết người dùng</DialogTitle>
                    </DialogHeader>
                    {currentUser && (
                        <UserDetail user={currentUser} onClose={handleCloseDetail} />
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog {...confirmProps} />
        </div>
    );
};

export default Users; 