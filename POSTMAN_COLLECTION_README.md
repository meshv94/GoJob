# GoJob Email Sender API - Postman Collection

This repository contains a comprehensive Postman collection for testing the GoJob Email Sender API, a bulk email management system with authentication, group management, and email tracking features.

## 📁 Files Included

- `GoJob_Email_Sender_API.postman_collection.json` - Main Postman collection
- `GoJob_Email_Sender_Environment.postman_environment.json` - Environment variables
- `POSTMAN_COLLECTION_README.md` - This documentation file

## 🚀 Quick Start

### 1. Import Collection and Environment

1. Open Postman
2. Click **Import** button
3. Import both files:
   - `GoJob_Email_Sender_API.postman_collection.json`
   - `GoJob_Email_Sender_Environment.postman_environment.json`

### 2. Set Up Environment

1. Select the **GoJob Email Sender Environment** from the environment dropdown
2. Update the `baseUrl` variable if your server is running on a different port
3. The collection will automatically handle authentication tokens

### 3. Start Testing

1. Run the **Health Check** requests first to ensure the API is running
2. Follow the **Test Scenarios** folder for a complete workflow
3. Use individual requests for specific testing

## 📋 API Endpoints Overview

### Health Check
- `GET /health` - API health check
- `GET /api/v1` - API information

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/send-otp` - Send OTP for verification
- `POST /auth/verify-otp` - Verify OTP and get token
- `POST /auth/login` - Login with credentials
- `GET /auth/profile` - Get user profile
- `PUT /auth/change-password` - Change password

### Groups Management
- `GET /groups` - Get all groups
- `GET /groups/:id` - Get group by ID
- `POST /groups` - Create new group (with Joi validation)
- `PUT /groups/:id` - Update group (with Joi validation)
- `DELETE /groups/:id` - Delete group (soft delete)
- `POST /groups/:id/emails` - Add emails to group (with Joi validation)
- `DELETE /groups/:id/emails` - Remove emails from group (with Joi validation)
- `POST /groups/:id/import` - Import emails from CSV

### Email Management
- `GET /emails` - Get all emails (with filtering)
- `GET /emails/:id` - Get email by ID
- `POST /emails` - Create email draft
- `POST /emails/:id/send` - Send email immediately
- `PUT /emails/:id` - Update email
- `DELETE /emails/:id` - Delete email
- `POST /emails/:id/schedule` - Schedule email
- `GET /emails/:id/analytics` - Get email analytics
- `GET /emails/:id/track/:recipientEmail` - Track email open

## 🔧 Features Tested

### ✅ Authentication & Authorization
- User registration with OTP verification
- JWT token-based authentication
- Password management
- User profile management

### ✅ Group Management
- CRUD operations for email groups
- Email validation using Joi schemas
- Bulk email operations
- CSV import functionality (placeholder)

### ✅ Email Operations
- Email draft creation and management
- Bulk email sending
- Email scheduling
- Attachment support
- Email analytics and tracking

### ✅ Validation & Error Handling
- Joi schema validation for all endpoints
- Comprehensive error responses
- Input sanitization
- Type safety

## 🧪 Test Scenarios

### Complete Email Flow
1. **Register User** - Create a new user account
2. **Verify OTP** - Verify email with OTP
3. **Create Group** - Create an email group
4. **Create Email** - Create an email draft
5. **Send Email** - Send the email

### Error Testing
- Invalid email format validation
- Missing required fields
- Unauthorized access attempts
- Quota limit testing

## 🔑 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `baseUrl` | API base URL | `http://localhost:3000` |
| `authToken` | JWT authentication token | Auto-populated |
| `userId` | Current user ID | Auto-populated |
| `groupId` | Current group ID | Auto-populated |
| `emailId` | Current email ID | Auto-populated |
| `testEmail` | Test email address | `test@example.com` |
| `testPassword` | Test password | `testpassword123` |
| `testOTP` | Test OTP code | `123456` |

## 📊 Request Examples

### Create Group with Validation
```json
{
  "name": "Marketing Team",
  "emails": [
    {"email": "john@example.com"},
    {"email": "jane@example.com"}
  ],
  "minEmails": 1,
  "maxEmails": 1000,
  "tags": ["marketing", "team"],
  "description": "Marketing team email group"
}
```

### Create Email Draft
```json
{
  "from": "sender@example.com",
  "to": [
    {"email": "recipient1@example.com"},
    {"email": "recipient2@example.com"}
  ],
  "cc": ["cc@example.com"],
  "bcc": ["bcc@example.com"],
  "subject": "Test Email Subject",
  "content": "<h1>Hello World!</h1><p>This is a test email.</p>",
  "attachments": [
    {
      "filename": "document.pdf",
      "path": "/uploads/document.pdf",
      "size": 1024000
    }
  ]
}
```

## 🚨 Error Response Format

All validation errors follow a consistent format:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Group name cannot be empty",
    "Invalid email format"
  ]
}
```

## 🔄 Automated Testing

The collection includes automated tests that:
- Extract and store authentication tokens
- Store IDs for subsequent requests
- Validate response times
- Check response content types
- Verify success/failure status

## 📝 Notes

1. **Authentication**: The collection automatically handles JWT tokens from login/verification responses
2. **Validation**: All group and email operations use Joi validation middleware
3. **Error Handling**: Comprehensive error responses with detailed validation messages
4. **Environment**: Variables are automatically populated during request execution
5. **Testing**: Use the "Test Scenarios" folder for complete workflow testing

## 🛠️ Customization

### Adding New Endpoints
1. Create new requests in the appropriate folder
2. Add validation schemas to `validationSchemas.js`
3. Update the collection with new requests
4. Add environment variables if needed

### Modifying Validation
1. Update schemas in `backend/src/middleware/validationSchemas.js`
2. Test with the collection to ensure proper validation
3. Update request examples if schema changes

## 📞 Support

For issues or questions about the API:
1. Check the server logs for detailed error messages
2. Verify environment variables are set correctly
3. Ensure the server is running on the correct port
4. Check JWT token expiration

## 🔗 Related Files

- `backend/src/middleware/validate.js` - Validation middleware
- `backend/src/middleware/validationSchemas.js` - Joi schemas
- `backend/src/routes/` - API route definitions
- `backend/src/controller/` - Controller implementations

---

**Happy Testing! 🚀**
