import React from 'react';
import {
    DollarSign,
    Package,
    ShoppingCart,
    Users
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { DASHBOARD_STATS, CHANGE_TYPE_COLORS } from '../../constants/dashboard';

type ChangeType = 'positive' | 'negative' | 'neutral';

const ICON_MAP = {
    DollarSign,
    ShoppingCart,
    Users,
    Package
} as const;

export const DashboardStats: React.FC = () => {
    const getChangeColor = (changeType: ChangeType) => {
        return CHANGE_TYPE_COLORS[changeType] || CHANGE_TYPE_COLORS.neutral;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DASHBOARD_STATS.map((stat, index) => {
                const Icon = ICON_MAP[stat.icon as keyof typeof ICON_MAP];
                return (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                </div>
                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                    <Icon className="w-6 h-6 text-primary-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center">
                                <span className={`text-sm font-medium ${getChangeColor(stat.changeType)}`}>
                                    {stat.change}
                                </span>
                                <span className="text-sm text-gray-500 ml-2">{stat.description}</span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}; 