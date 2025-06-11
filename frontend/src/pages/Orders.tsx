/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ShoppingCart, Search, Filter, Grid, List, Calendar, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { fetchOrders, createOrder, updateOrder, deleteOrder, setSearchTerm, setStatusFilter, setPaymentFilter, setCurrentOrder, clearError, fetchOrderById } from '../store/slices/ordersSlice';
import { fetchCustomers } from '../store/slices/customersSlice';
import { fetchProducts } from '../store/slices/productsSlice';
import { fetchAgents } from '../store/slices/agentsSlice';
import { OrderForm, OrderDetail, OrderCard, OrderTable } from '../components/orders';
import { EmptyState, Pagination } from '../components/common';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/date-picker';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useModal, usePagination, useConfirm } from '../hooks';
import { useToast } from '../contexts/ToastContext';
import type { CreateOrderRequest, Order, OrderQuery } from '../types';

type ViewMode = 'grid' | 'table';

export const Orders: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();
    const { orders, currentOrder, isLoading, error, searchTerm, statusFilter, paymentFilter, pagination } = useSelector((state: RootState) => state.orders);
    const { customers } = useSelector((state: RootState) => state.customers);
    const { products } = useSelector((state: RootState) => state.products);
    const { agents } = useSelector((state: RootState) => state.agents);
    const { confirm, confirmProps } = useConfirm();
    const { success, error: showError } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [hasProcessedUrlAction, setHasProcessedUrlAction] = useState(false);
    
    // Local search state for debounce
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    
    // Date filter state
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [dateFromObj, setDateFromObj] = useState<Date | undefined>();
    const [dateToObj, setDateToObj] = useState<Date | undefined>();

    // Hooks
    const formModal = useModal<Order>();
    const detailModal = useModal<Order>();
    const paginationHook = usePagination(10);
    
    // Extract function to avoid dependency issues
    const { updatePagination } = paginationHook;

    // Debounce search function
    const debounceSearch = useCallback(
        (() => {
            let timeout: NodeJS.Timeout;
            return (searchValue: string) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    dispatch(setSearchTerm(searchValue));
                }, 500); // 0.5s delay
            };
        })(),
        [dispatch]
    );

    useEffect(() => {
        debounceSearch(localSearchTerm);
    }, [localSearchTerm, debounceSearch]);

    useEffect(() => {
        const queryParams: OrderQuery = {
            page: paginationHook.pagination.currentPage,
            limit: paginationHook.pagination.limit,
            search: searchTerm,
            status: statusFilter,
            paymentStatus: paymentFilter,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined
        };
        
        console.log('🔍 useEffect: Calling fetchOrders triggered by dependency change');
        console.log('📋 Dependencies values:', {
            searchTerm,
            statusFilter, 
            paymentFilter,
            dateFrom,
            dateTo,
            currentPage: paginationHook.pagination.currentPage,
            limit: paginationHook.pagination.limit
        });
        console.log('🔍 Calling fetchOrders with params:', queryParams);
        console.log('📅 Date values:', { dateFrom, dateTo });
        console.log('🔤 Search values:', { localSearchTerm, searchTerm });
        dispatch(fetchOrders(queryParams));
    }, [dispatch, searchTerm, statusFilter, paymentFilter, dateFrom, dateTo, paginationHook.pagination.currentPage, paginationHook.pagination.limit]);

    // Load initial data
    useEffect(() => {
        dispatch(fetchCustomers({ page: 1, limit: 1000 }));
        dispatch(fetchProducts({ page: 1, limit: 1000 }));
        dispatch(fetchAgents({ page: 1, limit: 1000 }));
    }, [dispatch]);

    // Check URL parameters for auto-open form
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const action = urlParams.get('action');
        
        if (action === 'create' && !hasProcessedUrlAction) {
            setEditingOrder(null);
            setIsFormOpen(true);
            
            // Clean URL after opening form
            if (window.history.replaceState) {
                window.history.replaceState({}, '', window.location.pathname);
            }

            setHasProcessedUrlAction(true);
        }
    }, [location.search, hasProcessedUrlAction]);

    useEffect(() => {
        if (error) {
            console.error('Orders error:', error);
            setTimeout(() => dispatch(clearError()), 5000);
        }
    }, [error, dispatch]);

    useEffect(() => {
        if (pagination && pagination.total > 0) {
            updatePagination({
                total: pagination.total,
                totalPages: pagination.totalPages
            });
        }
    }, [pagination, updatePagination]);

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
        const confirmed = await confirm({
            title: 'Xác nhận xóa',
            message: 'Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.',
            confirmText: 'Xóa',
            cancelText: 'Hủy'
        });

        if (confirmed) {
            try {
                await dispatch(deleteOrder(id)).unwrap();
                success('Đã xóa đơn hàng thành công');
            } catch (error) {
                showError('Có lỗi xảy ra khi xóa đơn hàng');
            }
        }
    };

    const handleViewOrder = (order: Order) => {
        dispatch(setCurrentOrder(order));
        setIsDetailOpen(true);
    };

    const handleEditOrder = async (order: Order) => {
        console.log('🔧 Edit order clicked:', order);
        console.log('🔧 Order customer:', order.customer);
        console.log('🔧 Order agent:', order.agent);
        console.log('🔧 Order items:', order.items);
        console.log('🔧 Order VAT rate:', order.vatRate);
        console.log('🔧 Order shipping fee:', order.shippingFee);
        
        // Kiểm tra nếu đơn hàng đã hủy
        if (order.status === 'cancelled') {
            showError('Không thể chỉnh sửa', 'Đơn hàng đã hủy không thể chỉnh sửa');
            return;
        }
        
        try {
            console.log('🔄 Fetching full order data...');
            const fullOrder = await dispatch(fetchOrderById(order._id)).unwrap();
            console.log('✅ Full order data:', fullOrder);
            setEditingOrder(fullOrder);
            setIsFormOpen(true);
        } catch (error: any) {
            console.error('❌ Error fetching order:', error);
            showError('Không thể tải thông tin đơn hàng', error.message || 'Có lỗi xảy ra');
        }
    };

    const handleNewOrder = () => {
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

    const handleResetFilters = () => {
        console.log('🔄 Reset all filters');
        setLocalSearchTerm('');
        setDateFrom('');
        setDateTo('');
        setDateFromObj(undefined);
        setDateToObj(undefined);
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
                    onAction={handleNewOrder}
                />
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((order) => (
                    <OrderCard
                        key={order._id}
                        order={order}
                        onView={() => handleViewOrder(order)}
                        onEdit={() => handleEditOrder(order)}
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
                    onView={handleViewOrder}
                    onEdit={handleEditOrder}
                    onDelete={handleDeleteOrder}
                    onAdd={handleNewOrder}
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
                  
                </div>
                <Button onClick={handleNewOrder} className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo đơn hàng
                </Button>
            </div>

            {/* Search and Filters */}
            <Card className="shadow-sm border-0 shadow-md">
                <CardContent className="p-6">
                    {/* Mobile: Stack vertically, Desktop XL: Horizontal */}
                    <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6">
                        
                        {/* Search Input - Full width on mobile, flexible on desktop */}
                        <div className="w-full xl:flex-1 xl:max-w-lg">
                          
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Nhập tên khách hàng, đại lý, số đơn hàng..."
                                    value={localSearchTerm}
                                    onChange={(e) => {
                                        console.log('🔍 Local search changed:', e.target.value);
                                        setLocalSearchTerm(e.target.value);
                                    }}
                                    className="pl-10 h-12 text-sm font-medium border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            </div>
                        </div>
                        
                        {/* Date Filter */}
                        <div className="w-full xl:w-auto">
                           
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-3 flex-1 xl:flex-none">
                                    <DatePicker
                                        date={dateFromObj}
                                        onDateChange={(date: Date | undefined) => {
                                            console.log('📅 DateFrom changed:', date);
                                            setDateFromObj(date);
                                            setDateFrom(date ? date.toISOString().split('T')[0] : '');
                                        }}
                                        placeholder="Từ ngày"
                                        className="w-full xl:w-52"
                                    />
                                    <span className="text-gray-500 text-sm px-2 font-medium flex-shrink-0">đến</span>
                                    <DatePicker
                                        date={dateToObj}
                                        onDateChange={(date: Date | undefined) => {
                                            console.log('📅 DateTo changed:', date);
                                            setDateToObj(date);
                                            setDateTo(date ? date.toISOString().split('T')[0] : '');
                                        }}
                                        placeholder="Đến ngày"
                                        className="w-full xl:w-52"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Status */}
                        <div className="w-full xl:w-auto">
                          
                            <select
                                value={paymentFilter}
                                onChange={(e) => dispatch(setPaymentFilter(e.target.value))}
                                className="w-full xl:w-60 h-12 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-all"
                            >
                                <option value="">🏷️ Tất cả trạng thái</option>
                                <option value="completed">✅ Đã thanh toán</option>
                                <option value="pending">⏳ Chưa thanh toán</option>
                                <option value="debt">💰 Công nợ</option>
                            </select>
                        </div>
                        
                        {/* Action Buttons & Stats */}
                        <div className="w-full xl:w-auto">
                          
                            <div className="flex items-center justify-between xl:justify-end gap-4">
                                {/* Reset Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="flex items-center gap-2 h-12 px-6 whitespace-nowrap border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all font-medium"
                                >
                                    <X className="h-4 w-4" />
                                    Reset Filter
                                </Button>

                                {/* View Toggle */}
                                <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 hover:bg-gray-100 transition-colors">
                                    <Button
                                        variant={viewMode === 'grid' ? 'active' : 'inactive'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="h-10 w-10 p-0 rounded-md transition-colors"
                                        title="Xem dạng lưới"
                                    >
                                        <Grid className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'table' ? 'active' : 'inactive'}
                                        size="sm"
                                        onClick={() => setViewMode('table')}
                                        className="h-10 w-10 p-0 rounded-md ml-1 transition-colors"
                                        title="Xem dạng bảng"
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Stats Badge */}
                                <div className="text-sm text-gray-600 font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-lg border border-blue-200 shadow-sm">
                                    📊 <span className="text-blue-700 font-bold">{pagination.total}</span> đơn hàng
                                </div>
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
            {pagination && pagination.total > 0 && (
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