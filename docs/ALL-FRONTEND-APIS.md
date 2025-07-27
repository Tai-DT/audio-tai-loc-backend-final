# 🚀 Tất cả API Endpoints cho Frontend - Audio Tài Lộc

Base URL: `http://localhost:3001/api`

## 🔐 **Authentication APIs**

### 1. **Đăng ký tài khoản**
```javascript
POST /api/auth/register
Body: {
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Tài",
  "lastName": "Đại",
  "phone": "0123456789"
}
```

### 2. **Đăng nhập**
```javascript
POST /api/auth/login
Body: {
  "email": "user@example.com", 
  "password": "password123"
}
```

### 3. **Làm mới token**
```javascript
POST /api/auth/refresh
Headers: { "Authorization": "Bearer {refresh_token}" }
```

### 4. **Đăng xuất**
```javascript
POST /api/auth/logout
Headers: { "Authorization": "Bearer {access_token}" }
```

### 5. **Quên mật khẩu**
```javascript
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }
```

### 6. **Đặt lại mật khẩu**
```javascript
POST /api/auth/reset-password
Body: {
  "token": "reset_token",
  "newPassword": "newpassword123"
}
```

## 👤 **User Management APIs**

### 7. **Thông tin người dùng hiện tại**
```javascript
GET /api/users/profile
Headers: { "Authorization": "Bearer {access_token}" }
```

### 8. **Cập nhật thông tin cá nhân**
```javascript
PUT /api/users/profile
Headers: { "Authorization": "Bearer {access_token}" }
Body: {
  "firstName": "Tài",
  "lastName": "Đại", 
  "phone": "0987654321",
  "dateOfBirth": "1990-01-01"
}
```

### 9. **Đổi mật khẩu**
```javascript
PUT /api/users/change-password
Headers: { "Authorization": "Bearer {access_token}" }
Body: {
  "currentPassword": "oldpass",
  "newPassword": "newpass"
}
```

### 10. **Danh sách địa chỉ**
```javascript
GET /api/users/addresses
Headers: { "Authorization": "Bearer {access_token}" }
```

### 11. **Thêm địa chỉ mới**
```javascript
POST /api/users/addresses
Headers: { "Authorization": "Bearer {access_token}" }
Body: {
  "title": "Nhà riêng",
  "recipientName": "Đại Tài",
  "phone": "0123456789",
  "address": "Số 1 Đại Cồ Việt",
  "ward": "Phường Bách Khoa",
  "district": "Quận Hai Bà Trưng", 
  "city": "Hà Nội",
  "isDefault": true
}
```

## 🛍️ **Product APIs**

### 12. **Danh sách sản phẩm (có phân trang)**
```javascript
GET /api/products?page=1&limit=12&category=headphones&search=sony&sortBy=price&sortOrder=asc&minPrice=100000&maxPrice=5000000
```

### 13. **Chi tiết sản phẩm**
```javascript
GET /api/products/{id}
```

### 14. **Sản phẩm nổi bật**
```javascript
GET /api/products/featured
```

### 15. **Sản phẩm bán chạy**
```javascript
GET /api/products/best-sellers
```

### 16. **Sản phẩm mới**
```javascript
GET /api/products/new-arrivals
```

### 17. **Sản phẩm giảm giá**
```javascript
GET /api/products/on-sale
```

### 18. **Sản phẩm liên quan**
```javascript
GET /api/products/{id}/related
```

### 19. **Tìm kiếm sản phẩm**
```javascript
GET /api/search?q=headphones&category=audio&minPrice=100000
```

### 20. **Gợi ý tìm kiếm**
```javascript
GET /api/search/suggestions?q=sony
```

## 📂 **Category APIs**

### 21. **Danh sách danh mục**
```javascript
GET /api/categories
```

### 22. **Chi tiết danh mục**
```javascript
GET /api/categories/{id}
```

### 23. **Sản phẩm theo danh mục**
```javascript
GET /api/categories/{id}/products?page=1&limit=12
```

## 🛒 **Cart APIs**

### 24. **Giỏ hàng hiện tại**
```javascript
GET /api/cart
Headers: { "Authorization": "Bearer {access_token}" }
```

### 25. **Thêm vào giỏ hàng**
```javascript
POST /api/cart/items
Headers: { "Authorization": "Bearer {access_token}" }
Body: {
  "productId": "product_id",
  "quantity": 2,
  "variantId": "variant_id"  // optional
}
```

### 26. **Cập nhật số lượng**
```javascript
PUT /api/cart/items/{itemId}
Headers: { "Authorization": "Bearer {access_token}" }
Body: { "quantity": 3 }
```

### 27. **Xóa khỏi giỏ hàng**
```javascript
DELETE /api/cart/items/{itemId}
Headers: { "Authorization": "Bearer {access_token}" }
```

### 28. **Xóa toàn bộ giỏ hàng**
```javascript
DELETE /api/cart
Headers: { "Authorization": "Bearer {access_token}" }
```

## 📦 **Order APIs**

### 29. **Tạo đơn hàng mới**
```javascript
POST /api/orders
Headers: { "Authorization": "Bearer {access_token}" }
Body: {
  "shippingAddressId": "address_id",
  "paymentMethod": "payos",
  "items": [
    {
      "productId": "product_id",
      "quantity": 2,
      "price": 1000000
    }
  ],
  "shippingMethod": "standard",
  "notes": "Giao hàng buổi chiều"
}
```

### 30. **Danh sách đơn hàng**
```javascript
GET /api/orders?page=1&limit=10&status=pending
Headers: { "Authorization": "Bearer {access_token}" }
```

### 31. **Chi tiết đơn hàng**
```javascript
GET /api/orders/{id}
Headers: { "Authorization": "Bearer {access_token}" }
```

### 32. **Hủy đơn hàng**
```javascript
PUT /api/orders/{id}/cancel
Headers: { "Authorization": "Bearer {access_token}" }
Body: { "reason": "Không cần nữa" }
```

### 33. **Theo dõi đơn hàng**
```javascript
GET /api/orders/{id}/tracking
Headers: { "Authorization": "Bearer {access_token}" }
```

## 💳 **Payment APIs (PayOS)**

### 34. **Tạo link thanh toán**
```javascript
POST /api/payments/payos/create
Headers: { "Authorization": "Bearer {access_token}" }
Body: {
  "orderId": "order_id",
  "amount": 2850000,
  "description": "Đơn hàng #123",
  "buyerName": "Đại Tài",
  "buyerEmail": "taidt3004@gmail.com",
  "buyerPhone": "0123456789",
  "returnUrl": "http://localhost:3000/payment/success",
  "cancelUrl": "http://localhost:3000/payment/cancel"
}
```

### 35. **Kiểm tra trạng thái thanh toán**
```javascript
GET /api/payments/payos/{paymentLinkId}/status
```

### 36. **Hủy thanh toán**
```javascript
PUT /api/payments/payos/{paymentLinkId}/cancel
Headers: { "Authorization": "Bearer {access_token}" }
```

### 37. **Webhook PayOS** (Tự động)
```javascript
POST /api/payments/payos/webhook
// Tự động nhận từ PayOS
```

## ⭐ **Review APIs**

### 38. **Đánh giá sản phẩm**
```javascript
GET /api/products/{id}/reviews?page=1&limit=10
```

### 39. **Thêm đánh giá**
```javascript
POST /api/reviews
Headers: { "Authorization": "Bearer {access_token}" }
Body: {
  "productId": "product_id",
  "orderId": "order_id",
  "rating": 5,
  "comment": "Sản phẩm tuyệt vời!",
  "images": ["image1.jpg", "image2.jpg"]
}
```

### 40. **Cập nhật đánh giá**
```javascript
PUT /api/reviews/{id}
Headers: { "Authorization": "Bearer {access_token}" }
Body: {
  "rating": 4,
  "comment": "Sản phẩm tốt nhưng có thể cải thiện"
}
```

### 41. **Xóa đánh giá**
```javascript
DELETE /api/reviews/{id}
Headers: { "Authorization": "Bearer {access_token}" }
```

## 📧 **Email APIs** (Tự động gửi)

### 42. **Email xác nhận đăng ký** (Tự động)
### 43. **Email xác nhận đơn hàng** (Tự động)  
### 44. **Email thanh toán thành công** (Tự động)
### 45. **Email cập nhật giao hàng** (Tự động)
### 46. **Email hủy đơn hàng** (Tự động)

## 🗺️ **Maps APIs (Goong)**

### 47. **Gợi ý địa chỉ**
```javascript
GET /api/maps/autocomplete?input=Cầu Giấy&location=21.0285,105.8542
```

### 48. **Chuyển địa chỉ thành tọa độ**
```javascript
GET /api/maps/geocode?address=Số 1 Đại Cồ Việt, Hà Nội
```

### 49. **Chuyển tọa độ thành địa chỉ**
```javascript
GET /api/maps/reverse-geocode?lat=21.0285&lng=105.8542
```

### 50. **Xác thực địa chỉ**
```javascript
POST /api/maps/validate-address
Body: { "address": "Số 1 Đại Cồ Việt, Hà Nội" }
```

### 51. **Tính khoảng cách**
```javascript
GET /api/maps/distance?origin=Hà Nội&destination=TP.HCM
```

### 52. **Tìm địa điểm gần**
```javascript
GET /api/maps/nearby?lat=21.0285&lng=105.8542&type=restaurant&radius=2000
```

### 53. **Chi tiết địa điểm**
```javascript
GET /api/maps/place-detail/{place_id}
```

### 54. **Cấu hình bản đồ**
```javascript
GET /api/maps/config
```

### 55. **Kiểm tra Maps service**
```javascript
GET /api/maps/health
```

## 📤 **Upload APIs**

### 56. **Upload ảnh**
```javascript
POST /api/upload/image
Headers: { "Authorization": "Bearer {access_token}" }
Body: FormData with file
```

### 57. **Upload nhiều ảnh**
```javascript
POST /api/upload/images
Headers: { "Authorization": "Bearer {access_token}" }
Body: FormData with multiple files
```

## 🏪 **Services APIs**

### 58. **Danh sách dịch vụ**
```javascript
GET /api/services
```

### 59. **Chi tiết dịch vụ**
```javascript
GET /api/services/{id}
```

### 60. **Đặt lịch dịch vụ**
```javascript
POST /api/services/book
Headers: { "Authorization": "Bearer {access_token}" }
Body: {
  "serviceId": "service_id",
  "appointmentDate": "2024-07-25T10:00:00Z",
  "notes": "Cần tư vấn chi tiết"
}
```

## 📊 **Analytics & SEO APIs**

### 61. **Thống kê trang**
```javascript
GET /api/seo/page-stats?url=/products/headphones
```

### 62. **Sitemap**
```javascript
GET /api/seo/sitemap
```

### 63. **Meta tags cho trang**
```javascript
GET /api/seo/meta?url=/products/{id}
```

## 🏥 **System Health APIs**

### 64. **Kiểm tra hệ thống**
```javascript
GET /api/health
```

### 65. **Trạng thái database**
```javascript
GET /api/health/database
```

### 66. **Kiểm tra PayOS**
```javascript
GET /api/health/payos
```

## 👨‍💼 **Admin APIs** (Cần admin role)

### 67. **Thống kê tổng quan**
```javascript
GET /api/admin/stats
Headers: { "Authorization": "Bearer {admin_token}" }
```

### 68. **Quản lý sản phẩm**
```javascript
GET /api/admin/products
POST /api/admin/products
PUT /api/admin/products/{id}
DELETE /api/admin/products/{id}
```

### 69. **Quản lý đơn hàng**
```javascript
GET /api/admin/orders
PUT /api/admin/orders/{id}/status
```

### 70. **Quản lý người dùng**
```javascript
GET /api/admin/users
PUT /api/admin/users/{id}/status
```

## 📦 **Inventory APIs**

### 71. **Kiểm tra tồn kho**
```javascript
GET /api/inventory/stock/{productId}
```

### 72. **Cập nhật tồn kho** (Admin only)
```javascript
PUT /api/inventory/stock/{productId}
Headers: { "Authorization": "Bearer {admin_token}" }
Body: { "quantity": 100, "action": "increase" }
```

## 🌐 **Translation APIs**

### 73. **Lấy bản dịch**
```javascript
GET /api/translations/{language}  // vi, en
```

### 74. **Bản dịch động**
```javascript
POST /api/translations/translate
Body: { "text": "Hello", "from": "en", "to": "vi" }
```

## 📋 **Common Response Format**

Tất cả API đều trả về format chuẩn:

```javascript
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "statusCode": 200,
  "timestamp": "2024-07-22T10:30:00Z"
}
```

**Error Response:**
```javascript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": { ... }
  },
  "statusCode": 400,
  "timestamp": "2024-07-22T10:30:00Z"
}
```

## 🔒 **Authentication Headers**

Hầu hết API cần authentication:
```javascript
Headers: {
  "Authorization": "Bearer {access_token}",
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

## 🚀 **Frontend Integration Examples**

### React/Next.js:
```javascript
// hooks/useApi.js
const useApi = () => {
  const token = localStorage.getItem('access_token');
  
  const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    return response.json();
  };
  
  return { apiCall };
};
```

### Vue.js:
```javascript
// plugins/api.js
export default {
  install(app) {
    app.config.globalProperties.$api = {
      get: (endpoint) => fetch(`/api${endpoint}`).then(r => r.json()),
      post: (endpoint, data) => fetch(`/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json())
    };
  }
};
```

## 📱 **Mobile App Integration**

Tất cả API đều hỗ trợ CORS và có thể sử dụng trực tiếp từ:
- React Native  
- Flutter
- Ionic
- Cordova

## 🔧 **Development vs Production**

**Development:** `http://localhost:3001/api`
**Production:** `https://your-domain.com/api`

## 📖 **API Documentation**

Swagger UI: `http://localhost:3001/api-docs`

**Tổng cộng: 74 API endpoints sẵn sàng cho Frontend! 🎉**