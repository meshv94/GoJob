const Queue = require("bull");
const nodemailer = require("nodemailer");

const emailQueue = new Queue("emailQueue", {
  redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Process email jobs
emailQueue.process(async (job, done) => {
  try {
    const { from, to, subject, text, attachments } = job.data;

    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      attachments
    });

    done();
  } catch (err) {
    done(new Error(err));
  }
});

module.exports = emailQueue;


// exaple to use 
const emailQueue = require("../queues/emailQueue");

exports.sendEmail = async (req, res) => {
  const { from, to, subject, text, attachments } = req.body;

  await emailQueue.add({ from, to, subject, text, attachments });

  res.json({ message: "Email added to queue" });
};
