/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Search, Filter, Grid, List } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchOrders, createOrder, updateOrder, deleteOrder, setSearchTerm, setStatusFilter, setPaymentFilter, setCurrentOrder, clearError } from '../store/slices/ordersSlice';
import { fetchCustomers } from '../store/slices/customersSlice';
import { fetchProducts } from '../store/slices/productsSlice';
import { fetchAgents } from '../store/slices/agentsSlice';
import { OrderForm, OrderDetail, OrderCard, OrderTable } from '../components/orders';
import { EmptyState, Pagination } from '../components/common';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useModal, usePagination, useConfirm } from '../hooks';
import { useToast } from '../contexts/ToastContext';
import type { CreateOrderRequest, Order } from '../types';

type ViewMode = 'grid' | 'table';

export const Orders: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { orders, currentOrder, isLoading, error, searchTerm, statusFilter, paymentFilter, pagination } = useSelector((state: RootState) => state.orders);
    const { customers } = useSelector((state: RootState) => state.customers);
    const { products } = useSelector((state: RootState) => state.products);
    const { agents } = useSelector((state: RootState) => state.agents);
    const { confirm, confirmProps } = useConfirm();
    const { success, error: showError } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('table'); // Mặc định là table view

    // Hooks
    const formModal = useModal<Order>();
    const detailModal = useModal<Order>();
    const paginationHook = usePagination(10);

    useEffect(() => {
        dispatch(fetchOrders({
            page: paginationHook.pagination.currentPage,
            limit: paginationHook.pagination.limit,
            search: searchTerm,
            status: statusFilter,
            paymentStatus: paymentFilter
        }));
    }, [dispatch, searchTerm, statusFilter, paymentFilter, paginationHook.pagination.currentPage, paginationHook.pagination.limit]);

    useEffect(() => {
        dispatch(fetchCustomers({ page: 1, limit: 100 }));
        dispatch(fetchProducts({ page: 1, limit: 100 }));
        dispatch(fetchAgents({ page: 1, limit: 100 }));
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            console.error('Orders error:', error);
            setTimeout(() => dispatch(clearError()), 5000);
        }
    }, [error, dispatch]);

    useEffect(() => {
        if (pagination && pagination.total > 0) {
            paginationHook.updatePagination({
                total: pagination.total,
                totalPages: pagination.totalPages
            });
        }
    }, [pagination, paginationHook]);

    const handleCreateOrder = async (data: CreateOrderRequest) => {
        try {
            await dispatch(createOrder(data)).unwrap();
            setIsFormOpen(false);
            setEditingOrder(null);
            success('Tạo thành công', 'Đơn hàng mới đã được tạo');
        } catch (error: any) {
            console.error('Create order error:', error);
            showError('Tạo thất bại', error.message || 'Có lỗi xảy ra khi tạo đơn hàng');
        }
    };

    const handleUpdateOrder = async (data: CreateOrderRequest) => {
        if (!editingOrder) return;

        try {
            await dispatch(updateOrder({ id: editingOrder._id, data })).unwrap();
            setIsFormOpen(false);
            setEditingOrder(null);
            success('Cập nhật thành công', `Đơn hàng "#${editingOrder.orderNumber}" đã được cập nhật`);
        } catch (error: any) {
            console.error('Update order error:', error);
            showError('Cập nhật thất bại', error.message || 'Có lỗi xảy ra khi cập nhật đơn hàng');
        }
    };

    const handleDeleteOrder = async (id: string) => {
        const orderToDelete = orders.find(order => order._id === id);
        const confirmed = await confirm({
            title: 'Xóa đơn hàng',
            message: `Bạn có chắc chắn muốn xóa đơn hàng "#${orderToDelete?.orderNumber || ''}"?`,
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            confirmVariant: 'destructive'
        });

        if (!confirmed) return;

        try {
            await dispatch(deleteOrder(id)).unwrap();
            success('Đã xóa', `Đơn hàng "#${orderToDelete?.orderNumber || ''}" đã được xóa`);
        } catch (error: any) {
            console.error('Error deleting order:', error);
            showError('Lỗi', error.message || 'Có lỗi xảy ra khi xóa đơn hàng');
        }
    };

    const handleSearch = (searchValue: string) => {
        dispatch(setSearchTerm(searchValue));
    };

    const handleStatusFilter = (status: Order['status'] | 'all') => {
        dispatch(setStatusFilter(status === 'all' ? '' : status));
    };

    const handlePaymentFilter = (payment: string) => {
        dispatch(setPaymentFilter(payment));
    };

    const handleViewDetail = (order: Order) => {
        dispatch(setCurrentOrder(order));
        setIsDetailOpen(true);
    };

    const handleEdit = (order: Order) => {
        setEditingOrder(order);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingOrder(null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingOrder(null);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        dispatch(setCurrentOrder(null));
    };

    const clearFilters = () => {
        dispatch(setSearchTerm(''));
        dispatch(setStatusFilter(''));
        dispatch(setPaymentFilter(''));
    };

    const statusOptions = [
        { value: 'all', label: 'Tất cả trạng thái', count: orders.length },
        { value: 'active', label: 'Đang hoạt động', count: orders.filter(o => o.status === 'active').length },
        { value: 'cancelled', label: 'Đã hủy', count: orders.filter(o => o.status === 'cancelled').length },
    ];

    const renderOrdersGrid = () => {
        if (isLoading && orders.length === 0) {
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

        if (orders.length === 0) {
            return (
                <EmptyState
                    icon={ShoppingCart}
                    title="Chưa có đơn hàng nào"
                    description="Bắt đầu bằng cách tạo đơn hàng đầu tiên"
                    actionLabel="Tạo đơn hàng"
                    onAction={handleAddNew}
                />
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((order) => (
                    <OrderCard
                        key={order._id}
                        order={order}
                        onView={() => handleViewDetail(order)}
                        onEdit={() => handleEdit(order)}
                        onDelete={() => handleDeleteOrder(order._id)}
                    />
                ))}
            </div>
        );
    };

    const renderContent = () => {
        if (viewMode === 'table') {
            return (
                <OrderTable
                    orders={orders}
                    isLoading={isLoading}
                    onView={handleViewDetail}
                    onEdit={handleEdit}
                    onDelete={handleDeleteOrder}
                    onAdd={handleAddNew}
                />
            );
        }

        return renderOrdersGrid();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <ShoppingCart className="w-8 h-8 mr-3 text-primary-600" />
                        Quản lý đơn hàng
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Quản lý đơn hàng và theo dõi tiến trình
                    </p>
                </div>
                <Button onClick={handleAddNew} className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo đơn hàng
                </Button>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Tìm kiếm theo số đơn hàng, khách hàng..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
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
                                Tổng: {pagination.total} đơn hàng
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Orders Content */}
            {renderContent()}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <Pagination
                    pagination={paginationHook.pagination}
                    onPageChange={paginationHook.goToPage}
                    onPreviousPage={paginationHook.goToPreviousPage}
                    onNextPage={paginationHook.goToNextPage}
                />
            )}

            {/* Modals */}
            <OrderForm
                order={editingOrder}
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSubmit={editingOrder ? handleUpdateOrder : handleCreateOrder}
                isLoading={isLoading}
                customers={customers}
                agents={agents}
                products={products}
            />

            <OrderDetail
                order={currentOrder}
                isOpen={isDetailOpen}
                onClose={handleCloseDetail}
            />

            <ConfirmDialog {...confirmProps} />
        </div>
    );
}; 