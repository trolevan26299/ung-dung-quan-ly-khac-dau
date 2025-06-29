import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Portal } from '../ui/Portal';
import { X, User } from 'lucide-react';
import { RootState } from '../../store';
import type { CreateStockTransactionRequest, StockTransaction, Product } from '../../types';
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
    quantity: string; // Changed to string to allow empty input
    unitPrice: string; // Changed to string to allow empty input  
    notes: string;
}

export const StockTransactionForm: React.FC<StockTransactionFormProps> = ({
    transaction,
    isOpen,
    onClose,
    onSubmit,
    isLoading = false
}) => {
    const { user } = useSelector((state: RootState) => state.auth);
    
    const [formData, setFormData] = useState<FormData>({
        product: '',
        type: 'import',
        quantity: '',
        unitPrice: '',
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
                product: transaction.productId,
                type: transaction.type,
                quantity: transaction.quantity.toString(),
                unitPrice: (transaction.unitPrice || 0).toString(),
                notes: transaction.notes || ''
            });
        } else {
            setFormData({
                product: '',
                type: 'import',
                quantity: '',
                unitPrice: '',
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

        const quantity = parseFloat(formData.quantity);
        if (!formData.quantity || isNaN(quantity) || quantity <= 0) {
            newErrors.quantity = 'Số lượng phải lớn hơn 0';
        }

        // Chỉ validate unitPrice cho nhập kho
        if (formData.type === 'import') {
            const unitPrice = parseFloat(formData.unitPrice);
            if (!formData.unitPrice || isNaN(unitPrice) || unitPrice < 0) {
                newErrors.unitPrice = 'Đơn giá phải >= 0';
            }
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
                unitPrice: formData.type === 'import' ? '' : product.currentPrice.toString()
            });
        }
        if (errors.product) {
            setErrors({
                ...errors,
                product: ''
            });
        }
    };

    const handleTypeChange = (type: 'import' | 'export' | 'adjustment') => {
        const product = products.find(p => p._id === formData.product);
        
        console.log('🔄 Type changed to:', type);
        
        if (type === 'adjustment') {
            console.log('🔧 Setting adjustment mode...');
            setFormData({
                ...formData,
                type,
                unitPrice: '0', // Set 0 nhưng sẽ ẩn UI
                notes: 'Điều chỉnh số lượng tồn kho'
            });
        } else if (type === 'export') {
            console.log('📤 Setting export mode...');
            setFormData({
                ...formData,
                type,
                unitPrice: '0', // Xuất kho không có giá
                notes: 'Xuất kho'
            });
        } else {
            console.log('🏪 Setting normal mode...');
            setFormData({
                ...formData,
                type,
                unitPrice: type === 'import' ? '' : (product?.currentPrice.toString() || ''),
                notes: formData.notes === 'Điều chỉnh số lượng tồn kho' || formData.notes === 'Xuất kho' ? '' : formData.notes
            });
        }
    };

    const handleNumberChange = (field: 'quantity' | 'unitPrice', value: string) => {
        // Chỉ cho phép số, dấu chấm
        const sanitizedValue = value.replace(/[^0-9.]/g, '');
        
        // Đảm bảo chỉ có một dấu chấm
        const parts = sanitizedValue.split('.');
        const cleanValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : sanitizedValue;
        
        setFormData(prev => ({ ...prev, [field]: cleanValue }));
        
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                // Convert to API format
                const submitData: CreateStockTransactionRequest = {
                    product: formData.product,
                    type: formData.type,
                    quantity: parseFloat(formData.quantity),
                    unitPrice: parseFloat(formData.unitPrice) || 0,
                    notes: formData.notes
                };

                onSubmit(submitData);
            } catch (error) {
                console.error('Error submitting transaction:', error);
            }
        }
    };

    if (!isOpen) return null;

    const quantity = parseFloat(formData.quantity) || 0;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    const totalValue = quantity * unitPrice;

    return (
        <Portal>
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100vw',
                    height: '100vh'
                }}
            >
                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">
                            {transaction ? 'Cập nhật giao dịch kho' : 'Thêm giao dịch kho'}
                        </h2>
                        <Button variant="light" size="xs" onClick={onClose} className="h-8 w-8 p-0">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 text-sm text-blue-700">
                                <User className="w-4 h-4" />
                                <span className="font-medium">Người tạo giao dịch:</span>
                            </div>
                            <div className="mt-1 text-sm">
                                <div className="font-medium text-blue-800">
                                    {transaction ? transaction.userName : user?.fullName || 'Không xác định'}
                                </div>
                                <div className="text-blue-600">
                                    {transaction ? `ID: ${transaction.userId}` : `@${user?.username || 'unknown'}`}
                                </div>
                                {transaction && (
                                    <div className="text-xs text-blue-500 mt-1">
                                        Tạo lúc: {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                                    </div>
                                )}
                            </div>
                        </div>

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
                                        {product.name} - Tồn: {product.stockQuantity}
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
                            {formData.type === 'adjustment' && (
                                <p className="text-xs text-blue-600 mt-1">
                                    💡 Điều chỉnh để đặt lại số lượng tồn kho thành giá trị cụ thể
                                </p>
                            )}
                            {formData.type === 'export' && (
                                <p className="text-xs text-green-600 mt-1">
                                    💡 Xuất kho để giảm tồn kho (chuyển kho, hàng hỏng, sử dụng nội bộ...)
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {formData.type === 'adjustment' ? 'Số lượng tồn kho mới *' : 'Số lượng *'}
                            </label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                value={formData.quantity}
                                onChange={(e) => handleNumberChange('quantity', e.target.value)}
                                placeholder={formData.type === 'adjustment' ? 'Nhập số lượng tồn kho mới' : 'Nhập số lượng'}
                                className={errors.quantity ? 'border-red-500' : ''}
                            />
                            {errors.quantity && (
                                <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                            )}
                        </div>

                        {formData.type === 'import' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Đơn giá *
                                </label>
                                <Input
                                    type="text"
                                    inputMode="decimal"
                                    value={formData.unitPrice}
                                    onChange={(e) => handleNumberChange('unitPrice', e.target.value)}
                                    placeholder="Nhập đơn giá"
                                    className={errors.unitPrice ? 'border-red-500' : ''}
                                />
                                {errors.unitPrice && (
                                    <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>
                                )}
                            </div>
                        )}

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
                                    <span>
                                        {formData.type === 'adjustment' 
                                            ? 'Tồn kho sẽ được đặt thành:' 
                                            : formData.type === 'import'
                                                ? 'Tổng giá trị nhập:'
                                                : 'Số lượng xuất:'
                                        }
                                    </span>
                                    <span className="font-medium">
                                        {formData.type === 'adjustment' 
                                            ? `${quantity} sản phẩm`
                                            : formData.type === 'import'
                                                ? `${totalValue.toLocaleString('vi-VN')}₫`
                                                : `${quantity} sản phẩm`
                                        }
                                    </span>
                                </div>
                                {formData.type === 'export' && (
                                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                                        <span>📦 Chỉ giảm tồn kho, không có giá trị</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                className="flex-1"
                                disabled={isLoading}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                variant="default"
                                className="flex-1"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Đang xử lý...' : (transaction ? 'Cập nhật' : 'Thêm mới')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
}; 