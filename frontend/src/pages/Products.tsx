import React, { useState, useEffect } from 'react';
import { Plus, Search, Package } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchProducts, createProduct, updateProduct, deleteProduct, setSearchTerm, setCurrentProduct, clearError } from '../store/slices/productsSlice';
import { ProductForm } from '../components/products/ProductForm';
import { ProductDetail } from '../components/products/ProductDetail';
import { ProductCard } from '../components/products/ProductCard';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useConfirm } from '../hooks';
import { useToast } from '../contexts/ToastContext';
import type { Product, CreateProductRequest } from '../types';

export const Products: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { products, currentProduct, isLoading, error, searchTerm, pagination } = useSelector((state: RootState) => state.products);
    const { confirm, confirmProps } = useConfirm();
    const { success, error: showError } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    useEffect(() => {
        dispatch(fetchProducts({ page: 1, limit: 10, search: searchTerm }));
    }, [dispatch, searchTerm]);

    useEffect(() => {
        if (error) {
            console.error('Products error:', error);
            setTimeout(() => dispatch(clearError()), 5000);
        }
    }, [error, dispatch]);

    const handleCreateProduct = async (data: CreateProductRequest) => {
        try {
            await dispatch(createProduct(data)).unwrap();
            setIsFormOpen(false);
            setEditingProduct(null);
            success('Tạo thành công', `Sản phẩm "${data.name}" đã được tạo`);
        } catch (error: any) {
            console.error('Create product error:', error);
            showError('Tạo thất bại', error.message || 'Có lỗi xảy ra khi tạo sản phẩm');
        }
    };

    const handleUpdateProduct = async (data: CreateProductRequest) => {
        if (!editingProduct) return;

        try {
            await dispatch(updateProduct({ id: editingProduct._id, data })).unwrap();
            setIsFormOpen(false);
            setEditingProduct(null);
            success('Cập nhật thành công', `Sản phẩm "${data.name}" đã được cập nhật`);
        } catch (error: any) {
            console.error('Update product error:', error);
            showError('Cập nhật thất bại', error.message || 'Có lỗi xảy ra khi cập nhật sản phẩm');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        const productToDelete = products.find(product => product._id === id);
        const confirmed = await confirm({
            title: 'Xóa sản phẩm',
            message: 'Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.',
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            confirmVariant: 'destructive'
        });

        if (!confirmed) return;

        try {
            await dispatch(deleteProduct(id)).unwrap();
            success('Xóa thành công', `Sản phẩm "${productToDelete?.name || ''}" đã được xóa`);
        } catch (error: any) {
            console.error('Delete product error:', error);
            showError('Xóa thất bại', error.message || 'Có lỗi xảy ra khi xóa sản phẩm');
        }
    };

    const handleSearch = (searchValue: string) => {
        dispatch(setSearchTerm(searchValue));
    };

    const handleViewDetail = (product: Product) => {
        dispatch(setCurrentProduct(product));
        setIsDetailOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingProduct(null);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        dispatch(setCurrentProduct(null));
    };

    const clearFilters = () => {
        dispatch(setSearchTerm(''));
    };

    const renderProductsGrid = () => {
        if (products.length === 0) {
            return (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có sản phẩm nào</h3>
                    <p className="text-gray-500 mb-6">Tạo sản phẩm đầu tiên để bắt đầu quản lý</p>
                    <button
                        onClick={handleAddNew}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm sản phẩm
                    </button>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard
                        key={product._id}
                        product={product}
                        onView={() => handleViewDetail(product)}
                        onEdit={() => handleEdit(product)}
                        onDelete={() => handleDeleteProduct(product._id)}
                    />
                ))}
            </div>
        );
    };

    if (isLoading && products.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
                    <p className="text-gray-600">Quản lý các sản phẩm khắc dấu</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm sản phẩm
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                </div>
                {searchTerm && (
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Xóa bộ lọc
                    </button>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Products Grid */}
            {renderProductsGrid()}

            {/* Loading overlay */}
            {isLoading && products.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Đang xử lý...</p>
                    </div>
                </div>
            )}

            {/* Product Form Modal */}
            {isFormOpen && (
                <ProductForm
                    product={editingProduct}
                    isOpen={isFormOpen}
                    onClose={handleCloseForm}
                    onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                    onCancel={handleCloseForm}
                    isLoading={isLoading}
                />
            )}

            {/* Product Detail Modal */}
            {isDetailOpen && currentProduct && (
                <ProductDetail
                    product={currentProduct}
                    onClose={handleCloseDetail}
                />
            )}

            <ConfirmDialog {...confirmProps} />
        </div>
    );
}; 