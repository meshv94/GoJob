import express from 'express';
import User from '../models/User.js';
import { auth, generateToken } from '../middleware/auth.js';
import emailService from '../utils/emailService.js';
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate OTP
    const otp = emailService.generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = new User({
      email,
      password,
      otp: {
        code: otp,
        expiresAt: otpExpiry
      }
    });

    await user.save();

    // Send OTP email
    const emailResult = await emailService.sendOTP(email, otp);
    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.status(201).json({ 
      message: 'User registered successfully. Please check your email for verification code.',
      userId: user._id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Send OTP for verification
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Generate new OTP
    const otp = emailService.generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    console.log(otp, otpExpiry);
    user.otp = {
      code: otp,
      expiresAt: otpExpiry
    };
    await user.save();

    // Send OTP email
    const emailResult = await emailService.sendOTP(email, otp);
    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      return res.status(400).json({ message: 'No OTP found' });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        emailQuota: user.emailQuota
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {

    const hasSMTP =
      req.user.smtp && req.user.smtp.user && req.user.smtp.pass ? true : false;

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        isVerified: req.user.isVerified,
        emailQuota: req.user.emailQuota,
        createdAt: req.user.createdAt,
        hasSMTP: hasSMTP
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save SMTP credentials for logged-in user
router.post('/smtp', auth, async (req, res) => {
  try {
    const { smtpUser, smtpPass, smtpHost, smtpPort } = req.body;

    if (!smtpUser || !smtpPass) {
      return res.status(404).json({ success: false, message: 'SMTP credentials not found' });
    }

    const user = await User.findById(req.user._id);

    user.smtp = {
      host: smtpHost || 'smtp.gmail.com',
      port: smtpPort || 587,
      user: smtpUser,
      pass: smtpPass // 🚨 Encrypt before saving in real apps
    };

    await user.save();

    res.json({ success: true, message: 'SMTP credentials saved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get SMTP credentials for logged-in user
router.get('/smtp', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('smtp');

    if (!user || !user.smtp || !user.smtp.user) {
      return res.json({ success: false, message: 'No SMTP details found' });
    }

    // Don't send password in plain text 🚨
    const { host, port, user: smtpUser, pass } = user.smtp;

    res.json({
      success: true,
      smtp: {
        host,
        port,
        user: smtpUser,
        hasSMTP: true,
        pass
      }
    });
  } catch (error) {
    console.error('Get SMTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update SMTP credentials
router.put('/smtp', auth, async (req, res) => {
  try {
    const { smtpUser, smtpPass, smtpHost, smtpPort } = req.body;

    if (!smtpUser || !smtpPass) {
      return res.status(400).json({ success: false, message: 'SMTP user & pass are required' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.smtp = {
      host: smtpHost || user.smtp?.host || 'smtp.gmail.com',
      port: smtpPort || user.smtp?.port || 587,
      user: smtpUser,
      pass: smtpPass // 🚨 Encrypt in production
    };

    await user.save();

    res.json({ success: true, message: 'SMTP credentials updated' });
  } catch (error) {
    console.error('Update SMTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


export default router;
