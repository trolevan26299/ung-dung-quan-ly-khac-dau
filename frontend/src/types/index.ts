// User types
export interface User {
  _id: string;
  username: string;
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

// Category types
export interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Product types
export interface Product {
  _id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  stockQuantity: number;
  minStock: number;
  avgImportPrice: number;
  currentPrice: number;
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
  currentPrice: number;
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
  paymentMethod?: 'company_account' | 'personal_account' | 'cash';
  status: 'active' | 'cancelled';
  notes?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  agentId?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
  paymentStatus: 'pending' | 'completed' | 'debt';
  paymentMethod?: 'company_account' | 'personal_account' | 'cash';
  vat?: number;
  shippingFee?: number;
  notes?: string;
}

// Stock types
export interface StockTransaction {
  _id: string;
  productId: string;
  productCode: string;
  productName: string;
  type: 'import' | 'export' | 'adjustment';
  transactionType: 'import' | 'export' | 'adjustment';
  quantity: number;
  unitPrice?: number;
  vat?: number;
  totalValue?: number;
  notes?: string;
  userId: string | User;
  userName: string;
  orderId?: string;
  reason?: string;
  stockBefore?: number;
  stockAfter?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateStockTransactionRequest {
  product: string;
  type: 'import' | 'export' | 'adjustment';
  quantity: number;
  unitPrice?: number;
  vat?: number;
  notes?: string;
}

export interface UpdateStockTransactionRequest {
  quantity?: number;
  unitPrice?: number;
  vat?: number;
  reason?: string;
  notes?: string;
}

export interface StockQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  transactionType?: 'import' | 'export' | 'adjustment';
  productId?: string;
  startDate?: string;
  endDate?: string;
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
  password: string;
  fullName: string;
  phone?: string;
  role: 'admin' | 'employee';
}

export interface UpdateUserRequest {
  password?: string;
  fullName?: string;
  phone?: string;
  role?: 'admin' | 'employee';
  isActive?: boolean;
}

export interface OrderQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  customerId?: string;
  agentId?: string;
  dateFrom?: string;
  dateTo?: string;
} 