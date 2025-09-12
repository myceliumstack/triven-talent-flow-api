# 🏷️ JobPostingStatus API Documentation

## Overview
Complete CRUD API for managing job posting statuses with full authentication, validation, and error handling.

## 🔐 Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

## 📋 Available Endpoints

### 1. **GET** `/api/job-posting-statuses`
**Get all job posting statuses with pagination and filters**

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 50)
- `search` (string, optional): Search by status name
- `isActive` (boolean, optional): Filter by active status
- `sortBy` (string, optional): Sort field (default: 'name')
- `sortOrder` (string, optional): Sort order 'asc' or 'desc' (default: 'asc')

**Response:**
```json
{
  "success": true,
  "message": "Job posting statuses retrieved successfully",
  "data": [
    {
      "id": "cmffronvk0000agp911f7n0hi",
      "name": "uncontacted",
      "isActive": true,
      "createdAt": "2025-09-12T00:22:55.000Z",
      "updatedAt": "2025-09-12T00:22:55.000Z",
      "_count": {
        "jobPostings": 10
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 12,
    "totalPages": 1
  }
}
```

### 2. **GET** `/api/job-posting-statuses/search`
**Search job posting statuses**

**Query Parameters:**
- `q` (string, required): Search query (minimum 2 characters)

**Response:**
```json
{
  "success": true,
  "message": "Status search completed successfully",
  "data": [
    {
      "id": "cmffroo8i0002agp9bxeonofx",
      "name": "follow-up 1",
      "isActive": true,
      "_count": {
        "jobPostings": 0
      }
    }
  ]
}
```

### 3. **GET** `/api/job-posting-statuses/stats`
**Get status statistics**

**Response:**
```json
{
  "success": true,
  "message": "Status statistics retrieved successfully",
  "data": {
    "total": 12,
    "active": 12,
    "inactive": 0,
    "usage": [
      {
        "id": "cmffronvk0000agp911f7n0hi",
        "name": "uncontacted",
        "isActive": true,
        "_count": {
          "jobPostings": 10
        }
      }
    ]
  }
}
```

### 4. **GET** `/api/job-posting-statuses/:id`
**Get status by ID**

**Path Parameters:**
- `id` (string, required): Status ID (CUID)

**Response:**
```json
{
  "success": true,
  "message": "Job posting status retrieved successfully",
  "data": {
    "id": "cmffronvk0000agp911f7n0hi",
    "name": "uncontacted",
    "isActive": true,
    "createdAt": "2025-09-12T00:22:55.000Z",
    "updatedAt": "2025-09-12T00:22:55.000Z",
    "_count": {
      "jobPostings": 10
    }
  }
}
```

### 5. **GET** `/api/job-posting-statuses/name/:name`
**Get status by name**

**Path Parameters:**
- `name` (string, required): Status name

**Response:**
```json
{
  "success": true,
  "message": "Job posting status retrieved successfully",
  "data": {
    "id": "cmffronvk0000agp911f7n0hi",
    "name": "uncontacted",
    "isActive": true,
    "_count": {
      "jobPostings": 10
    }
  }
}
```

### 6. **POST** `/api/job-posting-statuses`
**Create new job posting status**

**Request Body:**
```json
{
  "name": "New Status",
  "isActive": true
}
```

**Validation:**
- `name`: Required, string, 1-100 characters
- `isActive`: Optional, boolean (default: true)

**Response:**
```json
{
  "success": true,
  "message": "Job posting status created successfully",
  "data": {
    "id": "cmffs5bpv0000115sp7dytxnp",
    "name": "New Status",
    "isActive": true,
    "createdAt": "2025-09-12T00:35:00.000Z",
    "updatedAt": "2025-09-12T00:35:00.000Z",
    "_count": {
      "jobPostings": 0
    }
  }
}
```

### 7. **PUT** `/api/job-posting-statuses/:id`
**Update job posting status**

**Path Parameters:**
- `id` (string, required): Status ID (CUID)

**Request Body:**
```json
{
  "name": "Updated Status Name",
  "isActive": false
}
```

**Validation:**
- `name`: Optional, string, 1-100 characters
- `isActive`: Optional, boolean

**Response:**
```json
{
  "success": true,
  "message": "Job posting status updated successfully",
  "data": {
    "id": "cmffs5bpv0000115sp7dytxnp",
    "name": "Updated Status Name",
    "isActive": false,
    "updatedAt": "2025-09-12T00:36:00.000Z",
    "_count": {
      "jobPostings": 0
    }
  }
}
```

### 8. **PATCH** `/api/job-posting-statuses/:id/toggle`
**Toggle status active/inactive**

**Path Parameters:**
- `id` (string, required): Status ID (CUID)

**Response:**
```json
{
  "success": true,
  "message": "Status activated successfully",
  "data": {
    "id": "cmffs5bpv0000115sp7dytxnp",
    "name": "Updated Status Name",
    "isActive": true,
    "updatedAt": "2025-09-12T00:37:00.000Z",
    "_count": {
      "jobPostings": 0
    }
  }
}
```

### 9. **DELETE** `/api/job-posting-statuses/:id`
**Delete job posting status**

**Path Parameters:**
- `id` (string, required): Status ID (CUID)

**Response:**
```json
{
  "success": true,
  "message": "Job posting status deleted successfully"
}
```

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Search query must be at least 2 characters long"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Job posting status not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Status with this name already exists"
}
```

```json
{
  "success": false,
  "message": "Cannot delete status that is being used by job postings"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## 📊 Default Status Values

The system comes with 12 predefined statuses:

1. **uncontacted** - Initial status for new job postings
2. **contacted** - Company has been contacted
3. **follow-up 1** - First follow-up completed
4. **follow-up 2** - Second follow-up completed
5. **Follow-up Completed** - All follow-ups completed
6. **Connected** - Successfully connected with company
7. **Future** - Potential future opportunity
8. **Negative** - Not interested
9. **DNC** - Do Not Contact
10. **Qualified** - Qualified opportunity
11. **Closed won** - Successfully closed
12. **Closed lost** - Opportunity lost

## 🔧 Usage Examples

### Get all active statuses
```bash
curl -X GET "http://localhost:5000/api/job-posting-statuses?isActive=true" \
  -H "Authorization: Bearer <token>"
```

### Search for follow-up statuses
```bash
curl -X GET "http://localhost:5000/api/job-posting-statuses/search?q=follow" \
  -H "Authorization: Bearer <token>"
```

### Create a new status
```bash
curl -X POST "http://localhost:5000/api/job-posting-statuses" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "In Progress", "isActive": true}'
```

### Update a status
```bash
curl -X PUT "http://localhost:5000/api/job-posting-statuses/cmffronvk0000agp911f7n0hi" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Contacted", "isActive": true}'
```

### Toggle status active state
```bash
curl -X PATCH "http://localhost:5000/api/job-posting-statuses/cmffronvk0000agp911f7n0hi/toggle" \
  -H "Authorization: Bearer <token>"
```

### Delete a status
```bash
curl -X DELETE "http://localhost:5000/api/job-posting-statuses/cmffronvk0000agp911f7n0hi" \
  -H "Authorization: Bearer <token>"
```

## 🎯 Integration with Job Postings

The JobPostingStatus system integrates seamlessly with job postings:

- **Job Posting Creation**: Can specify `statusId` when creating job postings
- **Job Posting Updates**: Can update job posting status via `statusId`
- **Job Posting Filtering**: Filter job postings by status name or ID
- **Status Usage Tracking**: See how many job postings use each status
- **Referential Integrity**: Cannot delete statuses that are being used

## 🔒 Security Features

- **JWT Authentication**: All endpoints require valid authentication
- **Input Validation**: Comprehensive validation using Zod schemas
- **Error Handling**: Detailed error messages with appropriate HTTP status codes
- **Data Integrity**: Prevents deletion of statuses in use
- **Name Uniqueness**: Prevents duplicate status names

## 📈 Performance Features

- **Pagination**: Efficient pagination for large datasets
- **Search**: Fast text search with case-insensitive matching
- **Sorting**: Flexible sorting options
- **Filtering**: Multiple filter options
- **Statistics**: Quick access to usage statistics
- **Optimized Queries**: Efficient database queries with proper indexing
