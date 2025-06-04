import React from 'react';

interface RevenueChartProps {
    data: Array<{
        month: string;
        revenue: number;
        profit: number;
    }>;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    const maxRevenue = Math.max(...data.map(d => d.revenue));

    return (
        <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Doanh thu theo tháng</h3>
            <div className="space-y-3">
                {data.map((item, index) => (
                    <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.month}</span>
                            <span className="font-medium">{item.revenue.toLocaleString('vi-VN')}₫</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                            ></div>
                        </div>
                        <div className="text-xs text-gray-500">
                            Lợi nhuận: {item.profit.toLocaleString('vi-VN')}₫
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 