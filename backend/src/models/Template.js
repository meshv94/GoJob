import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
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
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  placeholders: [{
    name: String,
    description: String,
    example: String
  }],
  category: {
    type: String,
    enum: ['marketing', 'notification', 'welcome', 'custom'],
    default: 'custom'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  variables: {
    type: Map,
    of: String
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: Date
}, {
  timestamps: true
});

// Index for better performance
templateSchema.index({ userId: 1, name: 1 });
templateSchema.index({ category: 1, isPublic: 1 });

export default mongoose.model('Template', templateSchema);
