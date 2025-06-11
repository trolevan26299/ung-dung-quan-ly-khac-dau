import React, { useState, useEffect } from 'react';
import {
    Package2,
    Plus,
    Search,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    ArrowUpCircle,
    ArrowDownCircle,
    RefreshCw,
    Package,
    Grid,
    List
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { stockApi, productsApi } from '../services/api';
import type { StockTransaction, CreateStockTransactionRequest, Product } from '../types';
import { useModal } from '../hooks/useModal';
import { useDebounce } from '../hooks/useDebounce';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { StockTransactionForm } from '../components/stock/StockTransactionForm';
import { StockTransactionDetail } from '../components/stock/StockTransactionDetail';
import { StockTransactionCard } from '../components/stock/StockTransactionCard';
import { StockTransactionTable } from '../components/stock/StockTransactionTable';
import { ProductStockCard } from '../components/stock/ProductStockCard';
import { formatCurrency} from '../lib/utils';
import { Portal } from '../components/ui/Portal';
import { useToast } from '../contexts/ToastContext';

// Product Stock Table Component
interface ProductStockTableProps {
    products: Product[];
    isLoading?: boolean;
    pagination?: {
        currentPage: number;
        totalPages: number;
        total: number;
        limit: number;
    };
    onPageChange?: (page: number) => void;
    onNextPage?: () => void;
    onPreviousPage?: () => void;
    onLimitChange?: (limit: number) => void;
}

const ProductStockTable: React.FC<ProductStockTableProps> = ({
    products,
    isLoading = false,
    pagination,
    onPageChange,
    onNextPage,
    onPreviousPage,
    onLimitChange
}) => {
    const getStockStatusColor = (product: Product) => {
        if (product.stockQuantity === 0) {
            return 'text-red-600 bg-red-100';
        } else if (product.stockQuantity >= 10 && product.stockQuantity <= 20) {
            return 'text-orange-600 bg-orange-100';
        } else if (product.stockQuantity > 20) {
            return 'text-green-600 bg-green-100';
        }
        return 'text-red-600 bg-red-100'; // < 10 cũng coi là hết hàng/tồn kho thấp
    };

    const getStockStatusText = (product: Product) => {
        if (product.stockQuantity === 0) {
            return 'Hết hàng';
        } else if (product.stockQuantity >= 10 && product.stockQuantity <= 20) {
            return 'Tồn kho thấp';
        } else if (product.stockQuantity > 20) {
            return 'Tồn kho tốt';
        }
        return 'Tồn kho thấp'; // < 10
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="animate-pulse">
                    <div className="h-12 bg-gray-200 rounded-t-lg"></div>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="h-16 bg-gray-100 border-t border-gray-200"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                    <Package className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có sản phẩm nào</h3>
                <p className="text-gray-500">Hệ thống chưa có sản phẩm nào được thêm</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sản phẩm
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Danh mục
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tồn kho
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Giá nhập TB
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {product.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-900">{product.category}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-blue-600">
                                        {product.stockQuantity.toLocaleString('vi-VN')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-900">
                                        {formatCurrency(product.avgImportPrice || 0)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(product)}`}>
                                        {getStockStatusText(product)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination tích hợp trong bảng */}
            {pagination && (
                <div className="flex items-center justify-between bg-white border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Hiển thị:</span>
                        <select
                            value={pagination.limit}
                            onChange={(e) => {
                                console.log('Dropdown onChange triggered with value:', e.target.value);
                                console.log('onLimitChange function:', onLimitChange);
                                if (onLimitChange) {
                                    onLimitChange(Number(e.target.value));
                                } else {
                                    console.error('onLimitChange is not defined!');
                                }
                            }}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-gray-700">mục</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">
                            Hiển thị {((pagination.currentPage - 1) * pagination.limit) + 1} đến{' '}
                            {Math.min(pagination.currentPage * pagination.limit, pagination.total)} trong{' '}
                            {pagination.total} kết quả
                        </span>
                        
                        <div className="flex items-center space-x-1 ml-4">
                            <button 
                                onClick={onPreviousPage}
                                disabled={pagination.currentPage === 1}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400 border border-gray-300 rounded"
                            >
                                ‹ Trước
                            </button>
                            
                            {/* Render page numbers */}
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                let pageNumber: number;
                                if (pagination.totalPages <= 5) {
                                    pageNumber = i + 1;
                                } else if (pagination.currentPage <= 3) {
                                    pageNumber = i + 1;
                                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                    pageNumber = pagination.totalPages - 4 + i;
                                } else {
                                    pageNumber = pagination.currentPage - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => onPageChange && onPageChange(pageNumber)}
                                        className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                                            pagination.currentPage === pageNumber
                                                ? 'bg-blue-500 text-white border-blue-500'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}
                            
                            <button 
                                onClick={onNextPage}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400 border border-gray-300 rounded"
                            >
                                Sau ›
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

type ViewMode = 'grid' | 'table';

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
                product: transaction.productId,
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

    // Xử lý logic khi type thay đổi
    useEffect(() => {
        console.log('🔍 Form type changed to:', formData.type);
        if (formData.type === 'adjustment') {
            console.log('🔧 Setting adjustment defaults...');
            setFormData(prev => ({
                ...prev,
                unitPrice: 0,
                notes: prev.notes || 'Chỉnh sửa số lượng tồn kho khi có sai lệch'
            }));
        }
    }, [formData.type]);

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
                unitPrice: formData.type === 'import' ? 0 : product.currentPrice
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    // Debug log
    console.log('📋 Form Data:', formData);
    console.log('🎯 Is Adjustment:', formData.type === 'adjustment');

    return (
        <Portal>
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100vw',
                    height: '100vh'
                }}
            >
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
                                        {product.name} - Tồn: {product.stockQuantity}
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
                                onChange={(e) => {
                                    const type = e.target.value as any;
                                    console.log('🔄 Type changed to:', type);
                                    
                                    if (type === 'adjustment') {
                                        console.log('🔧 Setting adjustment mode...');
                                        setFormData({ 
                                            ...formData, 
                                            type,
                                            unitPrice: 0,
                                            notes: 'Chỉnh sửa số lượng tồn kho khi có sai lệch'
                                        });
                                    } else {
                                        console.log('🏪 Setting normal mode...');
                                        setFormData({ 
                                            ...formData, 
                                            type,
                                            notes: formData.notes === 'Chỉnh sửa số lượng tồn kho khi có sai lệch' ? '' : formData.notes
                                        });
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                required
                            >
                                <option value="import">Nhập kho</option>
                                <option value="export">Xuất kho</option>
                                <option value="adjustment">Điều chỉnh</option>
                            </select>
                            {formData.type === 'adjustment' && (
                                <p className="text-xs text-blue-600 mt-1">
                                    💡 Điều chỉnh dùng để sửa sai lệch tồn kho, không ảnh hưởng giá trung bình
                                </p>
                            )}
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
                                Đơn giá {formData.type !== 'adjustment' && '*'}
                                {formData.type === 'adjustment' && (
                                    <span className="text-xs text-gray-500 ml-2">(Tự động = 0 cho điều chỉnh)</span>
                                )}
                            </label>
                            <Input
                                type="number"
                                value={formData.unitPrice}
                                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                                placeholder={formData.type === 'adjustment' ? '0 (tự động)' : 'Nhập đơn giá'}
                                min="0"
                                disabled={formData.type === 'adjustment'}
                                required={formData.type !== 'adjustment'}
                                style={{
                                    backgroundColor: formData.type === 'adjustment' ? '#f3f4f6' : 'white',
                                    cursor: formData.type === 'adjustment' ? 'not-allowed' : 'text',
                                    opacity: formData.type === 'adjustment' ? 0.6 : 1
                                }}
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
                                    <span>
                                        {formData.type === 'adjustment' ? 'Điều chỉnh tồn kho:' : 'Tổng giá trị:'}
                                    </span>
                                    <span className="font-medium">
                                        {formData.type === 'adjustment' 
                                            ? `${formData.quantity > 0 ? '+' : ''}${formData.quantity} sản phẩm`
                                            : formatCurrency(formData.quantity * (formData.unitPrice || 0))
                                        }
                                    </span>
                                </div>
                                {formData.type === 'adjustment' && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Không có giá trị tài chính cho giao dịch điều chỉnh
                                    </p>
                                )}
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
                                disabled={isLoading || !formData.product || !formData.quantity || (formData.type !== 'adjustment' && !formData.unitPrice)}
                            >
                                {isLoading ? 'Đang xử lý...' : (transaction ? 'Cập nhật' : 'Thêm mới')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
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
        <Portal>
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100vw',
                    height: '100vh'
                }}
            >
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
                                <p className="font-medium">{transaction.productName || 'N/A'}</p>
                                <p className="text-sm text-gray-600">Mã: {transaction.productCode || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Số lượng</label>
                                <p className="font-medium text-lg">{transaction.quantity}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Đơn giá</label>
                                <p className="font-medium">
                                    {(transaction.transactionType === 'import' || transaction.type === 'import')
                                        ? formatCurrency(transaction.unitPrice)
                                        : '-'
                                    }
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Tổng giá trị</label>
                                <p className="font-bold text-green-600">
                                    {(transaction.transactionType === 'import' || transaction.type === 'import')
                                        ? formatCurrency((transaction.quantity || 0) * (transaction.unitPrice || 0))
                                        : '-'
                                    }
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

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Người thực hiện</label>
                                <div className="mt-1">
                                    <p className="font-medium text-gray-900">
                                        {typeof transaction.userId === 'object' 
                                            ? transaction.userId.fullName 
                                            : transaction.userName || 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        @{typeof transaction.userId === 'object' 
                                            ? transaction.userId.username 
                                            : `ID: ${transaction.userId}`}
                                    </p>
                                    {typeof transaction.userId === 'object' && transaction.userId.role && (
                                        <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                                            transaction.userId.role === 'admin' 
                                                ? 'bg-purple-100 text-purple-800' 
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {transaction.userId.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Ngày thực hiện</label>
                                <p className="font-medium text-gray-900 mt-1">
                                    {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

// Enhanced Pagination Component với limit dropdown cho grid mode
interface EnhancedPaginationProps {
    pagination: {
        currentPage: number;
        totalPages: number;
        total: number;
        limit: number;
    };
    onPageChange: (page: number) => void;
    onNextPage: () => void;
    onPreviousPage: () => void;
    onLimitChange: (limit: number) => void;
}

const EnhancedPagination: React.FC<EnhancedPaginationProps> = ({
    pagination,
    onPageChange,
    onNextPage,
    onPreviousPage,
    onLimitChange
}) => {
    // Chỉ hiển thị pagination khi có nhiều hơn 1 trang hoặc tổng số items > limit
    if (pagination.totalPages <= 1 && pagination.total <= pagination.limit) return null;

    return (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Hiển thị:</span>
                <select
                    value={pagination.limit}
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-700">mục</span>
            </div>
            
            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                    Hiển thị {((pagination.currentPage - 1) * pagination.limit) + 1} đến{' '}
                    {Math.min(pagination.currentPage * pagination.limit, pagination.total)} trong{' '}
                    {pagination.total} kết quả
                </span>
                
                {/* Chỉ hiển thị navigation khi có nhiều trang */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center space-x-1 ml-4">
                        <button 
                            onClick={onPreviousPage}
                            disabled={pagination.currentPage === 1}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400 border border-gray-300 rounded"
                        >
                            ‹ Trước
                        </button>
                        
                        {/* Render page numbers */}
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            let pageNumber: number;
                            if (pagination.totalPages <= 5) {
                                pageNumber = i + 1;
                            } else if (pagination.currentPage <= 3) {
                                pageNumber = i + 1;
                            } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                pageNumber = pagination.totalPages - 4 + i;
                            } else {
                                pageNumber = pagination.currentPage - 2 + i;
                            }
                            
                            return (
                                <button
                                    key={pageNumber}
                                    onClick={() => onPageChange(pageNumber)}
                                    className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                                        pagination.currentPage === pageNumber
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}
                        
                        <button 
                            onClick={onNextPage}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400 border border-gray-300 rounded"
                        >
                            Sau ›
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Main Stock Page
export const Stock: React.FC = () => {
    const [transactions, setTransactions] = useState<StockTransaction[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [transactionPagination, setTransactionPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 10
    });
    const [productPagination, setProductPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 10
    });
    const [stats, setStats] = useState({
        todayImports: 0,
        todayExports: 0,
        totalProducts: 0,
        lowStockProducts: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'transactions' | 'products'>('transactions');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [productViewMode, setProductViewMode] = useState<ViewMode>('table');
    
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

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

    const { success, error: showError } = useToast();

    // Load initial data when component mounts
    useEffect(() => {
        fetchProducts();
        fetchTransactions();
        fetchStats();
    }, []);

    useEffect(() => {
        // Load transactions nếu đang ở tab transactions
        if (activeTab === 'transactions') {
            fetchTransactions();
        }
    }, [transactionPagination.currentPage, transactionPagination.limit, debouncedSearchTerm, activeTab, typeFilter]);

    useEffect(() => {
        // Load products 
        fetchProducts();
    }, [productPagination.currentPage, productPagination.limit, debouncedSearchTerm, activeTab]);

    // Debug useEffect để log khi productPagination thay đổi
    useEffect(() => {
        console.log('productPagination state changed to:', productPagination);
    }, [productPagination]);

    const fetchTransactions = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const fetchParams = {
                page: transactionPagination.currentPage,
                limit: transactionPagination.limit,
                ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
                ...(typeFilter && { type: typeFilter })
            };
            console.log('fetchTransactions called with params:', fetchParams);
            console.log('transactionPagination state:', transactionPagination);
            const response = await stockApi.getStockTransactions(fetchParams);
            setTransactions(response.data);
            setTransactionPagination(prev => ({
                ...prev,
                total: response.total,
                totalPages: response.totalPages || Math.ceil(response.total / prev.limit)
            }));
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
                page: productPagination.currentPage,
                limit: productPagination.limit,
                ...(debouncedSearchTerm && { search: debouncedSearchTerm })
            };
            console.log('fetchProducts called with params:', fetchParams);
            console.log('productPagination state:', productPagination);
            const response = await productsApi.getProducts(fetchParams);
            setProducts(response.data);
            setProductPagination(prev => ({
                ...prev,
                total: response.total,
                totalPages: response.totalPages || Math.ceil(response.total / prev.limit)
            }));
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Lấy tất cả transactions gần đây để tính thống kê hôm nay
            const todayResponse = await stockApi.getStockTransactions({
                limit: 1000 // lấy nhiều để đảm bảo có đủ
            });
            
            console.log('All transactions:', todayResponse.data);
            
            // Lọc transactions hôm nay
            const today = new Date().toDateString();
            console.log('Today string:', today);
            
            const todayTransactions = todayResponse.data.filter(t => {
                const transactionDate = new Date(t.createdAt).toDateString();
                console.log('Transaction date:', transactionDate, 'Type:', t.transactionType);
                return transactionDate === today;
            });
            
            console.log('Today transactions:', todayTransactions);
            
            const todayImports = todayTransactions.filter(t => t.transactionType === 'import').length;
            const todayExports = todayTransactions.filter(t => t.transactionType === 'export').length;
            
            console.log('Today imports:', todayImports, 'Today exports:', todayExports);
            
            // Lấy tất cả products để tính lowStock
            const allProductsResponse = await productsApi.getProducts({ limit: 1000 });
            const allProducts = allProductsResponse.data;
            const lowStockProducts = allProducts.filter(product => 
                product.stockQuantity <= (product.minStock || 10)
            ).length;
            
            setStats({
                todayImports,
                todayExports,
                totalProducts: allProductsResponse.total,
                lowStockProducts
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
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
            fetchStats(); // Refresh stats after transaction
            // Show success toast
            const typeText = data.type === 'import' ? 'Nhập kho' : 
                            data.type === 'export' ? 'Xuất kho' : 'Điều chỉnh';
            success(`${typeText} thành công!`);
        } catch (error) {
            console.error('Error creating transaction:', error);
            setError('Có lỗi xảy ra khi tạo giao dịch');
            showError('Có lỗi xảy ra khi tạo giao dịch');
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
        setSearchTerm('');
        // Reset pagination cho tab mới
        if (tab === 'products') {
            setProductPagination(prev => ({ ...prev, currentPage: 1 }));
        } else {
            setTransactionPagination(prev => ({ ...prev, currentPage: 1 }));
        }
    };

    // Product pagination handlers
    const goToProductPage = (page: number) => {
        setProductPagination(prev => ({ ...prev, currentPage: page }));
    };

    const goToNextProductPage = () => {
        if (productPagination.currentPage < productPagination.totalPages) {
            setProductPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
        }
    };

    const goToPreviousProductPage = () => {
        if (productPagination.currentPage > 1) {
            setProductPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
        }
    };

    // Transaction pagination handlers  
    const goToTransactionPage = (page: number) => {
        setTransactionPagination(prev => ({ ...prev, currentPage: page }));
    };

    const goToNextTransactionPage = () => {
        if (transactionPagination.currentPage < transactionPagination.totalPages) {
            setTransactionPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
        }
    };

    const goToPreviousTransactionPage = () => {
        if (transactionPagination.currentPage > 1) {
            setTransactionPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
        }
    };

    // Get filtered transactions
    const filteredTransactions = transactions.filter(transaction => {
        const matchesType = !typeFilter || transaction.transactionType === typeFilter;
        return matchesType;
    });

    // Products are already filtered by API search, không cần filter thêm
    const filteredProducts = products;

    // Product pagination handlers with limit change
    const handleProductLimitChange = (limit: number) => {
        console.log('handleProductLimitChange called with limit:', limit);
        console.log('Current productPagination BEFORE update:', productPagination);
        setProductPagination(prev => {
            const newState = { 
                ...prev, 
                limit, 
                currentPage: 1 
            };
            console.log('NEW productPagination state:', newState);
            return newState;
        });
    };

    // Transaction pagination handlers with limit change
    const handleTransactionLimitChange = (limit: number) => {
        console.log('handleTransactionLimitChange called with limit:', limit);
        console.log('Current transactionPagination BEFORE update:', transactionPagination);
        setTransactionPagination(prev => {
            const newState = { 
                ...prev, 
                limit, 
                currentPage: 1 
            };
            console.log('NEW transactionPagination state:', newState);
            return newState;
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Package2 className="w-8 h-8 mr-3 text-primary-600" />
                        Quản lý kho hàng
                    </h1>
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
                                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
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
                                <p className="text-2xl font-bold text-gray-900">{stats.todayImports}</p>
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
                                <p className="text-2xl font-bold text-gray-900">{stats.todayExports}</p>
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
                                <p className="text-2xl font-bold text-gray-900">{stats.lowStockProducts}</p>
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
                    <div className="flex items-center justify-between">
                        <div className="flex-1 relative mr-2">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder={activeTab === 'transactions' ? "Tìm kiếm giao dịch..." : "Tìm kiếm sản phẩm..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center space-x-4 ">
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

                            {/* View Toggle for Transactions */}
                            {activeTab === 'transactions' && (
                                <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                                    <Button
                                        variant={viewMode === 'grid' ? 'active' : 'inactive'}
                                        size="sm"
                                        onClick={() => {
                                            setViewMode('grid');
                                            // Chuyển về limit phù hợp cho grid mode
                                            if (transactionPagination.limit === 10 || transactionPagination.limit === 25 || transactionPagination.limit === 50 || transactionPagination.limit === 100) {
                                                setTransactionPagination(prev => ({ ...prev, limit: 10, currentPage: 1 }));
                                            }
                                        }}
                                        className="h-8 w-8 p-0 rounded-md"
                                        title="Xem dạng lưới"
                                    >
                                        <Grid className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'table' ? 'active' : 'inactive'}
                                        size="sm"
                                        onClick={() => {
                                            setViewMode('table');
                                            // Chuyển về limit phù hợp cho table mode
                                            if (transactionPagination.limit === 10 || transactionPagination.limit === 12 || transactionPagination.limit === 24 || transactionPagination.limit === 48) {
                                                setTransactionPagination(prev => ({ ...prev, limit: 10, currentPage: 1 }));
                                            }
                                        }}
                                        className="h-8 w-8 p-0 rounded-md ml-1"
                                        title="Xem dạng bảng"
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}

                            {/* View Toggle for Products */}
                            {activeTab === 'products' && (
                                <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                                    <Button
                                        variant={productViewMode === 'grid' ? 'active' : 'inactive'}
                                        size="sm"
                                        onClick={() => {
                                            setProductViewMode('grid');
                                            // Chuyển về limit phù hợp cho grid mode
                                            if (productPagination.limit === 10 || productPagination.limit === 25 || productPagination.limit === 50 || productPagination.limit === 100) {
                                                setProductPagination(prev => ({ ...prev, limit: 10, currentPage: 1 }));
                                            }
                                        }}
                                        className="h-8 w-8 p-0 rounded-md"
                                        title="Xem dạng lưới"
                                    >
                                        <Grid className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={productViewMode === 'table' ? 'active' : 'inactive'}
                                        size="sm"
                                        onClick={() => {
                                            setProductViewMode('table');
                                            // Chuyển về limit phù hợp cho table mode
                                            if (productPagination.limit === 10 || productPagination.limit === 25 || productPagination.limit === 50 || productPagination.limit === 100) {
                                                setProductPagination(prev => ({ ...prev, limit: 10, currentPage: 1 }));
                                            }
                                        }}
                                        className="h-8 w-8 p-0 rounded-md ml-1"
                                        title="Xem dạng bảng"
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}

                            <div className="text-sm text-gray-500">
                                Tổng: {activeTab === 'transactions' ? transactionPagination.total : productPagination.total} {activeTab === 'transactions' ? 'giao dịch' : 'sản phẩm'}
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

            {/* Content */}
            {activeTab === 'transactions' ? (
                <div className="space-y-4">
                    {/* Transactions List */}
                    {viewMode === 'table' ? (
                        <StockTransactionTable
                            transactions={filteredTransactions}
                            isLoading={isLoading}
                            onView={handleViewDetail}
                            onAdd={handleAddNew}
                            pagination={transactionPagination}
                            onPageChange={goToTransactionPage}
                            onNextPage={goToNextTransactionPage}
                            onPreviousPage={goToPreviousTransactionPage}
                            onLimitChange={handleTransactionLimitChange}
                        />
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                    <div className="col-span-full">
                                        <EmptyState
                                            icon={Package2}
                                            title="Chưa có giao dịch kho nào"
                                            description="Bắt đầu bằng cách thêm giao dịch đầu tiên"
                                            actionLabel="Thêm giao dịch"
                                            onAction={handleAddNew}
                                        />
                                    </div>
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
                            
                            {/* Pagination for grid mode */}
                            {!isLoading && filteredTransactions.length > 0 && (
                                <EnhancedPagination
                                    pagination={transactionPagination}
                                    onPageChange={goToTransactionPage}
                                    onNextPage={goToNextTransactionPage}
                                    onPreviousPage={goToPreviousTransactionPage}
                                    onLimitChange={handleTransactionLimitChange}
                                />
                            )}
                        </div>
                    )}
                </div>
            ) : (
                /* Products Stock List */
                <div className="space-y-4">
                    {productViewMode === 'table' ? (
                        <ProductStockTable
                            products={filteredProducts}
                            isLoading={isLoading}
                            pagination={productPagination}
                            onPageChange={goToProductPage}
                            onNextPage={goToNextProductPage}
                            onPreviousPage={goToPreviousProductPage}
                            onLimitChange={handleProductLimitChange}
                        />
                    ) : (
                        <div className="space-y-4">
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
                            
                            {/* Pagination for products grid mode */}
                            {!isLoading && filteredProducts.length > 0 && (
                                <EnhancedPagination
                                    pagination={{
                                        currentPage: productPagination.currentPage,
                                        totalPages: productPagination.totalPages,
                                        total: productPagination.total,
                                        limit: productPagination.limit
                                    }}
                                    onPageChange={goToProductPage}
                                    onNextPage={goToNextProductPage}
                                    onPreviousPage={goToPreviousProductPage}
                                    onLimitChange={handleProductLimitChange}
                                />
                            )}
                        </div>
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
