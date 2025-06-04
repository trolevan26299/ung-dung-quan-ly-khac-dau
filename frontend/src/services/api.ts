import axios from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  User,
  Customer,
  CreateCustomerRequest,
  Agent,
  CreateAgentRequest,
  Product,
  CreateProductRequest,
  Order,
  CreateOrderRequest,
  StockTransaction,
  CreateStockTransactionRequest,
  Statistics,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
  CreateUserRequest,
  UpdateUserRequest
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Chỉ logout nếu không phải đang ở trang login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data as LoginResponse;
  },
  
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data as User;
  },
};

// Users API
export const usersApi = {
  getUsers: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users', { params });
    return response.data as PaginatedResponse<User>;
  },
  
  getUser: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data as User;
  },
  
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data as User;
  },
  
  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data as User;
  },
  
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

// Customers API
export const customersApi = {
  getCustomers: async (params?: PaginationParams): Promise<PaginatedResponse<Customer>> => {
    const response = await api.get('/customers', { params });
    return response.data as PaginatedResponse<Customer>;
  },
  
  getCustomer: async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data as Customer;
  },
  
  createCustomer: async (data: CreateCustomerRequest): Promise<Customer> => {
    const response = await api.post('/customers', data);
    return response.data as Customer;
  },
  
  updateCustomer: async (id: string, data: Partial<CreateCustomerRequest>): Promise<Customer> => {
    const response = await api.patch(`/customers/${id}`, data);
    return response.data as Customer;
  },
  
  deleteCustomer: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
  
  getCustomerOrders: async (id: string, params?: PaginationParams): Promise<PaginatedResponse<Order>> => {
    const response = await api.get(`/customers/${id}/orders`, { params });
    return response.data as PaginatedResponse<Order>;
  },
};

// Agents API
export const agentsApi = {
  getAgents: async (params?: PaginationParams): Promise<PaginatedResponse<Agent>> => {
    const response = await api.get('/agents', { params });
    return response.data as PaginatedResponse<Agent>;
  },
  
  getAgent: async (id: string): Promise<Agent> => {
    const response = await api.get(`/agents/${id}`);
    return response.data as Agent;
  },
  
  createAgent: async (data: CreateAgentRequest): Promise<Agent> => {
    const response = await api.post('/agents', data);
    return response.data as Agent;
  },
  
  updateAgent: async (id: string, data: Partial<CreateAgentRequest>): Promise<Agent> => {
    const response = await api.patch(`/agents/${id}`, data);
    return response.data as Agent;
  },
  
  deleteAgent: async (id: string): Promise<void> => {
    await api.delete(`/agents/${id}`);
  },
  
  getAgentOrders: async (id: string, params?: PaginationParams): Promise<PaginatedResponse<Order>> => {
    const response = await api.get(`/agents/${id}/orders`, { params });
    return response.data as PaginatedResponse<Order>;
  },
};

// Products API
export const productsApi = {
  getProducts: async (params?: PaginationParams): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/products', { params });
    return response.data as PaginatedResponse<Product>;
  },
  
  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data as Product;
  },
  
  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const response = await api.post('/products', data);
    return response.data as Product;
  },
  
  updateProduct: async (id: string, data: Partial<CreateProductRequest>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data as Product;
  },
  
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

// Orders API
export const ordersApi = {
  getOrders: async (params?: PaginationParams): Promise<PaginatedResponse<Order>> => {
    const response = await api.get('/orders', { params });
    return response.data as PaginatedResponse<Order>;
  },
  
  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data as Order;
  },
  
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await api.post('/orders', data);
    return response.data as Order;
  },
  
  updateOrder: async (id: string, data: Partial<CreateOrderRequest>): Promise<Order> => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data as Order;
  },
  
  deleteOrder: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },
  
  updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data as Order;
  },
  
  updatePaymentStatus: async (id: string, status: Order['paymentStatus']): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/payment`, { status });
    return response.data as Order;
  },
};

// Stock API
export const stockApi = {
  getStockTransactions: async (params?: PaginationParams): Promise<PaginatedResponse<StockTransaction>> => {
    const response = await api.get('/stock/transactions', { params });
    return response.data as PaginatedResponse<StockTransaction>;
  },
  
  createStockTransaction: async (data: CreateStockTransactionRequest): Promise<StockTransaction> => {
    const response = await api.post('/stock/transactions', data);
    return response.data as StockTransaction;
  },
  
  getProductStock: async (productId: string) => {
    const response = await api.get(`/stock/product/${productId}`);
    return response.data;
  },
};

// Statistics API
export const statisticsApi = {
  getOverview: async (params?: { startDate?: string; endDate?: string }): Promise<Statistics> => {
    const response = await api.get('/statistics/overview', { params });
    return response.data as Statistics;
  },
  
  getRevenueByPeriod: async (params: {
    period: 'month' | 'quarter' | 'year';
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/statistics/revenue', { params });
    return response.data;
  },
  
  getTopCustomers: async (params?: { limit?: number; startDate?: string; endDate?: string }) => {
    const response = await api.get('/statistics/top-customers', { params });
    return response.data;
  },
  
  getTopAgents: async (params?: { limit?: number; startDate?: string; endDate?: string }) => {
    const response = await api.get('/statistics/top-agents', { params });
    return response.data;
  },
  
  getTopProducts: async (params?: { limit?: number; startDate?: string; endDate?: string }) => {
    const response = await api.get('/statistics/top-products', { params });
    return response.data;
  },
};

export default api;
 