import React from 'react';
import { Button } from '../ui/Button';
import { X, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';
import { Portal } from '../ui/Portal';
import { StockTransaction } from '../../types';

interface StockTransactionDetailProps {
    transaction: StockTransaction | null;
    isOpen: boolean;
    onClose: () => void;
}

export const StockTransactionDetail: React.FC<StockTransactionDetailProps> = ({
    transaction,
    isOpen,
    onClose
}) => {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'import': return <ArrowUpCircle className="w-5 h-5 text-green-600" />;
            case 'export': return <ArrowDownCircle className="w-5 h-5 text-red-600" />;
            case 'adjustment': return <RefreshCw className="w-5 h-5 text-blue-600" />;
            default: return null;
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
            case 'import': return 'bg-green-100 text-green-800';
            case 'export': return 'bg-red-100 text-red-800';
            case 'adjustment': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (!isOpen || !transaction) return null;

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
                <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Chi tiết giao dịch kho</h2>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {/* Transaction Type */}
                        <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getTypeColor(transaction.transactionType || transaction.type)}`}>
                                {getTypeIcon(transaction.transactionType || transaction.type)}
                                <span className="ml-2">{getTypeText(transaction.transactionType || transaction.type)}</span>
                            </span>
                        </div>

                        {/* Product Information */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-3">Thông tin sản phẩm</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Tên sản phẩm
                                    </label>
                                    <p className="text-gray-900 font-medium">{transaction.productName || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Mã sản phẩm
                                    </label>
                                    <p className="text-gray-900">{transaction.productCode || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Transaction Details */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-3">Chi tiết giao dịch</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Số lượng
                                    </label>
                                    <p className="text-gray-900 font-medium text-lg">
                                        {transaction.quantity.toLocaleString('vi-VN')}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Đơn giá
                                    </label>
                                    <p className="text-gray-900 font-medium">
                                        {(transaction.transactionType === 'import' || transaction.type === 'import')
                                            ? `${(transaction.unitPrice || 0).toLocaleString('vi-VN')}₫`
                                            : '-'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Tổng giá trị
                                    </label>
                                    <p className="text-green-600 font-bold text-xl">
                                        {(transaction.transactionType === 'import' || transaction.type === 'import')
                                            ? `${((transaction.quantity || 0) * (transaction.unitPrice || 0)).toLocaleString('vi-VN')}₫`
                                            : '-'
                                        }
                                    </p>
                                </div>
                                {transaction.stockBefore !== undefined && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Tồn kho trước
                                        </label>
                                        <p className="text-blue-600 font-medium">
                                            {transaction.stockBefore.toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                )}
                                {transaction.stockAfter !== undefined && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Tồn kho sau
                                        </label>
                                        <p className="text-blue-600 font-medium">
                                            {transaction.stockAfter.toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Ngày thực hiện
                                </label>
                                <p className="text-gray-900">
                                    {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Người thực hiện
                                </label>
                                <div className="flex items-center space-x-2 pb-2">
                                    <p className="text-gray-900 font-medium">
                                        {typeof transaction.userId === 'object' 
                                            ? (transaction.userId.fullName === 'Administrator' ? transaction.userId.username : transaction.userId.fullName)
                                            : transaction.userName || 'N/A'} -
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

                            {transaction.notes && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Ghi chú
                                    </label>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-gray-900">{transaction.notes}</p>
                                    </div>
                                </div>
                            )}

                            {transaction.orderId && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Liên kết đơn hàng
                                    </label>
                                    <p className="text-blue-600 font-medium">#{transaction.orderId}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t">
                        <Button onClick={onClose}>
                            Đóng
                        </Button>
                    </div>
                </div>
            </div>
        </Portal>
    );
}; 