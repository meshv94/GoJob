import express from 'express';
import upload from '../middleware/upload.js';
import {auth} from '../middleware/auth.js';
import { uploadAttachment, getAttachments, deleteAttachment } from '../controller/files.js';

const router = express.Router();

// Upload file (max 5MB, images/pdf/csv)
router.post('/upload', auth, upload.single('file'), uploadAttachment);

// Get all files for user
router.get('/', auth, getAttachments);

// Delete file by id
router.delete('/:id', auth, deleteAttachment);

export default router;