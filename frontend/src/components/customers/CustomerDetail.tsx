import React from 'react';
import { Phone, MapPin, FileText, Users, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate, safeString, safeNumber } from '../../lib/utils';
import type { Customer } from '../../types';

interface CustomerDetailProps {
    customer: Customer | null;
    isOpen: boolean;
    onClose: () => void;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({
    customer,
    isOpen,
    onClose
}) => {
    if (!isOpen || !customer) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Chi tiết khách hàng</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Tên khách hàng</label>
                            <p className="font-semibold text-gray-900 mt-1">{safeString(customer.name)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                            <p className="font-medium text-gray-900 mt-1 flex items-center">
                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                {safeString(customer.phone)}
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                        <p className="font-medium text-gray-900 mt-1 flex items-start">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                            {safeString(customer.address)}
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Đại lý phụ trách</label>
                        <p className="font-medium text-gray-900 mt-1 flex items-center">
                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                            {safeString(customer.agentName)}
                        </p>
                    </div>

                    {customer.taxCode && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Mã số thuế</label>
                            <p className="font-medium text-gray-900 mt-1 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-gray-400" />
                                {safeString(customer.taxCode)}
                            </p>
                        </div>
                    )}

                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {safeNumber(customer.totalOrders)}
                            </div>
                            <div className="text-sm text-gray-500">Tổng đơn hàng</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(customer.totalAmount)}
                            </div>
                            <div className="text-sm text-gray-500">Tổng giá trị</div>
                        </div>
                    </div>

                    {customer.notes && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                            <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                    {safeString(customer.notes)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 text-sm">
                        <div>
                            <label className="text-gray-500">Ngày tạo</label>
                            <p className="font-medium text-gray-900 mt-1">
                                {formatDate(customer.createdAt)}
                            </p>
                        </div>
                        <div>
                            <label className="text-gray-500">Cập nhật lần cuối</label>
                            <p className="font-medium text-gray-900 mt-1">
                                {formatDate(customer.updatedAt)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                    <Button onClick={onClose}>
                        Đóng
                    </Button>
                </div>
            </div>
        </div>
    );
};
