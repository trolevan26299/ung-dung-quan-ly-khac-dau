import React, { useState } from 'react';

interface RevenueChartProps {
    data: Array<{
        month: string;
        revenue: number;
        profit: number;
    }>;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    const [periodType, setPeriodType] = useState<'3months' | 'year'>('3months');

    // Kiểm tra data trước khi sử dụng
    if (!data || data.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">Doanh thu theo tháng</h3>
                    <select
                        value={periodType}
                        onChange={(e) => setPeriodType(e.target.value as '3months' | 'year')}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="3months">3 tháng gần nhất</option>
                        <option value="year">Theo năm (12 tháng)</option>
                    </select>
                </div>
                <div className="text-center text-gray-500 py-8">
                    Chưa có dữ liệu doanh thu
                </div>
            </div>
        );
    }

    // Logic filter data dựa trên lựa chọn
    const getDisplayData = () => {
        if (periodType === '3months') {
            // Lấy tháng hiện tại theo múi giờ Việt Nam
            const vietnamNow = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
            const currentMonth = new Date(vietnamNow).getMonth() + 1; // 1-12
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

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900">Doanh thu theo tháng</h3>
                <select
                    value={periodType}
                    onChange={(e) => setPeriodType(e.target.value as '3months' | 'year')}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="3months">3 tháng gần nhất</option>
                    <option value="year">Theo năm (12 tháng)</option>
                </select>
            </div>
            
            {/* Biểu đồ cột đứng với container cố định */}
            <div className="relative bg-gray-50 rounded-lg p-4" style={{ height: '320px' }}>
                {/* Trục Y labels */}
                <div className="absolute left-2 top-4 bottom-16 flex flex-col justify-between text-xs text-gray-500 w-8">
                    <span>{(maxRevenue / 1000).toFixed(0)}K</span>
                    <span>{(maxRevenue / 2000).toFixed(0)}K</span>
                    <span>0</span>
                </div>

                {/* Container biểu đồ */}
                <div className={`ml-10 h-64 flex items-end justify-between ${
                    periodType === 'year' ? 'space-x-1' : 'space-x-4'
                }`}>
                    {displayData.map((item, index) => {
                        if (!item) return null;
                        
                        const revenue = typeof item.revenue === 'number' ? item.revenue : 0;
                        const profit = typeof item.profit === 'number' ? item.profit : 0;
                        const month = item.month ? item.month.replace('Tháng ', 'T') : `T${index + 1}`;
                        const heightPercentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                        const barHeight = Math.max(heightPercentage * 2.2, revenue > 0 ? 8 : 2); // Tăng multiplier để cột cao hơn
                        
                        return (
                            <div key={index} className="flex flex-col items-center flex-1 group relative">
                                {/* Tooltip hiện khi hover - fixed positioning */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap absolute -top-12 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
                                    <div className="text-center">
                                        <div>{revenue.toLocaleString('vi-VN')}₫</div>
                                        <div>LN: {profit.toLocaleString('vi-VN')}₫</div>
                                    </div>
                                    {/* Arrow xuống */}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                </div>
                                
                                {/* Cột */}
                                <div className="flex flex-col justify-end items-center w-full mb-2" style={{ height: '220px' }}>
                                    <div
                                        className={`w-full rounded-t transition-all duration-300 min-h-0.5 flex items-end justify-center ${
                                            revenue > 0 
                                                ? 'bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500' 
                                                : 'bg-gray-300'
                                        }`}
                                        style={{ height: `${Math.min(barHeight, 220)}px` }}
                                    >
                                        {revenue > 0 && barHeight > 40 && periodType === '3months' && (
                                            <span className="text-white text-xs font-medium mb-2 transform -rotate-90 origin-center">
                                                {(revenue / 1000).toFixed(0)}K
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Label tháng */}
                                <div className={`font-medium text-center ${
                                    periodType === 'year' ? 'text-xs' : 'text-sm'
                                } ${revenue > 0 ? 'text-gray-700' : 'text-gray-400'} mb-1`}>
                                    {month}
                                </div>
                                
                                {/* Giá trị dưới - chỉ hiện khi có data hoặc là 3 tháng */}
                                {(revenue > 0 || periodType === '3months') && (
                                    <div className={`text-center ${
                                        periodType === 'year' ? 'text-xs' : 'text-sm'
                                    } ${revenue > 0 ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {revenue > 0 ? `${(revenue / 1000).toFixed(0)}K` : '0'}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Summary */}
            <div className="pt-2 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Tổng doanh thu:</span>
                        <div className="font-semibold text-blue-600">
                            {displayData.reduce((sum, item) => {
                                const revenue = typeof item?.revenue === 'number' ? item.revenue : 0;
                                return sum + revenue;
                            }, 0).toLocaleString('vi-VN')}₫
                        </div>
                    </div>
                    <div>
                        <span className="text-gray-600">Lợi nhuận ước tính:</span>
                        <div className="font-semibold text-green-600">
                            {displayData.reduce((sum, item) => {
                                const profit = typeof item?.profit === 'number' ? item.profit : 0;
                                return sum + profit;
                            }, 0).toLocaleString('vi-VN')}₫
                        </div>
                    </div>
                </div>
               
            </div>
        </div>
    );
}; 