# 🖋️ Hệ thống quản lý cơ sở khắc dấu và biển quảng cáo

## 📋 Mô tả dự án

Hệ thống quản lý toàn diện cho cơ sở kinh doanh khắc dấu và biển quảng cáo, bao gồm:

### 🔐 Quản lý tài khoản
- **Admin**: Toàn quyền, có thể tạo tài khoản nhân viên mới
- **Nhân viên 1, 2**: Quyền truy xuất dữ liệu, không thể tạo tài khoản mới
- Tất cả có quyền tương tự nhau ngoại trừ việc tạo tài khoản

### 👥 Quản lý khách hàng
- Tên khách hàng
- Số điện thoại
- Địa chỉ
- Mã số thuế (MST)
- Xem lịch sử đơn hàng đã mua

### 🏢 Quản lý đại lý
- Tên đại lý
- Số điện thoại
- Địa chỉ
- Lịch sử đơn hàng đã mua

### 📦 Quản lý kho
- Mã hàng (C20 XANH, C20 ĐỎ, C30 XANH, v.v.)
- Số lượng tồn kho
- Giá nhập trung bình (dựa vào các lần nhập kho)
- Ghi chú

### 🛒 Quản lý đơn hàng
- Thông tin đại lý/khách hàng
- Trạng thái thanh toán: Hoàn thành hay công nợ
- Ngày tạo đơn hàng
- Mã đơn hàng tự động
- Chi tiết sản phẩm: số lượng, giá tiền
- VAT, phí ship
- Tổng tiền
- Ghi chú
- Nhân viên tạo đơn
- Tự động trừ/cộng kho khi tạo/hủy đơn hàng
- In hóa đơn

### 📊 Thống kê
- Công nợ
- Doanh thu
- Lợi nhuận
- Khách hàng mua nhiều nhất
- Đại lý mua nhiều nhất
- Sản phẩm bán chạy nhất
- Thống kê theo tháng, quý, năm

## 🛠️ Công nghệ sử dụng

### Backend
- **NestJS** - Framework Node.js
- **MongoDB** - Cơ sở dữ liệu
- **Mongoose** - ODM cho MongoDB
- **JWT** - Authentication
- **Bcrypt** - Mã hóa mật khẩu
- **Swagger** - API Documentation
- **Class Validator** - Validation

### Frontend (Sẽ phát triển)
- **React** - UI Library
- **ShadCN** - Component Library
- **Redux Toolkit** - State Management

## 🚀 Cài đặt

### 1. Yêu cầu hệ thống
- Node.js >= 16
- MongoDB >= 4.4
- npm hoặc yarn

### 2. Clone repository
```bash
git clone <repository-url>
cd khac-dau-backend
```

### 3. Cài đặt dependencies
```bash
npm install
```

### 4. Cấu hình environment
Tạo file `.env` với nội dung:
```env
MONGODB_URI=mongodb://localhost:27017/khac_dau_db
JWT_SECRET=khac-dau-jwt-secret-key-2024
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

### 5. Khởi động MongoDB
```bash
mongod
```

### 6. Chạy ứng dụng

#### Development mode
```bash
npm run start:dev
```

#### Production mode
```bash
npm run build
npm run start:prod
```

## 📖 API Documentation

Sau khi khởi động ứng dụng, truy cập Swagger UI tại:
```
http://localhost:3000/api-docs
```

## 🔑 Tài khoản mặc định

Hệ thống sẽ tự động tạo tài khoản admin:
- **Username**: `admin`
- **Password**: `admin123`

## 📋 Danh sách sản phẩm mẫu

Hệ thống hỗ trợ quản lý các sản phẩm như:
- C20 XANH, C20 ĐỎ
- C30 XANH, C30 ĐỎ
- C40 XANH, C40 ĐỎ
- CAO SU
- CẦN 70*120
- LĂN TAY SHINY
- MỰC LĂN TAY ĐEN/ĐỎ/XANH
- MỰC ĐỎ các loại (10ML, 20ML)
- P30 ĐỎ, P53 DATE ĐỎ
- PET 300, PET 400
- R24, R40, R40 DATE
- Và nhiều sản phẩm khác...

## 🔄 Workflow chuẩn

### 1. Quản lý người dùng
```
Admin đăng nhập → Tạo tài khoản nhân viên → Phân quyền
```

### 2. Quản lý khách hàng/đại lý
```
Thêm thông tin → Lưu database → Theo dõi lịch sử mua hàng
```

### 3. Quản lý kho
```
Nhập hàng → Cập nhật tồn kho → Tính giá nhập TB → Cảnh báo hết hàng
```

### 4. Quy trình đặt hàng
```
Tạo đơn → Chọn sản phẩm → Tự động trừ kho → Thanh toán → In hóa đơn
Hủy đơn → Tự động cộng lại kho
```

### 5. Thống kê báo cáo
```
Thu thập dữ liệu → Phân tích theo thời gian → Báo cáo → Xuất file
```

## 🔧 Lệnh hữu ích

```bash
# Chạy test
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Build production
npm run build

# Xem logs
npm run start:debug
```

## 📁 Cấu trúc thư mục

```
src/
├── auth/           # Authentication module
├── users/          # Quản lý người dùng
├── customers/      # Quản lý khách hàng
├── agents/         # Quản lý đại lý
├── products/       # Quản lý sản phẩm
├── orders/         # Quản lý đơn hàng
├── stock/          # Quản lý kho
├── statistics/     # Thống kê báo cáo
├── schemas/        # MongoDB schemas
├── dto/           # Data Transfer Objects
├── app.module.ts   # Main app module
└── main.ts        # Entry point
```

## 🤝 Đóng góp

1. Fork project
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

This project is licensed under the MIT License.

---

**Phát triển bởi**: Đội ngũ phát triển hệ thống quản lý  
**Liên hệ hỗ trợ**: [email@example.com] 
 