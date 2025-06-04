import React from 'react';
import { Agent } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Phone, MapPin, FileText, ShoppingBag, Eye, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, safeString, safeNumber } from '../../lib/utils';
import { useConfirm } from '../../hooks';
import { useToast } from '../../contexts/ToastContext';

interface AgentCardProps {
    agent: Agent;
    onView: (agent: Agent) => void;
    onEdit: (agent: Agent) => void;
    onDelete: (id: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
    agent,
    onView,
    onEdit,
    onDelete
}) => {
    const { confirm, confirmProps } = useConfirm();
    const { success, error } = useToast();

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Xóa đại lý',
            message: `Bạn có chắc chắn muốn xóa đại lý "${agent.name}"? Hành động này không thể hoàn tác.`,
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            confirmVariant: 'destructive'
        });

        if (confirmed) {
            try {
                onDelete(agent._id);
                success('Xóa thành công', `Đại lý "${agent.name}" đã được xóa`);
            } catch (err) {
                error('Xóa thất bại', 'Có lỗi xảy ra khi xóa đại lý');
            }
        }
    };

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 truncate">
                                {safeString(agent.name)}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                                <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{safeString(agent.phone)}</span>
                            </p>
                        </div>
                        <div className="flex space-x-1 ml-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onView(agent)}
                                className="h-8 w-8 p-0"
                                title="Xem chi tiết"
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(agent)}
                                className="h-8 w-8 p-0"
                                title="Chỉnh sửa"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDelete}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Xóa"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-start text-gray-600">
                            <MapPin className="w-3 h-3 mr-1 mt-1 flex-shrink-0" />
                            <span className="line-clamp-2">{safeString(agent.address)}</span>
                        </div>

                        {agent.notes && (
                            <div className="flex items-start text-gray-600">
                                <FileText className="w-3 h-3 mr-1 mt-1 flex-shrink-0" />
                                <span className="line-clamp-2">{safeString(agent.notes)}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <div className="flex items-center text-blue-600">
                                <ShoppingBag className="w-3 h-3 mr-1" />
                                <span className="font-medium">{safeNumber(agent.totalOrders)} đơn</span>
                            </div>
                            <div className="font-semibold text-green-600">
                                {formatCurrency(agent.totalAmount)}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ConfirmDialog {...confirmProps} />
        </>
    );
}; 