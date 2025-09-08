/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ShoppingCart, Search, Grid, List, X, Download } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { fetchOrders, createOrder, updateOrder, deleteOrder, cancelOrder, setSearchTerm, setStatusFilter, setPaymentFilter, setCurrentOrder, clearError, fetchOrderById } from '../store/slices/ordersSlice';
import { fetchProducts } from '../store/slices/productsSlice';
import { fetchAgents, createAgent } from '../store/slices/agentsSlice';
import { OrderForm, OrderDetail, OrderCard, OrderTable } from '../components/orders';
import { EmptyState, Pagination } from '../components/common';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/date-picker';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { usePagination, useConfirm } from '../hooks';
import { useToast } from '../contexts/ToastContext';
import { ordersApi } from '../services/api';
import type { CreateOrderRequest, Order, OrderQuery, CreateAgentRequest, Agent } from '../types';
import * as XLSX from 'xlsx';
import { formatTableDate, formatCurrency } from '../lib/utils';

type ViewMode = 'grid' | 'table';

// Helper function để format date giữ nguyên timezone địa phương
const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const Orders: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();
    const { orders, currentOrder, isLoading, error, searchTerm, statusFilter, paymentFilter, pagination } = useSelector((state: RootState) => state.orders);
    const { products } = useSelector((state: RootState) => state.products);
    const { agents } = useSelector((state: RootState) => state.agents);
    const { confirm, confirmProps } = useConfirm();
    const { success, error: showError } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [hasProcessedUrlAction, setHasProcessedUrlAction] = useState(false);
    
    // Bulk selection state
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedNewStatus, setSelectedNewStatus] = useState<string>('');
    
    // Local search state for debounce
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    
    // Date filter state
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [dateFromObj, setDateFromObj] = useState<Date | undefined>();
    const [dateToObj, setDateToObj] = useState<Date | undefined>();

    // Hooks
    const paginationHook = usePagination(20);
    
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
        
        dispatch(fetchOrders(queryParams));
        
        // Reset selection when page/filters change
        setSelectedOrders([]);
    }, [dispatch, searchTerm, statusFilter, paymentFilter, dateFrom, dateTo, paginationHook.pagination.currentPage, paginationHook.pagination.limit]);

    // Load initial data
    useEffect(() => {
        // Chỉ load products và agents - customers sẽ load theo agent trong form
        dispatch(fetchProducts({ page: 1, limit: 10000 }));
        dispatch(fetchAgents({ page: 1, limit: 99999 }));
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
            success('Tạo thành công', `Đơn hàng đã được tạo`);
        } catch (error: any) {
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
            showError('Cập nhật thất bại', error.message || 'Có lỗi xảy ra khi cập nhật đơn hàng');
        }
    };

    const handleDeleteOrder = async (id: string) => {
        const confirmed = await confirm({
            title: 'Xác nhận hủy đơn hàng',
            message: 'Bạn có chắc chắn muốn hủy đơn hàng này? Hàng hóa sẽ được hoàn trả về kho.',
            confirmText: 'Hủy đơn hàng',
            cancelText: 'Không'
        });

        if (confirmed) {
            try {
                await dispatch(cancelOrder(id)).unwrap();
                success('Đã hủy đơn hàng thành công');
                // Không cần fetch lại - Redux sẽ tự động cập nhật status
            } catch (error) {
                showError('Có lỗi xảy ra khi hủy đơn hàng');
            }
        }
    };

    const handleViewOrder = (order: Order) => {
        dispatch(setCurrentOrder(order));
        setIsDetailOpen(true);
    };

    const handleEditOrder = async (order: Order) => {
        if (order.status === 'cancelled') {
            showError('Không thể chỉnh sửa', 'Đơn hàng đã hủy không thể chỉnh sửa');
            return;
        }
        
        try {
            const fullOrder = await dispatch(fetchOrderById(order._id)).unwrap();
            setEditingOrder(fullOrder);
            setIsFormOpen(true);
        } catch (error: any) {
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

    const handleAgentChange = (agentId: string) => {
        // Optional callback for when agent changes
        console.log('Agent changed to:', agentId);
    };

    const handleCreateAgent = async (agentData: CreateAgentRequest): Promise<Agent> => {
        try {
            // Sử dụng Redux action để tạo agent - tự động update store
            const resultAction = await dispatch(createAgent(agentData));
            
            if (createAgent.fulfilled.match(resultAction)) {
                return resultAction.payload; // Trả về agent mới được tạo
            } else {
                throw new Error('Tạo đại lý thất bại');
            }
        } catch (error) {
            console.error('Lỗi khi tạo đại lý:', error);
            throw error;
        }
    };

    const handleResetFilters = () => {
        dispatch(setSearchTerm(''));
        dispatch(setStatusFilter(''));
        dispatch(setPaymentFilter(''));
        setLocalSearchTerm('');
        setDateFrom('');
        setDateTo('');
        setDateFromObj(undefined);
        setDateToObj(undefined);
        paginationHook.goToPage(1);
    };

    // Bulk selection handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedOrders(orders.map(order => order._id));
        } else {
            setSelectedOrders([]);
        }
    };

    const handleSelectOrder = (orderId: string, checked: boolean) => {
        if (checked) {
            setSelectedOrders(prev => [...prev, orderId]);
        } else {
            setSelectedOrders(prev => prev.filter(id => id !== orderId));
        }
    };

    const handleSelectStatus = (status: string) => {
        setSelectedNewStatus(status);
    };

    const handleConfirmStatusChange = async () => {
        if (selectedOrders.length === 0 || !selectedNewStatus) return;
        
        try {
            // Call API using ordersApi service
            const result = await ordersApi.bulkUpdatePaymentStatus(selectedOrders, selectedNewStatus);
            success('Cập nhật thành công', `Đã cập nhật trạng thái ${result.updated} đơn hàng`);
            setSelectedOrders([]);
            setIsStatusModalOpen(false);
            setSelectedNewStatus('');
            // Refresh data
            const queryParams = {
                page: paginationHook.pagination.currentPage,
                limit: paginationHook.pagination.limit,
                search: searchTerm,
                status: statusFilter,
                paymentStatus: paymentFilter,
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined
            };
            dispatch(fetchOrders(queryParams));
        } catch (error) {
            console.error('Error updating payment status:', error);
            showError('Cập nhật thất bại', 'Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

    const handleCloseStatusModal = () => {
        setIsStatusModalOpen(false);
        setSelectedNewStatus('');
    };

    // Tính tổng tiền của các đơn hàng được chọn
    const calculateSelectedTotal = () => {
        if (selectedOrders.length === 0) return 0;
        return orders
            .filter(order => selectedOrders.includes(order._id))
            .reduce((total, order) => total + (order.totalAmount || 0), 0);
    };

    const handleExportExcel = async () => {
        try {
            

            // Gọi API riêng cho xuất Excel với các filter hiện tại
            const exportParams: any = {};
            if (searchTerm && searchTerm.trim()) exportParams.search = searchTerm.trim();
            if (statusFilter && statusFilter.trim()) exportParams.status = statusFilter.trim();
            if (paymentFilter && paymentFilter.trim()) exportParams.paymentStatus = paymentFilter.trim();
            if (dateFrom && dateFrom.trim()) exportParams.dateFrom = dateFrom.trim();
            if (dateTo && dateTo.trim()) exportParams.dateTo = dateTo.trim();

            const response = await ordersApi.getOrdersForExcel(exportParams);
            const excelOrders = response.data || response;

            const excelData = excelOrders.map((order: Order, index: number) => ({
                'Mã đơn hàng': order.orderNumber || '',
                'Tên khách hàng - SĐT': order.customer 
                    ? `${order.customer.name || ''} - ${order.customer.phone || ''}`
                    : 'N/A',
                'Tên đại lý': order.agent?.name || 'N/A',
                'Ngày lên đơn': formatTableDate(order.deliveryDate || order.createdAt),
                'Sản phẩm': order.items?.map((item: any) => {
                    const productName = item.productName || 'N/A';
                    const quantity = item.quantity || 0;
                    const unitPrice = item.unitPrice || 0;
                    return `${productName} (SL: ${quantity}, Giá: ${unitPrice.toLocaleString('vi-VN')}₫)`;
                }).join('; ') || 'N/A',
                'Tổng tiền': (order.totalAmount || 0).toLocaleString('vi-VN') + '₫',
                'VAT (tiền)': (order.vatAmount || 0).toLocaleString('vi-VN') + '₫',
                'Phí vận chuyển': (order.shippingFee || 0).toLocaleString('vi-VN') + '₫',
                'Ghi chú': order.notes || '',
                'Trạng thái thanh toán': order.paymentStatus === 'completed' ? 'Đã thanh toán' : 
                                       order.paymentStatus === 'pending' ? 'COD' : 'Công nợ',
                'Trạng thái đơn hàng': order.status === 'active' ? 'Hoàn thành' : 'Đã hủy'
            }));

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelData);

            const colWidths = [
                { wch: 15 },  // Mã đơn hàng
                { wch: 25 },  // Tên khách hàng - SDT
                { wch: 20 },  // Tên đại lý
                { wch: 15 },  // Ngày tạo
                { wch: 40 },  // Sản phẩm
                { wch: 15 },  // Tổng tiền
                { wch: 15 },  // VAT (tiền)
                { wch: 15 },  // Phí vận chuyển
                { wch: 30 },  // Ghi chú
                { wch: 18 },  // Trạng thái thanh toán
                { wch: 18 }   // Trạng thái đơn hàng
            ];
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, 'Danh sách đơn hàng');

            const vietnamNow = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
            const today = formatDateForAPI(new Date(vietnamNow));
            const fileName = `DanhSachDonHang_${today}.xlsx`;

            XLSX.writeFile(wb, fileName);

            success('Xuất Excel thành công', `File ${fileName} đã được tải xuống với ${excelOrders.length} đơn hàng`);
        } catch (error) {
            console.error('Export Excel error:', error);
            showError('Xuất Excel thất bại', 'Có lỗi xảy ra khi xuất file Excel');
        }
    };

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
                    currentPage={paginationHook.pagination.currentPage}
                    pageSize={paginationHook.pagination.limit}
                    selectedOrders={selectedOrders}
                    onSelectAll={handleSelectAll}
                    onSelectOrder={handleSelectOrder}
                />
            );
        }

        return renderOrdersGrid();
    };

    return (
        <div 
            className="flex flex-col overflow-hidden"
            style={{ 
                height: 'calc(100vh - 123px)', // Thêm 5px nữa
                minHeight: '400px',
                maxHeight: 'calc(100vh - 123px)' // Đảm bảo không vượt quá
            }}
        >
            <div className="flex-shrink-0 space-y-3 px-6 pt-1 pb-2">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <ShoppingCart className="w-6 h-6 mr-2 text-primary-600" />
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
                <CardContent className="p-4">
                    <div className="flex flex-col xl:flex-row items-start xl:items-center gap-2">
                        
                        {/* Search Input - Full width on mobile, flexible on desktop */}
                        <div className="w-full xl:w-80">
                          
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Nhập tên khách hàng, đại lý, số đơn hàng..."
                                    value={localSearchTerm}
                                    onChange={(e) => {
                                        setLocalSearchTerm(e.target.value);
                                    }}
                                    className="pl-10 h-12 text-sm font-medium border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            </div>
                        </div>
                        
                        {/* Date Filter */}
                        <div className="w-full xl:w-auto">
                           
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 flex-1 xl:flex-none">
                                    <DatePicker
                                        date={dateFromObj}
                                        onDateChange={(date: Date | undefined) => {
                                            setDateFromObj(date);
                                            setDateFrom(date ? formatDateForAPI(date) : '');
                                        }}
                                        placeholder="Từ ngày"
                                        className="w-full xl:w-40"
                                    />
                                    <span className="text-gray-500 text-sm px-[1px] font-medium flex-shrink-0">-</span>
                                    <DatePicker
                                        date={dateToObj}
                                        onDateChange={(date: Date | undefined) => {
                                            setDateToObj(date);
                                            setDateTo(date ? formatDateForAPI(date) : '');
                                        }}
                                        placeholder="Đến ngày"
                                        className="w-full xl:w-40"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Status */}
                        <div className="w-full xl:w-auto">
                          
                            <select
                                value={paymentFilter}
                                onChange={(e) => dispatch(setPaymentFilter(e.target.value))}
                                className="w-full xl:w-55 h-12 px-2 py-2 border border-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-all"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="completed">Đã thanh toán</option>
                                <option value="pending">COD</option>
                                <option value="debt">Công nợ</option>
                            </select>
                        </div>

                        {/* Order Status */}
                        <div className="w-full xl:w-auto">
                          
                            <select
                                value={statusFilter}
                                onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                                className="w-full xl:w-55 h-12 px-2 py-2 border border-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-all"
                            >
                                <option value="">📋 Tất cả đơn hàng</option>
                                <option value="active">🟢 Hoàn thành</option>
                                <option value="cancelled">🔴 Đã hủy</option>
                            </select>
                        </div>
                        
                        {/* Action Buttons & Stats */}
                        <div className="w-full xl:w-auto">
                          
                            <div className="flex items-center justify-between xl:justify-end gap-2">
                                {/* Bulk Status Change Button - Only show when orders are selected */}
                                {selectedOrders.length > 0 && (
                                    <>
                                        <Button
                                            size="sm"
                                            onClick={() => setIsStatusModalOpen(true)}
                                            className="flex items-center gap-2 h-12 px-2 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white transition-all font-medium"
                                        >
                                            Đổi Trạng thái TT ({selectedOrders.length})
                                        </Button>
                                        
                                        {/* Selected orders total amount */}
                                        <div className="bg-green-100 border border-green-300 rounded-lg px-1 py-2 h-12 flex items-center">
                                            <span className="text-green-800 font-bold text-sm whitespace-nowrap">
                                                Tổng: {formatCurrency(calculateSelectedTotal())}
                                            </span>
                                        </div>
                                    </>
                                )}

                                {/* Reset Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="flex items-center gap-2 h-12 px-2 whitespace-nowrap border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all font-medium"
                                >
                                    <X className="h-4 w-4" />
                                    Reset 
                                </Button>

                                {/* Export Excel Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExportExcel}
                                    className="flex items-center gap-2 h-12 px-6 whitespace-nowrap border-green-300 hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition-all font-medium"
                                >
                                    <Download className="h-4 w-4" />
                                    Excel
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
            </div>

            {/* Orders Content - Flexible area */}
            <div className="flex-1 px-6 overflow-hidden" style={{ minHeight: 0 }}>
                {renderContent()}
            </div>

            {/* Pagination - Always show */}
            <div className="flex-shrink-0 px-6 py-4">
                <Pagination
                    pagination={paginationHook.pagination}
                    onPageChange={paginationHook.goToPage}
                    onPreviousPage={paginationHook.goToPreviousPage}
                    onNextPage={paginationHook.goToNextPage}
                    onLimitChange={paginationHook.setLimit}
                />
            </div>

            {/* Modals */}
            <OrderForm
                order={editingOrder}
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSubmit={editingOrder ? handleUpdateOrder : handleCreateOrder}
                isLoading={isLoading}
                agents={agents}
                products={products}
                onAgentChange={handleAgentChange}
                onCreateAgent={handleCreateAgent}
            />

            <OrderDetail
                order={currentOrder}
                isOpen={isDetailOpen}
                onClose={handleCloseDetail}
            />

            <ConfirmDialog {...confirmProps} />

            {/* Bulk Status Change Modal */}
            {isStatusModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseStatusModal}></div>
                    <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-lg w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Thay đổi trạng thái thanh toán
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Chọn trạng thái mới cho {selectedOrders.length} đơn hàng đã chọn:
                                </p>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleSelectStatus('completed')}
                                        className={`w-full text-left px-4 py-3 border rounded-md transition-colors ${
                                            selectedNewStatus === 'completed' 
                                                ? 'border-green-400 bg-green-50 ring-2 ring-green-200' 
                                                : 'border-gray-300 hover:bg-green-50 hover:border-green-300'
                                        }`}
                                    >
                                        <div className="font-medium text-green-600">Đã thanh toán</div>
                                        <div className="text-sm text-gray-500">Đánh dấu các đơn hàng đã được thanh toán</div>
                                    </button>
                                    <button
                                        onClick={() => handleSelectStatus('pending')}
                                        className={`w-full text-left px-4 py-3 border rounded-md transition-colors ${
                                            selectedNewStatus === 'pending' 
                                                ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-200' 
                                                : 'border-gray-300 hover:bg-yellow-50 hover:border-yellow-300'
                                        }`}
                                    >
                                        <div className="font-medium text-yellow-600">COD</div>
                                        <div className="text-sm text-gray-500">Thanh toán khi nhận hàng</div>
                                    </button>
                                    <button
                                        onClick={() => handleSelectStatus('debt')}
                                        className={`w-full text-left px-4 py-3 border rounded-md transition-colors ${
                                            selectedNewStatus === 'debt' 
                                                ? 'border-red-400 bg-red-50 ring-2 ring-red-200' 
                                                : 'border-gray-300 hover:bg-red-50 hover:border-red-300'
                                        }`}
                                    >
                                        <div className="font-medium text-red-600">Công nợ</div>
                                        <div className="text-sm text-gray-500">Chưa thanh toán, ghi nợ</div>
                                    </button>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                                <Button
                                    onClick={handleConfirmStatusChange}
                                    disabled={!selectedNewStatus}
                                    className={`w-full sm:w-auto ${
                                        selectedNewStatus 
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Xác nhận thay đổi
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleCloseStatusModal}
                                    className="w-full sm:w-auto"
                                >
                                    Hủy
                                </Button>
                            </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 