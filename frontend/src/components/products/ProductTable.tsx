import React from 'react';
import { Eye, Edit, Trash2, Package, DollarSign, Archive, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { EmptyState } from '../common';
import { formatCurrency, safeString, safeNumber } from '../../lib/utils';
import type { Product } from '../../types';

interface ProductTableProps {
    products?: Product[];
    isLoading?: boolean;
    onView: (product: Product) => void;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
    products,
    isLoading = false,
    onView,
    onEdit,
    onDelete,
    onAdd
}) => {
    const handleDelete = (product: Product) => {
        onDelete(product._id);
    };

    const getStockStatus = (currentStock: number) => {
        if (currentStock === 0) {
            return { text: 'Hết hàng', color: 'text-red-600 bg-red-50' };
        } else if (currentStock < 10) {
            return { text: 'Sắp hết', color: 'text-orange-600 bg-orange-50' };
        }
        return { text: 'Còn hàng', color: 'text-green-600 bg-green-50' };
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

    if (!products || products.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                    <Package className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có sản phẩm nào</h3>
                <p className="text-gray-500 mb-4">Bắt đầu bằng cách thêm sản phẩm đầu tiên</p>
                {onAdd && (
                    <Button onClick={onAdd}>
                        Thêm sản phẩm
                    </Button>
                )}
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sản phẩm
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mã SP
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Danh mục
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Đơn vị
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Giá bán
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tồn kho
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(products || []).map((product) => {
                                const stockStatus = getStockStatus(product.currentStock);
                                return (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {safeString(product.name)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {product._id.slice(-6)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono text-gray-900">
                                                {safeString(product.code)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {safeString(product.category)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {safeString(product.unit)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                                                <span className="text-sm font-semibold text-green-600">
                                                    {formatCurrency(product.sellingPrice)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Archive className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {safeNumber(product.currentStock)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                                                {stockStatus.text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex space-x-1">
                                                <Button
                                                    variant="light"
                                                    size="xs"
                                                    onClick={() => onView(product)}
                                                    className="h-7 w-7 p-0"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    size="xs"
                                                    onClick={() => onEdit(product)}
                                                    className="h-7 w-7 p-0"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="xs"
                                                    onClick={() => handleDelete(product)}
                                                    className="h-7 w-7 p-0"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}; 