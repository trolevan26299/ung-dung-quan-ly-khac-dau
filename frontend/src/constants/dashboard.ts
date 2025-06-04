// Dashboard stats configuration
export const DASHBOARD_STATS = [
    {
        title: 'Tổng doanh thu',
        value: '125,430,000 ₫',
        change: '+12.5%',
        changeType: 'positive' as const,
        icon: 'DollarSign',
        description: 'So với tháng trước'
    },
    {
        title: 'Đơn hàng',
        value: '1,234',
        change: '+8.2%',
        changeType: 'positive' as const,
        icon: 'ShoppingCart',
        description: 'Đơn hàng trong tháng'
    },
    {
        title: 'Khách hàng',
        value: '856',
        change: '+15.3%',
        changeType: 'positive' as const,
        icon: 'Users',
        description: 'Khách hàng hoạt động'
    },
    {
        title: 'Sản phẩm',
        value: '23',
        change: '0%',
        changeType: 'neutral' as const,
        icon: 'Package',
        description: 'Sản phẩm đang bán'
    }
] as const;

// Recent orders mock data
export const RECENT_ORDERS = [
    { id: 'DH001', customer: 'Nguyễn Văn A', amount: '1,250,000 ₫', status: 'completed', date: '2024-01-15' },
    { id: 'DH002', customer: 'Trần Thị B', amount: '850,000 ₫', status: 'pending', date: '2024-01-15' },
    { id: 'DH003', customer: 'Lê Văn C', amount: '2,100,000 ₫', status: 'processing', date: '2024-01-14' },
    { id: 'DH004', customer: 'Phạm Thị D', amount: '750,000 ₫', status: 'completed', date: '2024-01-14' },
] as const;

// Low stock products mock data
export const LOW_STOCK_PRODUCTS = [
    { name: 'C20 XANH', stock: 5, minStock: 10 },
    { name: 'MỰC ĐỎ 10ML', stock: 3, minStock: 15 },
    { name: 'CAO SU', stock: 8, minStock: 20 },
] as const;

// Dashboard status mappings
export const DASHBOARD_STATUS_COLORS = {
    completed: 'text-green-600 bg-green-100',
    pending: 'text-yellow-600 bg-yellow-100',
    processing: 'text-blue-600 bg-blue-100',
    default: 'text-gray-600 bg-gray-100'
} as const;

export const DASHBOARD_STATUS_LABELS = {
    completed: 'Hoàn thành',
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý'
} as const;

// Change type colors
export const CHANGE_TYPE_COLORS = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
} as const; 