import { Minus, Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { VALIDATION } from '../../constants';
import type { Agent, CreateOrderRequest, Customer, Order, Product } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Portal } from '../ui/Portal';
import { Combobox } from '../ui/combobox';

interface OrderFormProps {
    order?: Order | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateOrderRequest) => void;
    isLoading?: boolean;
    customers: Customer[];
    agents: Agent[];
    products: Product[];
    onAgentChange?: (agentId: string) => void;
}

interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export const OrderForm: React.FC<OrderFormProps> = ({
    order,
    isOpen,
    onClose,
    onSubmit,
    isLoading = false,
    customers,
    agents,
    products,
    onAgentChange
}) => {
    const [formData, setFormData] = useState<CreateOrderRequest>({
        customerId: '',
        customerName: '',
        customerPhone: '',
        agentId: '',
        items: [],
        vat: 0,
        shippingFee: 0,
        notes: '',
        paymentStatus: 'pending',
        paymentMethod: 'personal_account'
    });

    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [errors, setErrors] = useState<any>({});
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [customerSearchValue, setCustomerSearchValue] = useState('');

    // Filter customers by selected agent
    const getCustomersByAgent = (agentId: string) => {
        if (!agentId) return customers;
        return customers.filter(customer => customer.agentId === agentId);
    };

    // Handle agent selection
    const handleAgentChange = (agentId: string) => {
        setFormData({ 
            ...formData, 
            agentId,
            customerId: '', // Reset customer when agent changes
            customerName: '',
            customerPhone: ''
        });
        setCustomerSearchValue('');
        const agentCustomers = getCustomersByAgent(agentId || '');
        setFilteredCustomers(agentCustomers);
        if (onAgentChange) {
            onAgentChange(agentId);
        }
    };

    // Handle customer search and selection
    const handleCustomerSearch = (value: string) => {
        setCustomerSearchValue(value);
        setFormData({ ...formData, customerName: value, customerId: '' });
        
        if (value.length > 0) {
            const agentCustomers = getCustomersByAgent(formData.agentId || '');
            const filtered = agentCustomers.filter(customer => 
                customer.name.toLowerCase().includes(value.toLowerCase()) ||
                (customer.phone && customer.phone.includes(value))
            );
            setFilteredCustomers(filtered);
            setShowCustomerDropdown(true);
        } else {
            setShowCustomerDropdown(false);
        }
    };

    const handleCustomerSelect = (customer: Customer) => {
        setFormData({
            ...formData,
            customerId: customer._id,
            customerName: customer.name,
            customerPhone: customer.phone || ''
        });
        setCustomerSearchValue(customer.name);
        setShowCustomerDropdown(false);
    };

    useEffect(() => {
        if (order && isOpen) {
            setFormData({
                customerId: order.customer?._id || '',
                customerName: order.customer?.name || '',
                customerPhone: order.customer?.phone || '',
                agentId: order.agent?._id || '',
                items: order.items.filter(item => item.product).map(item => ({
                    productId: typeof item.product === 'string' ? item.product : (item.product as any)?._id || '',
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                })),
                vat: order.vatRate || 0,
                shippingFee: order.shippingFee || 0,
                notes: order.notes || '',
                paymentStatus: order.paymentStatus || 'pending',
                paymentMethod: order.paymentMethod || 'personal_account'
            });

            const mappedOrderItemsDisplay = order.items.filter(item => item.product).map(item => ({
                productId: typeof item.product === 'string' ? item.product : (item.product as any)?._id || '',
                productName: item.productName || (typeof item.product === 'object' ? (item.product as any)?.name : 'Sản phẩm không xác định'),
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice
            }));
            
            setOrderItems(mappedOrderItemsDisplay);
            setCustomerSearchValue(order.customer?.name || '');
        } else {
            setFormData({
                customerId: '',
                customerName: '',
                customerPhone: '',
                agentId: '',
                items: [],
                vat: 10,
                shippingFee: 0,
                notes: '',
                paymentStatus: 'pending',
                paymentMethod: 'personal_account'
            });
            setOrderItems([]);
            setCustomerSearchValue('');
        }
        setErrors({});
        setFilteredCustomers(customers);
    }, [order, isOpen, customers]);

    const calculateTotals = () => {
        const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const vatAmount = subtotal * ((formData.vat || 0) / 100);
        const total = subtotal + vatAmount + (formData.shippingFee || 0);

        return { subtotal, vatAmount, total };
    };

    const addOrderItem = (productId: string) => {
        const product = products.find(p => p._id === productId);
        if (!product) return;

        const existingIndex = orderItems.findIndex(item => item.productId === productId);

        if (existingIndex >= 0) {
            // Increase quantity if product already exists
            const newItems = [...orderItems];
            newItems[existingIndex].quantity += 1;
            // Không tự động tăng totalPrice, để user tự nhập
            setOrderItems(newItems);
        } else {
            // Add new product với totalPrice = 0
            const newItem: OrderItem = {
                productId: product._id,
                productName: product.name,
                quantity: 1,
                unitPrice: 0, // Đặt 0 để user tự nhập
                totalPrice: 0 // Đặt 0 để user tự nhập
            };
            setOrderItems([...orderItems, newItem]);
        }
    };

    const updateOrderItem = (index: number, field: 'quantity' | 'unitPrice' | 'totalPrice', value: number) => {
        const newItems = [...orderItems];
        
        // Đảm bảo giá trị không âm
        if (field === 'quantity') {
            newItems[index][field] = Math.max(1, value);
        } else if (field === 'unitPrice') {
            newItems[index][field] = Math.max(0, value);
        } else if (field === 'totalPrice') {
            newItems[index][field] = Math.max(0, value);
        }
        
        // Tự động tính totalPrice khi thay đổi quantity hoặc unitPrice
        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
        }
        
        setOrderItems(newItems);
    };

    const removeOrderItem = (index: number) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const validateForm = (): boolean => {
        const newErrors: any = {};

        // Validate customer - either existing customer or new customer with name
        if (!formData.customerId && !formData.customerName?.trim()) {
            newErrors.customer = 'Vui lòng chọn khách hàng hoặc nhập tên khách hàng mới';
        }

        if (orderItems.length === 0) {
            newErrors.items = 'Vui lòng thêm ít nhất một sản phẩm';
        }

        // Validate orderItems
        orderItems.forEach((item, index) => {
            if (item.quantity <= 0) {
                newErrors[`quantity_${index}`] = 'Số lượng phải lớn hơn 0';
            }
            if (item.unitPrice <= 0) {
                newErrors[`unitPrice_${index}`] = 'Đơn giá phải lớn hơn 0';
            }
        });

        const vat = formData.vat || 0;
        if (vat < 0 || vat > 100) {
            newErrors.vatRate = 'VAT phải từ 0-100%';
        }

        const shippingFee = formData.shippingFee || 0;
        if (shippingFee < 0) {
            newErrors.shippingFee = 'Phí vận chuyển không được âm';
        }

        if (!formData.paymentStatus) {
            newErrors.paymentStatus = 'Vui lòng chọn trạng thái thanh toán';
        }

        if (formData.notes && formData.notes.length > VALIDATION.MAX_NOTES_LENGTH) {
            newErrors.notes = `Ghi chú không được vượt quá ${VALIDATION.MAX_NOTES_LENGTH} ký tự`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            const orderData: CreateOrderRequest = {
                ...formData,
                // Không gửi customerId nếu là empty string
                customerId: formData.customerId || undefined,
                agentId: formData.agentId || undefined,
                items: orderItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                }))
            };
            onSubmit(orderData);
        }
    };

    if (!isOpen) return null;

    const { subtotal, vatAmount, total } = calculateTotals();

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
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">
                            {order ? 'Cập nhật đơn hàng' : 'Tạo đơn hàng mới'}
                        </h2>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Agent and Customer Selection - Đổi vị trí */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Đại lý
                                </label>
                                <Combobox
                                    options={[
                                        { value: '', label: 'Không có đại lý' },
                                        ...agents.map(agent => ({
                                            value: agent._id,
                                            label: agent.name,
                                            subtitle: agent.phone,
                                        }))
                                    ]}
                                    value={formData.agentId}
                                    onChange={handleAgentChange}
                                    placeholder="Chọn đại lý"
                                    searchPlaceholder="Tìm kiếm đại lý..."
                                    emptyMessage="Không tìm thấy đại lý"
                                    allowClear
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Khách hàng *
                                </label>
                                <Input
                                    type="text"
                                    value={customerSearchValue}
                                    onChange={(e) => handleCustomerSearch(e.target.value)}
                                    placeholder="Nhập tên hoặc SĐT khách hàng"
                                    className={`${errors.customer ? 'border-red-500' : ''}`}
                                    onFocus={() => {
                                        if (filteredCustomers.length > 0) {
                                            setShowCustomerDropdown(true);
                                        }
                                    }}
                                />
                                
                                {/* Customer Phone Input */}
                                <Input
                                    type="text"
                                    value={formData.customerPhone}
                                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                    placeholder="Số điện thoại (tùy chọn)"
                                    className="mt-2"
                                />

                                {/* Customer Dropdown */}
                                {showCustomerDropdown && filteredCustomers.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {filteredCustomers.map(customer => (
                                            <button
                                                key={customer._id}
                                                type="button"
                                                onClick={() => handleCustomerSelect(customer)}
                                                className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                            >
                                                <div className="font-medium">{customer.name}</div>
                                                <div className="text-sm text-gray-500">{customer.phone}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                {errors.customer && (
                                    <p className="text-red-500 text-xs mt-1">{errors.customer}</p>
                                )}
                            </div>
                        </div>

                        {/* Product Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chọn sản phẩm
                            </label>
                            <Combobox
                                options={products.map(product => ({
                                    value: product._id,
                                    label: product.name,
                                    subtitle: `Tồn: ${product.stockQuantity}`,
                                }))}
                                value=""
                                onChange={(productId) => {
                                    if (productId) {
                                        addOrderItem(productId);
                                    }
                                }}
                                placeholder="Chọn sản phẩm để thêm"
                                searchPlaceholder="Tìm kiếm sản phẩm..."
                                emptyMessage="Không tìm thấy sản phẩm"
                            />
                            {errors.items && (
                                <p className="text-red-500 text-xs mt-1">{errors.items}</p>
                            )}
                        </div>

                        {/* Order Items */}
                        {orderItems.length > 0 && (
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="font-medium mb-3">Danh sách sản phẩm</h3>
                                    <div className="space-y-3">
                                        {orderItems.map((item, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.productName}</p>
                                                </div>
                                                
                                                {/* Số lượng */}
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-gray-600 w-16">Số lượng:</span>
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => updateOrderItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                        className={`w-20 text-center ${errors[`quantity_${index}`] ? 'border-red-500' : ''}`}
                                                        min="1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => updateOrderItem(index, 'quantity', item.quantity + 1)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                    {errors[`quantity_${index}`] && (
                                                        <p className="text-red-500 text-xs mt-1">{errors[`quantity_${index}`]}</p>
                                                    )}
                                                </div>
                                                
                                                {/* Đơn giá */}
                                                <div className="w-40">
                                                    <Input
                                                        type="number"
                                                        value={item.unitPrice === 0 ? '' : item.unitPrice}
                                                        onChange={(e) => updateOrderItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        placeholder="Nhập đơn giá"
                                                        className={`text-right ${errors[`unitPrice_${index}`] ? 'border-red-500' : ''}`}
                                                        min="0"
                                                        step="1000"
                                                    />
                                                    {errors[`unitPrice_${index}`] && (
                                                        <p className="text-red-500 text-xs mt-1">{errors[`unitPrice_${index}`]}</p>
                                                    )}
                                                </div>
                                                
                                                {/* Tổng tiền (tự động tính) */}
                                                <div className="w-40">
                                                 
                                                    <div className="p-2 bg-gray-100 rounded border text-right font-medium">
                                                        {item.totalPrice.toLocaleString('vi-VN')}₫
                                                    </div>
                                                </div>
                                                
                                                <Button
                                                    type="button"
                                                    variant="danger"
                                                    size="xs"
                                                    onClick={() => removeOrderItem(index)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* VAT, Shipping, Payment Method and Payment Status */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    VAT (%)
                                </label>
                                <Input
                                    type="number"
                                    value={formData.vat === 0 ? '' : formData.vat}
                                    onChange={(e) => setFormData({ ...formData, vat: parseFloat(e.target.value) || 0 })}
                                    placeholder="0"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className={errors.vatRate ? 'border-red-500' : ''}
                                />
                                {errors.vatRate && (
                                    <p className="text-red-500 text-xs mt-1">{errors.vatRate}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phí vận chuyển
                                </label>
                                <Input
                                    type="number"
                                    value={formData.shippingFee === 0 ? '' : formData.shippingFee}
                                    onChange={(e) => setFormData({ ...formData, shippingFee: parseFloat(e.target.value) || 0 })}
                                    placeholder="0"
                                    min="0"
                                    step="1000"
                                    className={errors.shippingFee ? 'border-red-500' : ''}
                                />
                                {errors.shippingFee && (
                                    <p className="text-red-500 text-xs mt-1">{errors.shippingFee}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Khách thanh toán
                                </label>
                                <Combobox
                                    options={[
                                        { value: 'personal_account', label: 'Tài khoản cá nhân chị Hậu' },
                                        { value: 'company_account', label: 'Tài khoản Cty' },
                                        { value: 'cash', label: 'Tiền mặt' },
                                    ]}
                                    value={formData.paymentMethod}
                                    onChange={(value) => setFormData({ ...formData, paymentMethod: value as any })}
                                    placeholder="Chọn phương thức thanh toán"
                                    searchPlaceholder="Tìm kiếm phương thức..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trạng thái thanh toán *
                                </label>
                                <Combobox
                                    options={[
                                        { value: 'pending', label: 'Chưa thanh toán' },
                                        { value: 'completed', label: 'Đã thanh toán' },
                                        { value: 'debt', label: 'Công nợ' },
                                    ]}
                                    value={formData.paymentStatus}
                                    onChange={(value) => setFormData({ ...formData, paymentStatus: value as any })}
                                    placeholder="Chọn trạng thái thanh toán"
                                    searchPlaceholder="Tìm kiếm trạng thái..."
                                    error={!!errors.paymentStatus}
                                />
                                {errors.paymentStatus && (
                                    <p className="text-red-500 text-xs mt-1">{errors.paymentStatus}</p>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        {orderItems.length > 0 && (
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="font-medium mb-3">Tổng kết đơn hàng</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Tạm tính:</span>
                                            <span>{subtotal.toLocaleString('vi-VN')}₫</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>VAT ({formData.vat}%):</span>
                                            <span>{vatAmount.toLocaleString('vi-VN')}₫</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Phí vận chuyển:</span>
                                            <span>{(formData.shippingFee || 0).toLocaleString('vi-VN')}₫</span>
                                        </div>
                                        <div className="border-t pt-2">
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Tổng cộng:</span>
                                                <span className="text-green-600">{total.toLocaleString('vi-VN')}₫</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ghi chú
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Nhập ghi chú (tùy chọn)"
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.notes ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                rows={3}
                            />
                            {errors.notes && (
                                <p className="text-red-500 text-xs mt-1">{errors.notes}</p>
                            )}
                        </div>

                        {/* Actions */}
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
                                disabled={isLoading || orderItems.length === 0}
                            >
                                {isLoading ? 'Đang xử lý...' : (order ? 'Cập nhật' : 'Tạo đơn hàng')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
};