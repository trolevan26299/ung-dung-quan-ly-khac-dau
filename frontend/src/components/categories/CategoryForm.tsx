import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Portal } from '../ui/Portal';
import type { Category, CreateCategoryRequest } from '../../types';

interface CategoryFormProps {
    category?: Category | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateCategoryRequest) => void;
    isLoading?: boolean;
}

interface FormErrors {
    name?: string;
    description?: string;
}

const VALIDATION = {
    MAX_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
};

export const CategoryForm: React.FC<CategoryFormProps> = ({
    category,
    isOpen,
    onClose,
    onSubmit,
    isLoading = false
}) => {
    const [formData, setFormData] = useState<CreateCategoryRequest>({
        name: '',
        description: '',
        isActive: true
    });

    const [errors, setErrors] = useState<FormErrors>({});

    // Reset form when modal opens/closes or category changes
    useEffect(() => {
        if (isOpen) {
            if (category) {
                // Edit mode - populate form with existing data
                setFormData({
                    name: category.name,
                    description: category.description || '',
                    isActive: category.isActive
                });
            } else {
                // Create mode - reset to default values
                setFormData({
                    name: '',
                    description: '',
                    isActive: true
                });
            }
            setErrors({});
        }
    }, [isOpen, category]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên danh mục là bắt buộc';
        } else if (formData.name.length > VALIDATION.MAX_NAME_LENGTH) {
            newErrors.name = `Tên không được vượt quá ${VALIDATION.MAX_NAME_LENGTH} ký tự`;
        }

        if (formData.description && formData.description.length > VALIDATION.MAX_DESCRIPTION_LENGTH) {
            newErrors.description = `Mô tả không được vượt quá ${VALIDATION.MAX_DESCRIPTION_LENGTH} ký tự`;
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

    const handleInputChange = (field: keyof CreateCategoryRequest, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field as keyof FormErrors]) {
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
                            {category ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
                        </h2>
                        <Button variant="light" size="xs" onClick={onClose} className="h-8 w-8 p-0">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên danh mục *
                            </label>
                            <Input
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Nhập tên danh mục"
                                className={errors.name ? 'border-red-500' : ''}
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mô tả
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Nhập mô tả danh mục (tùy chọn)"
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                rows={3}
                                disabled={isLoading}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                            )}
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                disabled={isLoading}
                            />
                            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                                Kích hoạt danh mục
                            </label>
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
                                {isLoading ? 'Đang xử lý...' : (category ? 'Cập nhật' : 'Thêm mới')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
}; 