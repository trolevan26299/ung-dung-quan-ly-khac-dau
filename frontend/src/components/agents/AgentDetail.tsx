import React from 'react';
import { Phone, MapPin, Users, FileText, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Portal } from '../ui/Portal';
import { formatCurrency, formatDate, safeString, safeNumber } from '../../lib/utils';
import type { Agent } from '../../types';

interface AgentDetailProps {
    agent: Agent | null;
    isOpen: boolean;
    onClose: () => void;
}

export const AgentDetail: React.FC<AgentDetailProps> = ({
    agent,
    isOpen,
    onClose
}) => {
    if (!isOpen || !agent) return null;

    return (
        <Portal>
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
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
                <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Chi tiết đại lý</h2>
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
                                <label className="text-sm font-medium text-gray-500">Tên đại lý</label>
                                <p className="font-semibold text-gray-900 mt-1">{safeString(agent.name)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                                <p className="font-medium text-gray-900 mt-1 flex items-center">
                                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                    {safeString(agent.phone)}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                            <p className="font-medium text-gray-900 mt-1 flex items-start">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                                {safeString(agent.address)}
                            </p>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {safeNumber(agent.totalOrders)}
                                </div>
                                <div className="text-sm text-gray-500">Tổng đơn hàng</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(agent.totalAmount)}
                                </div>
                                <div className="text-sm text-gray-500">Tổng giá trị</div>
                            </div>
                        </div>

                        {agent.notes && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                        {safeString(agent.notes)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 text-sm">
                            <div>
                                <label className="text-gray-500">Ngày tạo</label>
                                <p className="font-medium text-gray-900 mt-1">
                                    {formatDate(agent.createdAt)}
                                </p>
                            </div>
                            <div>
                                <label className="text-gray-500">Cập nhật lần cuối</label>
                                <p className="font-medium text-gray-900 mt-1">
                                    {formatDate(agent.updatedAt)}
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
        </Portal>
    );
}; 