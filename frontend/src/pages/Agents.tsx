import {
    Plus,
    Search,
    UserCheck,
    Grid,
    List
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { AppDispatch, RootState } from '../store';
import { createAgent, deleteAgent, fetchAgents, updateAgent } from '../store/slices/agentsSlice';
import { useConfirm } from '../hooks';
import { useToast } from '../contexts/ToastContext';
import type { Agent, CreateAgentRequest } from '../types';

// Agent Components
import { AgentForm, AgentDetail, AgentCard, AgentTable } from '../components/agents';

type ViewMode = 'grid' | 'table';

// Main Agents Page
export const Agents: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { agents, isLoading, error, pagination } = useSelector((state: RootState) => state.agents);
    const { confirm, confirmProps } = useConfirm();
    const { success, error: showError } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>('table'); // Mặc định là table view

    useEffect(() => {
        dispatch(fetchAgents({
            page: currentPage,
            limit: 10,
            search: searchTerm
        }));
    }, [dispatch, currentPage, searchTerm]);

    const handleCreateAgent = async (data: CreateAgentRequest) => {
        try {
            await dispatch(createAgent(data)).unwrap();
            setIsFormOpen(false);
            success('Tạo thành công', `Đại lý "${data.name}" đã được tạo`);
            dispatch(fetchAgents({ page: currentPage, limit: 10, search: searchTerm }));
        } catch (error: any) {
            console.error('Error creating agent:', error);
            showError('Tạo thất bại', error.message || 'Có lỗi xảy ra khi tạo đại lý');
        }
    };

    const handleUpdateAgent = async (data: CreateAgentRequest) => {
        if (!selectedAgent) return;

        try {
            console.log('Updating agent with data:', data);
            await dispatch(updateAgent({
                id: selectedAgent._id,
                data
            })).unwrap();
            setIsFormOpen(false);
            setSelectedAgent(null);
            success('Cập nhật thành công', `Đại lý "${data.name}" đã được cập nhật`);
            dispatch(fetchAgents({ page: currentPage, limit: 10, search: searchTerm }));
        } catch (error: any) {
            console.error('Error updating agent:', error);
            showError('Cập nhật thất bại', error.message || 'Có lỗi xảy ra khi cập nhật đại lý');
        }
    };

    const handleDeleteAgent = async (id: string) => {
        const agentToDelete = agents.find(agent => agent._id === id);
        const confirmed = await confirm({
            title: 'Xóa đại lý',
            message: 'Bạn có chắc chắn muốn xóa đại lý này? Hành động này không thể hoàn tác.',
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            confirmVariant: 'destructive'
        });

        if (confirmed) {
            try {
                await dispatch(deleteAgent(id)).unwrap();
                success('Xóa thành công', `Đại lý "${agentToDelete?.name || ''}" đã được xóa`);
                dispatch(fetchAgents({ page: currentPage, limit: 10, search: searchTerm }));
            } catch (error: any) {
                console.error('Error deleting agent:', error);
                showError('Xóa thất bại', error.message || 'Có lỗi xảy ra khi xóa đại lý');
            }
        }
    };

    const handleEdit = (agent: Agent) => {
        setSelectedAgent(agent);
        setIsFormOpen(true);
    };

    const handleViewDetail = (agent: Agent) => {
        setSelectedAgent(agent);
        setIsDetailOpen(true);
    };

    const handleAddNew = () => {
        setSelectedAgent(null);
        setIsFormOpen(true);
    };

    const renderAgentGrid = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
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

        if (agents.length === 0) {
            return (
                <div className="text-center py-12">
                    <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Chưa có đại lý nào
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Bắt đầu bằng cách thêm đại lý đầu tiên
                    </p>
                    <Button onClick={handleAddNew}>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm đại lý
                    </Button>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                    <AgentCard
                        key={agent._id}
                        agent={agent}
                        onView={handleViewDetail}
                        onEdit={handleEdit}
                        onDelete={handleDeleteAgent}
                    />
                ))}
            </div>
        );
    };

    const renderContent = () => {
        if (viewMode === 'table') {
            return (
                <AgentTable
                    agents={agents}
                    isLoading={isLoading}
                    onView={handleViewDetail}
                    onEdit={handleEdit}
                    onDelete={handleDeleteAgent}
                    onAdd={handleAddNew}
                />
            );
        }

        return renderAgentGrid();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <UserCheck className="w-8 h-8 mr-3 text-primary-600" />
                        Quản lý đại lý
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Quản lý thông tin đại lý và lịch sử giao dịch
                    </p>
                </div>
                <Button onClick={handleAddNew} className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm đại lý
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
                                    placeholder="Tìm kiếm theo tên, số điện thoại..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
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
                                Tổng: {pagination.total} đại lý
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Agents Content */}
            {renderContent()}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Trước
                    </Button>

                    <span className="text-sm text-gray-600">
                        Trang {currentPage} / {pagination.totalPages}
                    </span>

                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                        disabled={currentPage === pagination.totalPages}
                    >
                        Sau
                    </Button>
                </div>
            )}

            {/* Modals */}
            <AgentForm
                agent={selectedAgent || undefined}
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedAgent(null);
                }}
                onSubmit={selectedAgent ? handleUpdateAgent : handleCreateAgent}
                isLoading={isLoading}
            />

            <AgentDetail
                agent={selectedAgent}
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedAgent(null);
                }}
            />

            <ConfirmDialog {...confirmProps} />
        </div>
    );
}; 