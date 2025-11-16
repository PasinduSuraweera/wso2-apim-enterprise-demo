# API Documentation

Complete reference for the Inventory Management API endpoints, authentication, and usage examples.

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Base URLs](#base-urls)
- [Endpoints](#endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

## Overview

The Inventory Management API provides RESTful endpoints for managing product inventory, categories, and health monitoring. All endpoints require OAuth2 authentication and are subject to rate limiting policies.

### API Specifications
- **Protocol**: HTTPS (TLS 1.3)
- **Format**: JSON
- **Authentication**: OAuth2 Bearer Token
- **Rate Limiting**: 50 requests per minute
- **Version**: v1.0

## Authentication

### OAuth2 Client Credentials Flow

**Token Endpoint:**
```
POST https://localhost:9443/oauth2/token
```

**Request Headers:**
```
Content-Type: application/x-www-form-urlencoded
Authorization: Basic {base64(client_id:client_secret)}
```

**Request Body:**
```
grant_type=client_credentials&scope=default
```

**Response:**
```json
{
  "access_token": "eyJ4NXQiOiJNekF4...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "default"
}
```

### Using Access Token

**Request Header:**
```
Authorization: Bearer {access_token}
```

**Example:**
```bash
curl -H "Authorization: Bearer eyJ4NXQiOiJNekF4..." \
     https://localhost:8243/inventory/v1.0/health \
     -k
```

## Base URLs

| Environment | Base URL |
|-------------|----------|
| **Production Gateway** | `https://localhost:8243/inventory/v1.0` |
| **Development Backend** | `http://localhost:8081` |

## Endpoints

### 1. Health Check

Monitor service availability and performance metrics.

```http
GET /health
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2025-11-16T14:33:31.260Z",
  "service": "inventory-backend",
  "version": "1.0.0",
  "uptime": 12504.119
}
```

**cURL Example:**
```bash
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     https://localhost:8243/inventory/v1.0/health \
     -k
```

---

### 2. Get All Items

Retrieve all inventory items with pagination support.

```http
GET /items
```

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | integer | Page number (1-based) | 1 |
| `limit` | integer | Items per page (1-100) | 10 |
| `category` | string | Filter by category | - |
| `search` | string | Search in name/description | - |

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "items": [
    {
      "id": 1,
      "name": "Wireless Headphones",
      "category": "electronics",
      "price": 99.99,
      "stock": 25,
      "description": "High-quality wireless headphones with noise cancellation",
      "sku": "WH-001",
      "created_at": "2025-11-16T10:00:00Z",
      "updated_at": "2025-11-16T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Coffee Mug",
      "category": "home",
      "price": 15.99,
      "stock": 50,
      "description": "Ceramic coffee mug with ergonomic handle",
      "sku": "CM-002",
      "created_at": "2025-11-16T10:00:00Z",
      "updated_at": "2025-11-16T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 10,
    "pages": 1
  },
  "total": 10,
  "timestamp": "2025-11-16T14:33:31.260Z"
}
```

**cURL Examples:**
```bash
# Get all items
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     https://localhost:8243/inventory/v1.0/items \
     -k

# Get items with pagination
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     "https://localhost:8243/inventory/v1.0/items?page=1&limit=5" \
     -k

# Filter by category
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     "https://localhost:8243/inventory/v1.0/items?category=electronics" \
     -k

# Search items
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     "https://localhost:8243/inventory/v1.0/items?search=wireless" \
     -k
```

---

### 3. Get Item by ID

Retrieve a specific inventory item by its unique identifier.

```http
GET /items/{id}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Unique item identifier |

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "item": {
    "id": 1,
    "name": "Wireless Headphones",
    "category": "electronics",
    "price": 99.99,
    "stock": 25,
    "description": "High-quality wireless headphones with noise cancellation",
    "sku": "WH-001",
    "specifications": {
      "brand": "TechCorp",
      "model": "WH-Pro-2023",
      "color": "Black",
      "warranty": "2 years"
    },
    "created_at": "2025-11-16T10:00:00Z",
    "updated_at": "2025-11-16T10:00:00Z"
  },
  "timestamp": "2025-11-16T14:33:31.260Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": {
    "code": "ITEM_NOT_FOUND",
    "message": "Item with ID 999 not found",
    "timestamp": "2025-11-16T14:33:31.260Z"
  }
}
```

**cURL Example:**
```bash
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     https://localhost:8243/inventory/v1.0/items/1 \
     -k
```

---

### 4. Get Categories

Retrieve all available product categories with item counts.

```http
GET /categories
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "categories": [
    {
      "name": "electronics",
      "display_name": "Electronics",
      "description": "Electronic devices and gadgets",
      "item_count": 4,
      "subcategories": ["headphones", "smartphones", "laptops"]
    },
    {
      "name": "home",
      "display_name": "Home & Garden",
      "description": "Home improvement and garden items",
      "item_count": 3,
      "subcategories": ["kitchen", "decor", "garden"]
    },
    {
      "name": "books",
      "display_name": "Books",
      "description": "Books and educational materials",
      "item_count": 2,
      "subcategories": ["fiction", "non-fiction", "technical"]
    },
    {
      "name": "clothing",
      "display_name": "Clothing",
      "description": "Apparel and accessories",
      "item_count": 1,
      "subcategories": ["shirts", "pants", "accessories"]
    }
  ],
  "total_categories": 4,
  "total_items": 10,
  "timestamp": "2025-11-16T14:33:31.260Z"
}
```

**cURL Example:**
```bash
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     https://localhost:8243/inventory/v1.0/categories \
     -k
```

---

### 5. Create Item

Create a new inventory item.

```http
POST /items
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Bluetooth Speaker",
  "category": "electronics",
  "price": 79.99,
  "stock": 15,
  "description": "Portable Bluetooth speaker with excellent sound quality",
  "sku": "BS-003",
  "specifications": {
    "brand": "AudioTech",
    "model": "BT-Pro-2023",
    "color": "Blue",
    "battery_life": "12 hours"
  }
}
```

**Response:** `201 Created`
```json
{
  "item": {
    "id": 11,
    "name": "Bluetooth Speaker",
    "category": "electronics",
    "price": 79.99,
    "stock": 15,
    "description": "Portable Bluetooth speaker with excellent sound quality",
    "sku": "BS-003",
    "specifications": {
      "brand": "AudioTech",
      "model": "BT-Pro-2023",
      "color": "Blue",
      "battery_life": "12 hours"
    },
    "created_at": "2025-11-16T14:33:31.260Z",
    "updated_at": "2025-11-16T14:33:31.260Z"
  },
  "message": "Item created successfully",
  "timestamp": "2025-11-16T14:33:31.260Z"
}
```

**Validation Error:** `400 Bad Request`
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      },
      {
        "field": "price",
        "message": "Price must be a positive number"
      }
    ],
    "timestamp": "2025-11-16T14:33:31.260Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST \
     -H "Authorization: Bearer $ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Bluetooth Speaker",
       "category": "electronics",
       "price": 79.99,
       "stock": 15,
       "description": "Portable Bluetooth speaker with excellent sound quality"
     }' \
     https://localhost:8243/inventory/v1.0/items \
     -k
```

## Data Models

### Item Object
```typescript
interface Item {
  id: number;                    // Unique identifier
  name: string;                  // Item name (required)
  category: string;              // Product category (required)
  price: number;                 // Price in USD (required)
  stock: number;                 // Available quantity (required)
  description?: string;          // Item description
  sku?: string;                  // Stock Keeping Unit
  specifications?: object;       // Additional specifications
  created_at: string;           // ISO 8601 timestamp
  updated_at: string;           // ISO 8601 timestamp
}
```

### Category Object
```typescript
interface Category {
  name: string;                  // Category identifier
  display_name: string;          // Human-readable name
  description: string;           // Category description
  item_count: number;           // Number of items in category
  subcategories: string[];      // Sub-category list
}
```

### Pagination Object
```typescript
interface Pagination {
  page: number;                 // Current page (1-based)
  limit: number;                // Items per page
  total: number;                // Total items
  pages: number;                // Total pages
}
```

### Health Object
```typescript
interface Health {
  status: "healthy" | "unhealthy";  // Service status
  timestamp: string;                // ISO 8601 timestamp
  service: string;                  // Service name
  version: string;                  // Service version
  uptime: number;                   // Uptime in seconds
}
```

## Error Handling

### Standard HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details (optional)",
    "timestamp": "2025-11-16T14:33:31.260Z"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `MISSING_CREDENTIALS` | No authorization header provided |
| `INVALID_TOKEN` | OAuth2 token is invalid or expired |
| `RATE_LIMIT_EXCEEDED` | Too many requests in time window |
| `ITEM_NOT_FOUND` | Requested item does not exist |
| `VALIDATION_ERROR` | Request data validation failed |
| `SERVER_ERROR` | Internal server error occurred |

## Rate Limiting

### Policy Configuration

| Level | Limit | Time Window | Status Code |
|-------|-------|-------------|-------------|
| **Application** | 50 requests | 1 minute | 429 |
| **Subscription** | 5000 requests | 1 minute | 429 |
| **Effective** | 50 requests | 1 minute | 429 |

### Rate Limit Headers

Response headers include rate limiting information:

```http
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1700140000
```

### Rate Limit Exceeded Response

```json
{
  "fault": {
    "code": "900801",
    "message": "API Limit Reached",
    "description": "API request quota exceeded. You have exceeded the allocated quota."
  }
}
```

## Examples

### Complete Workflow Example

```bash
#!/bin/bash
# Complete API workflow demonstration

# Set access token
export ACCESS_TOKEN="your-access-token-here"
BASE_URL="https://localhost:8243/inventory/v1.0"

echo "=== Inventory API Workflow Demo ==="

echo "1. Health Check:"
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     $BASE_URL/health -k

echo -e "\n2. Get All Categories:"
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     $BASE_URL/categories -k

echo -e "\n3. Get All Items:"
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     $BASE_URL/items -k

echo -e "\n4. Get Specific Item:"
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     $BASE_URL/items/1 -k

echo -e "\n5. Filter Items by Category:"
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     "$BASE_URL/items?category=electronics" -k

echo -e "\n6. Create New Item:"
curl -X POST \
     -H "Authorization: Bearer $ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Smart Watch",
       "category": "electronics",
       "price": 199.99,
       "stock": 20,
       "description": "Feature-rich smartwatch with health monitoring"
     }' \
     $BASE_URL/items -k

echo -e "\n=== Demo Complete ==="
```

### Postman Collection

Import the following collection for easy testing:

```json
{
  "info": {
    "name": "WSO2 Inventory API",
    "description": "Complete API collection for inventory management",
    "version": "1.0.0"
  },
  "auth": {
    "type": "bearer",
    "bearer": {
      "token": "{{accessToken}}"
    }
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://localhost:8243/inventory/v1.0"
    },
    {
      "key": "accessToken",
      "value": "your-access-token-here"
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/health"
      }
    },
    {
      "name": "Get All Items",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/items"
      }
    },
    {
      "name": "Get Item by ID",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/items/1"
      }
    },
    {
      "name": "Get Categories",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/categories"
      }
    },
    {
      "name": "Create Item",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/items",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Test Item\",\n  \"category\": \"electronics\",\n  \"price\": 99.99,\n  \"stock\": 10,\n  \"description\": \"Test item description\"\n}"
        }
      }
    }
  ]
}
```

---

*API Documentation Version: 1.0*  
*Last Updated: 2025-11-16*  
*Author: Pasindu Suraweera*