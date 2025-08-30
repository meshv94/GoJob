import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emails: [{
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    name: String,
    tags: [String]
  }],
  minEmails: {
    type: Number,
    default: 1,
    min: 1
  },
  maxEmails: {
    type: Number,
    default: 1000,
    min: 1
  },
  tags: [String],
  description: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Validate email count constraints
groupSchema.pre('save', function(next) {
  if (this.emails.length < this.minEmails) {
    return next(new Error(`Group must have at least ${this.minEmails} emails`));
  }
  if (this.emails.length > this.maxEmails) {
    return next(new Error(`Group cannot have more than ${this.maxEmails} emails`));
  }
  next();
});

// Index for faster queries
groupSchema.index({ userId: 1, name: 1 });

export default mongoose.model('Group', groupSchema);
