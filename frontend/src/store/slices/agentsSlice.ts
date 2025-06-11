import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { agentsApi } from '../../services/api';
import type { Agent, CreateAgentRequest, PaginatedResponse, PaginationParams } from '../../types';

interface AgentsState {
  agents: Agent[];
  currentAgent: Agent | null;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: AgentsState = {
  agents: [],
  currentAgent: null,
  isLoading: false,
  error: null,
  searchTerm: '',
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const fetchAgents = createAsyncThunk(
  'agents/fetchAgents',
  async (params: PaginationParams | undefined, { rejectWithValue }) => {
    try {
      return await agentsApi.getAgents(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy danh sách đại lý thất bại');
    }
  }
);

export const createAgent = createAsyncThunk(
  'agents/createAgent',
  async (data: CreateAgentRequest, { rejectWithValue }) => {
    try {
      return await agentsApi.createAgent(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Tạo đại lý thất bại');
    }
  }
);

export const updateAgent = createAsyncThunk(
  'agents/updateAgent',
  async ({ id, data }: { id: string; data: Partial<CreateAgentRequest> }, { rejectWithValue }) => {
    try {
      return await agentsApi.updateAgent(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Cập nhật đại lý thất bại');
    }
  }
);

export const deleteAgent = createAsyncThunk(
  'agents/deleteAgent',
  async (id: string, { rejectWithValue }) => {
    try {
      await agentsApi.deleteAgent(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Xóa đại lý thất bại');
    }
  }
);

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentAgent: (state, action: PayloadAction<Agent | null>) => {
      state.currentAgent = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset to first page when changing page size
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAgents.fulfilled, (state, action: PayloadAction<PaginatedResponse<Agent>>) => {
        state.isLoading = false;
        state.agents = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createAgent.fulfilled, (state, action: PayloadAction<Agent>) => {
        state.agents.unshift(action.payload);
      })
      .addCase(updateAgent.fulfilled, (state, action: PayloadAction<Agent>) => {
        const index = state.agents.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.agents[index] = action.payload;
        }
        if (state.currentAgent?._id === action.payload._id) {
          state.currentAgent = action.payload;
        }
      })
      .addCase(deleteAgent.fulfilled, (state, action: PayloadAction<string>) => {
        state.agents = state.agents.filter(a => a._id !== action.payload);
        if (state.currentAgent?._id === action.payload) {
          state.currentAgent = null;
        }
      });
  },
});

export const { clearError, setCurrentAgent, setSearchTerm, setPage, setPageSize } = agentsSlice.actions;
export default agentsSlice.reducer; 