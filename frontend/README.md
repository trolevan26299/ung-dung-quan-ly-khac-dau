# 🖋️ Khắc Dấu Pro - Frontend

Frontend cho hệ thống quản lý cơ sở khắc dấu và biển quảng cáo.

## 🛠️ Công nghệ sử dụng

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Redux Toolkit** - State Management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **ShadCN UI** - Component Library
- **Lucide React** - Icons
- **Axios** - HTTP Client

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình environment
Tạo file `.env` với nội dung:
```env
REACT_APP_API_URL=http://localhost:3000
```

### 3. Chạy ứng dụng
```bash
npm start
```

Ứng dụng sẽ chạy tại: http://localhost:3001

## 📋 Tính năng

### ✅ Đã hoàn thành
- 🔐 **Đăng nhập** với JWT authentication
- 🏠 **Dashboard** tổng quan với thống kê
- 👥 **Quản lý khách hàng** - CRUD đầy đủ với modal form
- 🏢 **Quản lý đại lý** - CRUD đầy đủ với modal form
- 📦 **Quản lý sản phẩm** - CRUD đầy đủ với filter danh mục
- 🎨 **UI/UX hiện đại** với Tailwind CSS + ShadCN
- 📱 **Responsive design** 
- 🔄 **State management** với Redux Toolkit
- 🛡️ **Protected routes** và authorization
- 🎯 **TypeScript** cho type safety
- 🔍 **Search và pagination** cho tất cả danh sách
- 📊 **Loading states** và error handling
- 🎭 **Modal components** tái sử dụng

### 🚧 Đang phát triển
- 🛒 Quản lý đơn hàng với tính năng tạo đơn
- 📊 Quản lý kho hàng với nhập/xuất
- 📈 Thống kê báo cáo với charts
- 👤 Quản lý người dùng (Admin only)
- 🖨️ In hóa đơn và báo cáo
- 📤 Export/Import data

## 🔑 Tài khoản đăng nhập

```
Username: admin
Password: admin123
```

## 📁 Cấu trúc thư mục

```
src/
├── components/          # Reusable components
│   ├── ui/             # ShadCN UI components
│   │   ├── Button.tsx  # Button component
│   │   ├── Card.tsx    # Card components
│   │   ├── Input.tsx   # Input component
│   │   ├── Modal.tsx   # Modal component
│   │   └── LoadingSpinner.tsx
│   └── layout/         # Layout components
│       ├── Header.tsx  # Top header
│       ├── Sidebar.tsx # Navigation sidebar
│       └── Layout.tsx  # Main layout wrapper
├── pages/              # Page components
│   ├── Login.tsx       # Login page
│   ├── Dashboard.tsx   # Dashboard overview
│   ├── Customers.tsx   # Customer management
│   ├── Agents.tsx      # Agent management
│   └── Products.tsx    # Product management
├── store/              # Redux store
│   ├── index.ts        # Store configuration
│   └── slices/         # Redux slices
│       ├── authSlice.ts
│       ├── customersSlice.ts
│       ├── agentsSlice.ts
│       └── ...
├── services/           # API services
│   └── api.ts          # Axios API calls
├── types/              # TypeScript types
│   └── index.ts        # All type definitions
├── lib/                # Utility functions
│   └── utils.ts        # Common utilities
└── App.tsx             # Main app component
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6)
- **Secondary**: Gray (#64748b)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Font**: Inter
- **Sizes**: text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl

### Components
- Sử dụng ShadCN UI components
- Tailwind CSS utilities
- Consistent spacing và border radius
- Modal system cho forms
- Loading states và skeletons

## 🔧 Scripts

```bash
# Development
npm start

# Build production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🌟 Features Chi tiết

### Authentication
- JWT token-based authentication
- Auto redirect khi chưa đăng nhập
- Persistent login state
- Logout functionality
- Profile management

### Dashboard
- Thống kê tổng quan (doanh thu, đơn hàng, khách hàng)
- Đơn hàng gần đây
- Cảnh báo tồn kho thấp
- Quick actions
- Real-time data

### Customer Management
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Search theo tên, số điện thoại
- ✅ Pagination
- ✅ Modal forms
- ✅ Validation
- ✅ View customer details
- ✅ Customer statistics (total orders, amount)

### Agent Management  
- ✅ CRUD operations
- ✅ Search và filter
- ✅ Pagination
- ✅ Modal forms
- ✅ Agent performance tracking

### Product Management
- ✅ CRUD operations
- ✅ Category filtering
- ✅ Search by name/code
- ✅ Stock level indicators
- ✅ Price management
- ✅ Product status (active/inactive)
- ✅ Low stock alerts

### UI/UX
- Modern và clean design
- Smooth animations và transitions
- Loading states với skeletons
- Error handling với user-friendly messages
- Responsive design cho mobile/tablet
- Consistent color scheme
- Intuitive navigation

## 🔗 API Integration

Frontend kết nối với backend NestJS qua REST API:
- Base URL: `http://localhost:3000`
- Authentication: Bearer token
- Error handling với interceptors
- Type-safe API calls
- Automatic token refresh

## 📈 Performance

- Efficient re-renders với Redux
- Optimized bundle size
- Lazy loading cho routes (sẽ thêm)
- Image optimization (sẽ thêm)
- Caching strategies

## 🧪 Testing

- Unit tests với Jest (sẽ thêm)
- Component tests với React Testing Library (sẽ thêm)
- E2E tests với Cypress (sẽ thêm)
- API integration tests

## 🚀 Deployment

- Build production: `npm run build`
- Deploy to Vercel/Netlify
- Environment variables configuration
- CI/CD pipeline (sẽ thêm)

## 📝 Changelog

### v1.1.0 (Latest)
- ✅ Hoàn thành Customer Management
- ✅ Hoàn thành Agent Management  
- ✅ Hoàn thành Product Management
- ✅ Thêm Modal components
- ✅ Thêm Loading states
- ✅ Cải thiện UI/UX

### v1.0.0
- ✅ Authentication system
- ✅ Dashboard overview
- ✅ Basic layout và navigation
- ✅ Redux setup
- ✅ API integration

---

**Phát triển bởi:** Khắc Dấu Pro Team  
**Version:** 1.1.0  
# 🖋️ Khắc Dấu Pro - Frontend

Frontend cho hệ thống quản lý cơ sở khắc dấu và biển quảng cáo.

## 🛠️ Công nghệ sử dụng

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Redux Toolkit** - State Management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **ShadCN UI** - Component Library
- **Lucide React** - Icons
- **Axios** - HTTP Client

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình environment
Tạo file `.env` với nội dung:
```env
REACT_APP_API_URL=http://localhost:3000
```

### 3. Chạy ứng dụng
```bash
npm start
```

Ứng dụng sẽ chạy tại: http://localhost:3001

## 📋 Tính năng

### ✅ Đã hoàn thành
- 🔐 **Đăng nhập** với JWT authentication
- 🏠 **Dashboard** tổng quan với thống kê
- 🎨 **UI/UX hiện đại** với Tailwind CSS + ShadCN
- 📱 **Responsive design** 
- 🔄 **State management** với Redux Toolkit
- 🛡️ **Protected routes** và authorization
- 🎯 **TypeScript** cho type safety

### 🚧 Đang phát triển
- 👥 Quản lý khách hàng
- 🏢 Quản lý đại lý  
- 📦 Quản lý sản phẩm
- 🛒 Quản lý đơn hàng
- 📊 Quản lý kho hàng
- 📈 Thống kê báo cáo
- 👤 Quản lý người dùng

## 🔑 Tài khoản đăng nhập

```
Username: admin
Password: admin123
```

## 📁 Cấu trúc thư mục

```
src/
├── components/          # Reusable components
│   ├── ui/             # ShadCN UI components
│   └── layout/         # Layout components
├── pages/              # Page components
├── store/              # Redux store
│   └── slices/         # Redux slices
├── services/           # API services
├── types/              # TypeScript types
├── lib/                # Utility functions
└── App.tsx             # Main app component
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6)
- **Secondary**: Gray (#64748b)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Font**: Inter
- **Sizes**: text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl

### Components
- Sử dụng ShadCN UI components
- Tailwind CSS utilities
- Consistent spacing và border radius

## 🔧 Scripts

```bash
# Development
npm start

# Build production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🌟 Features

### Authentication
- JWT token-based authentication
- Auto redirect khi chưa đăng nhập
- Persistent login state
- Logout functionality

### Dashboard
- Thống kê tổng quan
- Đơn hàng gần đây
- Cảnh báo tồn kho thấp
- Quick actions

### UI/UX
- Modern và clean design
- Smooth animations
- Loading states
- Error handling
- Toast notifications (sẽ thêm)

## 🔗 API Integration

Frontend kết nối với backend NestJS qua REST API:
- Base URL: `http://localhost:3000`
- Authentication: Bearer token
- Error handling với interceptors
- Type-safe API calls

## 📈 Performance

- Code splitting với React.lazy (sẽ thêm)
- Optimized bundle size
- Efficient re-renders với Redux
- Image optimization (sẽ thêm)

## 🧪 Testing

- Unit tests với Jest (sẽ thêm)
- Component tests với React Testing Library (sẽ thêm)
- E2E tests với Cypress (sẽ thêm)

## 🚀 Deployment

- Build production: `npm run build`
- Deploy to Vercel/Netlify
- Environment variables configuration
- CI/CD pipeline (sẽ thêm)

---

**Phát triển bởi:** Khắc Dấu Pro Team  
**Version:** 1.0.0  
**Last updated:** 2024