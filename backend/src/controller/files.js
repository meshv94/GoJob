import File from '../models/File.js';
import fs from 'fs';
import { deleteUploadedFile } from '../utils/fileUtils.js';

export const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    console.log("req.file In Upload Files", req.file);
    const fileDoc = await File.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.relativePath, // This is relative
      userId: req.user._id,
      category: 'attachment',
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
      metadata: req.body.metadata || {}
    });

    res.json({ success: true, file: fileDoc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAttachments = async (req, res) => {
  try {
    const files = await File.find({ userId: req.user._id, category: 'attachment' }).sort({ createdAt: -1 });
    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAttachment = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.user._id, category: 'attachment' });
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });
    
    // Use utility to delete file
    let isFileDeleted = deleteUploadedFile(file.path);
    if (!isFileDeleted) {
      console.warn(`Warning: File at path ${file.path} could not be deleted or does not exist.`);
    }
    await file.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};