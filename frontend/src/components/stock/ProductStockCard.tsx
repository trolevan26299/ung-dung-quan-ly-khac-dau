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
        if (stock < 10) {
            return {
                text: 'Tồn kho thấp',
                color: 'bg-orange-100 text-orange-800',
                cardBorder: 'border-orange-200',
                cardBg: 'bg-orange-50'
            };
        } else if (stock < 50) {
            return {
                text: 'Tồn kho vừa',
                color: 'bg-yellow-100 text-yellow-800',
                cardBorder: 'border-gray-200',
                cardBg: 'bg-white'
            };
        } else {
            return {
                text: 'Tồn kho tốt',
                color: 'bg-green-100 text-green-800',
                cardBorder: 'border-gray-200',
                cardBg: 'bg-white'
            };
        }
    };

    const stockStatus = getStockStatus(safeNumber(product.currentStock));

    return (
        <Card className={`hover:shadow-lg transition-shadow ${stockStatus.cardBorder} ${stockStatus.cardBg}`}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                            {safeString(product.name)}
                        </h3>
                        <p className="text-sm text-gray-500">{safeString(product.code)}</p>
                    </div>
                    {safeNumber(product.currentStock) < 10 && (
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                    )}
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Tồn kho hiện tại:</span>
                        <span className={`font-bold text-lg ${safeNumber(product.currentStock) < 10 ? 'text-orange-600' : 'text-blue-600'
                            }`}>
                            {safeNumber(product.currentStock)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Giá nhập TB:</span>
                        <span className="font-medium text-gray-900">
                            {formatCurrency(product.averageImportPrice)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Giá bán:</span>
                        <span className="font-medium text-green-600">
                            {formatCurrency(product.sellingPrice)}
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
