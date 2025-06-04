import React from 'react';

interface TopItemsListProps<T> {
    title: string;
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
}

export function TopItemsList<T>({ title, items, renderItem }: TopItemsListProps<T>) {
    return (
        <div className="space-y-4">
            <h3 className="font-medium text-gray-900">{title}</h3>
            <div className="space-y-3">
                {items.length === 0 ? (
                    <p className="text-gray-500 text-sm">Chưa có dữ liệu</p>
                ) : (
                    items.map((item, index) => renderItem(item, index))
                )}
            </div>
        </div>
    );
} 