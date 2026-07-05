import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationState } from '../../hooks/usePagination';

interface PaginationProps {
    pagination: PaginationState;
    onPageChange: (page: number) => void;
    onPreviousPage: () => void;
    onNextPage: () => void;
    onLimitChange?: (limit: number) => void;
    showInfo?: boolean;
    className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
    pagination,
    onPageChange,
    onPreviousPage,
    onNextPage,
    onLimitChange,
    showInfo = true,
    className = ''
}) => {
    const { currentPage, totalPages, total, limit } = pagination;

    const showNavigation = totalPages > 1;
    const startItem = total === 0 ? 0 : (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, total);

    // Danh sách số trang hiển thị (rút gọn bằng dấu … khi quá nhiều trang).
    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                if (i !== 1 && i !== totalPages) pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push('...');
            if (totalPages > 1) pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
            {/* Thông tin + chọn số dòng mỗi trang */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
                {showInfo && (
                    <span className="tabular-nums">
                        <span className="font-semibold text-gray-900">{startItem}</span>
                        <span className="mx-0.5">–</span>
                        <span className="font-semibold text-gray-900">{endItem}</span>
                        <span className="mx-1 text-gray-400">/</span>
                        <span className="font-semibold text-gray-900">{total}</span>
                    </span>
                )}

                {onLimitChange && (
                    <label className="flex items-center gap-2">
                        <span className="hidden text-gray-500 sm:inline">Hiển thị</span>
                        <select
                            value={limit}
                            onChange={(e) => onLimitChange(Number(e.target.value))}
                            className="h-8 rounded-lg border border-gray-200 bg-white pl-2.5 pr-7 text-sm text-gray-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        >
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </label>
                )}
            </div>

            {/* Điều hướng trang */}
            {showNavigation ? (
                <nav className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={onPreviousPage}
                        disabled={currentPage === 1}
                        aria-label="Trang trước"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {getPageNumbers().map((page, index) =>
                        page === '...' ? (
                            <span key={`ellipsis-${index}`} className="px-1.5 text-sm text-gray-400">
                                …
                            </span>
                        ) : (
                            <button
                                key={page}
                                type="button"
                                onClick={() => onPageChange(page as number)}
                                aria-current={currentPage === page ? 'page' : undefined}
                                className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm font-medium tabular-nums transition-colors ${
                                    currentPage === page
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {page}
                            </button>
                        )
                    )}

                    <button
                        type="button"
                        onClick={onNextPage}
                        disabled={currentPage === totalPages}
                        aria-label="Trang sau"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </nav>
            ) : (
                <span className="text-sm text-gray-400">
                    {total > 0 ? 'Tất cả trên 1 trang' : 'Không có dữ liệu'}
                </span>
            )}
        </div>
    );
};
