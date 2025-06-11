import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { categoriesApi } from '../../services/api';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest, PaginatedResponse, PaginationParams } from '../../types';

interface CategoriesState {
  categories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchTerm: string;
}

const initialState: CategoriesState = {
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  searchTerm: '',
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (params?: PaginationParams) => {
    const response = await categoriesApi.getCategories(params);
    return response;
  }
);

export const fetchActiveCategories = createAsyncThunk(
  'categories/fetchActiveCategories',
  async () => {
    const response = await categoriesApi.getActiveCategories();
    return response;
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData: CreateCategoryRequest) => {
    const response = await categoriesApi.createCategory(categoryData);
    return response;
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, data }: { id: string; data: UpdateCategoryRequest }) => {
    const response = await categoriesApi.updateCategory(id, data);
    return response;
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: string) => {
    await categoriesApi.deleteCategory(id);
    return id;
  }
);

export const getCategoryById = createAsyncThunk(
  'categories/getCategoryById',
  async (id: string) => {
    const response = await categoriesApi.getCategoryById(id);
    return response;
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
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
    setPagination: (state, action: PayloadAction<Partial<CategoriesState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<PaginatedResponse<Category>>) => {
        state.isLoading = false;
        state.categories = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Lỗi khi tải danh mục';
      })
      
      // Fetch active categories
      .addCase(fetchActiveCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        // This doesn't replace the main categories list, just for dropdowns
      })
      
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        state.categories.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Lỗi khi tạo danh mục';
      })
      
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        const index = state.categories.findIndex(cat => cat._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        if (state.selectedCategory?._id === action.payload._id) {
          state.selectedCategory = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Lỗi khi cập nhật danh mục';
      })
      
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.categories = state.categories.filter(cat => cat._id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedCategory?._id === action.payload) {
          state.selectedCategory = null;
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Lỗi khi xóa danh mục';
      })
      
      // Get category by ID
      .addCase(getCategoryById.fulfilled, (state, action: PayloadAction<Category>) => {
        state.selectedCategory = action.payload;
      });
  },
});

export const {
  setSelectedCategory,
  clearSelectedCategory,
  setSearchTerm,
  setPage,
  setPageSize,
  setPagination,
  clearError,
} = categoriesSlice.actions;

export default categoriesSlice.reducer; 