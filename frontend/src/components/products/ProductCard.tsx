import React from 'react';
import { Package, Edit, Eye, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { formatCurrency, safeString, safeNumber } from '../../lib/utils';
import { useConfirm } from '../../hooks';
import type { Product } from '../../types';

interface ProductCardProps {
    product: Product;
    onView: (product: Product) => void;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onView,
    onEdit,
    onDelete
}) => {
    const { confirm, confirmProps } = useConfirm();

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Xóa sản phẩm',
            message: `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"? Hành động này không thể hoàn tác.`,
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            confirmVariant: 'destructive'
        });

        if (confirmed) {
            onDelete(product._id);
        }
    };

    const isLowStock = safeNumber(product.currentStock) <= 10;

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                                <Package className="w-5 h-5 text-gray-400" />
                                <h3 className="font-semibold text-lg text-gray-900 truncate">
                                    {safeString(product.name)}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-1">
                                Mã: {safeString(product.code)}
                            </p>
                            <p className="text-sm text-gray-500">
                                {safeString(product.category)} • {safeString(product.unit)}
                            </p>
                        </div>
                        <div className="flex space-x-1 ml-2">
                            {onView && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onView(product)}
                                    className="h-8 w-8 p-0"
                                    title="Xem chi tiết"
                                >
                                    <Package className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(product)}
                                className="h-8 w-8 p-0"
                                title="Chỉnh sửa"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDelete}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Xóa"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Stock Warning */}
                        {isLowStock && (
                            <div className="flex items-center p-2 bg-orange-50 border border-orange-200 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />
                                <span className="text-xs text-orange-700">
                                    Tồn kho thấp
                                </span>
                            </div>
                        )}

                        {/* Stock and Price */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Tồn kho:</span>
                                <p className={`font-semibold ${isLowStock ? 'text-orange-600' : 'text-gray-900'}`}>
                                    {product.currentStock} {product.unit}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500">Giá bán:</span>
                                <p className="font-semibold text-green-600">
                                    {formatCurrency(product.sellingPrice)}
                                </p>
                            </div>
                        </div>

                        {/* Import Price */}
                        <div className="text-sm">
                            <span className="text-gray-500">Giá nhập TB:</span>
                            <span className="font-medium text-gray-900 ml-1">
                                {formatCurrency(product.averageImportPrice)}
                            </span>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <div className="flex items-center">
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${product.isActive ? 'bg-green-500' : 'bg-red-500'
                                    }`}></span>
                                <span className="text-sm text-gray-600">
                                    {product.isActive ? 'Đang bán' : 'Ngừng bán'}
                                </span>
                            </div>
                        </div>

                        {/* Notes preview */}
                        {product.notes && (
                            <div className="pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-500 line-clamp-2">
                                    {product.notes}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <ConfirmDialog {...confirmProps} />
        </>
    );
};
