// Configuration file with environment variables and defaults
import dotenv from "dotenv";
dotenv.config();

export const config = {
  // Server Configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  serverUrl: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`,
  
  // MongoDB Configuration
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/gojob',
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // SMTP Configuration
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    secure: process.env.SMTP_SECURE === 'true'
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  
  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  
  // Email Quota
  emailQuota: {
    daily: parseInt(process.env.DAILY_EMAIL_QUOTA) || 100,
    monthly: parseInt(process.env.MONTHLY_EMAIL_QUOTA) || 1000
  }
};

// Validate required configuration
export const validateConfig = () => {
  // const required = ['smtp.user', 'smtp.pass'];
  // const missing = required.filter(key => {
  //   const value = key.split('.').reduce((obj, k) => obj?.[k], config);
  //   return !value;
  // });
  
  // if (missing.length > 0) {
  //   throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  // }
  
  return true;
};

export default config;
