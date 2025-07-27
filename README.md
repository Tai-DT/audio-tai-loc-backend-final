# Audio Tai Loc Backend

Backend API cho hệ thống Audio Tai Loc được xây dựng với NestJS, Prisma, PostgreSQL và Redis.

## 🚀 Tính năng

- **Authentication & Authorization**: JWT, Role-based access control
- **Product Management**: CRUD operations, categories, inventory
- **Order Management**: Order processing, payment integration
- **User Management**: User profiles, preferences
- **Search & Analytics**: Full-text search, analytics dashboard
- **Maps Integration**: Goong Maps integration
- **AI Integration**: Gemini AI for recommendations
- **Real-time Features**: WebSocket, notifications
- **Payment Processing**: VNPay, MoMo integration
- **SEO Optimization**: Dynamic sitemaps, meta tags

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL với Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT
- **Payment**: VNPay, MoMo
- **Maps**: Goong Maps API
- **AI**: Google Gemini AI
- **Testing**: Jest, Supertest
- **Documentation**: Swagger/OpenAPI
- **Monitoring**: Prometheus, Grafana

## 📋 Yêu cầu hệ thống

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm hoặc yarn

## 🚀 Cài đặt

1. **Clone repository**
```bash
git clone https://github.com/Tai-DT/audio-tai-loc-backend.git
cd audio-tai-loc-backend
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình environment**
```bash
cp .env.example .env
# Chỉnh sửa .env với thông tin database và API keys
```

4. **Setup database**
```bash
# Tạo database
npx prisma db push

# Chạy migrations
npx prisma migrate dev

# Seed data (tùy chọn)
npm run seed
```

5. **Chạy ứng dụng**
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📁 Cấu trúc thư mục

```
src/
├── admin/           # Admin controllers & services
├── auth/            # Authentication & authorization
├── cart/            # Shopping cart functionality
├── categories/      # Product categories
├── common/          # Shared utilities & decorators
├── config/          # Configuration files
├── email/           # Email services
├── health/          # Health checks
├── inventory/       # Inventory management
├── maps/            # Maps integration
├── mcp/             # MCP (Model Context Protocol)
├── messaging/       # Real-time messaging
├── monitoring/      # Monitoring & metrics
├── notifications/   # Push notifications
├── orders/          # Order management
├── payments/        # Payment processing
├── products/        # Product management
├── ratings/         # Rating & review system
├── recommendations/ # AI recommendations
├── search/          # Search functionality
├── seo/             # SEO optimization
├── upload/          # File upload handling
└── users/           # User management
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Đăng xuất

### Products
- `GET /products` - Lấy danh sách sản phẩm
- `GET /products/:id` - Lấy chi tiết sản phẩm
- `POST /products` - Tạo sản phẩm mới
- `PUT /products/:id` - Cập nhật sản phẩm
- `DELETE /products/:id` - Xóa sản phẩm

### Orders
- `GET /orders` - Lấy danh sách đơn hàng
- `GET /orders/:id` - Lấy chi tiết đơn hàng
- `POST /orders` - Tạo đơn hàng mới
- `PUT /orders/:id/status` - Cập nhật trạng thái đơn hàng

### Cart
- `GET /cart` - Lấy giỏ hàng
- `POST /cart/add` - Thêm sản phẩm vào giỏ hàng
- `PUT /cart/update` - Cập nhật số lượng
- `DELETE /cart/remove` - Xóa sản phẩm khỏi giỏ hàng

### Payments
- `POST /payments/vnpay` - Tạo thanh toán VNPay
- `POST /payments/momo` - Tạo thanh toán MoMo
- `GET /payments/callback` - Callback xử lý thanh toán

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📊 Monitoring

- **Health Check**: `GET /health`
- **Metrics**: Prometheus metrics tại `/metrics`
- **API Documentation**: Swagger UI tại `/api`

## 🚀 Deployment

### Docker
```bash
docker build -t audio-tai-loc-backend .
docker run -p 3000:3000 audio-tai-loc-backend
```

### Kubernetes
```bash
kubectl apply -f k8s/
```

## 📝 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/audio_tai_loc"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# Payment
VNPAY_TMN_CODE="your-vnpay-tmn-code"
VNPAY_HASH_SECRET="your-vnpay-hash-secret"
MOMO_PARTNER_CODE="your-momo-partner-code"
MOMO_ACCESS_KEY="your-momo-access-key"

# Maps
GOONG_API_KEY="your-goong-api-key"

# AI
GEMINI_API_KEY="your-gemini-api-key"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-email-password"
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Support

- Email: support@audiotailoc.com
- GitHub Issues: [Tạo issue](https://github.com/Tai-DT/audio-tai-loc-backend/issues)
