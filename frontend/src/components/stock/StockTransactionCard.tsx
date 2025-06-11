import React from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Eye, ArrowUpCircle, ArrowDownCircle, RefreshCw, User } from 'lucide-react';
import { StockTransaction } from '../../types';
import { formatCurrency, formatDateTime } from '../../lib/utils';

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
            case 'import': return {
                bg: 'bg-green-50',
                border: 'border-green-200',
                badge: 'bg-green-100 text-green-800',
                accent: 'text-green-600'
            };
            case 'export': return {
                bg: 'bg-red-50',
                border: 'border-red-200', 
                badge: 'bg-red-100 text-red-800',
                accent: 'text-red-600'
            };
            case 'adjustment': return {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                badge: 'bg-blue-100 text-blue-800', 
                accent: 'text-blue-600'
            };
            default: return {
                bg: 'bg-gray-50',
                border: 'border-gray-200',
                badge: 'bg-gray-100 text-gray-800',
                accent: 'text-gray-600'
            };
        }
    };

    const typeConfig = getTypeColor(transaction.transactionType || transaction.type);
    const totalValue = (transaction.quantity || 0) * (transaction.unitPrice || 0);

    return (
        <Card className={`hover:shadow-lg transition-shadow ${typeConfig.border} ${typeConfig.bg}`}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        {getTypeIcon(transaction.transactionType || transaction.type)}
                        <div>
                            <h4 className="font-medium text-gray-900">
                                {transaction.productName || 'N/A'}
                            </h4>
                            <p className="text-sm text-gray-500">
                                Mã: {transaction.productCode || 'N/A'}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetail(transaction)}
                        className="h-8 w-8 p-0"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Số lượng:</span>
                        <span className={`font-bold text-lg ${typeConfig.accent}`}>
                            {transaction.quantity}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Đơn giá:</span>
                        <span className="font-medium text-gray-900">
                            {(transaction.transactionType === 'import' || transaction.type === 'import')
                                ? formatCurrency(transaction.unitPrice || 0)
                                : '-'
                            }
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Tổng giá trị:</span>
                        <span className="font-bold text-green-600">
                            {(transaction.transactionType === 'import' || transaction.type === 'import')
                                ? formatCurrency(totalValue)
                                : '-'
                            }
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Thời gian:</span>
                        <span className="text-sm font-medium text-gray-700">
                            {formatDateTime(transaction.createdAt)}
                        </span>
                    </div>
                </div>

                <div className="pt-3 border-t border-gray-200 mt-3">
                    <div className="flex items-center justify-between">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${typeConfig.badge}`}>
                            {getTypeText(transaction.transactionType || transaction.type)}
                        </span>
                        
                        <div className="flex items-center text-xs text-gray-500">
                            <User className="w-3 h-3 mr-1" />
                            <div>
                                <div className="font-medium text-gray-700">
                                    {typeof transaction.userId === 'object' 
                                        ? (transaction.userId.fullName === 'Administrator' ? transaction.userId.username : transaction.userId.fullName)
                                        : transaction.userName || 'N/A'}
                                </div>
                               
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}; 