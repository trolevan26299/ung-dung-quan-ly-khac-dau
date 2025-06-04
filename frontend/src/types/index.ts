// User types
export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'admin' | 'employee';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// Customer types
export interface Customer {
  _id: string;
  name: string;
  phone: string;
  address: string;
  taxCode?: string;
  agentId: string;
  agentName: string;
  notes?: string;
  totalOrders: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  address: string;
  taxCode?: string;
  agentId: string;
  agentName: string;
  notes?: string;
}

// Agent types
export interface Agent {
  _id: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  totalOrders: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentRequest {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

// Product types
export interface Product {
  _id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  averageImportPrice: number;
  sellingPrice: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  code: string;
  name: string;
  category: string;
  unit: string;
  sellingPrice: number;
  notes?: string;
}

// Order types
export interface OrderItem {
  product: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer?: Customer;
  agent?: Agent;
  items: OrderItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  shippingFee: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'debt';
  status: 'active' | 'cancelled';
  notes?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  customer?: string;
  agent?: string;
  items: {
    product: string;
    quantity: number;
    unitPrice: number;
  }[];
  vatRate: number;
  shippingFee: number;
  paymentStatus: 'pending' | 'completed' | 'debt';
  notes?: string;
}

// Stock types
export interface StockTransaction {
  _id: string;
  product: Product;
  type: 'import' | 'export' | 'adjustment';
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
  order?: string;
  createdBy: User;
  createdAt: string;
}

export interface CreateStockTransactionRequest {
  product: string;
  type: 'import' | 'export' | 'adjustment';
  quantity: number;
  unitPrice?: number;
  notes?: string;
}

// Statistics types
export interface Statistics {
  totalRevenue: number;
  totalProfit: number;
  totalDebt: number;
  totalOrders: number;
  topCustomers: Array<{
    customer: Customer;
    totalAmount: number;
    totalOrders: number;
  }>;
  topAgents: Array<{
    agent: Agent;
    totalAmount: number;
    totalOrders: number;
  }>;
  topProducts: Array<{
    product: Product;
    totalSold: number;
    totalRevenue: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    profit: number;
  }>;
}

// Common types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'admin' | 'employee';
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  role?: 'admin' | 'employee';
  isActive?: boolean;
} 