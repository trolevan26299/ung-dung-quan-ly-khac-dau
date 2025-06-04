import React from 'react';
import { Eye, Edit, Trash2, Phone, MapPin, Users, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../common';
import { formatCurrency, safeString, safeNumber } from '../../lib/utils';
import { useConfirm } from '../../hooks';
import type { Agent } from '../../types';

interface AgentTableProps {
    agents?: Agent[];
    isLoading: boolean;
    onView: (agent: Agent) => void;
    onEdit: (agent: Agent) => void;
    onDelete: (id: string) => void;
    onAdd?: () => void;
}

export const AgentTable: React.FC<AgentTableProps> = ({
    agents,
    isLoading,
    onView,
    onEdit,
    onDelete,
    onAdd
}) => {
    const { confirm, confirmProps } = useConfirm();

    const handleDelete = async (agent: Agent) => {
        const confirmed = await confirm({
            title: 'Xóa vĩnh viễn đại lý',
            message: `⚠️ BẠN SẮP XÓA VĨNH VIỄN đại lý "${agent.name}" khỏi hệ thống!\n\nDữ liệu sẽ bị mất hoàn toàn và KHÔNG THỂ KHÔI PHỤC. Tất cả thông tin liên quan cũng có thể bị ảnh hưởng.\n\nBạn có chắc chắn muốn tiếp tục?`,
            confirmText: 'XÓA VĨNH VIỄN',
            cancelText: 'Hủy',
            confirmVariant: 'destructive'
        });

        if (confirmed) {
            onDelete(agent._id);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="flex items-center space-x-4">
                                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!agents || agents.length === 0) {
        return (
            <EmptyState
                icon={Users}
                title="Chưa có đại lý nào"
                description="Bắt đầu bằng cách thêm đại lý đầu tiên"
                actionLabel="Thêm đại lý"
                onAction={onAdd}
            />
        );
    }

    return (
        <>
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <Users className="w-4 h-4 mr-2" />
                                            Đại lý
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <Phone className="w-4 h-4 mr-2" />
                                            Liên hệ
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            Địa chỉ
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center justify-center">
                                            <ShoppingBag className="w-4 h-4 mr-2" />
                                            Đơn hàng
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tổng giá trị
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(agents || []).map((agent) => (
                                    <tr key={agent._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900 line-clamp-1">
                                                    {safeString(agent.name)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 line-clamp-1">
                                                {safeString(agent.phone)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 line-clamp-2 max-w-xs">
                                                {safeString(agent.address)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {safeNumber(agent.totalOrders)} đơn
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-semibold text-green-600">
                                                {formatCurrency(agent.totalAmount)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-1">
                                                <Button
                                                    variant="light"
                                                    size="xs"
                                                    onClick={() => onView(agent)}
                                                    className="h-7 w-7 p-0"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    size="xs"
                                                    onClick={() => onEdit(agent)}
                                                    className="h-7 w-7 p-0"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="xs"
                                                    onClick={() => handleDelete(agent)}
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
                </CardContent>
            </Card>

            <ConfirmDialog {...confirmProps} />
        </>
    );
}; 