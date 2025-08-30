# 📧 GoJob Email Sender

A comprehensive email management system built with the MERN stack, featuring bulk email sending, group management, templates, and advanced analytics.

## 🚀 Features

### 🔐 Authentication & Security
- **JWT-based authentication** with secure token management
- **OTP verification** via email for account activation
- **Password hashing** using bcrypt
- **User quota management** to prevent abuse

### 📧 Email Management
- **Bulk email sending** to multiple recipients
- **Email templates** with customizable placeholders
- **Draft management** - save and edit emails before sending
- **Email scheduling** for future delivery
- **CC/BCC support** for flexible recipient management
- **File attachments** (PDFs, images, documents)

### 👥 Group Management
- **Create email groups** with custom names and descriptions
- **Min/Max email constraints** per group
- **CSV import/export** for bulk contact management
- **Tags and labels** for better organization
- **Search and filter** capabilities

### 📊 Analytics & Tracking
- **Email delivery status** tracking
- **Open rate tracking** with pixel tracking
- **Click tracking** for engagement analysis
- **Detailed analytics** per email campaign
- **Success/failure reporting**

### 🛠 Technical Features
- **Background job processing** for bulk emails
- **Retry mechanism** for failed emails
- **File management system** for attachments
- **RESTful API** with comprehensive endpoints
- **Real-time logging** and monitoring

## 🏗 Architecture

```
┌───────────────────┐          ┌──────────────────┐
│     Frontend      │          │     Backend      │
│ (React + JWT)     │          │ (Node + Express) │
└───────▲───────────┘          └───────▲──────────┘
        │ JWT Auth                      │
        │ OTP Verify                    │
        │ Send Email Request            │
        │ Upload PDFs                   │
        │                              │
        ▼                              ▼
┌───────────────────┐          ┌──────────────────┐
│   Authentication   │ <──────▶│  MongoDB Atlas   │
│ (JWT + OTP via     │          │ (Users, Groups, │
│ Nodemailer)        │          │  Emails, Files) │
└───────────────────┘          └──────────────────┘
        │                              ▲
        │ Send OTP Email               │
        │ Bulk Email Send              │
        ▼                              │
┌────────────────────────────────────────────┐
│                Nodemailer                  │
│ (SMTP/Gmail/SES/other SMTP provider)       │
└────────────────────────────────────────────┘
```

## 📁 Project Structure

```
gojob-email-sender/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js              # User model with auth
│   │   │   ├── Group.js             # Email group model
│   │   │   ├── Email.js             # Email model with tracking
│   │   │   ├── Template.js          # Email template model
│   │   │   └── File.js              # File attachment model
│   │   ├── routes/
│   │   │   ├── auth.js              # Authentication routes
│   │   │   ├── groups.js            # Group management routes
│   │   │   ├── emails.js            # Email management routes
│   │   │   └── index.js             # Main router
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT authentication
│   │   ├── utils/
│   │   │   └── emailService.js      # Nodemailer service
│   │   └── queues/
│   │       ├── emailQueue.js        # Email job queue
│   │       └── worker.js            # Background worker
│   ├── index.js                     # Main server file
│   ├── package.json
│   └── Dockerfile
├── frontend/                        # React frontend (coming soon)
├── docker-compose.yml
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- SMTP email service (Gmail, SendGrid, etc.)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gojob-email-sender/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/gojob
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=24h
   
   # SMTP Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Verify the setup**
   - Health check: `http://localhost:3000/health`
   - API docs: `http://localhost:3000/api/v1`

### Frontend Setup (Coming Soon)
```bash
cd frontend
npm install
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/send-otp` - Send OTP for verification
- `POST /auth/verify-otp` - Verify OTP and activate account
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PUT /auth/change-password` - Change password

### Group Management
- `GET /groups` - Get all groups
- `POST /groups` - Create new group
- `GET /groups/:id` - Get specific group
- `PUT /groups/:id` - Update group
- `DELETE /groups/:id` - Delete group
- `POST /groups/:id/emails` - Add emails to group
- `DELETE /groups/:id/emails` - Remove emails from group

### Email Management
- `GET /emails` - Get all emails
- `POST /emails` - Create email draft
- `GET /emails/:id` - Get specific email
- `PUT /emails/:id` - Update email
- `POST /emails/:id/send` - Send email immediately
- `POST /emails/:id/schedule` - Schedule email
- `DELETE /emails/:id` - Delete email
- `GET /emails/:id/analytics` - Get email analytics

## 🔧 Configuration

### SMTP Providers

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-access-key
SMTP_PASS=your-ses-secret-key
```

## 🐳 Docker Deployment

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

## 📊 Database Schema

### Users Collection
- Email, password (hashed), verification status
- OTP for email verification
- Email quota limits and usage tracking

### Groups Collection
- Group name, description, tags
- Email list with validation constraints
- Min/max email limits per group

### Emails Collection
- Email content, recipients, attachments
- Status tracking (draft, scheduled, sent, failed)
- Delivery status for each recipient
- Open and click tracking data

### Templates Collection
- Reusable email templates
- Placeholder variables for personalization
- Category classification

### Files Collection
- Uploaded file metadata
- File storage paths and types
- Usage tracking and organization

## 🔒 Security Features

- **JWT token expiration** and refresh mechanisms
- **Password hashing** with bcrypt
- **Input validation** and sanitization
- **Rate limiting** for API endpoints
- **CORS configuration** for frontend integration
- **Environment variable** management

## 🚧 Development Roadmap

### Phase 1 (Current)
- ✅ Backend API structure
- ✅ User authentication system
- ✅ Basic email functionality
- ✅ Group management

### Phase 2 (Next)
- 🔄 Frontend React application
- 🔄 File upload system
- 🔄 Email templates
- 🔄 Advanced analytics

### Phase 3 (Future)
- 📅 Email scheduling system
- 📅 Background job processing
- 📅 CSV import/export
- 📅 Advanced reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api/v1`

## 🙏 Acknowledgments

- Express.js team for the robust web framework
- MongoDB team for the flexible database
- Nodemailer team for email functionality
- JWT community for authentication standards

---

**Built with ❤️ by the GoJob Team**
