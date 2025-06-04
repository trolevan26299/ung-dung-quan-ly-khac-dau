import React from 'react';
import { Customer } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Phone, MapPin, FileText, ShoppingBag, Eye, Edit, Trash2, Users } from 'lucide-react';
import { formatCurrency, safeString, safeNumber } from '../../lib/utils';
import { useConfirm } from '../../hooks';

interface CustomerCardProps {
    customer: Customer;
    onView: (customer: Customer) => void;
    onEdit: (customer: Customer) => void;
    onDelete: (id: string) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
    customer,
    onView,
    onEdit,
    onDelete
}) => {
    const { confirm, confirmProps } = useConfirm();

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Xóa khách hàng',
            message: `Bạn có chắc chắn muốn xóa khách hàng "${customer.name}"? Hành động này không thể hoàn tác.`,
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            confirmVariant: 'destructive'
        });

        if (confirmed) {
            onDelete(customer._id);
        }
    };

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 truncate">
                                {safeString(customer.name)}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                                <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{safeString(customer.phone)}</span>
                            </p>
                        </div>
                        <div className="flex space-x-1 ml-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onView(customer)}
                                className="h-8 w-8 p-0"
                                title="Xem chi tiết"
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(customer)}
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
                            <span className="line-clamp-2">{safeString(customer.address)}</span>
                        </div>

                        <div className="flex items-center text-gray-600">
                            <Users className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{safeString(customer.agentName, 'Chưa có đại lý')}</span>
                        </div>

                        {customer.notes && (
                            <div className="flex items-start text-gray-600">
                                <FileText className="w-3 h-3 mr-1 mt-1 flex-shrink-0" />
                                <span className="line-clamp-2">{safeString(customer.notes)}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <div className="flex items-center text-blue-600">
                                <ShoppingBag className="w-3 h-3 mr-1" />
                                <span className="font-medium">{safeNumber(customer.totalOrders)} đơn</span>
                            </div>
                            <div className="font-semibold text-green-600">
                                {formatCurrency(customer.totalAmount)}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ConfirmDialog {...confirmProps} />
        </>
    );
};
