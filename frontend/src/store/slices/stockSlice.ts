import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { stockApi } from '../../services/api';
import type { StockTransaction, CreateStockTransactionRequest, StockQueryParams } from '../../types';

interface StockState {
  transactions: StockTransaction[];
  currentTransaction: StockTransaction | null;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  typeFilter: string;
  startDate: string;
  endDate: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: StockState = {
  transactions: [],
  currentTransaction: null,
  isLoading: false,
  error: null,
  searchTerm: '',
  typeFilter: '',
  startDate: '',
  endDate: '',
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'stock/fetchTransactions',
  async (params: StockQueryParams = {}, { rejectWithValue }) => {
    try {
      const response = await stockApi.getStockTransactions(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy danh sách giao dịch kho thất bại');
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  'stock/fetchTransactionById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await stockApi.getProductStock(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin giao dịch thất bại');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'stock/createTransaction',
  async (transactionData: CreateStockTransactionRequest, { rejectWithValue }) => {
    try {
      const response = await stockApi.createStockTransaction(transactionData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Tạo giao dịch kho thất bại');
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'stock/updateTransaction',
  async ({ id, data }: { id: string; data: Partial<CreateStockTransactionRequest> }, { rejectWithValue }) => {
    // API không có update method, tạm thời return error
    return rejectWithValue('Chức năng cập nhật chưa được hỗ trợ');
  }
);

export const deleteTransaction = createAsyncThunk(
  'stock/deleteTransaction', 
  async (id: string, { rejectWithValue }) => {
    // API không có delete method, tạm thời return error
    return rejectWithValue('Chức năng xóa chưa được hỗ trợ');
  }
);

const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setTypeFilter: (state, action: PayloadAction<string>) => {
      state.typeFilter = action.payload;
    },
    setStartDate: (state, action: PayloadAction<string>) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action: PayloadAction<string>) => {
      state.endDate = action.payload;
    },
    setCurrentTransaction: (state, action: PayloadAction<StockTransaction | null>) => {
      state.currentTransaction = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearTransactions: (state) => {
      state.transactions = [];
      state.pagination = initialState.pagination;
    },
    clearFilters: (state) => {
      state.searchTerm = '';
      state.typeFilter = '';
      state.startDate = '';
      state.endDate = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.data || action.payload;
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
        };
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Transaction By ID
      .addCase(fetchTransactionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.isLoading = false;
        // getProductStock returns different data structure, không set currentTransaction
        state.error = null;
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Transaction
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Transaction
      .addCase(updateTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        // Do nothing since update is not supported
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        // Do nothing since delete is not supported
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setSearchTerm, 
  setTypeFilter, 
  setStartDate,
  setEndDate,
  setCurrentTransaction, 
  clearError, 
  clearTransactions,
  clearFilters
} = stockSlice.actions;
export default stockSlice.reducer; 