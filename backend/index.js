import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./src/config/database.js";
import routes from "./src/routes/index.js";
import config, { validateConfig } from "./src/config/config.js";
import path from 'path';
import { fileURLToPath } from "url";

// Recreate __dirname and __filename in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
// app.use(dotenv.config())


// Validate configuration
// try {
//   // console.log("=======================", process.env)
//   validateConfig();
// } catch (error) {
//   console.error('❌ Configuration Error:', error.message);
//   process.exit(1);
// }

const app = express();

//cors configuration
app.use(cors({
  origin: '*', // Allow all origins for simplicity; adjust in production
  methods: "*",
  allowedHeaders: "*",
}));

// Add this line:
app.use(express.json());

// Connect to MongoDB
connectDB();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  // console.log('Headers:', req.headers);
  // console.log('Body:', req.body);
  // console.log('Query:', req.query);
  next();
});

// Serve Uploads folder as static
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Routes
app.use('/', routes);

// 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ 
//     message: 'Route not found',
//     path: req.originalUrl
//   });
// });

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(error.errors).map(err => err.message)
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    });
  }
  
  res.status(500).json({
    message: 'Internal Server Error',
    error: config.nodeEnv === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`🚀 GoJob Email Sender Server running on port ${config.port}`);
  console.log(`📧 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${config.port}/health`);
  console.log(`📚 API docs: http://localhost:${config.port}/api/v1`);
  console.log(`📊 MongoDB: ${config.mongoUri}`);
  console.log(`📧 SMTP: ${config.smtp.host}:${config.smtp.port}`);
  console.log("📂 Serving uploads from:", path.join(__dirname, 'Uploads'));
});
