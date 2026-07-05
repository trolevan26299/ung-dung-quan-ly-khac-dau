import React, { useState } from 'react';
import { formatCurrency } from '../../lib/utils';

interface RevenueChartProps {
    data: Array<{
        month: string;
        revenue: number;
        profit: number;
    }>;
}

// Rút gọn số tiền thành dạng "1,2Tr" / "850K" cho trục và nhãn cột cho gọn.
const shortMoney = (n: number): string => {
    if (!n) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}Tr`;
    if (n >= 1_000) return `${Math.round(n / 1000)}K`;
    return `${Math.round(n)}`;
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    const [periodType, setPeriodType] = useState<'3months' | 'year'>('3months');

    // Ô chọn khoảng thời gian (dùng chung cho cả trạng thái rỗng và có dữ liệu)
    const periodSelect = (
        <select
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value as '3months' | 'year')}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option value="3months">3 tháng gần nhất</option>
            <option value="year">Theo năm (12 tháng)</option>
        </select>
    );

    // Kiểm tra data trước khi sử dụng
    if (!data || data.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-600">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        Doanh thu theo tháng
                    </span>
                    {periodSelect}
                </div>
                <div className="py-12 text-center text-gray-400">
                    Chưa có dữ liệu doanh thu
                </div>
            </div>
        );
    }

    // Logic filter data dựa trên lựa chọn
    const getDisplayData = () => {
        if (periodType === '3months') {
            // Lấy tháng hiện tại và 2 tháng trước
            const currentMonth = new Date().getMonth() + 1; // 1-12
            const targetMonths = [];

            for (let i = 2; i >= 0; i--) {
                let month = currentMonth - i;
                if (month <= 0) {
                    month += 12; // Nếu âm thì lấy tháng năm trước
                }
                targetMonths.push(month);
            }

            // Tạo data cho 3 tháng, kể cả tháng không có doanh thu
            return targetMonths.map(month => {
                const monthName = `Tháng ${month}`;
                const existingData = data.find(item => item.month === monthName);
                return existingData || {
                    month: monthName,
                    revenue: 0,
                    profit: 0
                };
            });
        } else {
            // Hiển thị tất cả 12 tháng
            const monthsData = [];
            for (let i = 1; i <= 12; i++) {
                const monthName = `Tháng ${i}`;
                const existingData = data.find(item => item.month === monthName);
                monthsData.push(existingData || {
                    month: monthName,
                    revenue: 0,
                    profit: 0
                });
            }
            return monthsData;
        }
    };

    const displayData = getDisplayData();

    // Đảm bảo tất cả revenue values hợp lệ trước khi tính max
    const validRevenues = displayData.filter(d => d && typeof d.revenue === 'number' && !isNaN(d.revenue)).map(d => d.revenue);
    const maxRevenue = validRevenues.length > 0 ? Math.max(...validRevenues) : 1;

    // 5 mốc trục Y (trên xuống dưới): max, 3/4, 1/2, 1/4, 0
    const yTicks = [1, 0.75, 0.5, 0.25, 0].map(f => maxRevenue * f);

    const gap = periodType === 'year' ? 'gap-1.5' : 'gap-6';

    const totalRevenue = displayData.reduce((sum, item) => sum + (typeof item?.revenue === 'number' ? item.revenue : 0), 0);
    const totalProfit = displayData.reduce((sum, item) => sum + (typeof item?.profit === 'number' ? item.profit : 0), 0);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    Doanh thu theo tháng
                </span>
                {periodSelect}
            </div>

            {/* Vùng vẽ biểu đồ */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                <div className="relative" style={{ height: '224px' }}>
                    {/* Đường lưới ngang + nhãn trục Y */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                        {yTicks.map((tick, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-gray-400">
                                    {shortMoney(tick)}
                                </span>
                                <div className="h-px flex-1 bg-gray-200" />
                            </div>
                        ))}
                    </div>

                    {/* Các cột (đặt chồng lên lưới, chừa chỗ nhãn trục Y bên trái) */}
                    <div className={`absolute inset-0 flex items-end pl-12 ${gap}`}>
                        {displayData.map((item, index) => {
                            if (!item) return null;

                            const revenue = typeof item.revenue === 'number' ? item.revenue : 0;
                            const profit = typeof item.profit === 'number' ? item.profit : 0;
                            const pct = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                            // Cột có doanh thu tối thiểu cao 3% để luôn nhìn thấy được.
                            const barPct = revenue > 0 ? Math.max(pct, 3) : 0;

                            return (
                                <div key={index} className="group relative flex h-full flex-1 items-end justify-center">
                                    {/* Tooltip khi hover */}
                                    <div className="pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-center text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                        <div className="font-semibold">{formatCurrency(revenue)}</div>
                                        <div className="text-gray-300">LN: {formatCurrency(profit)}</div>
                                        <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                                    </div>

                                    {/* Cột doanh thu */}
                                    <div
                                        className={`w-full max-w-[46px] rounded-t-md transition-all duration-300 ${
                                            revenue > 0
                                                ? 'bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-blue-700 group-hover:to-blue-500'
                                                : 'bg-gray-200'
                                        }`}
                                        style={{ height: revenue > 0 ? `${barPct}%` : '2px' }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Nhãn tháng (căn thẳng với các cột) */}
                <div className={`mt-2 flex pl-12 ${gap}`}>
                    {displayData.map((item, index) => {
                        const revenue = typeof item?.revenue === 'number' ? item.revenue : 0;
                        const month = item?.month ? item.month.replace('Tháng ', 'T') : `T${index + 1}`;
                        return (
                            <div key={index} className="flex-1 text-center">
                                <div className={`font-medium ${periodType === 'year' ? 'text-[11px]' : 'text-sm'} ${revenue > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                                    {month}
                                </div>
                                {periodType === '3months' && (
                                    <div className={`text-xs tabular-nums ${revenue > 0 ? 'text-gray-500' : 'text-gray-300'}`}>
                                        {shortMoney(revenue)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                    <span className="text-sm text-gray-500">Tổng doanh thu</span>
                    <div className="text-lg font-bold tabular-nums text-blue-600">
                        {formatCurrency(totalRevenue)}
                    </div>
                </div>
                <div>
                    <span className="text-sm text-gray-500">Lợi nhuận ước tính</span>
                    <div className="text-lg font-bold tabular-nums text-emerald-600">
                        {formatCurrency(totalProfit)}
                    </div>
                </div>
            </div>
        </div>
    );
};
