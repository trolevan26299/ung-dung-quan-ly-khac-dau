import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Portal } from '../ui/Portal';
import { VALIDATION } from '../../constants';
import type { Product, CreateProductRequest } from '../../types';

interface ProductFormProps {
    product?: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onCancel?: () => void;
    onSubmit: (data: CreateProductRequest) => void;
    isLoading?: boolean;
}

// Create a separate interface for form errors
interface FormErrors {
    code?: string;
    name?: string;
    category?: string;
    unit?: string;
    sellingPrice?: string;
    notes?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
    product,
    isOpen,
    onClose,
    onCancel,
    onSubmit,
    isLoading = false
}) => {
    const [formData, setFormData] = useState<CreateProductRequest>({
        code: '',
        name: '',
        category: '',
        unit: '',
        sellingPrice: 0,
        notes: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (product) {
            setFormData({
                code: product.code,
                name: product.name,
                category: product.category,
                unit: product.unit,
                sellingPrice: product.sellingPrice,
                notes: product.notes || ''
            });
        } else {
            setFormData({
                code: '',
                name: '',
                category: '',
                unit: '',
                sellingPrice: 0,
                notes: ''
            });
        }
        setErrors({});
    }, [product, isOpen]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.code.trim()) {
            newErrors.code = 'Mã sản phẩm là bắt buộc';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Tên sản phẩm là bắt buộc';
        } else if (formData.name.length > VALIDATION.MAX_NAME_LENGTH) {
            newErrors.name = `Tên không được vượt quá ${VALIDATION.MAX_NAME_LENGTH} ký tự`;
        }

        if (!formData.category.trim()) {
            newErrors.category = 'Danh mục là bắt buộc';
        }

        if (!formData.unit.trim()) {
            newErrors.unit = 'Đơn vị tính là bắt buộc';
        }

        if (formData.sellingPrice <= 0) {
            newErrors.sellingPrice = 'Giá bán phải lớn hơn 0';
        }

        if (formData.notes && formData.notes.length > VALIDATION.MAX_NOTES_LENGTH) {
            newErrors.notes = `Ghi chú không được vượt quá ${VALIDATION.MAX_NOTES_LENGTH} ký tự`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const handleInputChange = (field: keyof CreateProductRequest, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleNumberChange = (field: 'sellingPrice', value: number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    if (!isOpen) return null;

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
                            {product ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                        </h2>
                        <Button variant="light" size="xs" onClick={onCancel || onClose} className="h-8 w-8 p-0">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mã sản phẩm *
                            </label>
                            <Input
                                value={formData.code}
                                onChange={(e) => handleInputChange('code', e.target.value)}
                                placeholder="Nhập mã sản phẩm"
                                className={errors.code ? 'border-red-500' : ''}
                            />
                            {errors.code && (
                                <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên sản phẩm *
                            </label>
                            <Input
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Nhập tên sản phẩm"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Danh mục *
                                </label>
                                <Input
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                    placeholder="Nhập danh mục"
                                    className={errors.category ? 'border-red-500' : ''}
                                />
                                {errors.category && (
                                    <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Đơn vị tính *
                                </label>
                                <Input
                                    value={formData.unit}
                                    onChange={(e) => handleInputChange('unit', e.target.value)}
                                    placeholder="Cái, Chiếc, Kg..."
                                    className={errors.unit ? 'border-red-500' : ''}
                                />
                                {errors.unit && (
                                    <p className="text-red-500 text-xs mt-1">{errors.unit}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giá bán *
                            </label>
                            <Input
                                type="number"
                                value={formData.sellingPrice}
                                onChange={(e) => handleNumberChange('sellingPrice', parseFloat(e.target.value) || 0)}
                                placeholder="Nhập giá bán"
                                min="0"
                                step="1000"
                                className={errors.sellingPrice ? 'border-red-500' : ''}
                            />
                            {errors.sellingPrice && (
                                <p className="text-red-500 text-xs mt-1">{errors.sellingPrice}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ghi chú
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="Nhập ghi chú (tùy chọn)"
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.notes ? 'border-red-500' : 'border-gray-300'}`}
                                rows={3}
                            />
                            {errors.notes && (
                                <p className="text-red-500 text-xs mt-1">{errors.notes}</p>
                            )}
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onCancel || onClose}
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
                                {isLoading ? 'Đang xử lý...' : (product ? 'Cập nhật' : 'Thêm mới')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
}; 