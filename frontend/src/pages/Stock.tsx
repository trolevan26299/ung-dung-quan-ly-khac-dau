import React, { useState, useEffect } from 'react';
import {
    Package2,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    TrendingUp,
    TrendingDown,
    BarChart3,
    AlertTriangle,
    ArrowUpCircle,
    ArrowDownCircle,
    RefreshCw,
    Package,
    RotateCcw
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { stockApi, productsApi } from '../services/api';
import type { StockTransaction, CreateStockTransactionRequest, Product } from '../types';
import { useModal } from '../hooks/useModal';
import { usePagination } from '../hooks/usePagination';
import { useDebounce } from '../hooks/useDebounce';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { StockTransactionForm } from '../components/stock/StockTransactionForm';
import { StockTransactionDetail } from '../components/stock/StockTransactionDetail';
import { StockTransactionCard } from '../components/stock/StockTransactionCard';
import { ProductStockCard } from '../components/stock/ProductStockCard';
import { formatCurrency, formatNumber, formatDateTime, safeString, safeNumber } from '../lib/utils';

// Stock Transaction Form Modal
interface StockFormProps {
    transaction?: StockTransaction;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateStockTransactionRequest) => void;
    isLoading?: boolean;
}

const StockForm: React.FC<StockFormProps> = ({
    transaction,
    isOpen,
    onClose,
    onSubmit,
    isLoading = false
}) => {
    const [formData, setFormData] = useState<CreateStockTransactionRequest>({
        product: '',
        type: 'import',
        quantity: 0,
        unitPrice: 0,
        notes: ''
    });

    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (isOpen) {
            loadProducts();
        }
    }, [isOpen]);

    useEffect(() => {
        if (transaction) {
            setFormData({
                product: transaction.product._id,
                type: transaction.type,
                quantity: transaction.quantity,
                unitPrice: transaction.unitPrice,
                notes: transaction.notes || ''
            });
        } else {
            setFormData({
                product: '',
                type: 'import',
                quantity: 0,
                unitPrice: 0,
                notes: ''
            });
        }
    }, [transaction, isOpen]);

    const loadProducts = async () => {
        try {
            const response = await productsApi.getProducts({ limit: 100 });
            setProducts(response.data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const handleProductChange = (productId: string) => {
        const product = products.find(p => p._id === productId);
        if (product) {
            setFormData({
                ...formData,
                product: productId,
                unitPrice: formData.type === 'import' ? 0 : product.sellingPrice
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-xl font-bold mb-4">
                    {transaction ? 'Cập nhật giao dịch kho' : 'Thêm giao dịch kho'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sản phẩm *
                        </label>
                        <select
                            value={formData.product}
                            onChange={(e) => handleProductChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                        >
                            <option value="">Chọn sản phẩm</option>
                            {products.map(product => (
                                <option key={product._id} value={product._id}>
                                    {product.name} - Tồn: {product.currentStock}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loại giao dịch *
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                        >
                            <option value="import">Nhập kho</option>
                            <option value="export">Xuất kho</option>
                            <option value="adjustment">Điều chỉnh</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số lượng *
                        </label>
                        <Input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                            placeholder="Nhập số lượng"
                            min="1"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Đơn giá *
                        </label>
                        <Input
                            type="number"
                            value={formData.unitPrice}
                            onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                            placeholder="Nhập đơn giá"
                            min="0"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ghi chú
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Nhập ghi chú (tùy chọn)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            rows={3}
                        />
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm">
                            <div className="flex justify-between">
                                <span>Tổng giá trị:</span>
                                <span className="font-medium">
                                    {formatCurrency(formData.quantity * (formData.unitPrice || 0))}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isLoading || !formData.product || !formData.quantity}
                        >
                            {isLoading ? 'Đang xử lý...' : (transaction ? 'Cập nhật' : 'Thêm mới')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Stock Transaction Detail Modal
interface StockDetailProps {
    transaction: StockTransaction | null;
    isOpen: boolean;
    onClose: () => void;
}

const StockDetail: React.FC<StockDetailProps> = ({ transaction, isOpen, onClose }) => {
    if (!isOpen || !transaction) return null;

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'import': return <ArrowUpCircle className="w-4 h-4 text-green-600" />;
            case 'export': return <ArrowDownCircle className="w-4 h-4 text-red-600" />;
            case 'adjustment': return <RefreshCw className="w-4 h-4 text-blue-600" />;
            default: return <Package2 className="w-4 h-4" />;
        }
    };

    const getTypeText = (type: string) => {
        switch (type) {
            case 'import': return 'Nhập kho';
            case 'export': return 'Xuất kho';
            case 'adjustment': return 'Điều chỉnh';
            default: return type;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'import': return 'text-green-600 bg-green-100';
            case 'export': return 'text-red-600 bg-red-100';
            case 'adjustment': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Chi tiết giao dịch kho</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(transaction.type)}`}>
                            {getTypeIcon(transaction.type)}
                            <span className="ml-1">{getTypeText(transaction.type)}</span>
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Sản phẩm</label>
                            <p className="font-medium">{transaction.product.name}</p>
                            <p className="text-sm text-gray-600">{transaction.product.code}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Số lượng</label>
                            <p className="font-medium text-lg">{transaction.quantity}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Đơn giá</label>
                            <p className="font-medium">{formatCurrency(transaction.unitPrice)}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Tổng giá trị:</span>
                            <p className="font-bold text-green-600">
                                {formatCurrency(transaction.totalPrice)}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Tồn kho trước</label>
                            <p className="font-medium">-</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Tồn kho sau</label>
                            <p className="font-medium">-</p>
                        </div>
                    </div>

                    {transaction.notes && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                            <p className="font-medium">{transaction.notes}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                        <div>
                            <label>Người thực hiện</label>
                            <p>{transaction.createdBy.username}</p>
                        </div>
                        <div>
                            <label>Ngày thực hiện</label>
                            <p>{new Date(transaction.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Stock Page
export const Stock: React.FC = () => {
    const [transactions, setTransactions] = useState<StockTransaction[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'transactions' | 'products'>('transactions');
    const [typeFilter, setTypeFilter] = useState<string>('');

    const {
        isOpen: isFormOpen,
        selectedItem: selectedTransaction,
        openCreateModal,
        openEditModal,
        closeModal: closeFormModal
    } = useModal<StockTransaction>();

    const {
        isOpen: isDetailOpen,
        selectedItem: detailTransaction,
        openModal: openDetailModal,
        closeModal: closeDetailModal
    } = useModal<StockTransaction>();

    const {
        pagination,
        params,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        setSearch,
        updatePagination
    } = usePagination();

    const debouncedSearchTerm = useDebounce(params.search || '', 500);

    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchTransactions();
        } else {
            fetchProducts();
        }
    }, [pagination.currentPage, debouncedSearchTerm, activeTab, typeFilter]);

    const fetchTransactions = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const fetchParams = {
                page: pagination.currentPage,
                limit: pagination.limit,
                ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
                ...(typeFilter && { type: typeFilter })
            };
            const response = await stockApi.getStockTransactions(fetchParams);
            setTransactions(response.data);
            updatePagination({ total: response.total, totalPages: response.totalPages });
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setError('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const fetchParams = {
                limit: 100,
                ...(debouncedSearchTerm && { search: debouncedSearchTerm })
            };
            const response = await productsApi.getProducts(fetchParams);
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTransaction = async (data: CreateStockTransactionRequest) => {
        try {
            setIsLoading(true);
            await stockApi.createStockTransaction(data);
            closeFormModal();
            if (activeTab === 'transactions') {
                fetchTransactions();
            }
            fetchProducts(); // Always refresh products to update stock
        } catch (error) {
            console.error('Error creating transaction:', error);
            setError('Có lỗi xảy ra khi tạo giao dịch');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetail = (transaction: StockTransaction) => {
        openDetailModal(transaction);
    };

    const handleAddNew = () => {
        openCreateModal();
    };

    const handleTabChange = (tab: 'transactions' | 'products') => {
        setActiveTab(tab);
        setTypeFilter('');
        setSearch('');
    };

    // Get filtered transactions
    const filteredTransactions = transactions.filter(transaction => {
        const matchesType = !typeFilter || transaction.type === typeFilter;
        return matchesType;
    });

    // Get filtered products
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    const lowStockProducts = products.filter(product => product.currentStock < 10);

    // Calculate stats
    const todayTransactions = transactions.filter(t =>
        new Date(t.createdAt).toDateString() === new Date().toDateString()
    );
    const todayImports = todayTransactions.filter(t => t.type === 'import').length;
    const todayExports = todayTransactions.filter(t => t.type === 'export').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Package2 className="w-8 h-8 mr-3 text-primary-600" />
                        Quản lý kho hàng
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Quản lý nhập/xuất kho và theo dõi tồn kho
                    </p>
                </div>
                <Button onClick={handleAddNew} className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm giao dịch
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Package2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Tổng sản phẩm</p>
                                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Nhập kho hôm nay</p>
                                <p className="text-2xl font-bold text-gray-900">{todayImports}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <TrendingDown className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Xuất kho hôm nay</p>
                                <p className="text-2xl font-bold text-gray-900">{todayExports}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Tồn kho thấp</p>
                                <p className="text-2xl font-bold text-gray-900">{lowStockProducts.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => handleTabChange('transactions')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'transactions'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Giao dịch kho
                    </button>
                    <button
                        onClick={() => handleTabChange('products')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'products'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Tồn kho sản phẩm
                    </button>
                </nav>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder={activeTab === 'transactions' ? "Tìm kiếm giao dịch..." : "Tìm kiếm sản phẩm..."}
                                value={params.search || ''}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        {activeTab === 'transactions' && (
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">Tất cả loại</option>
                                <option value="import">Nhập kho</option>
                                <option value="export">Xuất kho</option>
                                <option value="adjustment">Điều chỉnh</option>
                            </select>
                        )}
                        <div className="text-sm text-gray-500">
                            Tổng: {activeTab === 'transactions' ? pagination.total : filteredProducts.length} {activeTab === 'transactions' ? 'giao dịch' : 'sản phẩm'}
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

            {/* Content */}
            {activeTab === 'transactions' ? (
                <div className="space-y-4">
                    {/* Transactions List */}
                    <div className="grid grid-cols-1 gap-4">
                        {isLoading ? (
                            // Loading skeleton
                            Array.from({ length: 5 }).map((_, index) => (
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
                            ))
                        ) : filteredTransactions.length === 0 ? (
                            <EmptyState
                                icon={Package2}
                                title="Chưa có giao dịch kho nào"
                                description="Bắt đầu bằng cách thêm giao dịch đầu tiên"
                                actionLabel="Thêm giao dịch"
                                onAction={handleAddNew}
                            />
                        ) : (
                            filteredTransactions.map((transaction) => (
                                <StockTransactionCard
                                    key={transaction._id}
                                    transaction={transaction}
                                    onViewDetail={handleViewDetail}
                                />
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <Pagination
                            pagination={pagination}
                            onPageChange={goToPage}
                            onNextPage={goToNextPage}
                            onPreviousPage={goToPreviousPage}
                        />
                    )}
                </div>
            ) : (
                /* Products Stock List */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        // Loading skeleton
                        Array.from({ length: 6 }).map((_, index) => (
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
                        ))
                    ) : filteredProducts.length === 0 ? (
                        <div className="col-span-full">
                            <EmptyState
                                icon={Package2}
                                title="Không tìm thấy sản phẩm nào"
                                description="Thử thay đổi từ khóa tìm kiếm"
                            />
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <ProductStockCard
                                key={product._id}
                                product={product}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Modals */}
            <StockTransactionForm
                transaction={selectedTransaction || undefined}
                isOpen={isFormOpen}
                onClose={closeFormModal}
                onSubmit={handleCreateTransaction}
                isLoading={isLoading}
            />

            <StockTransactionDetail
                transaction={detailTransaction}
                isOpen={isDetailOpen}
                onClose={closeDetailModal}
            />
        </div>
    );
};
