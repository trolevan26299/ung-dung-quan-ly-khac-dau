import React from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Eye, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';
import { StockTransaction } from '../../types';

interface StockTransactionCardProps {
    transaction: StockTransaction;
    onViewDetail: (transaction: StockTransaction) => void;
}

export const StockTransactionCard: React.FC<StockTransactionCardProps> = ({
    transaction,
    onViewDetail
}) => {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'import': return <ArrowUpCircle className="w-4 h-4 text-green-600" />;
            case 'export': return <ArrowDownCircle className="w-4 h-4 text-red-600" />;
            case 'adjustment': return <RefreshCw className="w-4 h-4 text-blue-600" />;
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

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                                {getTypeIcon(transaction.type)}
                                <span className="ml-1">{getTypeText(transaction.type)}</span>
                            </span>
                            <h3 className="font-semibold text-lg">
                                {transaction.product.name}
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Số lượng:</span>
                                <p className="font-medium">{transaction.quantity}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Đơn giá:</span>
                                <p className="font-medium">{(transaction.unitPrice || 0).toLocaleString('vi-VN')}₫</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Tổng giá trị:</span>
                                <p className="font-bold text-green-600">
                                    {(transaction.totalPrice || 0).toLocaleString('vi-VN')}₫
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500">Ngày:</span>
                                <p className="font-medium">
                                    {new Date(transaction.createdAt).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 text-sm text-gray-600">
                            <span>Tồn kho: {transaction.product.currentStock}</span>
                        </div>
                    </div>

                    <div className="flex space-x-1 ml-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetail(transaction)}
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}; 