import React from 'react';
import { Eye, ArrowUpCircle, ArrowDownCircle, RotateCcw, Package, Calendar, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency, formatDateTime, safeString, safeNumber } from '../../lib/utils';
import type { StockTransaction } from '../../types';

interface StockTransactionTableProps {
    transactions?: StockTransaction[];
    isLoading?: boolean;
    onView: (transaction: StockTransaction) => void;
    onAdd?: () => void;
}

export const StockTransactionTable: React.FC<StockTransactionTableProps> = ({
    transactions,
    isLoading = false,
    onView,
    onAdd
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
                                Đơn giá
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tổng giá trị
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
                        {(transactions || []).map((transaction) => (
                            <tr key={transaction._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {safeString(transaction.product?.name || 'N/A')}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Mã: {safeString(transaction.product?.code || '')}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {getTypeIcon(transaction.type)}
                                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(transaction.type)}`}>
                                            {getTypeText(transaction.type)}
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
                                            {formatCurrency(transaction.unitPrice || 0)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                                        <span className="text-sm font-semibold text-green-600">
                                            {formatCurrency((transaction.quantity || 0) * (transaction.unitPrice || 0))}
                                        </span>
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
                                    <Button
                                        variant="light"
                                        size="xs"
                                        onClick={() => onView(transaction)}
                                        className="h-7 w-7 p-0"
                                        title="Xem chi tiết"
                                    >
                                        <Eye className="w-3 h-3" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}; 