import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./src/config/database.js";
import routes from "./src/routes/index.js";
import config, { validateConfig } from "./src/config/config.js";

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

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: config.upload.maxFileSize }));
app.use(express.urlencoded({ extended: true, limit: config.upload.maxFileSize }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

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
});
