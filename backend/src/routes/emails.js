import express from 'express';
import Email from '../models/Email.js';
import Group from '../models/Group.js';
import { auth } from '../middleware/auth.js';
import { validateEmail } from '../middleware/validate.js';
import emailService from '../utils/emailService.js';
import User from '../models/User.js';
import emailQueue from '../jobs/emailQueue.js';

const router = express.Router();

// Get all emails for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    const query = { userId: req.user._id };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { 'to.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    const emails = await Email.find(query)
      .populate('to.groupId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Email.countDocuments(query);
    
    res.json({
      emails,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get emails error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single email by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const email = await Email.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    }).populate('to.groupId', 'name');
    
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }
    
    res.json({ email });
  } catch (error) {
    console.error('Get email error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new email (draft)
router.post('/', auth, validateEmail.create, async (req, res) => {
  try {
    // Validation is now handled by middleware
    const { from, to, cc, bcc, subject, content, template, attachments, scheduledAt } = req.body;
    
    // Check if user has quota
    const user = await User.findById(req.user._id);
    if (user.emailQuota.used >= user.emailQuota.monthly) {
      return res.status(403).json({ success: false, message: 'Monthly email quota exceeded' });
    }
    
    // Determine status
    let status = 'draft';
    if (scheduledAt) {
      status = 'scheduled';
    }
    
    const email = new Email({
      userId: req.user._id,
      from,
      to,
      cc: cc || [],
      bcc: bcc || [],
      subject,
      content,
      template,
      attachments: attachments || [],
      status,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null
    });
    
    await email.save();
    
    res.status(201).json({ 
      success: true,
      message: 'Email created successfully',
      email
    });
  } catch (error) {
    console.error('Create email error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send email immediately
router.post('/:id/send', auth, async (req, res) => {
  try {
    const email = await Email.findOne({ 
      _id: req.params.id, 
      userId: req.user._id,
      status: { $in: ['draft', 'scheduled'] }
    });
    
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email not found or cannot be sent' });
    }
    
    // Check quota
    const user = await User.findById(req.user._id);
    const recipientCount = email.to.length;
    if (user.emailQuota.used + recipientCount > user.emailQuota.monthly) {
      return res.status(403).json({ success: false, message: 'Sending this email would exceed your monthly quota' });
    }
    
    // Update status
    email.status = 'sending';
    await email.save();
    
    // Prepare email data for sending
    const emailData = email.to.map(recipient => ({
      from: email.from,
      to: recipient.email,
      cc: email.cc,
      bcc: email.bcc,
      subject: email.subject,
      content: email.content,
      attachments: email.attachments
    }));
    
    // Send emails
    const results = await emailService.sendBulkEmails(emailData, req.user._id);
    
    // Update delivery status
    email.deliveryStatus = results.map(result => ({
      email: result.email,
      status: result.success ? 'sent' : 'failed',
      sentAt: result.sentAt,
      failureReason: result.error || null
    }));
    
    email.status = 'sent';
    email.sentAt = new Date();
    
    // Update user quota
    user.emailQuota.used += recipientCount;
    await user.save();
    
    await email.save();
    
    res.json({ 
      success: true,
      message: 'Email sent successfully',
      results,
      email
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update email (draft)
router.put('/:id', auth, validateEmail.update, async (req, res) => {
  try {
    const { from, to, cc, bcc, subject, content, template, attachments, scheduledAt } = req.body;
    
    const email = await Email.findOne({ 
      _id: req.params.id, 
      userId: req.user._id,
      status: { $in: ['draft', 'scheduled'] }
    });
    
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email not found or cannot be updated' });
    }
    
    // Update fields
    if (from !== undefined) email.from = from;
    if (to !== undefined) email.to = to;
    if (cc !== undefined) email.cc = cc;
    if (bcc !== undefined) email.bcc = bcc;
    if (subject !== undefined) email.subject = subject;
    if (content !== undefined) email.content = content;
    if (template !== undefined) email.template = template;
    if (attachments !== undefined) email.attachments = attachments;
    if (scheduledAt !== undefined) {
      email.scheduledAt = new Date(scheduledAt);
      email.status = scheduledAt ? 'scheduled' : 'draft';
    }
    
    await email.save();
    
    res.json({ 
      success: true,
      message: 'Email updated successfully',
      email
    });
  } catch (error) {
    console.error('Update email error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete email
router.delete('/:id', auth, async (req, res) => {
  try {
    const email = await Email.findOne({ 
      _id: req.params.id, 
      userId: req.user._id,
      status: { $in: ['draft', 'scheduled'] }
    });
    
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email not found or cannot be deleted' });
    }
    
    await email.deleteOne();
    
    res.json({ success: true, message: 'Email deleted successfully' });
  } catch (error) {
    console.error('Delete email error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Schedule email
router.post('/:id/schedule', auth, validateEmail.schedule, async (req, res) => {
  try {
    console.log("Scheduling email...");
    // Validation is now handled by middleware
    const { scheduledAt } = req.body;
    console.log("Scheduling email...", scheduledAt);
    
    const email = await Email.findOne({ 
      _id: req.params.id, 
      userId: req.user._id,
      status: 'draft'
    });
    console.log("Scheduling email...", email);
    
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email not found or cannot be scheduled' });
    }
    
    email.status = 'scheduled';
    email.scheduledAt = new Date(scheduledAt);
    await email.save();

    // Add job to Bull queue
    const delay = new Date(scheduledAt) - Date.now();
    console.log("Scheduling email with delay:", delay);
    if (delay > 0) {
      await emailQueue.add(
        { emailId: email._id, userId: req.user._id },
        { delay }
      );
    } else {
      // If scheduledAt is in the past, send immediately
      await emailQueue.add(
        { emailId: email._id, userId: req.user._id }
      );
    }
    
    res.json({
      success: true,
      message: 'Email scheduled successfully',
      email
    });
  } catch (error) {
    console.error('Schedule email error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get email analytics
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const email = await Email.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }
    
    const analytics = {
      totalRecipients: email.to.length,
      sent: email.deliveryStatus.filter(d => d.status === 'sent').length,
      failed: email.deliveryStatus.filter(d => d.status === 'failed').length,
      delivered: email.deliveryStatus.filter(d => d.status === 'delivered').length,
      opened: email.openTracking.openedBy.length,
      clicks: email.clickTracking.clicks.length,
      openRate: email.to.length > 0 ? (email.openTracking.openedBy.length / email.to.length * 100).toFixed(2) : 0,
      clickRate: email.to.length > 0 ? (email.clickTracking.clicks.length / email.to.length * 100).toFixed(2) : 0
    };
    
    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Track email open
router.get('/:id/track/:recipientEmail', async (req, res) => {
  try {
    const { id, recipientEmail } = req.params;
    
    const email = await Email.findById(id);
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }
    
    // Add tracking pixel
    const trackingPixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    
    // Record open
    const existingOpen = email.openTracking.openedBy.find(o => o.email === recipientEmail);
    if (!existingOpen) {
      email.openTracking.openedBy.push({
        email: recipientEmail,
        openedAt: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      await email.save();
    }
    
    res.set('Content-Type', 'image/gif');
    res.send(trackingPixel);
  } catch (error) {
    console.error('Track open error:', error);
    res.status(500).send();
  }
});


export default router;
