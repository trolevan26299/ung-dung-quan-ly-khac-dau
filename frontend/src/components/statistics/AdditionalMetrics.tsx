import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import type { Statistics } from '../../types';

interface AdditionalMetricsProps {
    statistics: Statistics;
}

export const AdditionalMetrics: React.FC<AdditionalMetricsProps> = ({ statistics }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Tỷ lệ lợi nhuận</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                            {statistics.totalRevenue > 0
                                ? ((statistics.totalProfit / statistics.totalRevenue) * 100).toFixed(1)
                                : 0
                            }%
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Lợi nhuận trên doanh thu
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Giá trị đơn hàng TB</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                            {statistics.totalOrders > 0
                                ? (statistics.totalRevenue / statistics.totalOrders).toLocaleString('vi-VN')
                                : 0
                            }₫
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Trung bình mỗi đơn hàng
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Tỷ lệ công nợ</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">
                            {statistics.totalRevenue > 0
                                ? ((statistics.totalDebt / statistics.totalRevenue) * 100).toFixed(1)
                                : 0
                            }%
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Công nợ trên doanh thu
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}; 