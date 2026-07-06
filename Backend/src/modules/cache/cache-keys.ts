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
 * TTL (giây). 0 = KHÔNG hết hạn (cache vĩnh viễn).
 *
 * Cơ chế làm mới CHÍNH là invalidate() chạy sau mỗi lần ghi (xem CACHE_INVALIDATION),
 * nên dữ liệu luôn tươi ngay khi có thay đổi qua app — không cần TTL để "tự lành".
 * Vì vậy các cache đọc nặng để VĨNH VIỄN (0): mỗi query nặng chỉ chạy DB đúng 1 lần
 * sau khi bị xóa cache, còn lại luôn hit ngay lập tức → không còn cảnh "load đúng lúc
 * hết hạn thì lâu". An toàn vì:
 *   1) Mọi đường ghi qua app đều gọi invalidate() → cache không bao giờ cũ do thao tác app.
 *   2) Redis chạy allkeys-lru 256MB (xem docker-compose) → key ít dùng tự bị đẩy khi
 *      thiếu RAM, không phình vô hạn.
 * LƯU Ý: nếu SỬA DB TRỰC TIẾP (không qua app) thì cache sẽ KHÔNG tự làm mới — phải
 * flush Redis thủ công. SHORT (300s) vẫn giữ để dùng cho chỗ nào cần backstop ngắn.
 */
export const CacheTTL = {
  LIST: 0,        // vĩnh viễn — danh sách (làm mới qua invalidate)
  DETAIL: 0,      // vĩnh viễn — chi tiết 1 bản ghi
  STATISTICS: 0,  // vĩnh viễn — thống kê
  SHORT: 300,     // 5 phút — backstop ngắn khi cần
};
