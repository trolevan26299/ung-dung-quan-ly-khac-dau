import { useState, useCallback, useMemo } from 'react';
import { PAGINATION } from '../constants';

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
}

export interface UsePaginationReturn {
  pagination: PaginationState;
  params: PaginationParams;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  updatePagination: (data: { total: number; totalPages: number }) => void;
  resetPagination: () => void;
}

export const usePagination = (
  initialLimit: number = PAGINATION.DEFAULT_LIMIT
): UsePaginationReturn => {
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: PAGINATION.DEFAULT_PAGE,
    totalPages: 1,
    total: 0,
    limit: initialLimit
  });

  const [search, setSearchState] = useState('');

  // Memoize params để tránh re-create mỗi lần render
  const params = useMemo((): PaginationParams => ({
    page: pagination.currentPage,
    limit: pagination.limit,
    search: search || undefined
  }), [pagination.currentPage, pagination.limit, search]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }));
    }
  }, [pagination.totalPages]);

  const goToNextPage = useCallback(() => {
    goToPage(pagination.currentPage + 1);
  }, [pagination.currentPage, goToPage]);

  const goToPreviousPage = useCallback(() => {
    goToPage(pagination.currentPage - 1);
  }, [pagination.currentPage, goToPage]);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({
      ...prev,
      limit,
      currentPage: PAGINATION.DEFAULT_PAGE // Reset to first page when changing limit
    }));
  }, []);

  const setSearch = useCallback((searchValue: string) => {
    setSearchState(searchValue);
    setPagination(prev => ({
      ...prev,
      currentPage: PAGINATION.DEFAULT_PAGE // Reset to first page when searching
    }));
  }, []);

  const updatePagination = useCallback((data: { total: number; totalPages: number }) => {
    setPagination(prev => ({
      ...prev,
      total: data.total,
      totalPages: data.totalPages
    }));
  }, []);

  const resetPagination = useCallback(() => {
    setPagination({
      currentPage: PAGINATION.DEFAULT_PAGE,
      totalPages: 1,
      total: 0,
      limit: initialLimit
    });
    setSearchState('');
  }, [initialLimit]);

  return {
    pagination,
    params,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    setLimit,
    setSearch,
    updatePagination,
    resetPagination
  };
}; 