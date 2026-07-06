import React from 'react';
import { TopItemsList } from './TopItemsList';
import { formatCurrency } from '../../lib/utils';
import type { Statistics } from '../../types';

interface TopAgentsChartProps {
    topAgents: Statistics['topAgents'];
}

export const TopAgentsChart: React.FC<TopAgentsChartProps> = ({ topAgents }) => {
    return (
        <TopItemsList
            title=""
            items={topAgents}
            renderItem={(item, index) => (
                <div key={index} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 p-2.5 transition-colors hover:bg-gray-100">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-600">
                            {index + 1}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">{item.agent.name}</p>
                            <p className="text-sm text-gray-500">{item.totalOrders} đơn hàng</p>
                        </div>
                    </div>
                    <div className="ml-3 shrink-0 text-right">
                        <p className="font-bold tabular-nums text-emerald-600">
                            {formatCurrency(item.totalAmount)}
                        </p>
                    </div>
                </div>
            )}
        />
    );
}; 