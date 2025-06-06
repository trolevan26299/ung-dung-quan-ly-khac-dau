import React from 'react';
import { Agent } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Phone, MapPin, FileText, ShoppingBag, Eye, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, safeString, safeNumber } from '../../lib/utils';
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
    const { success, error } = useToast();

    const handleDelete = () => {
        onDelete(agent._id);
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
                                variant="light"
                                size="xs"
                                onClick={() => onView(agent)}
                                className="h-8 w-8 p-0"
                                title="Xem chi tiết"
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="light"
                                size="xs"
                                onClick={() => onEdit(agent)}
                                className="h-8 w-8 p-0"
                                title="Chỉnh sửa"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="danger"
                                size="xs"
                                onClick={handleDelete}
                                className="h-8 w-8 p-0"
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
        </>
    );
}; 