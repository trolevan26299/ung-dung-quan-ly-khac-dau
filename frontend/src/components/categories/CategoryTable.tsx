import React from 'react';
import { Edit, Trash2, Tag } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatDate, safeString, safeNumber } from '../../lib/utils';
import type { Category } from '../../types';

interface CategoryTableProps {
    categories?: Category[];
    isLoading?: boolean;
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
    categories,
    isLoading = false,
    onEdit,
    onDelete,
    onAdd
}) => {
    const handleDelete = (category: Category) => {
        onDelete(category._id);
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

    if (!categories || categories.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                    <Tag className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có danh mục nào</h3>
                <p className="text-gray-500 mb-4">Bắt đầu bằng cách thêm danh mục đầu tiên</p>
                {onAdd && (
                    <Button onClick={onAdd}>
                        Thêm danh mục
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tên danh mục
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Mô tả
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Số sản phẩm
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ngày tạo
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(categories || []).map((category) => (
                            <tr key={category._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <Tag className="w-5 h-5 text-gray-400 mr-3" />
                                        <div className="text-sm font-medium text-gray-900">
                                            {safeString(category.name)}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                        {safeString(category.description) || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-medium text-gray-900">
                                        {safeNumber(category.productCount)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                        category.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {category.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {formatDate(category.createdAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex space-x-1">
                                        <Button
                                            variant="light"
                                            size="xs"
                                            onClick={() => onEdit(category)}
                                            className="h-7 w-7 p-0"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="xs"
                                            onClick={() => handleDelete(category)}
                                            className="h-7 w-7 p-0"
                                            title="Xóa"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}; 