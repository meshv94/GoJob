# 🚀 GoJob Email Sender - Setup Guide

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 18.0.0 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **SMTP Email Service** (Gmail, SendGrid, AWS SES, etc.)

## 🔧 Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Environment Configuration

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/gojob
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/gojob

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# SMTP Configuration (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Step 3: SMTP Setup

#### Gmail Setup:
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the generated password in your `.env` file

#### SendGrid Setup:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### AWS SES Setup:
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-access-key
SMTP_PASS=your-ses-secret-key
```

### Step 4: Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Step 5: Verify Setup

The server should start and display:
```
🚀 GoJob Email Sender Server running on port 3000
📧 Environment: development
🔗 Health check: http://localhost:3000/health
📚 API docs: http://localhost:3000/api/v1
📊 MongoDB: mongodb://localhost:27017/gojob
📧 SMTP: smtp.gmail.com:587
```

## 🧪 Testing the API

### Test Health Endpoint
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "GoJob Email Sender API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### Test API Info
```bash
curl http://localhost:3000/api/v1
```

### Test Authentication (should fail without data)
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 📱 Frontend Setup (Coming Soon)

The React frontend will be available in the next phase of development.

## 🐳 Docker Setup (Optional)

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build
```bash
# Build backend image
docker build -t gojob-backend ./backend

# Run container
docker run -p 3000:3000 --env-file .env gojob-backend
```

## 🔍 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
- Ensure MongoDB is running
- Check your connection string
- Verify network access (for Atlas)

#### 2. SMTP Authentication Failed
- Verify your email and password
- Check if 2FA is enabled (for Gmail)
- Ensure app passwords are generated correctly

#### 3. Port Already in Use
- Change the PORT in your `.env` file
- Kill the process using the port: `lsof -ti:3000 | xargs kill -9`

#### 4. JWT Secret Issues
- Generate a strong random string for JWT_SECRET
- Ensure the secret is at least 32 characters long

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=*
```

## 📚 Next Steps

Once the backend is running successfully:

1. **Test User Registration**: Create a new user account
2. **Verify Email**: Check OTP functionality
3. **Create Email Groups**: Test group management
4. **Send Test Emails**: Verify email functionality
5. **Explore Analytics**: Check tracking and reporting

## 🆘 Getting Help

If you encounter issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check the API documentation at `/api/v1`
5. Create an issue in the repository

## 🎯 API Endpoints Overview

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/send-otp` - Send OTP
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/login` - User login

### Groups
- `GET /groups` - List groups
- `POST /groups` - Create group
- `PUT /groups/:id` - Update group
- `DELETE /groups/:id` - Delete group

### Emails
- `GET /emails` - List emails
- `POST /emails` - Create email
- `POST /emails/:id/send` - Send email
- `GET /emails/:id/analytics` - Get analytics

---

**Happy Coding! 🚀**
