import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';

interface PeriodFilterProps {
    startDate: string;
    endDate: string;
    onChange: (startDate: string, endDate: string) => void;
}

type PresetKey = 'today' | 'last7days' | 'last30days' | 'thisMonth' | 'custom';

// Lấy thời điểm hiện tại theo múi giờ Việt Nam để tính khoảng ngày chuẩn xác.
const vnNow = (): Date => {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
};

const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Cộng/trừ số ngày tính từ hôm nay (theo giờ VN).
const dayOffset = (offset: number): Date => {
    const d = vnNow();
    d.setDate(d.getDate() + offset);
    return d;
};

const presets: { key: PresetKey; label: string; range?: () => { start: string; end: string } }[] = [
    { key: 'today', label: 'Hôm nay', range: () => ({ start: formatDateForAPI(dayOffset(0)), end: formatDateForAPI(dayOffset(0)) }) },
    { key: 'last7days', label: '7 ngày', range: () => ({ start: formatDateForAPI(dayOffset(-6)), end: formatDateForAPI(dayOffset(0)) }) },
    { key: 'last30days', label: '30 ngày', range: () => ({ start: formatDateForAPI(dayOffset(-29)), end: formatDateForAPI(dayOffset(0)) }) },
    {
        key: 'thisMonth',
        label: 'Tháng này',
        range: () => {
            const n = vnNow();
            return { start: formatDateForAPI(new Date(n.getFullYear(), n.getMonth(), 1)), end: formatDateForAPI(dayOffset(0)) };
        },
    },
    { key: 'custom', label: 'Tùy chọn' },
];

export const PeriodFilter: React.FC<PeriodFilterProps> = ({ startDate, endDate, onChange }) => {
    const [active, setActive] = useState<PresetKey>('thisMonth');

    const handlePreset = (p: (typeof presets)[number]) => {
        setActive(p.key);
        if (p.range) {
            const { start, end } = p.range();
            onChange(start, end);
        }
    };

    return (
        <div className="flex flex-wrap items-end gap-3">
            {/* Nút chọn nhanh khoảng thời gian */}
            <div className="inline-flex flex-wrap rounded-lg bg-gray-100 p-1">
                {presets.map((p) => {
                    const isActive = active === p.key;
                    return (
                        <button
                            key={p.key}
                            type="button"
                            onClick={() => handlePreset(p)}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            {p.label}
                        </button>
                    );
                })}
            </div>

            {/* Ô nhập ngày tùy chọn — chỉ hiện khi chọn "Tùy chọn" */}
            {active === 'custom' && (
                <div className="flex items-end gap-2">
                    <div>
                        <label className="mb-1 block text-xs text-gray-500">Từ ngày</label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => onChange(e.target.value, endDate)}
                            className="w-[150px] text-sm"
                            max={endDate || undefined}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-gray-500">Đến ngày</label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => onChange(startDate, e.target.value)}
                            className="w-[150px] text-sm"
                            min={startDate || undefined}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
