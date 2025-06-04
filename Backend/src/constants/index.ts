// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
} as const;

// Payment status  
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed', 
  DEBT: 'debt'
} as const;

// Order status
export const ORDER_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled'
} as const;

// Stock transaction types
export const STOCK_TRANSACTION_TYPES = {
  IMPORT: 'import',
  EXPORT: 'export',
  ADJUSTMENT: 'adjustment'
} as const;

// Date formats
export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  DISPLAY: 'DD/MM/YYYY', 
  DATETIME: 'DD/MM/YYYY HH:mm'
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
} as const;

// Validation constants
export const VALIDATION = {
  PHONE_REGEX: /^[0-9]{10,11}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TAX_CODE_REGEX: /^[0-9]{10,13}$/,
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 100,
  MAX_ADDRESS_LENGTH: 500,
  MAX_NOTES_LENGTH: 1000
} as const;

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Không có quyền truy cập',
  NOT_FOUND: 'Không tìm thấy dữ liệu',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  INTERNAL_ERROR: 'Lỗi hệ thống',
  DUPLICATE_EMAIL: 'Email đã tồn tại',
  DUPLICATE_PHONE: 'Số điện thoại đã tồn tại',
  INVALID_CREDENTIALS: 'Thông tin đăng nhập không đúng',
  ADMIN_REQUIRED: 'Cần quyền quản trị viên',
  CANNOT_DELETE_LAST_ADMIN: 'Không thể xóa admin cuối cùng',
  INSUFFICIENT_STOCK: 'Không đủ hàng trong kho'
} as const;

// Success messages  
export const SUCCESS_MESSAGES = {
  CREATED: 'Tạo thành công',
  UPDATED: 'Cập nhật thành công', 
  DELETED: 'Xóa thành công',
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công'
} as const; 