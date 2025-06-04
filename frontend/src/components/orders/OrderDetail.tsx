import React from 'react';
import { X, User, MapPin, Phone, Package, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { StatusBadge } from '../common';
import { formatCurrency, formatDate, safeString, safeNumber } from '../../lib/utils';
import type { Order } from '../../types';
import { Portal } from '../ui/Portal';

interface OrderDetailProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({
    order,
    isOpen,
    onClose
}) => {
    if (!isOpen || !order) return null;

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
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Chi tiết đơn hàng #{safeString(order.orderNumber)}
                            </h2>
                            <div className="flex items-center space-x-3 mt-2">
                                <StatusBadge type="order" status={order.status} />
                                <StatusBadge type="payment" status={order.paymentStatus} />
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Customer Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-gray-900 flex items-center">
                                <User className="w-5 h-5 mr-2" />
                                Thông tin khách hàng
                            </h3>

                            {order.customer ? (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-500">Tên khách hàng:</span>
                                            <p className="font-medium">{safeString(order.customer.name)}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Số điện thoại:</span>
                                            <p className="font-medium flex items-center">
                                                <Phone className="w-4 h-4 mr-1" />
                                                {safeString(order.customer.phone)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Địa chỉ:</span>
                                            <p className="font-medium flex items-start">
                                                <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                                                {safeString(order.customer.address)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">Không có thông tin khách hàng</p>
                            )}

                            {/* Agent Information */}
                            {order.agent && (
                                <div className="mt-6">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-3">
                                        Thông tin đại lý
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-sm text-gray-500">Tên đại lý:</span>
                                                <p className="font-medium">{safeString(order.agent.name)}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-500">Số điện thoại:</span>
                                                <p className="font-medium flex items-center">
                                                    <Phone className="w-4 h-4 mr-1" />
                                                    {safeString(order.agent.phone)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-gray-900 flex items-center">
                                <DollarSign className="w-5 h-5 mr-2" />
                                Tóm tắt đơn hàng
                            </h3>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tạm tính:</span>
                                        <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">VAT ({safeNumber(order.vatRate)}%):</span>
                                        <span className="font-medium">{formatCurrency(order.vatAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phí vận chuyển:</span>
                                        <span className="font-medium">{formatCurrency(order.shippingFee)}</span>
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-lg font-semibold">Tổng cộng:</span>
                                            <span className="text-lg font-bold text-green-600">
                                                {formatCurrency(order.totalAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Meta */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Ngày tạo:</span>
                                        <p className="font-medium">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Cập nhật:</span>
                                        <p className="font-medium">{formatDate(order.updatedAt)}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Người tạo:</span>
                                        <p className="font-medium">{safeString(order.createdBy?.fullName)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-6">
                        <h3 className="font-semibold text-lg text-gray-900 flex items-center mb-4">
                            <Package className="w-5 h-5 mr-2" />
                            Danh sách sản phẩm
                        </h3>

                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-100 font-semibold text-sm">
                                <div className="col-span-5">Sản phẩm</div>
                                <div className="col-span-2 text-center">Số lượng</div>
                                <div className="col-span-2 text-right">Đơn giá</div>
                                <div className="col-span-3 text-right">Thành tiền</div>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {order.items?.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-4 p-4">
                                        <div className="col-span-5">
                                            <p className="font-medium">{safeString(item.productName)}</p>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            {safeNumber(item.quantity)}
                                        </div>
                                        <div className="col-span-2 text-right">
                                            {formatCurrency(item.unitPrice)}
                                        </div>
                                        <div className="col-span-3 text-right font-semibold">
                                            {formatCurrency(item.totalPrice)}
                                        </div>
                                    </div>
                                )) || []}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div className="mt-6">
                            <h3 className="font-semibold text-lg text-gray-900 mb-3">Ghi chú</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700 whitespace-pre-wrap">{safeString(order.notes)}</p>
                            </div>
                        </div>
                    )}

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