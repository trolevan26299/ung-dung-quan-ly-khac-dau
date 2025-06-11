import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface DashboardStats {
    totalOrders: number;
    totalRevenue: number;
    totalDebt: number;
    completedRevenue: number;
    estimatedProfit: number;
    changes?: {
        revenueChange: number;
        ordersChange: number;
        revenueChangeFormatted: string;
        ordersChangeFormatted: string;
    };
    previousPeriod?: {
        totalOrders: number;
        totalRevenue: number;
        totalDebt: number;
        completedRevenue: number;
    };
}

export interface CustomerStats {
    totalCustomers: number;
    currentMonthCustomers: number;
    previousMonthCustomers: number;
    customersChange: number;
    customersChangeFormatted: string;
}

export interface DashboardState {
    stats: DashboardStats | null;
    recentOrders: any[];
    lowStockProducts: any[];
    totalCustomers: number;
    totalAgents: number;
    totalProducts: number;
    customerStats: CustomerStats | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: DashboardState = {
    stats: null,
    recentOrders: [],
    lowStockProducts: [],
    totalCustomers: 0,
    totalAgents: 0,
    totalProducts: 0,
    customerStats: null,
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchStats',
    async () => {
        const response = await api.get('/orders/stats');
        return response.data as DashboardStats;
    }
);

export const fetchRecentOrders = createAsyncThunk(
    'dashboard/fetchRecentOrders',
    async () => {
        const response = await api.get('/orders?page=1&limit=5');
        return response.data as any;
    }
);

export const fetchTotalCustomers = createAsyncThunk(
    'dashboard/fetchTotalCustomers',
    async () => {
        const response = await api.get('/customers?page=1&limit=1');
        return (response.data as any).total as number;
    }
);

export const fetchTotalAgents = createAsyncThunk(
    'dashboard/fetchTotalAgents',
    async () => {
        const response = await api.get('/agents?page=1&limit=1');
        return (response.data as any).total as number;
    }
);

export const fetchTotalProducts = createAsyncThunk(
    'dashboard/fetchTotalProducts',
    async () => {
        const response = await api.get('/products?page=1&limit=1');
        return (response.data as any).total as number;
    }
);

export const fetchCustomerStats = createAsyncThunk(
    'dashboard/fetchCustomerStats',
    async () => {
        const response = await api.get('/customers/stats');
        return response.data as CustomerStats;
    }
);

export const fetchLowStockProducts = createAsyncThunk(
    'dashboard/fetchLowStockProducts',
    async () => {
        const response = await api.get('/products?page=1&limit=1000');
        // Filter products with low stock (stock <= 10)
        const products = (response.data as any).data;
        const lowStockProducts = products.filter((product: any) => 
            product.stockQuantity <= 10
        );
        return lowStockProducts as any[];
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Stats
            .addCase(fetchDashboardStats.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload as DashboardStats;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Có lỗi xảy ra khi tải thống kê';
            })
            // Fetch Recent Orders
            .addCase(fetchRecentOrders.fulfilled, (state, action) => {
                state.recentOrders = (action.payload as any).data;
            })
            // Fetch Total Customers
            .addCase(fetchTotalCustomers.fulfilled, (state, action) => {
                state.totalCustomers = action.payload as number;
            })
            // Fetch Total Agents
            .addCase(fetchTotalAgents.fulfilled, (state, action) => {
                state.totalAgents = action.payload as number;
            })
            // Fetch Total Products
            .addCase(fetchTotalProducts.fulfilled, (state, action) => {
                state.totalProducts = action.payload as number;
            })
            // Fetch Customer Stats
            .addCase(fetchCustomerStats.fulfilled, (state, action) => {
                state.customerStats = action.payload as CustomerStats;
            })
            // Fetch Low Stock Products
            .addCase(fetchLowStockProducts.fulfilled, (state, action) => {
                state.lowStockProducts = action.payload as any[];
            });
    },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer; 