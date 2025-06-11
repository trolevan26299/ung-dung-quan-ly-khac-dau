import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { usersApi } from '../../services/api';
import type { User, CreateUserRequest, UpdateUserRequest, PaginationParams } from '../../types';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params?: PaginationParams) => {
    const response = await usersApi.getUsers(params);
    return response;
  }
);

export const fetchUserStats = createAsyncThunk(
  'users/fetchUserStats',
  async () => {
    const response = await usersApi.getUserStats();
    return response;
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (data: CreateUserRequest) => {
    const response = await usersApi.createUser(data);
    return response;
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }: { id: string; data: UpdateUserRequest }) => {
    const response = await usersApi.updateUser(id, data);
    return response;
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string) => {
    await usersApi.deleteUser(id);
    return id;
  }
);

// State interface
interface UsersState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    totalUsers: number;
    adminCount: number;
    employeeCount: number;
    activeCount: number;
  } | null;
}

const initialState: UsersState = {
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  stats: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        
        // Handle both old and new response structures
        if (action.payload.data) {
          // New structure: {data: [...], page, limit, total, totalPages}
          state.users = action.payload.data;
          state.pagination = {
            total: action.payload.total,
            page: action.payload.page,
            limit: action.payload.limit,
            totalPages: action.payload.totalPages,
          };
        } else if (action.payload.users) {
          // Old structure: {users: [...], pagination: {...}}
          state.users = action.payload.users;
          state.pagination = {
            total: action.payload.pagination.total,
            page: action.payload.pagination.page,
            limit: action.payload.pagination.limit,
            totalPages: action.payload.pagination.totalPages,
          };
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Lỗi khi tải danh sách người dùng';
      })
      
      // Fetch user stats
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      // Create user
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.users.unshift(action.payload);
        state.pagination.total += 1;
        // Update stats
        if (state.stats) {
          state.stats.totalUsers += 1;
          if (action.payload.role === 'admin') {
            state.stats.adminCount += 1;
          } else if (action.payload.role === 'employee') {
            state.stats.employeeCount += 1;
          }
          if (action.payload.isActive) {
            state.stats.activeCount += 1;
          }
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Lỗi khi tạo người dùng';
      })
      
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        const oldUser = state.users.find(user => user._id === action.payload._id);
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser?._id === action.payload._id) {
          state.currentUser = action.payload;
        }
        
        // Update stats if role or active status changed
        if (state.stats && oldUser) {
          // Role changes
          if (oldUser.role !== action.payload.role) {
            if (oldUser.role === 'admin') state.stats.adminCount -= 1;
            if (oldUser.role === 'employee') state.stats.employeeCount -= 1;
            if (action.payload.role === 'admin') state.stats.adminCount += 1;
            if (action.payload.role === 'employee') state.stats.employeeCount += 1;
          }
          // Active status changes
          if (oldUser.isActive !== action.payload.isActive) {
            if (action.payload.isActive) {
              state.stats.activeCount += 1;
            } else {
              state.stats.activeCount -= 1;
            }
          }
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Lỗi khi cập nhật người dùng';
      })
      
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        const deletedUser = state.users.find(user => user._id === action.payload);
        state.users = state.users.filter(user => user._id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentUser?._id === action.payload) {
          state.currentUser = null;
        }
        
        // Update stats
        if (state.stats && deletedUser) {
          state.stats.totalUsers -= 1;
          if (deletedUser.role === 'admin') {
            state.stats.adminCount -= 1;
          } else if (deletedUser.role === 'employee') {
            state.stats.employeeCount -= 1;
          }
          if (deletedUser.isActive) {
            state.stats.activeCount -= 1;
          }
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Lỗi khi xóa người dùng';
      });
  },
});

export const { clearError, clearCurrentUser, setCurrentUser } = usersSlice.actions;
export default usersSlice.reducer; 