import React from 'react';
import { Input } from '../ui/Input';

interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange
}) => {
    return (
        <div className="flex items-center space-x-2">
            <div>
                <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
                <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="text-sm"
                />
            </div>
            <div>
                <label className="block text-xs text-gray-500 mb-1">Đến ngày</label>
                <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className="text-sm"
                />
            </div>
        </div>
    );
}; 