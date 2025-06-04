import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, Grid, List } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchProducts, createProduct, updateProduct, deleteProduct, setSearchTerm, setCurrentProduct, clearError } from '../store/slices/productsSlice';
import { ProductForm, ProductDetail, ProductCard, ProductTable } from '../components/products';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useConfirm } from '../hooks';
import { useToast } from '../contexts/ToastContext';
import type { Product, CreateProductRequest } from '../types';
import { Portal } from '../components/ui/Portal';

type ViewMode = 'grid' | 'table';

export const Products: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { products, currentProduct, isLoading, error, searchTerm, pagination } = useSelector((state: RootState) => state.products);
    const { confirm, confirmProps } = useConfirm();
    const { success, error: showError } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('table'); // Mặc định là table view

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

    const renderProductsGrid = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <Card key={index} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-200 rounded"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (products.length === 0) {
            return (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có sản phẩm nào</h3>
                    <p className="text-gray-500 mb-4">Bắt đầu bằng cách thêm sản phẩm đầu tiên</p>
                    <Button onClick={handleAddNew}>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm sản phẩm
                    </Button>
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

    const renderContent = () => {
        if (viewMode === 'table') {
            return (
                <ProductTable
                    products={products}
                    isLoading={isLoading}
                    onView={handleViewDetail}
                    onEdit={handleEdit}
                    onDelete={handleDeleteProduct}
                    onAdd={handleAddNew}
                />
            );
        }

        return renderProductsGrid();
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Package className="w-8 h-8 mr-3 text-primary-600" />
                        Quản lý sản phẩm
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Quản lý các sản phẩm khắc dấu
                    </p>
                </div>
                <Button onClick={handleAddNew} className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm sản phẩm
                </Button>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Tìm kiếm theo tên, mã sản phẩm..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* View Toggle */}
                            <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                                <Button
                                    variant={viewMode === 'grid' ? 'active' : 'inactive'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="h-8 w-8 p-0 rounded-md"
                                    title="Xem dạng lưới"
                                >
                                    <Grid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'table' ? 'active' : 'inactive'}
                                    size="sm"
                                    onClick={() => setViewMode('table')}
                                    className="h-8 w-8 p-0 rounded-md ml-1"
                                    title="Xem dạng bảng"
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="text-sm text-gray-500">
                                Tổng: {pagination.total} sản phẩm
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Products Content */}
            {renderContent()}

            {/* Loading overlay */}
            {isLoading && products.length > 0 && (
                <Portal>
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-[9999]"
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
                        <div className="bg-white p-4 rounded-lg shadow-lg">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Đang xử lý...</p>
                        </div>
                    </div>
                </Portal>
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
                    isOpen={isDetailOpen}
                    product={currentProduct}
                    onClose={handleCloseDetail}
                />
            )}

            <ConfirmDialog {...confirmProps} />
        </div>
    );
}; 