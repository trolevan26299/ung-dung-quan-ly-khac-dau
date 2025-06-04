import React, { useState, useEffect } from 'react';
import { Agent, CreateAgentRequest } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AgentFormProps {
    agent?: Agent;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateAgentRequest) => void;
    isLoading?: boolean;
}

export const AgentForm: React.FC<AgentFormProps> = ({
    agent,
    isOpen,
    onClose,
    onSubmit,
    isLoading = false
}) => {
    const [formData, setFormData] = useState<CreateAgentRequest>({
        name: '',
        phone: '',
        address: '',
        notes: ''
    });

    useEffect(() => {
        if (agent) {
            setFormData({
                name: agent.name,
                phone: agent.phone,
                address: agent.address,
                notes: agent.notes || ''
            });
        } else {
            setFormData({
                name: '',
                phone: '',
                address: '',
                notes: ''
            });
        }
    }, [agent, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-xl font-bold mb-4">
                    {agent ? 'Cập nhật đại lý' : 'Thêm đại lý mới'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên đại lý *
                        </label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nhập tên đại lý"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số điện thoại *
                        </label>
                        <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Nhập số điện thoại"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Địa chỉ *
                        </label>
                        <Input
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Nhập địa chỉ"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ghi chú
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Nhập ghi chú (tùy chọn)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            rows={3}
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isLoading || !formData.name || !formData.phone || !formData.address}
                        >
                            {isLoading ? 'Đang xử lý...' : (agent ? 'Cập nhật' : 'Thêm mới')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 