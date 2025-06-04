import { Minus, Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { VALIDATION } from '../../constants';
import type { Agent, CreateOrderRequest, Customer, Order, Product } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Portal } from '../ui/Portal';

interface OrderFormProps {
    order?: Order | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateOrderRequest) => void;
    isLoading?: boolean;
    customers: Customer[];
    agents: Agent[];
    products: Product[];
}

interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export const OrderForm: React.FC<OrderFormProps> = ({
    order,
    isOpen,
    onClose,
    onSubmit,
    isLoading = false,
    customers,
    agents,
    products
}) => {
    const [formData, setFormData] = useState<CreateOrderRequest>({
        customer: '',
        agent: '',
        items: [],
        vatRate: 10,
        shippingFee: 0,
        notes: '',
        paymentStatus: 'pending'
    });

    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (order) {
            setFormData({
                customer: order.customer?._id || '',
                agent: order.agent?._id || '',
                items: order.items.map(item => ({
                    product: item.product,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                })),
                vatRate: order.vatRate,
                shippingFee: order.shippingFee,
                notes: order.notes || '',
                paymentStatus: order.paymentStatus
            });

            setOrderItems(order.items.map(item => ({
                productId: item.product,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice
            })));
        } else {
            setFormData({
                customer: '',
                agent: '',
                items: [],
                vatRate: 10,
                shippingFee: 0,
                notes: '',
                paymentStatus: 'pending'
            });
            setOrderItems([]);
        }
        setErrors({});
    }, [order, isOpen]);

    const calculateTotals = () => {
        const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
        const vatAmount = subtotal * (formData.vatRate / 100);
        const total = subtotal + vatAmount + formData.shippingFee;

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
            newItems[existingIndex].total = newItems[existingIndex].quantity * newItems[existingIndex].unitPrice;
            setOrderItems(newItems);
        } else {
            // Add new product
            const newItem: OrderItem = {
                productId: product._id,
                productName: product.name,
                quantity: 1,
                unitPrice: product.sellingPrice,
                total: product.sellingPrice
            };
            setOrderItems([...orderItems, newItem]);
        }
    };

    const updateOrderItem = (index: number, field: 'quantity' | 'unitPrice', value: number) => {
        const newItems = [...orderItems];
        newItems[index][field] = value;
        newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
        setOrderItems(newItems);
    };

    const removeOrderItem = (index: number) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const validateForm = (): boolean => {
        const newErrors: any = {};

        if (!formData.customer) {
            newErrors.customer = 'Vui lòng chọn khách hàng';
        }

        if (orderItems.length === 0) {
            newErrors.items = 'Vui lòng thêm ít nhất một sản phẩm';
        }

        if (formData.vatRate < 0 || formData.vatRate > 100) {
            newErrors.vatRate = 'VAT phải từ 0-100%';
        }

        if (formData.shippingFee < 0) {
            newErrors.shippingFee = 'Phí vận chuyển không được âm';
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
                items: orderItems.map(item => ({
                    product: item.productId,
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
                        {/* Customer and Agent Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Khách hàng *
                                </label>
                                <select
                                    value={formData.customer}
                                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.customer ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Chọn khách hàng</option>
                                    {customers.map(customer => (
                                        <option key={customer._id} value={customer._id}>
                                            {customer.name} - {customer.phone}
                                        </option>
                                    ))}
                                </select>
                                {errors.customer && (
                                    <p className="text-red-500 text-xs mt-1">{errors.customer}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Đại lý
                                </label>
                                <select
                                    value={formData.agent}
                                    onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Không có đại lý</option>
                                    {agents.map(agent => (
                                        <option key={agent._id} value={agent._id}>
                                            {agent.name} - {agent.phone}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Product Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chọn sản phẩm
                            </label>
                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        addOrderItem(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">Chọn sản phẩm để thêm</option>
                                {products.map(product => (
                                    <option key={product._id} value={product._id}>
                                        {product.name} - {product.sellingPrice.toLocaleString('vi-VN')}₫
                                    </option>
                                ))}
                            </select>
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
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
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
                                                        className="w-20 text-center"
                                                        min="1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => updateOrderItem(index, 'quantity', item.quantity + 1)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <div className="w-32">
                                                    <Input
                                                        type="number"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateOrderItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        placeholder="Đơn giá"
                                                    />
                                                </div>
                                                <div className="w-32 text-right font-medium">
                                                    {item.total.toLocaleString('vi-VN')}₫
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeOrderItem(index)}
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* VAT and Shipping */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    VAT (%)
                                </label>
                                <Input
                                    type="number"
                                    value={formData.vatRate}
                                    onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) || 0 })}
                                    placeholder="VAT"
                                    min="0"
                                    max="100"
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
                                    value={formData.shippingFee}
                                    onChange={(e) => setFormData({ ...formData, shippingFee: parseFloat(e.target.value) || 0 })}
                                    placeholder="Phí vận chuyển"
                                    min="0"
                                    className={errors.shippingFee ? 'border-red-500' : ''}
                                />
                                {errors.shippingFee && (
                                    <p className="text-red-500 text-xs mt-1">{errors.shippingFee}</p>
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
                                            <span>VAT ({formData.vatRate}%):</span>
                                            <span>{vatAmount.toLocaleString('vi-VN')}₫</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Phí vận chuyển:</span>
                                            <span>{formData.shippingFee.toLocaleString('vi-VN')}₫</span>
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