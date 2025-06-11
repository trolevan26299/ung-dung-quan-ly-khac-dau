import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { RootState, AppDispatch } from '../../store';
import { fetchLowStockProducts } from '../../store/slices/dashboardSlice';

export const LowStockAlert: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { lowStockProducts, isLoading } = useSelector((state: RootState) => state.dashboard);

    useEffect(() => {
        dispatch(fetchLowStockProducts());
    }, [dispatch]);

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
                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200 animate-pulse">
                                <div className="flex-1">
                                    <div className="h-4 bg-orange-200 rounded mb-2"></div>
                                    <div className="h-3 bg-orange-200 rounded w-2/3"></div>
                                </div>
                                <div className="text-right">
                                    <div className="h-6 bg-orange-200 rounded mb-1 w-8"></div>
                                    <div className="h-3 bg-orange-200 rounded w-12"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {lowStockProducts.length > 0 ? lowStockProducts.map((product: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <div>
                                    <p className="font-medium text-gray-900">{product.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-orange-600">{product.stockQuantity}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-gray-500">
                                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>Tất cả sản phẩm đều đủ hàng</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}; 