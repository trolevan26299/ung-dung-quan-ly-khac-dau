import React, { useState } from 'react';
import { Users, UserCheck } from 'lucide-react';
import { TopCustomersChart } from './TopCustomersChart';
import { TopAgentsChart } from './TopAgentsChart';
import { cn } from '../../lib/utils';
import type { Statistics } from '../../types';

interface TopPartnersChartProps {
    topCustomers: Statistics['topCustomers'];
    topAgents: Statistics['topAgents'];
}

// Gộp "Khách hàng hàng đầu" và "Đại lý hàng đầu" vào một thẻ có tab để tiết kiệm diện tích.
export const TopPartnersChart: React.FC<TopPartnersChartProps> = ({ topCustomers, topAgents }) => {
    const [tab, setTab] = useState<'customers' | 'agents'>('customers');

    const tabs = [
        { key: 'customers' as const, label: 'Khách hàng', icon: Users, count: topCustomers?.length ?? 0 },
        { key: 'agents' as const, label: 'Đại lý', icon: UserCheck, count: topAgents?.length ?? 0 },
    ];

    return (
        <div className="space-y-3">
            {/* Bộ chuyển tab */}
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
                {tabs.map((t) => {
                    const Icon = t.icon;
                    const isActive = tab === t.key;
                    return (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setTab(t.key)}
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {tab === 'customers' ? (
                <TopCustomersChart topCustomers={topCustomers} />
            ) : (
                <TopAgentsChart topAgents={topAgents} />
            )}
        </div>
    );
};
