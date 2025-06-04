/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Search, Filter } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchOrders, createOrder, updateOrder, deleteOrder, setSearchTerm, setStatusFilter, setPaymentFilter, setCurrentOrder, clearError } from '../store/slices/ordersSlice';
import { fetchCustomers } from '../store/slices/customersSlice';
import { fetchProducts } from '../store/slices/productsSlice';
import { fetchAgents } from '../store/slices/agentsSlice';
import { OrderForm } from '../components/orders/OrderForm';
import { OrderDetail } from '../components/orders/OrderDetail';
import { OrderCard } from '../components/orders/OrderCard';
import { EmptyState, Pagination } from '../components/common';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useModal, usePagination, useConfirm } from '../hooks';
import { useToast } from '../contexts/ToastContext';
import type { CreateOrderRequest, Order } from '../types';

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
            message: `Bạn có chắc chắn muốn xóa đơn hàng "#${orderToDelete?.orderNumber || ''}"? Hành động này không thể hoàn tác.`,
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            confirmVariant: 'destructive'
        });

        if (!confirmed) return;

        try {
            await dispatch(deleteOrder(id)).unwrap();
            success('Xóa thành công', `Đơn hàng "#${orderToDelete?.orderNumber || ''}" đã được xóa`);
        } catch (error: any) {
            console.error('Delete order error:', error);
            showError('Xóa thất bại', error.message || 'Có lỗi xảy ra khi xóa đơn hàng');
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
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
                    </div>
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
                        Quản lý đơn hàng và theo dõi trạng thái
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
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 max-w-md">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo mã đơn hàng, khách hàng..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                Tổng: {pagination.total} đơn hàng
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Trạng thái đơn hàng</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleStatusFilter(e.target.value as Order['status'] | 'all')}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="all">Tất cả</option>
                                    <option value="active">Đang hoạt động</option>
                                    <option value="cancelled">Đã hủy</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Trạng thái thanh toán</label>
                                <select
                                    value={paymentFilter}
                                    onChange={(e) => handlePaymentFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="pending">Chờ thanh toán</option>
                                    <option value="completed">Đã thanh toán</option>
                                    <option value="debt">Công nợ</option>
                                </select>
                            </div>

                            {(searchTerm || statusFilter || paymentFilter) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="mt-6"
                                >
                                    Xóa bộ lọc
                                </Button>
                            )}
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

            {/* Orders Grid */}
            {renderOrdersGrid()}

            {/* Pagination */}
            <Pagination
                pagination={paginationHook.pagination}
                onPageChange={paginationHook.goToPage}
                onNextPage={paginationHook.goToNextPage}
                onPreviousPage={paginationHook.goToPreviousPage}
            />

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

            {/* Order Detail Modal */}
            {isDetailOpen && currentOrder && (
                <OrderDetail
                    isOpen={isDetailOpen}
                    order={currentOrder}
                    onClose={handleCloseDetail}
                />
            )}

            <ConfirmDialog {...confirmProps} />
        </div>
    );
}; 