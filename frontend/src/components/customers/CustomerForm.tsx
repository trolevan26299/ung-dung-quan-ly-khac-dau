import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Portal } from '../ui/Portal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { fetchAgents } from '../../store/slices/agentsSlice';
import { AppDispatch, RootState } from '../../store';
import { VALIDATION } from '../../constants';
import type { Customer, CreateCustomerRequest } from '../../types';

interface CustomerFormProps {
    customer?: Customer | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateCustomerRequest) => void;
    isLoading?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
    customer,
    isOpen,
    onClose,
    onSubmit,
    isLoading = false
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const { agents } = useSelector((state: RootState) => state.agents);

    const [formData, setFormData] = useState<CreateCustomerRequest>({
        name: '',
        phone: '',
        address: '',
        taxCode: '',
        agentId: '',
        agentName: '',
        notes: ''
    });

    const [errors, setErrors] = useState<Partial<CreateCustomerRequest>>({});

    // Fetch agents when form opens
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchAgents({ page: 1, limit: 100 })); // Get all agents
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        if (customer) {
            // Handle case where agentId might be object or string
            const agentId = typeof customer.agentId === 'object' && (customer.agentId as any)?._id
                ? (customer.agentId as any)._id
                : customer.agentId;

            setFormData({
                name: customer.name || '',
                phone: customer.phone || '',
                address: customer.address || '',
                taxCode: customer.taxCode || '',
                agentId: String(agentId) || '',
                agentName: customer.agentName || '',
                notes: customer.notes || ''
            });
        } else {
            setFormData({
                name: '',
                phone: '',
                address: '',
                taxCode: '',
                agentId: '',
                agentName: '',
                notes: ''
            });
        }
        setErrors({});
    }, [customer, isOpen]);

    // Effect để set lại agent khi có customer data để edit
    useEffect(() => {
        if (customer && customer.agentId && agents.length > 0) {
            // Handle case where agentId might be object or string
            const agentId = typeof customer.agentId === 'object' && (customer.agentId as any)?._id
                ? (customer.agentId as any)._id
                : customer.agentId;

            if (agentId) {
                handleAgentChange(String(agentId));
            }
        }
    }, [customer, agents]);

    const validateForm = (): boolean => {
        const newErrors: Partial<CreateCustomerRequest> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên khách hàng là bắt buộc';
        } else if (formData.name.length > VALIDATION.MAX_NAME_LENGTH) {
            newErrors.name = `Tên không được vượt quá ${VALIDATION.MAX_NAME_LENGTH} ký tự`;
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Số điện thoại là bắt buộc';
        } else if (!VALIDATION.PHONE_REGEX.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Địa chỉ là bắt buộc';
        } else if (formData.address.length > VALIDATION.MAX_ADDRESS_LENGTH) {
            newErrors.address = `Địa chỉ không được vượt quá ${VALIDATION.MAX_ADDRESS_LENGTH} ký tự`;
        }

        if (!formData.agentId) {
            newErrors.agentId = 'Vui lòng chọn đại lý';
        }

        if (formData.taxCode && !VALIDATION.TAX_CODE_REGEX.test(formData.taxCode)) {
            newErrors.taxCode = 'Mã số thuế không hợp lệ (10-13 số)';
        }

        if (formData.notes && formData.notes.length > VALIDATION.MAX_NOTES_LENGTH) {
            newErrors.notes = `Ghi chú không được vượt quá ${VALIDATION.MAX_NOTES_LENGTH} ký tự`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form data before submit:', formData);
        if (validateForm()) {
            console.log('Form validation passed, submitting:', formData);
            onSubmit(formData);
        } else {
            console.log('Form validation failed, errors:', errors);
        }
    };

    const handleInputChange = (field: keyof CreateCustomerRequest, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleAgentChange = (agentId: string) => {
        const selectedAgent = agents.find(agent => agent._id === agentId);
        if (selectedAgent) {
            setFormData(prev => ({
                ...prev,
                agentId: selectedAgent._id,
                agentName: selectedAgent.name
            }));
            // Clear error
            if (errors.agentId) {
                setErrors(prev => ({ ...prev, agentId: undefined }));
            }
        }
    };

    if (!isOpen) return null;

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
                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">
                        {customer ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên khách hàng *
                            </label>
                            <Input
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Nhập tên khách hàng"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số điện thoại *
                            </label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="Nhập số điện thoại"
                                className={errors.phone ? 'border-red-500' : ''}
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Địa chỉ *
                            </label>
                            <Input
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                placeholder="Nhập địa chỉ"
                                className={errors.address ? 'border-red-500' : ''}
                            />
                            {errors.address && (
                                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Đại lý phụ trách *
                            </label>
                            <Select value={formData.agentId} onValueChange={handleAgentChange}>
                                <SelectTrigger className={errors.agentId ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Chọn đại lý" />
                                </SelectTrigger>
                                <SelectContent>
                                    {agents.map((agent) => (
                                        <SelectItem key={agent._id} value={agent._id}>
                                            {String(agent.name || '')} - {String(agent.phone || '')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.agentId && (
                                <p className="text-red-500 text-xs mt-1">{errors.agentId}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mã số thuế
                            </label>
                            <Input
                                value={formData.taxCode}
                                onChange={(e) => handleInputChange('taxCode', e.target.value)}
                                placeholder="Nhập mã số thuế (tùy chọn)"
                                className={errors.taxCode ? 'border-red-500' : ''}
                            />
                            {errors.taxCode && (
                                <p className="text-red-500 text-xs mt-1">{errors.taxCode}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ghi chú
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="Nhập ghi chú (tùy chọn)"
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.notes ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                rows={3}
                            />
                            {errors.notes && (
                                <p className="text-red-500 text-xs mt-1">{errors.notes}</p>
                            )}
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                className="flex-1"
                                disabled={isLoading}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                variant="default"
                                className="flex-1"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Đang xử lý...' : (customer ? 'Cập nhật' : 'Thêm mới')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
}; 