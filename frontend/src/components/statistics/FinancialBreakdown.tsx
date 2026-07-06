import React from 'react';
import { PieChart } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import type { Statistics } from '../../types';

interface FinancialBreakdownProps {
    statistics: Statistics;
}

interface Segment {
    label: string;
    value: number;
    barClass: string;
    dotClass: string;
}

// Một thanh ngang gồm nhiều phần, kèm chú thích giá trị bên dưới.
const StackedBar: React.FC<{ title: string; segments: Segment[] }> = ({ title, segments }) => {
    const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);

    return (
        <div>
            <p className="mb-2 text-sm font-medium text-gray-700">{title}</p>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
                {total > 0 &&
                    segments.map((s) => {
                        const pct = (Math.max(0, s.value) / total) * 100;
                        if (pct <= 0) return null;
                        return <div key={s.label} className={s.barClass} style={{ width: `${pct}%` }} title={`${s.label}: ${formatCurrency(s.value)}`} />;
                    })}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5">
                {segments.map((s) => {
                    const pct = total > 0 ? Math.round((Math.max(0, s.value) / total) * 100) : 0;
                    return (
                        <div key={s.label} className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dotClass}`} />
                            <span className="text-sm text-gray-500">{s.label}</span>
                            <span className="text-sm font-semibold tabular-nums text-gray-900">{formatCurrency(s.value)}</span>
                            <span className="text-xs text-gray-400">({pct}%)</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const FinancialBreakdown: React.FC<FinancialBreakdownProps> = ({ statistics }) => {
    const revenue = statistics.totalRevenue || 0;
    const profit = statistics.totalProfit || 0;
    const debt = statistics.totalDebt || 0;
    // Giá vốn = doanh thu - lợi nhuận; Đã thu = doanh thu - công nợ (không âm).
    const cost = Math.max(0, revenue - profit);
    const collected = Math.max(0, revenue - debt);

    if (revenue <= 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <PieChart className="mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">Chưa có dữ liệu tài chính trong kỳ</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <StackedBar
                title="Cơ cấu doanh thu"
                segments={[
                    { label: 'Lợi nhuận', value: profit, barClass: 'bg-blue-500', dotClass: 'bg-blue-500' },
                    { label: 'Giá vốn', value: cost, barClass: 'bg-gray-300', dotClass: 'bg-gray-300' },
                ]}
            />
            <StackedBar
                title="Tình hình thu hồi"
                segments={[
                    { label: 'Đã thu', value: collected, barClass: 'bg-emerald-500', dotClass: 'bg-emerald-500' },
                    { label: 'Công nợ', value: debt, barClass: 'bg-orange-400', dotClass: 'bg-orange-400' },
                ]}
            />
        </div>
    );
};
