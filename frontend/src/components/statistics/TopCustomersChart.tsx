import React from 'react';
import { TopItemsList } from './TopItemsList';
import { formatCurrency } from '../../lib/utils';
import type { Statistics } from '../../types';

interface TopCustomersChartProps {
    topCustomers: Statistics['topCustomers'];
}

export const TopCustomersChart: React.FC<TopCustomersChartProps> = ({ topCustomers }) => {
    return (
        <TopItemsList
            title=""
            items={topCustomers}
            renderItem={(item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                                {index + 1}
                            </span>
                        </div>
                        <div className="ml-3">
                            <p className="font-medium text-gray-900">{item.customer.name}</p>
                            <p className="text-sm text-gray-500">{item.totalOrders} đơn hàng</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-green-600">
                            {formatCurrency(item.totalAmount)}
                        </p>
                    </div>
                </div>
            )}
        />
    );
};


