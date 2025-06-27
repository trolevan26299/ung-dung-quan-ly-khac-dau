import React from 'react';
import { Eye, ArrowUpCircle, ArrowDownCircle, RotateCcw, Package, Calendar, DollarSign, User, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency, formatDateTime, safeString, safeNumber } from '../../lib/utils';
import type { StockTransaction } from '../../types';

interface StockTransactionTableProps {
    transactions?: StockTransaction[];
    isLoading?: boolean;
    onView: (transaction: StockTransaction) => void;
    onEdit?: (transaction: StockTransaction) => void;
    onDelete?: (transaction: StockTransaction) => void;
    onAdd?: () => void;
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

export const StockTransactionTable: React.FC<StockTransactionTableProps> = ({
    transactions,
    isLoading = false,
    onView,
    onEdit,
    onDelete,
    onAdd,
    pagination,
    onPageChange,
    onNextPage,
    onPreviousPage,
    onLimitChange
}) => {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'import':
                return <ArrowUpCircle className="w-4 h-4 text-green-600" />;
            case 'export':
                return <ArrowDownCircle className="w-4 h-4 text-red-600" />;
            case 'adjustment':
                return <RotateCcw className="w-4 h-4 text-blue-600" />;
            default:
                return <Package className="w-4 h-4 text-gray-600" />;
        }
    };

    const getTypeText = (type: string) => {
        switch (type) {
            case 'import':
                return 'Nhập kho';
            case 'export':
                return 'Xuất kho';
            case 'adjustment':
                return 'Điều chỉnh';
            default:
                return 'Không xác định';
        }
    };

    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'import':
                return 'bg-green-100 text-green-800';
            case 'export':
                return 'bg-red-100 text-red-800';
            case 'adjustment':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
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

    if (!transactions || transactions.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                    <Package className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có giao dịch kho nào</h3>
                <p className="text-gray-500 mb-4">Bắt đầu bằng cách thêm giao dịch đầu tiên</p>
                {onAdd && (
                    <Button onClick={onAdd}>
                        Thêm giao dịch
                    </Button>
                )}
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
                                Loại giao dịch
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Số lượng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Đơn giá (VAT)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tổng giá trị (VAT)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Người tạo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thời gian
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(transactions || []).map((transaction) => {
                            const canEditDelete = (transaction.transactionType === 'import' || transaction.transactionType === 'adjustment') && !transaction.orderId;

                            return (
                                <tr key={transaction._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {safeString(transaction.productName || 'N/A')}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Mã: {safeString(transaction.productCode || '')}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getTypeIcon(transaction.transactionType)}
                                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(transaction.transactionType)}`}>
                                                {getTypeText(transaction.transactionType)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {safeNumber(transaction.quantity)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                                            <span className="text-sm text-gray-900">
                                                {transaction.transactionType === 'import' 
                                                    ? formatCurrency(transaction.unitPrice || 0)
                                                    : '-'
                                                }
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                                            <span className="text-sm font-semibold text-green-600">
                                                {transaction.transactionType === 'import' 
                                                    ? formatCurrency((transaction.quantity || 0) * (transaction.unitPrice || 0))
                                                    : '-'
                                                }
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 text-gray-400 mr-2" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {typeof transaction.userId === 'object' 
                                                        ? (transaction.userId.fullName === 'Administrator' ? transaction.userId.username : transaction.userId.fullName)
                                                        : transaction.userName || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-900">
                                                {formatDateTime(transaction.createdAt)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-1">
                                            {canEditDelete && onEdit && (
                                                <Button
                                                    variant="light"
                                                    size="xs"
                                                    onClick={() => onEdit(transaction)}
                                                    className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                </Button>
                                            )}
                                            {canEditDelete && onDelete && (
                                                <Button
                                                    variant="light"
                                                    size="xs"
                                                    onClick={() => onDelete(transaction)}
                                                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="light"
                                                size="xs"
                                                onClick={() => onView(transaction)}
                                                className="h-7 w-7 p-0"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
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
                            onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
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