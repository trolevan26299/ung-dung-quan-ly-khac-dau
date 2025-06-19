import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { statisticsApi } from '../../services/api';
import type { Statistics } from '../../types';

interface StatisticsState {
  statistics: Statistics | null;
  isLoading: boolean;
  error: string | null;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  refreshKey: number;
}

const getVietnamStartOfMonth = (): string => {
    const vietnamNow = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    const date = new Date(vietnamNow);
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
};

const getVietnamCurrentDate = (): string => {
    const vietnamNow = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    return new Date(vietnamNow).toISOString().split('T')[0];
};

const initialState: StatisticsState = {
  statistics: null,
  isLoading: false,
  error: null,
  dateRange: {
    startDate: getVietnamStartOfMonth(),
    endDate: getVietnamCurrentDate(),
  },
  refreshKey: 0,
};

// Async thunks
export const fetchStatistics = createAsyncThunk(
  'statistics/fetchStatistics',
  async (params: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await statisticsApi.getOverview(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thống kê thất bại');
    }
  }
);

export const exportReport = createAsyncThunk(
  'statistics/exportReport',
  async (params: { startDate?: string; endDate?: string; format?: 'excel' | 'pdf' } = {}, { rejectWithValue }) => {
    try {
      // API không có exportReport method, tạm thời return error
      return rejectWithValue('Chức năng xuất báo cáo chưa được hỗ trợ');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Xuất báo cáo thất bại');
    }
  }
);

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.dateRange = action.payload;
    },
    setStartDate: (state, action: PayloadAction<string>) => {
      state.dateRange.startDate = action.payload;
    },
    setEndDate: (state, action: PayloadAction<string>) => {
      state.dateRange.endDate = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    refreshStatistics: (state) => {
      state.refreshKey += 1;
    },
    clearStatistics: (state) => {
      state.statistics = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Statistics
      .addCase(fetchStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Export Report
      .addCase(exportReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportReport.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(exportReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setDateRange, 
  setStartDate, 
  setEndDate, 
  clearError, 
  refreshStatistics, 
  clearStatistics 
} = statisticsSlice.actions;
export default statisticsSlice.reducer; 