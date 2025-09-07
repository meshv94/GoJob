import express from 'express';
import authRoutes from './auth.js';
import groupRoutes from './groups.js';
import emailRoutes from './emails.js';
import filesRouter from './files.js'

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'GoJob Email Sender API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API version endpoint
router.get('/api/v1', (req, res) => {
  res.json({ 
    message: 'GoJob Email Sender API v1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      auth: '/auth',
      groups: '/groups',
      emails: '/emails'
    },
    features: [
      'User Authentication with JWT & OTP',
      'Email Group Management',
      'Bulk Email Sending',
      'Email Templates',
      'File Attachments',
      'Email Scheduling',
      'Analytics & Tracking'
    ]
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/groups', groupRoutes);
router.use('/emails', emailRoutes);
router.use('/files', filesRouter);

export default router;
