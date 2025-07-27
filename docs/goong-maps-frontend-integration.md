# Goong Maps API - Frontend Integration Guide

## 🗺️ Tổng quan các API endpoints

Base URL: `http://localhost:3001/api/maps`

## 📍 1. Geocoding - Chuyển địa chỉ thành tọa độ

**Endpoint:** `GET /api/maps/geocode`

**Query Parameters:**
- `address` (required): Địa chỉ cần chuyển đổi

**Example Request:**
```javascript
const response = await fetch('/api/maps/geocode?address=Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội');
const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "status": "OK",
  "data": {
    "address": "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
    "results": [
      {
        "formatted_address": "Số 1 Đại Cồ Việt, Phường Bách Khoa, Quận Hai Bà Trưng, Hà Nội",
        "coordinates": {
          "lat": 21.0045,
          "lng": 105.8467
        },
        "place_id": "...",
        "location_type": "ROOFTOP",
        "types": ["street_address"],
        "address_components": [...]
      }
    ]
  }
}
```

## 🔄 2. Reverse Geocoding - Chuyển tọa độ thành địa chỉ

**Endpoint:** `GET /api/maps/reverse-geocode`

**Query Parameters:**
- `lat` (required): Vĩ độ
- `lng` (required): Kinh độ

**Example Request:**
```javascript
const response = await fetch('/api/maps/reverse-geocode?lat=21.0285&lng=105.8542');
const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "status": "OK",
  "data": {
    "coordinates": { "lat": 21.0285, "lng": 105.8542 },
    "results": [
      {
        "formatted_address": "Hà Nội, Việt Nam",
        "place_id": "...",
        "location_type": "APPROXIMATE",
        "types": ["locality", "political"]
      }
    ]
  }
}
```

## 🔍 3. Autocomplete - Gợi ý địa chỉ

**Endpoint:** `GET /api/maps/autocomplete`

**Query Parameters:**
- `input` (required): Từ khóa tìm kiếm (tối thiểu 2 ký tự)
- `location` (optional): Tọa độ ưu tiên (định dạng: "lat,lng")

**Example Request:**
```javascript
const response = await fetch('/api/maps/autocomplete?input=Cầu Giấy&location=21.0285,105.8542');
const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "status": "OK",
  "data": {
    "input": "Cầu Giấy",
    "suggestions": [
      {
        "description": "Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội",
        "place_id": "...",
        "main_text": "Cầu Giấy",
        "secondary_text": "Quan Hoa, Cầu Giấy, Hà Nội",
        "types": ["route"],
        "compound": {
          "district": "Cầu Giấy",
          "commune": "Quan Hoa"
        }
      }
    ]
  }
}
```

## 📍 4. Chi tiết địa điểm

**Endpoint:** `GET /api/maps/place-detail/:placeId`

**Parameters:**
- `placeId` (required): ID của địa điểm

**Example Request:**
```javascript
const response = await fetch('/api/maps/place-detail/ChIJeRpOeF41QjERRm9iLWXrf0E');
const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "data": {
    "place_id": "ChIJeRpOeF41QjERRm9iLWXrf0E",
    "name": "Hà Nội",
    "formatted_address": "Hà Nội, Việt Nam",
    "coordinates": {
      "lat": 21.0285,
      "lng": 105.8542
    },
    "address_components": [...],
    "types": ["locality", "political"],
    "plus_code": {...},
    "url": "..."
  }
}
```

## ✅ 5. Xác thực địa chỉ

**Endpoint:** `POST /api/maps/validate-address`

**Body:**
```json
{
  "address": "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội"
}
```

**Example Request:**
```javascript
const response = await fetch('/api/maps/validate-address', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội'
  })
});
const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "data": {
    "original_address": "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
    "is_valid": true,
    "formatted_address": "Số 1 Đại Cồ Việt, Phường Bách Khoa, Quận Hai Bà Trưng, Hà Nội",
    "coordinates": {
      "lat": 21.0045,
      "lng": 105.8467
    },
    "confidence": "ROOFTOP",
    "address_components": [...]
  }
}
```

## 📏 6. Tính khoảng cách

**Endpoint:** `GET /api/maps/distance`

**Query Parameters:**
- `origin` (required): Địa chỉ điểm xuất phát
- `destination` (required): Địa chỉ điểm đến

**Example Request:**
```javascript
const response = await fetch('/api/maps/distance?origin=Hà Nội&destination=TP.HCM');
const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "status": "OK",
  "data": {
    "origin": "Hà Nội",
    "destination": "TP.HCM",
    "distance": "1,694 km",
    "duration": "18 giờ 30 phút"
  }
}
```

## 🔍 7. Tìm kiếm gần đó

**Endpoint:** `GET /api/maps/nearby`

**Query Parameters:**
- `lat` (required): Vĩ độ
- `lng` (required): Kinh độ
- `radius` (optional): Bán kính tìm kiếm (mét, mặc định: 1000)
- `type` (optional): Loại địa điểm (ví dụ: restaurant, hospital)

**Example Request:**
```javascript
const response = await fetch('/api/maps/nearby?lat=21.0285&lng=105.8542&radius=2000&type=restaurant');
const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "status": "OK",
  "data": {
    "center": { "lat": 21.0285, "lng": 105.8542 },
    "radius": 2000,
    "type": "restaurant",
    "places": [
      {
        "description": "Nhà hàng ABC, Hà Nội",
        "place_id": "...",
        "main_text": "Nhà hàng ABC",
        "secondary_text": "Hà Nội",
        "types": ["restaurant", "food"]
      }
    ]
  }
}
```

## ⚙️ 8. Cấu hình cho frontend

**Endpoint:** `GET /api/maps/config`

**Example Request:**
```javascript
const response = await fetch('/api/maps/config');
const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": "Goong Maps",
    "configured": true,
    "features": {
      "geocoding": true,
      "autocomplete": true,
      "place_details": true,
      "distance_matrix": true,
      "reverse_geocoding": true
    },
    "map_center": {
      "vietnam": { "lat": 16.0583, "lng": 108.2772 },
      "hanoi": { "lat": 21.0285, "lng": 105.8542 },
      "hcmc": { "lat": 10.8231, "lng": 106.6297 }
    },
    "zoom_levels": {
      "country": 6,
      "city": 12,
      "district": 14,
      "street": 16
    }
  }
}
```

## 🔍 9. Kiểm tra trạng thái

**Endpoint:** `GET /api/maps/health`

**Example Request:**
```javascript
const response = await fetch('/api/maps/health');
const data = await response.json();
```

**Response:**
```json
{
  "service": "Goong Maps",
  "status": "ready",
  "configured": true,
  "apiKeyStatus": "valid",
  "timestamp": "2024-07-22T18:30:00.000Z"
}
```

## 🎯 Các use case phổ biến cho frontend

### 1. **Form nhập địa chỉ với autocomplete**
```javascript
// Gợi ý địa chỉ khi user nhập
async function getAddressSuggestions(input) {
  if (input.length < 2) return [];
  
  const response = await fetch(`/api/maps/autocomplete?input=${encodeURIComponent(input)}`);
  const data = await response.json();
  
  return data.success ? data.data.suggestions : [];
}
```

### 2. **Xác thực địa chỉ trước khi lưu**
```javascript
async function validateAddress(address) {
  const response = await fetch('/api/maps/validate-address', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
  
  const data = await response.json();
  return data.success && data.data.is_valid;
}
```

### 3. **Hiển thị bản đồ với tọa độ**
```javascript
async function getCoordinatesForAddress(address) {
  const response = await fetch(`/api/maps/geocode?address=${encodeURIComponent(address)}`);
  const data = await response.json();
  
  if (data.success && data.data.results.length > 0) {
    return data.data.results[0].coordinates;
  }
  return null;
}
```

### 4. **Tính phí ship theo khoảng cách**
```javascript
async function calculateShippingFee(origin, destination) {
  const response = await fetch(`/api/maps/distance?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
  const data = await response.json();
  
  if (data.success && data.data.distance) {
    // Parse distance và tính phí
    const distanceText = data.data.distance;
    // Logic tính phí ship...
    return { distance: distanceText, fee: calculatedFee };
  }
  return null;
}
```

### 5. **Tìm cửa hàng gần nhất**
```javascript
async function findNearestStore(userLat, userLng) {
  const response = await fetch(`/api/maps/nearby?lat=${userLat}&lng=${userLng}&type=store&radius=5000`);
  const data = await response.json();
  
  return data.success ? data.data.places : [];
}
```

## 🚀 Tích hợp với React/Next.js

### Hook tùy chỉnh cho maps
```javascript
// hooks/useMaps.js
import { useState, useCallback } from 'react';

export function useMaps() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const geocode = useCallback(async (address) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/maps/geocode?address=${encodeURIComponent(address)}`);
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const autocomplete = useCallback(async (input) => {
    if (input.length < 2) return [];
    
    setLoading(true);
    try {
      const response = await fetch(`/api/maps/autocomplete?input=${encodeURIComponent(input)}`);
      const data = await response.json();
      return data.success ? data.data.suggestions : [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { geocode, autocomplete, loading, error };
}
```

## 🔒 Lưu ý bảo mật

- Tất cả API đã được validate input
- Rate limiting được áp dụng
- API key Goong được bảo vệ ở backend
- CORS được cấu hình cho frontend domain

## 📱 Responsive & Mobile

- Tất cả API đều hỗ trợ mobile
- Response được optimize cho bandwidth thấp
- Tự động detect location từ browser geolocation API