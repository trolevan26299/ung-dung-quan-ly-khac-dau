import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { LOW_STOCK_PRODUCTS } from '../../constants/dashboard';

export const LowStockAlert: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center text-orange-600">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Cảnh báo tồn kho
                </CardTitle>
                <CardDescription>
                    Sản phẩm sắp hết hàng cần nhập thêm
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {LOW_STOCK_PRODUCTS.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div>
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-500">Tồn kho tối thiểu: {product.minStock}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-orange-600">{product.stock}</p>
                                <p className="text-xs text-orange-500">Còn lại</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}; 