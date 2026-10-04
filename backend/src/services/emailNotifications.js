import nodemailer from 'nodemailer';

const enabled = () => String(process.env.EMAIL_NOTIFICATIONS || '').toLowerCase() === 'true';

export function emailNotificationsConfigured() {
  return Boolean(enabled() && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.CONTACT_NOTIFY_TO);
}

export async function sendContactNotification(message) {
  if (!emailNotificationsConfigured()) return { configured:false, sent:false };
  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.CONTACT_NOTIFY_TO,
    replyTo: message.email,
    subject: `[WALLACE.DEV] ${message.subject}`,
    text: `New portfolio contact message\n\nName: ${message.name}\nEmail: ${message.email}\nSubject: ${message.subject}\n\n${message.message}`
  });
  return { configured:true, sent:true };
}
