/* eslint-disable @typescript-eslint/no-redeclare */
import {
    BarChart3,
    Download,
    RefreshCw
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { statisticsApi } from '../services/api';
import type { Statistics as StatisticsType } from '../types';
import { formatTableDate } from '../lib/utils';

// Statistics Components
import { StatisticsCards } from '../components/statistics/StatisticsCards';
import { RevenueChart } from '../components/statistics/RevenueChart';
import { TopCustomersChart } from '../components/statistics/TopCustomersChart';
import { TopAgentsChart } from '../components/statistics/TopAgentsChart';
import { TopProductsChart } from '../components/statistics/TopProductsChart';
import { AdditionalMetrics } from '../components/statistics/AdditionalMetrics';
import { DateRangePicker } from '../components/statistics/DateRangePicker';

// Main Statistics Page
export const Statistics: React.FC = () => {
    const [statistics, setStatistics] = useState<StatisticsType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper function để format date giữ nguyên timezone địa phương
    const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Lấy ngày đầu tháng hiện tại
    const getCurrentMonthStart = (): string => {
        const now = new Date();
        const vietnamNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        const date = new Date(vietnamNow.getFullYear(), vietnamNow.getMonth(), 1);
        return formatDateForAPI(date);
    };

    // Lấy ngày hiện tại
    const getCurrentDate = (): string => {
        const now = new Date();
        const vietnamNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        return formatDateForAPI(vietnamNow);
    };

    const [startDate, setStartDate] = useState(() => getCurrentMonthStart());
    const [endDate, setEndDate] = useState(() => getCurrentDate());

    const fetchStatistics = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await statisticsApi.getOverview({
                startDate,
                endDate
            });
            setStatistics(response);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi tải thống kê');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, [startDate, endDate]);

    const handleExportReport = () => {
        // Placeholder for export functionality
        alert('Tính năng xuất báo cáo đang được phát triển');
    };

    const handleRefresh = () => {
        fetchStatistics();
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <BarChart3 className="w-7 h-7 mr-3 text-primary-600" />
                        Thống kê báo cáo
                    </h1>
                    <p className="text-gray-500 mt-0.5 text-sm">
                        Phân tích doanh thu và hiệu suất kinh doanh
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                    <Button variant="outline" onClick={handleExportReport}>
                        <Download className="w-4 h-4 mr-2" />
                        Xuất báo cáo
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <DateRangePicker
                                startDate={startDate}
                                endDate={endDate}
                                onStartDateChange={setStartDate}
                                onEndDateChange={setEndDate}
                            />
                        </div>
                        <div className="text-sm text-gray-500">
                            Dữ liệu từ {formatTableDate(startDate)} đến {formatTableDate(endDate)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
                    <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
                </div>
            )}

            {/* Statistics Content */}
            {!isLoading && statistics && (
                <>
                    {/* Overview Cards */}
                    <StatisticsCards statistics={statistics} />

                    {/* Charts and Lists */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Biểu đồ doanh thu</CardTitle>
                               
                            </CardHeader>
                            <CardContent>
                                <RevenueChart data={statistics.revenueByMonth} />
                            </CardContent>
                        </Card>

                        {/* Top Customers */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Khách hàng hàng đầu</CardTitle>
                                <CardDescription>
                                    Top khách hàng theo doanh thu
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TopCustomersChart topCustomers={statistics.topCustomers} />
                            </CardContent>
                        </Card>

                        {/* Top Agents */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Đại lý hàng đầu</CardTitle>
                                <CardDescription>
                                    Top đại lý theo doanh thu
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TopAgentsChart topAgents={statistics.topAgents} />
                            </CardContent>
                        </Card>

                        {/* Top Products */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Sản phẩm bán chạy</CardTitle>
                                <CardDescription>
                                    Top sản phẩm theo doanh thu
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TopProductsChart topProducts={statistics.topProducts} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Additional Metrics */}
                    <AdditionalMetrics statistics={statistics} />
                </>
            )}

            {/* Empty State */}
            {!isLoading && !statistics && !error && (
                <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Chưa có dữ liệu thống kê
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Dữ liệu thống kê sẽ hiển thị khi có đơn hàng
                    </p>
                    <Button onClick={handleRefresh}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Tải lại
                    </Button>
                </div>
            )}
        </div>
    );
}; 