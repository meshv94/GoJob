import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: [{
    email: String,
    name: String,
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group'
    }
  }],
  cc: [String],
  bcc: [String],
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
    default: 'draft'
  },
  scheduledAt: Date,
  sentAt: Date,
  deliveryStatus: [{
    email: String,
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed', 'bounced'],
      default: 'pending'
    },
    sentAt: Date,
    deliveredAt: Date,
    failureReason: String
  }],
  openTracking: {
    enabled: { type: Boolean, default: true },
    openedBy: [{
      email: String,
      openedAt: Date,
      ipAddress: String,
      userAgent: String
    }]
  },
  clickTracking: {
    enabled: { type: Boolean, default: true },
    clicks: [{
      email: String,
      link: String,
      clickedAt: Date,
      ipAddress: String
    }]
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  }
}, {
  timestamps: true
});

// Indexes for better performance
emailSchema.index({ userId: 1, status: 1, createdAt: -1 });
emailSchema.index({ scheduledAt: 1, status: 1 });
emailSchema.index({ 'deliveryStatus.email': 1 });

export default mongoose.model('Email', emailSchema);
