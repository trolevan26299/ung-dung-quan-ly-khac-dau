import React, { useState } from 'react';
import { Input } from '../ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
}

type PeriodOption = {
  value: string;
  label: string;
  getStartDate: () => Date;
  getEndDate: () => Date;
};

const periodOptions: PeriodOption[] = [
  {
    value: 'today',
    label: 'Hôm nay',
    getStartDate: () => new Date(),
    getEndDate: () => new Date(),
  },
  {
    value: 'yesterday',
    label: 'Hôm qua',
    getStartDate: () => {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return date;
    },
    getEndDate: () => {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return date;
    },
  },
  {
    value: 'last7days',
    label: '7 ngày qua',
    getStartDate: () => {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      return date;
    },
    getEndDate: () => new Date(),
  },
  {
    value: 'last30days',
    label: '30 ngày qua',
    getStartDate: () => {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      return date;
    },
    getEndDate: () => new Date(),
  },
  {
    value: 'thisMonth',
    label: 'Tháng này',
    getStartDate: () => {
      const date = new Date();
      return new Date(date.getFullYear(), date.getMonth(), 1);
    },
    getEndDate: () => new Date(),
  },
  {
    value: 'lastMonth',
    label: 'Tháng trước',
    getStartDate: () => {
      const date = new Date();
      return new Date(date.getFullYear(), date.getMonth() - 1, 1);
    },
    getEndDate: () => {
      const date = new Date();
      return new Date(date.getFullYear(), date.getMonth(), 0);
    },
  },
  {
    value: 'thisQuarter',
    label: 'Quý này',
    getStartDate: () => {
      const date = new Date();
      const quarter = Math.floor(date.getMonth() / 3);
      return new Date(date.getFullYear(), quarter * 3, 1);
    },
    getEndDate: () => new Date(),
  },
  {
    value: 'thisYear',
    label: 'Năm này',
    getStartDate: () => {
      const date = new Date();
      return new Date(date.getFullYear(), 0, 1);
    },
    getEndDate: () => new Date(),
  },
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange
}) => {
    const [selectedPeriod, setSelectedPeriod] = useState<string>('thisMonth');
    const today = new Date().toISOString().split('T')[0];

    const handlePeriodChange = (periodValue: string) => {
        setSelectedPeriod(periodValue);
        const period = periodOptions.find(p => p.value === periodValue);
        if (period) {
            const start = period.getStartDate();
            const end = period.getEndDate();
            onStartDateChange(start.toISOString().split('T')[0]);
            onEndDateChange(end.toISOString().split('T')[0]);
        }
    };

    const handleManualDateChange = () => {
        // Reset selected period khi user thay đổi date thủ công
        setSelectedPeriod('');
    };

    return (
        <div className="flex items-center space-x-4">
            {/* Quick Period Selector */}
            <div>
                <label className="block text-xs text-gray-500 mb-1">Chu kỳ</label>
                <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Chọn chu kỳ" />
                    </SelectTrigger>
                    <SelectContent>
                        {periodOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Start Date */}
            <div>
                <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
                <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                        onStartDateChange(e.target.value);
                        handleManualDateChange();
                    }}
                    className="w-[140px] text-sm"
                    max={endDate || undefined}
                />
            </div>

            {/* End Date */}
            <div>
                <label className="block text-xs text-gray-500 mb-1">Đến ngày</label>
                <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                        onEndDateChange(e.target.value);
                        handleManualDateChange();
                    }}
                    className="w-[140px] text-sm"
                    min={startDate || undefined}
                />
            </div>
        </div>
    );
}; 