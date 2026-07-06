import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { formatCurrency } from '../../lib/utils';
import type { Statistics } from '../../types';

interface AdditionalMetricsProps {
    statistics: Statistics;
}

export const AdditionalMetrics: React.FC<AdditionalMetricsProps> = ({ statistics }) => {
    const profitRate = statistics.totalRevenue > 0
        ? ((statistics.totalProfit / statistics.totalRevenue) * 100).toFixed(1)
        : '0';
    // Dùng formatCurrency để làm tròn VND (không còn phần lẻ lẻ tẻ).
    const avgOrderValue = statistics.totalOrders > 0
        ? formatCurrency(statistics.totalRevenue / statistics.totalOrders)
        : formatCurrency(0);
    const debtRate = statistics.totalRevenue > 0
        ? ((statistics.totalDebt / statistics.totalRevenue) * 100).toFixed(1)
        : '0';

    const metrics = [
        { title: 'Tỷ lệ lợi nhuận', value: `${profitRate}%`, hint: 'Lợi nhuận trên doanh thu', color: 'text-blue-600' },
        { title: 'Giá trị đơn hàng TB', value: avgOrderValue, hint: 'Trung bình mỗi đơn hàng', color: 'text-emerald-600' },
        { title: 'Tỷ lệ công nợ', value: `${debtRate}%`, hint: 'Công nợ trên doanh thu', color: 'text-orange-600' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((m) => (
                <Card key={m.title}>
                    <CardHeader className="pb-1.5">
                        <CardTitle className="text-base text-gray-600">{m.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center">
                            <div className={`text-2xl font-bold tabular-nums tracking-tight ${m.color}`}>
                                {m.value}
                            </div>
                            <p className="mt-0.5 text-sm text-gray-400">{m.hint}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
