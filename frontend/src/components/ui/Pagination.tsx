import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  className = '',
}) => {
  // Tính toán range hiển thị
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Hiển thị tất cả nếu ít trang
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logic phức tạp hơn cho nhiều trang
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={`flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 ${className}`}>
      {/* Left side - Empty for spacing */}
      <div className="flex-1"></div>

      {/* Center - Navigation */}
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-500">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              );
            }

            const pageNumber = Number(page);
            const isActive = Number(currentPage) === pageNumber;
            
            // Debug log
            console.log(`Page ${pageNumber}: isActive = ${isActive}, currentPage = ${currentPage} (type: ${typeof currentPage})`);
            
            return (
              <div
                key={pageNumber}
                className="inline-block rounded-md"
                style={{
                  backgroundColor: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? 'white' : '#374151'
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(pageNumber)}
                  className="h-8 w-8 p-0"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'inherit',
                    border: 'none'
                  }}
                >
                  {pageNumber}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Next Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Right side - Page Size Selector */}
      <div className="flex-1 flex justify-end">
        {showPageSizeSelector && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Hiển thị:</span>
            <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-700">mục</span>
          </div>
        )}
      </div>
    </div>
  );
};