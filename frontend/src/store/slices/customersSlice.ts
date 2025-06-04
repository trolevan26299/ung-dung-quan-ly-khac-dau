import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { customersApi } from '../../services/api';
import type { Customer, CreateCustomerRequest, PaginatedResponse, PaginationParams } from '../../types';

interface CustomersState {
  customers: Customer[];
  currentCustomer: Customer | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: CustomersState = {
  customers: [],
  currentCustomer: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (params: PaginationParams | undefined, { rejectWithValue }) => {
    try {
      return await customersApi.getCustomers(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy danh sách khách hàng thất bại');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (data: CreateCustomerRequest, { rejectWithValue }) => {
    try {
      return await customersApi.createCustomer(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Tạo khách hàng thất bại');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, data }: { id: string; data: Partial<CreateCustomerRequest> }, { rejectWithValue }) => {
    try {
      return await customersApi.updateCustomer(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Cập nhật khách hàng thất bại');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (id: string, { rejectWithValue }) => {
    try {
      await customersApi.deleteCustomer(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Xóa khách hàng thất bại');
    }
  }
);

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.currentCustomer = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch customers
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<PaginatedResponse<Customer>>) => {
        state.isLoading = false;
        state.customers = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create customer
      .addCase(createCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.customers.unshift(action.payload);
      })
      // Update customer
      .addCase(updateCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        const index = state.customers.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.currentCustomer?._id === action.payload._id) {
          state.currentCustomer = action.payload;
        }
      })
      // Delete customer
      .addCase(deleteCustomer.fulfilled, (state, action: PayloadAction<string>) => {
        state.customers = state.customers.filter(c => c._id !== action.payload);
        if (state.currentCustomer?._id === action.payload) {
          state.currentCustomer = null;
        }
      });
  },
});

export const { clearError, setCurrentCustomer } = customersSlice.actions;
export default customersSlice.reducer; 