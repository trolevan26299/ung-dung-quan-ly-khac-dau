import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { DollarSign, TrendingUp, TrendingDown, ShoppingCart } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../lib/utils';
import type { Statistics } from '../../types';

interface StatisticsCardsProps {
    statistics: Statistics;
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ statistics }) => {
    if (!statistics) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {Array(4).fill(0).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-5">
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    // 4 chỉ số chính — mỗi thẻ một màu chip icon riêng cho dễ phân biệt.
    const cards = [
        { label: 'Tổng doanh thu', value: formatCurrency(statistics.totalRevenue), icon: DollarSign, bg: 'bg-emerald-50', text: 'text-emerald-600' },
        { label: 'Lợi nhuận', value: formatCurrency(statistics.totalProfit), icon: TrendingUp, bg: 'bg-blue-50', text: 'text-blue-600' },
        { label: 'Công nợ', value: formatCurrency(statistics.totalDebt), icon: TrendingDown, bg: 'bg-orange-50', text: 'text-orange-600' },
        { label: 'Tổng đơn hàng', value: formatNumber(statistics.totalOrders), icon: ShoppingCart, bg: 'bg-violet-50', text: 'text-violet-600' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((c) => {
                const Icon = c.icon;
                return (
                    <Card key={c.label} className="transition-shadow hover:shadow-md">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.bg}`}>
                                    <Icon className={`h-6 w-6 ${c.text}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-500">{c.label}</p>
                                    <p className="mt-1 truncate text-2xl font-bold tabular-nums tracking-tight text-gray-900">
                                        {c.value}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
