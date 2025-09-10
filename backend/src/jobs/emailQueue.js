import Queue from 'bull';
import emailService from '../utils/emailService.js';
import Email from '../models/Email.js';
import User from '../models/User.js';
import File from '../models/File.js';
import path from 'path';

const emailQueue = new Queue('scheduled-emails', {
  redis: { host: 'redis', port: 6379 }
});

emailQueue.process(async (job) => {
  const { emailId, userId } = job.data;
  console.log(`Processing email job for emailId: ${emailId}, userId: ${userId}`);
  const email = await Email.findOne({ _id: emailId, userId });
  console.log('Fetched Email:', email);
  if (!email || email.status !== 'scheduled') return;

  const user = await User.findById(userId);
  const recipientCount = email.to.length;
  if (user.emailQuota.used + recipientCount > user.emailQuota.monthly) {
    email.status = 'failed';
    await email.save();
    return;
  }

  // Fetch attachment file info
      let attachmentFiles = [];
      if (email.attachments && email.attachments.length > 0) {
        attachmentFiles = await File.find({
          _id: { $in: email.attachments },
          userId: userId,
          category: 'attachment'
        });
      }
console.log('Attachment Files:', attachmentFiles);
  const emailData = email.to.map(recipient => ({
    from: email.from,
    to: recipient.email,
    cc: email.cc,
    bcc: email.bcc,
    subject: email.subject,
    content: email.content,
    attachments: attachmentFiles.map(f => ({
            filename: f.originalName,
            path: path.join(process.cwd(), 'Uploads', f.path)
          }))
  }));

  const results = await emailService.sendBulkEmails(emailData, userId);

  email.deliveryStatus = results.map(result => ({
    email: result.email,
    status: result.success ? 'sent' : 'failed',
    sentAt: result.sentAt,
    failureReason: result.error || null
  }));

  email.status = 'sent';
  email.sentAt = new Date();

  user.emailQuota.used += recipientCount;
  await user.save();
  await email.save();
});

export default emailQueue;