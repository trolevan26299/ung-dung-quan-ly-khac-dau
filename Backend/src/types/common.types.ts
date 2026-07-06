export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  agentId?: string;
  // light=true: chỉ trả field cơ bản, BỎ QUA lookup orders/agents (dùng cho dropdown
  // chọn khách hàng — không cần totalOrders/totalAmount). Query nhẹ, nhanh cả khi cache miss.
  light?: boolean;
}

export interface PaginationResult<T> {
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

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface StatisticsPeriod {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate?: Date;
  endDate?: Date;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  totalDebt: number;
  totalProfit: number;
}

export interface ProductStats {
  totalProducts: number;
  lowStockProducts: number;
  totalStockValue: number;
}

export interface CustomerStats {
  totalCustomers: number;
  topCustomer: {
    id: string;
    name: string;
    totalSpent: number;
  };
}

export interface AgentStats {
  totalAgents: number;
  topAgent: {
    id: string;
    name: string;
    totalSales: number;
  };
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  DEBT = 'debt'
}

export enum OrderStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled'
}

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee'
}

export enum TransactionType {
  IMPORT = 'import',
  EXPORT = 'export',
  ADJUSTMENT = 'adjustment'
} 