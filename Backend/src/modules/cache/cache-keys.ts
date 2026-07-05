/**
 * Cache namespaces + cross-module invalidation map.
 *
 * Mỗi entity khi ghi (create/update/delete) sẽ xóa cache của TẤT CẢ namespace
 * mà nó ảnh hưởng tới (kể cả gián tiếp qua denormalize/populate/aggregate).
 * Bảng CACHE_INVALIDATION là nguồn sự thật duy nhất — sửa quan hệ cache ở đây.
 */
export enum CacheNamespace {
  ORDERS = 'orders',
  PRODUCTS = 'products',
  CUSTOMERS = 'customers',
  AGENTS = 'agents',
  CATEGORIES = 'categories',
  STOCK = 'stock',
  STATISTICS = 'statistics',
  INVOICES = 'invoices',
  USERS = 'users',
}

/**
 * Lý do phụ thuộc:
 * - orders: ghi đơn hàng làm thay đổi tồn kho (products) + giao dịch kho (stock),
 *   tổng tiền của khách (customers) & đại lý (agents), thống kê (statistics),
 *   và ảnh hưởng snapshot hóa đơn (invoices).
 * - stock: giao dịch kho đổi tồn kho sản phẩm (products) + thống kê tồn kho (statistics).
 * - products: đổi sản phẩm ảnh hưởng đếm theo danh mục (categories) + thống kê (statistics).
 * - categories: đổi tên danh mục cascade sang products; productCount đổi.
 * - customers: tên khách hiển thị qua populate ở danh sách đơn (orders); top khách + thống kê.
 * - agents: tên đại lý hiển thị qua populate ở đơn (orders) + denormalize agentName ở customers.
 * - invoices: tạo hóa đơn chỉ đọc order, không ghi ngược → chỉ xóa cache invoices.
 * - users: tên người tạo hiển thị qua populate ở danh sách đơn (orders).
 */
export const CACHE_INVALIDATION: Record<string, CacheNamespace[]> = {
  orders: [
    CacheNamespace.ORDERS,
    CacheNamespace.PRODUCTS,
    CacheNamespace.STOCK,
    CacheNamespace.CUSTOMERS,
    CacheNamespace.AGENTS,
    CacheNamespace.STATISTICS,
    CacheNamespace.INVOICES,
  ],
  stock: [CacheNamespace.STOCK, CacheNamespace.PRODUCTS, CacheNamespace.STATISTICS],
  // products: đổi/tạo/xóa sản phẩm đổi cả tồn kho (stockSummary nằm ở namespace stock)
  products: [
    CacheNamespace.PRODUCTS,
    CacheNamespace.CATEGORIES,
    CacheNamespace.STATISTICS,
    CacheNamespace.STOCK,
  ],
  categories: [CacheNamespace.CATEGORIES, CacheNamespace.PRODUCTS],
  customers: [CacheNamespace.CUSTOMERS, CacheNamespace.ORDERS, CacheNamespace.STATISTICS],
  agents: [
    CacheNamespace.AGENTS,
    CacheNamespace.CUSTOMERS,
    CacheNamespace.ORDERS,
    CacheNamespace.STATISTICS,
  ],
  invoices: [CacheNamespace.INVOICES],
  users: [CacheNamespace.USERS, CacheNamespace.ORDERS],
};

/**
 * TTL (giây) — chỉ là "lưới an toàn" trên nền invalidation tường minh.
 *
 * Cơ chế làm mới CHÍNH là invalidate() chạy sau mỗi lần ghi (xem CACHE_INVALIDATION),
 * nên dữ liệu luôn tươi ngay khi có thay đổi qua app. TTL dài để cache "lưu lâu",
 * giảm tối đa số lần phải chạy lại query nặng. KHÔNG để vô hạn: nếu lỡ có đường ghi
 * nào quên invalidate (hoặc sửa DB trực tiếp), TTL đảm bảo cache tự lành lại sau tối
 * đa khoảng thời gian này thay vì sai vĩnh viễn. (Redis đang bật allkeys-lru 256MB nên
 * key cũ vẫn bị đẩy ra khi thiếu bộ nhớ.)
 */
export const CacheTTL = {
  LIST: 21600,        // 6 giờ — danh sách
  DETAIL: 43200,      // 12 giờ — chi tiết 1 bản ghi
  STATISTICS: 10800,  // 3 giờ — thống kê (ngắn hơn để tránh lệch ở mốc chuyển ngày/tháng)
  SHORT: 300,         // 5 phút
};
