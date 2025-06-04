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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array(4).fill(0).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Tổng doanh thu</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(statistics.totalRevenue)}
                            </p>
                            <div className="flex items-center mt-1">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-600 ml-1">+12.5%</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Lợi nhuận</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(statistics.totalProfit)}
                            </p>
                            <div className="flex items-center mt-1">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-600 ml-1">+8.2%</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <TrendingDown className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Công nợ</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(statistics.totalDebt)}
                            </p>
                            <div className="flex items-center mt-1">
                                <TrendingDown className="w-4 h-4 text-red-500" />
                                <span className="text-sm text-red-600 ml-1">-5.1%</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <ShoppingCart className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(statistics.totalOrders)}
                            </p>
                            <div className="flex items-center mt-1">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-600 ml-1">+15.3%</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}; 