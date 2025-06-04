// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  ITEMS_PER_PAGE_OPTIONS: [10, 20, 50, 100]
} as const;

// Order status - KHỚP VỚI BACKEND
export const ORDER_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled'
} as const;

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.ACTIVE]: 'Đang hoạt động',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy'
} as const;

// Payment status - KHỚP VỚI BACKEND
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  DEBT: 'debt'  // Từ backend thay vì PARTIAL
} as const;

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Chờ thanh toán',
  [PAYMENT_STATUS.COMPLETED]: 'Đã thanh toán', 
  [PAYMENT_STATUS.DEBT]: 'Công nợ'
} as const;

// Stock transaction types
export const STOCK_TRANSACTION_TYPES = {
  IMPORT: 'import',
  EXPORT: 'export',
  ADJUSTMENT: 'adjustment'
} as const;

export const STOCK_TRANSACTION_LABELS = {
  [STOCK_TRANSACTION_TYPES.IMPORT]: 'Nhập kho',
  [STOCK_TRANSACTION_TYPES.EXPORT]: 'Xuất kho',
  [STOCK_TRANSACTION_TYPES.ADJUSTMENT]: 'Điều chỉnh'
} as const;

// User roles - KHỚP VỚI BACKEND
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
} as const;

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Quản trị viên',
  [USER_ROLES.EMPLOYEE]: 'Nhân viên'
} as const;

// Colors for status badges
export const STATUS_COLORS = {
  SUCCESS: 'bg-green-100 text-green-800',
  WARNING: 'bg-yellow-100 text-yellow-800',
  ERROR: 'bg-red-100 text-red-800',
  INFO: 'bg-blue-100 text-blue-800',
  DEFAULT: 'bg-gray-100 text-gray-800'
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  API: 'yyyy-MM-dd',
  DATETIME: 'dd/MM/yyyy HH:mm'
} as const;

// API endpoints (base paths)
export const API_ENDPOINTS = {
  AUTH: '/auth',
  CUSTOMERS: '/customers',
  AGENTS: '/agents', 
  PRODUCTS: '/products',
  ORDERS: '/orders',
  STOCK: '/stock',
  USERS: '/users',
  STATISTICS: '/statistics'
} as const;

// Form validation - KHỚP VỚI BACKEND
export const VALIDATION = {
  PHONE_REGEX: /^[0-9]{10,11}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TAX_CODE_REGEX: /^[0-9]{10,13}$/,
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 100,
  MAX_ADDRESS_LENGTH: 500,
  MAX_NOTES_LENGTH: 1000
} as const; 