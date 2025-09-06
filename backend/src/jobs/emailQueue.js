import Queue from 'bull';
import emailService from '../utils/emailService.js';
import Email from '../models/Email.js';
import User from '../models/User.js';

const emailQueue = new Queue('scheduled-emails', {
  redis: { host: '127.0.0.1', port: 6379 }
});

emailQueue.process(async (job) => {
  const { emailId, userId } = job.data;
  console
  const email = await Email.findOne({ _id: emailId, userId });
  if (!email || email.status !== 'scheduled') return;

  const user = await User.findById(userId);
  const recipientCount = email.to.length;
  if (user.emailQuota.used + recipientCount > user.emailQuota.monthly) {
    email.status = 'failed';
    await email.save();
    return;
  }

  const emailData = email.to.map(recipient => ({
    from: email.from,
    to: recipient.email,
    cc: email.cc,
    bcc: email.bcc,
    subject: email.subject,
    content: email.content,
    attachments: email.attachments
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