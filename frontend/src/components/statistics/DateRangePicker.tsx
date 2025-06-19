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

// Helper function để tạo date với múi giờ Việt Nam
const createVietnamDate = (dateOffset = 0): Date => {
  const now = new Date();
  const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  vietnamTime.setDate(vietnamTime.getDate() + dateOffset);
  return vietnamTime;
};

const createVietnamDateFromMonthYear = (year: number, month: number, day = 1): Date => {
  const date = new Date();
  const vietnamTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  vietnamTime.setFullYear(year, month, day);
  return vietnamTime;
};

const periodOptions: PeriodOption[] = [
  {
    value: 'today',
    label: 'Hôm nay',
    getStartDate: () => createVietnamDate(0),
    getEndDate: () => createVietnamDate(0),
  },
  {
    value: 'yesterday',
    label: 'Hôm qua',
    getStartDate: () => createVietnamDate(-1),
    getEndDate: () => createVietnamDate(-1),
  },
  {
    value: 'last7days',
    label: '7 ngày qua',
    getStartDate: () => createVietnamDate(-7),
    getEndDate: () => createVietnamDate(0),
  },
  {
    value: 'last30days',
    label: '30 ngày qua',
    getStartDate: () => createVietnamDate(-30),
    getEndDate: () => createVietnamDate(0),
  },
  {
    value: 'thisMonth',
    label: 'Tháng này',
    getStartDate: () => {
      const vietnamTime = createVietnamDate(0);
      return createVietnamDateFromMonthYear(vietnamTime.getFullYear(), vietnamTime.getMonth(), 1);
    },
    getEndDate: () => createVietnamDate(0),
  },
  {
    value: 'lastMonth',
    label: 'Tháng trước',
    getStartDate: () => {
      const vietnamTime = createVietnamDate(0);
      return createVietnamDateFromMonthYear(vietnamTime.getFullYear(), vietnamTime.getMonth() - 1, 1);
    },
    getEndDate: () => {
      const vietnamTime = createVietnamDate(0);
      return createVietnamDateFromMonthYear(vietnamTime.getFullYear(), vietnamTime.getMonth(), 0);
    },
  },
  {
    value: 'thisQuarter',
    label: 'Quý này',
    getStartDate: () => {
      const vietnamTime = createVietnamDate(0);
      const quarter = Math.floor(vietnamTime.getMonth() / 3);
      return createVietnamDateFromMonthYear(vietnamTime.getFullYear(), quarter * 3, 1);
    },
    getEndDate: () => createVietnamDate(0),
  },
  {
    value: 'thisYear',
    label: 'Năm này',
    getStartDate: () => {
      const vietnamTime = createVietnamDate(0);
      return createVietnamDateFromMonthYear(vietnamTime.getFullYear(), 0, 1);
    },
    getEndDate: () => createVietnamDate(0),
  },
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange
}) => {
    const [selectedPeriod, setSelectedPeriod] = useState<string>('thisMonth');

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