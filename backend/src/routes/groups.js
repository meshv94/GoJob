import express from 'express';
import Group from '../models/Group.js';
import { auth } from '../middleware/auth.js';
import { Groups } from '../controller/groups.js';
import { validateGroup } from '../middleware/validate.js';

const router = express.Router();

// Get all groups for the authenticated user
router.get('/', auth, Groups.getAllGroup);

// Get single group by ID
router.get('/:id', auth, Groups.getGroupById);

// Create new group
router.post('/', auth, validateGroup.create, Groups.createGroup);

// Update group
router.put('/:id', auth, validateGroup.update, Groups.updateGroupById);

// Delete group (soft delete)
router.delete('/:id', auth, Groups.deleteGroupById);

// Add emails to group
router.post('/:id/emails', auth, validateGroup.addEmails, Groups.addEmailsInToGroup);

// Remove emails from group
router.delete('/:id/emails', auth, validateGroup.removeEmails, Groups.removeEmailsFromGroup);

// Import emails from CSV (placeholder for future implementation)
router.post('/:id/import', auth, Groups.importEmailsByCSV);

export default router;
