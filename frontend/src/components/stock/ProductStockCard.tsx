import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { AlertTriangle } from 'lucide-react';
import { formatCurrency, safeString, safeNumber } from '../../lib/utils';
import { Product } from '../../types';

interface ProductStockCardProps {
    product: Product;
}

export const ProductStockCard: React.FC<ProductStockCardProps> = ({ product }) => {
    const getStockStatus = (stock: number) => {
        if (stock === 0) {
            return {
                text: 'Hết hàng',
                color: 'bg-red-100 text-red-800',
                cardBorder: 'border-red-200',
                cardBg: 'bg-red-50',
                textColor: 'text-red-600',
                showAlert: true
            };
        } else if (stock >= 1 && stock <= 9) {
            return {
                text: 'Tồn kho thấp',
                color: 'bg-red-100 text-red-800',
                cardBorder: 'border-red-200',
                cardBg: 'bg-red-50',
                textColor: 'text-red-600',
                showAlert: true
            };
        } else if (stock >= 10 && stock <= 20) {
            return {
                text: 'Tồn kho thấp',
                color: 'bg-orange-100 text-orange-800',
                cardBorder: 'border-orange-200',
                cardBg: 'bg-orange-50',
                textColor: 'text-orange-600',
                showAlert: true
            };
        } else {
            return {
                text: 'Tồn kho tốt',
                color: 'bg-green-100 text-green-800',
                cardBorder: 'border-gray-200',
                cardBg: 'bg-white',
                textColor: 'text-blue-600',
                showAlert: false
            };
        }
    };

    const stockStatus = getStockStatus(safeNumber(product.stockQuantity));

    return (
        <Card className={`hover:shadow-lg transition-shadow ${stockStatus.cardBorder} ${stockStatus.cardBg}`}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h4 className="font-medium text-gray-900">{safeString(product.name)}</h4>
                    </div>
                    {stockStatus.showAlert && (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Tồn kho hiện tại:</span>
                        <span className={`font-bold text-lg ${stockStatus.textColor}`}>
                            {safeNumber(product.stockQuantity)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Giá nhập TB:</span>
                        <span className="font-medium text-gray-900">
                            {formatCurrency(product.avgImportPrice)}
                        </span>
                    </div>

                    <div className="pt-2 border-t">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                            {stockStatus.text}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
