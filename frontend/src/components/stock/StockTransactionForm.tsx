import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X } from 'lucide-react';
import { StockTransaction, CreateStockTransactionRequest, Product } from '../../types';
import { productsApi } from '../../services/api';

interface StockTransactionFormProps {
    transaction?: StockTransaction;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateStockTransactionRequest) => void;
    isLoading?: boolean;
}

interface FormErrors {
    product?: string;
    quantity?: string;
    unitPrice?: string;
    notes?: string;
}

interface FormData {
    product: string;
    type: 'import' | 'export' | 'adjustment';
    quantity: number;
    unitPrice: number; // Required in form
    notes: string;
}

export const StockTransactionForm: React.FC<StockTransactionFormProps> = ({
    transaction,
    isOpen,
    onClose,
    onSubmit,
    isLoading = false
}) => {
    const [formData, setFormData] = useState<FormData>({
        product: '',
        type: 'import',
        quantity: 0,
        unitPrice: 0,
        notes: ''
    });

    const [products, setProducts] = useState<Product[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (isOpen) {
            loadProducts();
        }
    }, [isOpen]);

    useEffect(() => {
        if (transaction) {
            setFormData({
                product: transaction.product._id,
                type: transaction.type,
                quantity: transaction.quantity,
                unitPrice: transaction.unitPrice || 0,
                notes: transaction.notes || ''
            });
        } else {
            setFormData({
                product: '',
                type: 'import',
                quantity: 0,
                unitPrice: 0,
                notes: ''
            });
        }
        setErrors({});
    }, [transaction, isOpen]);

    const loadProducts = async () => {
        try {
            const response = await productsApi.getProducts({ limit: 100 });
            setProducts(response.data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.product) {
            newErrors.product = 'Vui lòng chọn sản phẩm';
        }

        if (formData.quantity <= 0) {
            newErrors.quantity = 'Số lượng phải lớn hơn 0';
        }

        if (formData.unitPrice < 0) {
            newErrors.unitPrice = 'Đơn giá không được âm';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProductChange = (productId: string) => {
        const product = products.find(p => p._id === productId);
        if (product) {
            setFormData({
                ...formData,
                product: productId,
                unitPrice: formData.type === 'import' ? 0 : product.sellingPrice
            });
        }
        if (errors.product) {
            setErrors(prev => ({ ...prev, product: undefined }));
        }
    };

    const handleTypeChange = (type: 'import' | 'export' | 'adjustment') => {
        const product = products.find(p => p._id === formData.product);
        setFormData({
            ...formData,
            type,
            unitPrice: type === 'import' ? 0 : (product?.sellingPrice || 0)
        });
    };

    const handleNumberChange = (field: 'quantity' | 'unitPrice', value: number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            // Convert to API format
            const submitData: CreateStockTransactionRequest = {
                product: formData.product,
                type: formData.type,
                quantity: formData.quantity,
                unitPrice: formData.unitPrice,
                notes: formData.notes
            };
            onSubmit(submitData);
        }
    };

    if (!isOpen) return null;

    const totalValue = formData.quantity * formData.unitPrice;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">
                        {transaction ? 'Cập nhật giao dịch kho' : 'Thêm giao dịch kho'}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sản phẩm *
                        </label>
                        <select
                            value={formData.product}
                            onChange={(e) => handleProductChange(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.product ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="">Chọn sản phẩm</option>
                            {products.map(product => (
                                <option key={product._id} value={product._id}>
                                    {product.name} - Tồn: {product.currentStock}
                                </option>
                            ))}
                        </select>
                        {errors.product && (
                            <p className="text-red-500 text-xs mt-1">{errors.product}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loại giao dịch *
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => handleTypeChange(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="import">Nhập kho</option>
                            <option value="export">Xuất kho</option>
                            <option value="adjustment">Điều chỉnh</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số lượng *
                        </label>
                        <Input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => handleNumberChange('quantity', Number(e.target.value))}
                            placeholder="Nhập số lượng"
                            min="1"
                            className={errors.quantity ? 'border-red-500' : ''}
                        />
                        {errors.quantity && (
                            <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Đơn giá *
                        </label>
                        <Input
                            type="number"
                            value={formData.unitPrice}
                            onChange={(e) => handleNumberChange('unitPrice', Number(e.target.value))}
                            placeholder="Nhập đơn giá"
                            min="0"
                            step="1000"
                            className={errors.unitPrice ? 'border-red-500' : ''}
                        />
                        {errors.unitPrice && (
                            <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ghi chú
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Nhập ghi chú (tùy chọn)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            rows={3}
                        />
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm">
                            <div className="flex justify-between">
                                <span>Tổng giá trị:</span>
                                <span className="font-medium">
                                    {totalValue.toLocaleString('vi-VN')}₫
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang xử lý...' : (transaction ? 'Cập nhật' : 'Thêm mới')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 