import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import type { PaginationState } from '../../hooks/usePagination';

interface PaginationProps {
    pagination: PaginationState;
    onPageChange: (page: number) => void;
    onPreviousPage: () => void;
    onNextPage: () => void;
    showInfo?: boolean;
    className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
    pagination,
    onPageChange,
    onPreviousPage,
    onNextPage,
    showInfo = true,
    className = ''
}) => {
    const { currentPage, totalPages, total, limit } = pagination;

    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, total);

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (i !== 1 && i !== totalPages) {
                    pages.push(i);
                }
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className={`flex items-center justify-between ${className}`}>
            {showInfo && (
                <div className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{startItem}</span> đến{' '}
                    <span className="font-medium">{endItem}</span> trong{' '}
                    <span className="font-medium">{total}</span> kết quả
                </div>
            )}

            <nav className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onPreviousPage}
                    disabled={currentPage === 1}
                    className="flex items-center"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Trước
                </Button>

                <div className="flex items-center space-x-1">
                    {getPageNumbers().map((page, index) => (
                        <React.Fragment key={index}>
                            {page === '...' ? (
                                <span className="px-3 py-2 text-gray-500">...</span>
                            ) : (
                                <Button
                                    variant={currentPage === page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onPageChange(page as number)}
                                    className="min-w-[40px]"
                                >
                                    {page}
                                </Button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center"
                >
                    Sau
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </nav>
        </div>
    );
}; 