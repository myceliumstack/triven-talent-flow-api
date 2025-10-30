# Job Assignment API Endpoints

## Base URL: `/api/job-assignments`

All endpoints require authentication and appropriate RBAC permissions.

### 1. Create Job Assignment
**POST** `/api/job-assignments`

**Required Fields:**
- `jobId` (string) - ID of the job
- `assignedUserId` (string) - ID of the user being assigned
- `statusId` (string) - ID of the assignment status
- `assignedById` (string) - ID of the user making the assignment

**Optional Fields:**
- `priority` (string) - Priority level (default: "normal")
- `notes` (string) - Additional notes

**Example Request:**
```json
{
  "jobId": "job_123",
  "assignedUserId": "user_456",
  "statusId": "status_789",
  "assignedById": "user_101",
  "priority": "high",
  "notes": "Urgent assignment"
}
```

### 2. Get All Job Assignments
**GET** `/api/job-assignments`

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 10)
- `jobId` (string) - Filter by job ID
- `assignedUserId` (string) - Filter by assigned user ID
- `statusId` (string) - Filter by status ID
- `assignedById` (string) - Filter by assigned by user ID
- `priority` (string) - Filter by priority
- `search` (string) - Search in job title, user names, or notes
- `sortBy` (string) - Sort field (default: "assignedAt")
- `sortOrder` (string) - Sort order: "asc" or "desc" (default: "desc")

**Example Request:**
```
GET /api/job-assignments?page=1&limit=10&priority=high&search=developer
```

### 3. Get Job Assignment by ID
**GET** `/api/job-assignments/:id`

**Path Parameters:**
- `id` (string) - Job assignment ID

### 4. Update Job Assignment
**PUT** `/api/job-assignments/:id`

**Path Parameters:**
- `id` (string) - Job assignment ID

**Optional Fields (at least one required):**
- `assignedUserId` (string) - New assigned user ID
- `statusId` (string) - New status ID
- `priority` (string) - New priority
- `notes` (string) - New notes

**Example Request:**
```json
{
  "statusId": "new_status_123",
  "priority": "low",
  "notes": "Updated assignment notes"
}
```

### 5. Delete Job Assignment
**DELETE** `/api/job-assignments/:id`

**Path Parameters:**
- `id` (string) - Job assignment ID

### 6. Get Job Assignments by Job ID
**GET** `/api/job-assignments/job/:jobId`

**Path Parameters:**
- `jobId` (string) - Job ID

### 7. Get Job Assignments by User ID
**GET** `/api/job-assignments/user/:userId`

**Path Parameters:**
- `userId` (string) - User ID

## Response Format

All endpoints return responses in the following format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "pagination": { ... } // Only for list endpoints
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## RBAC Permissions Required

- **Create**: `job-assignment:create`
- **Read**: `job-assignment:read`
- **Update**: `job-assignment:update`
- **Delete**: `job-assignment:delete`

## Example Usage

### Create a new job assignment:
```bash
curl -X POST http://localhost:5000/api/job-assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "jobId": "job_123",
    "assignedUserId": "user_456",
    "statusId": "status_789",
    "assignedById": "user_101",
    "priority": "high",
    "notes": "Urgent assignment"
  }'
```

### Get all job assignments with filters:
```bash
curl -X GET "http://localhost:5000/api/job-assignments?page=1&limit=10&priority=high" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get job assignments for a specific job:
```bash
curl -X GET http://localhost:5000/api/job-assignments/job/job_123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
