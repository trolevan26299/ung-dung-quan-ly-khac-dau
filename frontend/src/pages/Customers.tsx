import React, { useEffect, useCallback, useState } from 'react';
import { Users, Plus, Grid, List } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { SearchInput, Pagination, EmptyState } from '../components/common';
import { CustomerForm, CustomerDetail, CustomerCard, CustomerTable } from '../components/customers';
import { usePagination, useModal } from '../hooks';
import { useToast } from '../contexts/ToastContext';
import { AppDispatch, RootState } from '../store';
import { createCustomer, deleteCustomer, fetchCustomers, updateCustomer } from '../store/slices/customersSlice';
import type { CreateCustomerRequest, Customer } from '../types';

type ViewMode = 'grid' | 'table';

export const Customers: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { customers, isLoading, error, pagination: paginationData } = useSelector((state: RootState) => state.customers);
    const { success, error: showError } = useToast();
    const [viewMode, setViewMode] = useState<ViewMode>('table'); // Mặc định là table view

    // Hooks - Khởi tạo với page hiện tại từ Redux nếu có
    const {
        pagination: paginationState,
        params,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        setSearch,
        updatePagination
    } = usePagination();
    const formModal = useModal<Customer>();
    const detailModal = useModal<Customer>();

    // Memoized refresh function
    const refreshCustomers = useCallback(() => {
        dispatch(fetchCustomers(params));
    }, [dispatch, params]);

    // Fetch customers when pagination params change
    useEffect(() => {
        refreshCustomers();
    }, [refreshCustomers]);

    // NOTE: Không cần useEffect để update pagination vì nó đã được handle trong Redux slice

    // Handlers
    const handleCreateCustomer = async (data: CreateCustomerRequest) => {
        try {
            await dispatch(createCustomer(data)).unwrap();
            formModal.closeModal();
            // Refresh current page
            dispatch(fetchCustomers(params));
            success('Tạo thành công', `Khách hàng "${data.name}" đã được tạo`);
        } catch (error: any) {
            console.error('Error creating customer:', error);
            showError('Tạo thất bại', error.message || 'Có lỗi xảy ra khi tạo khách hàng');
        }
    };

    const handleUpdateCustomer = async (data: CreateCustomerRequest) => {
        if (!formModal.selectedItem) return;

        try {
            console.log('Updating customer with data:', data);
            await dispatch(updateCustomer({
                id: formModal.selectedItem._id,
                data
            })).unwrap();
            formModal.closeModal();
            // Refresh current page
            dispatch(fetchCustomers(params));
            success('Cập nhật thành công', `Khách hàng "${data.name}" đã được cập nhật`);
        } catch (error: any) {
            console.error('Error updating customer:', error);
            showError('Cập nhật thất bại', error.message || 'Có lỗi xảy ra khi cập nhật khách hàng');
        }
    };

    const handleDeleteCustomer = async (id: string) => {
        try {
            await dispatch(deleteCustomer(id)).unwrap();
            // Refresh current page
            dispatch(fetchCustomers(params));
            success('Xóa thành công', 'Khách hàng đã được xóa');
        } catch (error: any) {
            console.error('Error deleting customer:', error);
            showError('Xóa thất bại', error.message || 'Có lỗi xảy ra khi xóa khách hàng');
        }
    };

    const handleSearch = (searchTerm: string) => {
        setSearch(searchTerm);
    };

    const renderCustomerGrid = () => {
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

        if (customers.length === 0) {
            return (
                <EmptyState
                    icon={Users}
                    title="Chưa có khách hàng nào"
                    description="Bắt đầu bằng cách thêm khách hàng đầu tiên"
                    actionLabel="Thêm khách hàng"
                    onAction={formModal.openCreateModal}
                />
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map((customer) => (
                    <CustomerCard
                        key={customer._id}
                        customer={customer}
                        onEdit={formModal.openEditModal}
                        onView={detailModal.openDetailModal}
                        onDelete={handleDeleteCustomer}
                    />
                ))}
            </div>
        );
    };

    const renderContent = () => {
        if (viewMode === 'table') {
            return (
                <CustomerTable
                    customers={customers}
                    isLoading={isLoading}
                    onView={detailModal.openDetailModal}
                    onEdit={formModal.openEditModal}
                    onDelete={handleDeleteCustomer}
                />
            );
        }

        return renderCustomerGrid();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Users className="w-8 h-8 mr-3 text-primary-600" />
                        Quản lý khách hàng
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Quản lý thông tin khách hàng và lịch sử mua hàng
                    </p>
                </div>
                <Button onClick={formModal.openCreateModal} className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm khách hàng
                </Button>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 max-w-md">
                            <SearchInput
                                placeholder="Tìm kiếm theo tên, số điện thoại..."
                                onSearch={handleSearch}
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* View Toggle */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="h-8 w-8 p-0"
                                    title="Xem dạng lưới"
                                >
                                    <Grid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('table')}
                                    className="h-8 w-8 p-0"
                                    title="Xem dạng bảng"
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="text-sm text-gray-500">
                                Tổng: {paginationData?.total || 0} khách hàng
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Customers Content */}
            {renderContent()}

            {/* Pagination */}
            {paginationData && paginationData.totalPages > 1 && (
                <Pagination
                    pagination={{
                        currentPage: paginationData.page,
                        totalPages: paginationData.totalPages,
                        total: paginationData.total,
                        limit: paginationData.limit
                    }}
                    onPageChange={goToPage}
                    onNextPage={goToNextPage}
                    onPreviousPage={goToPreviousPage}
                />
            )}

            {/* Modals */}
            <CustomerForm
                customer={formModal.selectedItem}
                isOpen={formModal.isOpen}
                onClose={formModal.closeModal}
                onSubmit={formModal.selectedItem ? handleUpdateCustomer : handleCreateCustomer}
                isLoading={isLoading}
            />

            <CustomerDetail
                customer={detailModal.selectedItem}
                isOpen={detailModal.isOpen}
                onClose={detailModal.closeModal}
            />
        </div>
    );
}; 