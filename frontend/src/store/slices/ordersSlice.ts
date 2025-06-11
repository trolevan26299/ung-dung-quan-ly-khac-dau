import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ordersApi } from '../../services/api';
import type { Order, CreateOrderRequest, OrderQuery } from '../../types';

interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  statusFilter: string;
  paymentFilter: string;
  lastUpdated: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  searchTerm: '',
  statusFilter: '',
  paymentFilter: '',
  lastUpdated: 0,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: OrderQuery = {}, { rejectWithValue }) => {
    try {
      // Loại bỏ các tham số rỗng
      const cleanParams: any = {};
      if (params.page) cleanParams.page = params.page;
      if (params.limit) cleanParams.limit = params.limit;
      if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
      if (params.status && params.status.trim()) cleanParams.status = params.status.trim();
      if (params.paymentStatus && params.paymentStatus.trim()) cleanParams.paymentStatus = params.paymentStatus.trim();
      if (params.customerId && params.customerId.trim()) cleanParams.customerId = params.customerId.trim();
      if (params.agentId && params.agentId.trim()) cleanParams.agentId = params.agentId.trim();
      if (params.dateFrom && params.dateFrom.trim()) cleanParams.dateFrom = params.dateFrom.trim();
      if (params.dateTo && params.dateTo.trim()) cleanParams.dateTo = params.dateTo.trim();
      
      console.log('📤 API Call params:', cleanParams);
      const response = await ordersApi.getOrders(cleanParams);
      console.log('📥 API Response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ API Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Lấy danh sách đơn hàng thất bại');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await ordersApi.getOrder(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin đơn hàng thất bại');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: CreateOrderRequest, { rejectWithValue }) => {
    try {
      const response = await ordersApi.createOrder(orderData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Tạo đơn hàng thất bại');
    }
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ id, data }: { id: string; data: Partial<CreateOrderRequest> }, { rejectWithValue }) => {
    try {
      const response = await ordersApi.updateOrder(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Cập nhật đơn hàng thất bại');
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      await ordersApi.deleteOrder(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Xóa đơn hàng thất bại');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    setPaymentFilter: (state, action: PayloadAction<string>) => {
      state.paymentFilter = action.payload;
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearOrders: (state) => {
      state.orders = [];
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data || action.payload;
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Order By ID
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Order
      .addCase(updateOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        console.log('🔄 Update Order Fulfilled:', action.payload);
        state.isLoading = false;
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        console.log('📍 Found order at index:', index);
        if (index !== -1) {
          console.log('📝 Updating order in state...');
          state.orders[index] = action.payload;
        }
        // Update currentOrder nếu đang xem order này
        if (state.currentOrder && state.currentOrder._id === action.payload._id) {
          console.log('👁️ Updating currentOrder in state...');
          state.currentOrder = action.payload;
        }
        // Update timestamp to force re-render
        state.lastUpdated = Date.now();
        console.log('✅ Orders state after update:', state.orders);
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Order
      .addCase(deleteOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = state.orders.filter(o => o._id !== action.payload);
        state.pagination.total -= 1;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setSearchTerm, 
  setStatusFilter, 
  setPaymentFilter, 
  setCurrentOrder, 
  clearError, 
  clearOrders 
} = ordersSlice.actions;

export default ordersSlice.reducer;