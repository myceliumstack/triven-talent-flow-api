# 🔧 Frontend Company ID Update Guide

## 🚨 Issue Identified

The frontend is receiving **500 Internal Server Error** when fetching job postings because it's using **old company IDs** that no longer exist after the database migration.

## 🔍 Root Cause

After the database migration and seeding process, all company IDs have changed. The frontend is still using the old company ID `cmfahk7oj0039jaklezojxiii` which no longer exists in the database.

## ✅ Current Valid Company IDs

Here are the **current valid company IDs** in the database:

| Company ID | Company Name | Industry | Location |
|------------|--------------|----------|----------|
| `cmfejpvvy0039ybdxgxk3jdte` | TechCorp Solutions | Technology | San Francisco, CA |
| `cmfejpvzb003aybdx82t5njhp` | Global Finance Inc | Finance | New York, NY |
| `cmfejpw2r003bybdxmad9sssl` | HealthTech Innovations | Healthcare | Boston, MA |
| `cmfejpw62003cybdx4g2lwh1k` | EcoGreen Energy | Energy | Austin, TX |
| `cmfejpw99003dybdx6k5uqg82` | RetailMax Corporation | Retail | Chicago, IL |
| `cmfejpwcg003eybdxtiehs0l7` | StartupHub Ventures | Technology | Seattle, WA |

## 🛠️ Backend Improvements Made

### 1. **Enhanced Error Handling**
- Added detailed logging to identify company ID issues
- Improved error messages with specific company ID information
- Better 404 vs 500 error differentiation

### 2. **New Helper Endpoint**
- **GET** `/api/job-postings/companies` - Returns all companies with current IDs
- This allows the frontend to refresh its company list

### 3. **Improved Logging**
- Service-level logging for company existence checks
- Controller-level logging for request tracking
- Clear error messages for debugging

## 🔧 Frontend Fix Options

### Option 1: Update Company IDs (Recommended)
Update the frontend to use the new company IDs:

```javascript
// OLD (causing 500 error)
const oldCompanyId = 'cmfahk7oj0039jaklezojxiii';

// NEW (working)
const newCompanyId = 'cmfejpvvy0039ybdxgxk3jdte'; // TechCorp Solutions
```

### Option 2: Dynamic Company List Refresh
Use the new companies endpoint to refresh the company list:

```javascript
// Fetch current companies
const response = await fetch('/api/job-postings/companies', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { data: companies } = await response.json();

// Use the current company IDs
companies.forEach(company => {
  console.log(`Company: ${company.name}, ID: ${company.id}`);
});
```

### Option 3: Company Search by Name
If you know the company name, you can search for it:

```javascript
// Search for company by name
const response = await fetch('/api/companies/search?q=TechCorp', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🧪 Testing the Fix

### Test with Valid Company ID:
```bash
curl -X GET "http://localhost:5000/api/job-postings/company/cmfejpvvy0039ybdxgxk3jdte" \
  -H "Authorization: Bearer <valid-token>"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Job postings retrieved successfully",
  "data": {
    "jobPostings": [
      {
        "id": "...",
        "title": "Senior Full Stack Developer",
        "company": {
          "name": "TechCorp Solutions"
        },
        "status": {
          "name": "uncontacted"
        }
      }
    ]
  }
}
```

### Test with Invalid Company ID:
```bash
curl -X GET "http://localhost:5000/api/job-postings/company/cmfahk7oj0039jaklezojxiii" \
  -H "Authorization: Bearer <valid-token>"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Company with ID cmfahk7oj0039jaklezojxiii not found"
}
```

## 📊 Current Database State

- **Companies**: 6 companies with new IDs
- **Job Postings**: 12 job postings (2 per company)
- **Statuses**: 12 job posting statuses
- **All relationships**: Working correctly

## 🚀 Immediate Action Required

1. **Update Frontend Company IDs**: Replace old company IDs with new ones
2. **Test Company Selection**: Verify company selection works with new IDs
3. **Update Company Search**: Ensure company search returns current IDs
4. **Refresh Company Lists**: Use the new companies endpoint to get current data

## 🔍 Debugging Tips

### Check Server Logs:
The backend now provides detailed logging:
```
🏢 Fetching job postings for company ID: cmfahk7oj0039jaklezojxiii
🔍 JobPostingService: Checking company existence for ID: cmfahk7oj0039jaklezojxiii
❌ JobPostingService: Company not found for ID: cmfahk7oj0039jaklezojxiii
📍 Company not found, returning 404
```

### Verify Company Existence:
```javascript
// Check if company exists
const companyExists = await fetch(`/api/companies/${companyId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## ✅ Success Indicators

After the fix, you should see:
- ✅ **200 OK** responses for valid company IDs
- ✅ **404 Not Found** for invalid company IDs (not 500)
- ✅ Job postings loading correctly
- ✅ Company details displaying properly
- ✅ No more 500 Internal Server Errors

## 📞 Support

If you continue to see 500 errors after updating the company IDs, check:
1. JWT token validity
2. Network connectivity
3. Server logs for specific error details
4. Database connection status

The backend is now properly configured and ready to handle requests with the correct company IDs! 🎯
