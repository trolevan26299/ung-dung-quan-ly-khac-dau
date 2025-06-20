import React, { useEffect } from 'react';
import { Tag, Plus, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types';
import { useToast } from '../contexts/ToastContext';
import { CategoryForm } from '../components/categories/CategoryForm';
import { CategoryTable } from '../components/categories/CategoryTable';
import { useModal } from '../hooks/useModal';
import { useDebounce } from '../hooks/useDebounce';
import { 
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  setSearchTerm,
  setPage,
  setPageSize,
  clearError
} from '../store/slices/categoriesSlice';
import type { RootState, AppDispatch } from '../store';

export const Categories: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { 
        categories, 
        isLoading, 
        error, 
        pagination: storePagination,
        searchTerm 
    } = useSelector((state: RootState) => state.categories);
    const toast = useToast();

    const {
        isOpen: isFormOpen,
        selectedItem: selectedCategory,
        openCreateModal,
        openEditModal,
        closeModal: closeFormModal
    } = useModal<Category>();

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Fetch categories when pagination or search changes
    useEffect(() => {
        const fetchParams = {
            page: storePagination.page,
            limit: storePagination.limit,
            ...(debouncedSearchTerm && { search: debouncedSearchTerm })
        };
        dispatch(fetchCategories(fetchParams));
    }, [dispatch, storePagination.page, storePagination.limit, debouncedSearchTerm]);

    // Clear error when component mounts
    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    const handleCreateCategory = async (data: CreateCategoryRequest) => {
        try {
            await dispatch(createCategory(data)).unwrap();
            closeFormModal();
            toast.success('Tạo danh mục thành công');
            // Refresh the list
            dispatch(fetchCategories({
                page: storePagination.page,
                limit: storePagination.limit,
                ...(debouncedSearchTerm && { search: debouncedSearchTerm })
            }));
        } catch (error: any) {
            console.error('Error creating category:', error);
            toast.error(error.message || 'Tính năng tạo danh mục đang phát triển');
        }
    };

    const handleUpdateCategory = async (id: string, data: UpdateCategoryRequest) => {
        try {
            await dispatch(updateCategory({ id, data })).unwrap();
            closeFormModal();
            toast.success('Cập nhật danh mục thành công');
            // Refresh the list
            dispatch(fetchCategories({
                page: storePagination.page,
                limit: storePagination.limit,
                ...(debouncedSearchTerm && { search: debouncedSearchTerm })
            }));
        } catch (error: any) {
            console.error('Error updating category:', error);
            toast.error(error.message || 'Tính năng cập nhật danh mục đang phát triển');
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

        try {
            await dispatch(deleteCategory(id)).unwrap();
            toast.success('Xóa danh mục thành công');
            // Refresh the list
            dispatch(fetchCategories({
                page: storePagination.page,
                limit: storePagination.limit,
                ...(debouncedSearchTerm && { search: debouncedSearchTerm })
            }));
        } catch (error: any) {
            console.error('Error deleting category:', error);
            toast.error(error.message || 'Tính năng xóa danh mục đang phát triển');
        }
    };

    const handleSubmitForm = (data: CreateCategoryRequest) => {
        if (selectedCategory) {
            handleUpdateCategory(selectedCategory._id, data);
        } else {
            handleCreateCategory(data);
        }
    };

    const handleSearch = (searchValue: string) => {
        dispatch(setSearchTerm(searchValue));
    };

    const handlePageChange = (page: number) => {
        dispatch(setPage(page));
    };

    const handlePageSizeChange = (pageSize: number) => {
        dispatch(setPageSize(pageSize));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Tag className="w-8 h-8 mr-3 text-primary-600" />
                        Quản lý danh mục sản phẩm
                    </h1>
                </div>
                <Button onClick={openCreateModal} className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm danh mục
                </Button>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Tìm kiếm danh mục..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="text-sm text-gray-500 ml-4">
                            Tổng: {storePagination.total} danh mục
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Categories Table */}
            <Card>
                <CardContent className="p-0">
                    <CategoryTable
                        categories={categories}
                        isLoading={isLoading}
                        onEdit={openEditModal}
                        onDelete={handleDeleteCategory}
                        onAdd={openCreateModal}
                    />
                    
                    {/* Pagination */}
                    {storePagination.total > 0 && (
                        <Card>
                            <Pagination
                                currentPage={storePagination.page}
                                totalPages={storePagination.totalPages}
                                totalItems={storePagination.total}
                                pageSize={storePagination.limit}
                                onPageChange={(page) => dispatch(setPage(page))}
                                onPageSizeChange={(pageSize) => {
                                    dispatch(setPageSize(pageSize));
                                    dispatch(setPage(1));
                                }}
                            />
                        </Card>
                    )}
                </CardContent>
            </Card>

            {/* Category Form Modal */}
            <CategoryForm
                category={selectedCategory}
                isOpen={isFormOpen}
                onClose={closeFormModal}
                onSubmit={handleSubmitForm}
                isLoading={isLoading}
            />
        </div>
    );
}; 