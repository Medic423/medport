# API Documentation: [Endpoint Name]

## **📋 Endpoint Information**
**Endpoint**: `[METHOD] /api/[path]`
**Version**: [v1, v2, etc.]
**Authentication**: [Required/Optional/None]
**Rate Limit**: [requests per time period]
**Last Updated**: [Date]

---

## **🎯 Overview**

### **Purpose**
[What does this endpoint do?]

### **Use Cases**
1. Use case 1
2. Use case 2
3. Use case 3

---

## **🔐 Authentication**

### **Required Authentication**
- **Type**: [Bearer Token/API Key/OAuth/None]
- **Header**: `Authorization: Bearer <token>`
- **Permissions**: [Required user permissions]

### **Authentication Example**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  https://api.example.com/api/endpoint
```

---

## **📥 Request**

### **HTTP Method**
`[GET/POST/PUT/PATCH/DELETE]`

### **Endpoint URL**
```
[METHOD] /api/[path]
```

### **Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Resource ID |
| `param` | string | No | Optional parameter |

### **Query Parameters**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `limit` | integer | No | 10 | Items per page |
| `filter` | string | No | - | Filter criteria |

### **Request Headers**
| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | Yes | Bearer token |
| `X-Custom-Header` | No | Custom header description |

### **Request Body**
```json
{
  "field1": "string",
  "field2": 123,
  "field3": {
    "nestedField": "value"
  },
  "field4": ["array", "values"]
}
```

### **Field Descriptions**
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `field1` | string | Yes | max 255 chars | Description |
| `field2` | integer | Yes | min 0 | Description |
| `field3` | object | No | - | Description |
| `field4` | array | No | max 10 items | Description |

---

## **📤 Response**

### **Success Response**
**Status Code**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 123,
    "field1": "value",
    "field2": "value",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  },
  "meta": {
    "timestamp": "2025-01-01T00:00:00Z",
    "requestId": "uuid"
  }
}
```

### **Response Fields**
| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether request was successful |
| `data` | object | Response data |
| `data.id` | integer | Resource ID |
| `meta` | object | Metadata about the request |

---

## **❌ Error Responses**

### **400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid input provided",
    "details": [
      {
        "field": "field1",
        "message": "Field is required"
      }
    ]
  }
}
```

### **401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### **403 Forbidden**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### **404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### **500 Internal Server Error**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

### **Error Codes**
| Code | Description | Resolution |
|------|-------------|------------|
| `INVALID_INPUT` | Invalid input provided | Check request format |
| `UNAUTHORIZED` | Authentication required | Provide valid token |
| `FORBIDDEN` | Insufficient permissions | Check user permissions |
| `NOT_FOUND` | Resource not found | Verify resource exists |

---

## **📝 Examples**

### **Example 1: Basic Request**

**Request**:
```bash
curl -X POST https://api.example.com/api/endpoint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "field1": "value",
    "field2": 123
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 456,
    "field1": "value",
    "field2": 123
  }
}
```

---

### **Example 2: With Query Parameters**

**Request**:
```bash
curl -X GET "https://api.example.com/api/endpoint?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

### **Example 3: JavaScript/TypeScript**

```typescript
const response = await fetch('https://api.example.com/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    field1: 'value',
    field2: 123
  })
});

const data = await response.json();
console.log(data);
```

---

### **Example 4: Python**

```python
import requests

url = 'https://api.example.com/api/endpoint'
headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}'
}
payload = {
    'field1': 'value',
    'field2': 123
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print(data)
```

---

## **🔄 Pagination**

### **Request Parameters**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

### **Response Format**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## **🔍 Filtering & Sorting**

### **Filter Parameters**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `filter[field]` | string | Filter by field | `filter[status]=active` |
| `search` | string | Search query | `search=keyword` |

### **Sort Parameters**
| Parameter | Description | Example |
|-----------|-------------|---------|
| `sort` | Sort field | `sort=createdAt` |
| `order` | Sort order (asc/desc) | `order=desc` |

---

## **⚡ Performance**

### **Response Times**
- **Average**: ~100ms
- **95th Percentile**: ~200ms
- **99th Percentile**: ~500ms

### **Rate Limits**
- **Limit**: 100 requests per minute
- **Headers**: 
  - `X-RateLimit-Limit`: Total limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

---

## **🔗 Related Endpoints**
- [`GET /api/related-endpoint`](./related-endpoint.md)
- [`POST /api/another-endpoint`](./another-endpoint.md)

---

## **📚 Additional Resources**
- [Authentication Guide](../reference/authentication.md)
- [Error Handling Guide](../reference/error-handling.md)
- [Rate Limiting Guide](../reference/rate-limiting.md)

---

## **📝 Changelog**

### **Version 1.1** - [Date]
- Added new field: `field3`
- Updated error codes
- Improved performance

### **Version 1.0** - [Date]
- Initial release

---

*Created: [DATE]*
*Last Updated: [DATE]*
*Version: [VERSION]*

