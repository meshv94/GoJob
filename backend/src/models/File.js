import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['attachment', 'template', 'avatar'],
    default: 'attachment'
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: Date,
  metadata: {
    width: Number,
    height: Number,
    duration: Number,
    pages: Number
  }
}, {
  timestamps: true
});

// Index for better performance
fileSchema.index({ userId: 1, category: 1 });
fileSchema.index({ mimetype: 1 });
fileSchema.index({ tags: 1 });

export default mongoose.model('File', fileSchema);
