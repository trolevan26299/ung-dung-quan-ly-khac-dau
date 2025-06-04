import React from 'react';
import { X, Package, Tag, DollarSign, Hash, Calendar } from 'lucide-react';
import type { Product } from '../../types';

interface ProductDetailProps {
    product: Product;
    onClose: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Package className="w-6 h-6 mr-2 text-primary-600" />
                        Chi tiết sản phẩm
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Thông tin cơ bản */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500 flex items-center mb-2">
                                    <Hash className="w-4 h-4 mr-1" />
                                    Mã sản phẩm
                                </label>
                                <p className="font-mono text-lg font-medium text-gray-900">{product.code}</p>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500 flex items-center mb-2">
                                    <Package className="w-4 h-4 mr-1" />
                                    Tên sản phẩm
                                </label>
                                <p className="text-lg font-medium text-gray-900">{product.name}</p>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500 flex items-center mb-2">
                                    <Tag className="w-4 h-4 mr-1" />
                                    Danh mục
                                </label>
                                <p className="text-gray-900">{product.category}</p>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500 mb-2 block">
                                    Đơn vị tính
                                </label>
                                <p className="text-gray-900">{product.unit}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500 mb-2 block">
                                    Tồn kho hiện tại
                                </label>
                                <p className="text-2xl font-bold text-green-600">{product.currentStock}</p>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500 flex items-center mb-2">
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    Giá nhập trung bình
                                </label>
                                <p className="text-lg font-medium text-gray-900">
                                    {formatCurrency(product.averageImportPrice)}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500 flex items-center mb-2">
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    Giá bán
                                </label>
                                <p className="text-lg font-bold text-primary-600">
                                    {formatCurrency(product.sellingPrice)}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500 mb-2 block">
                                    Trạng thái
                                </label>
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${product.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {product.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Ghi chú */}
                    {product.notes && (
                        <div>
                            <label className="text-sm text-gray-500 mb-2 block">
                                Ghi chú
                            </label>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-900 whitespace-pre-wrap">{product.notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Thông tin thời gian */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>Tạo: {formatDate(product.createdAt)}</span>
                            </div>
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>Cập nhật: {formatDate(product.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}; 