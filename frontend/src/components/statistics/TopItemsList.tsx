import React from 'react';

interface TopItemsListProps<T> {
    title: string;
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
}

export function TopItemsList<T>({ title, items, renderItem }: TopItemsListProps<T>) {
    return (
        <div className="space-y-3">
            {title ? <h3 className="font-medium text-gray-900">{title}</h3> : null}
            <div className="space-y-2.5">
                {!items || items.length === 0 ? (
                    <p className="py-6 text-center text-sm text-gray-400">Chưa có dữ liệu</p>
                ) : (
                    items.map((item, index) => renderItem(item, index))
                )}
            </div>
        </div>
    );
} 