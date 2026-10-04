import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { sendContactNotification } from '../services/emailNotifications.js';

const router = Router();
const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(3000)
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok:false, error:'Please provide a valid name, email, subject and message.' });
    const saved = await prisma.contactMessage.create({ data: parsed.data });
    sendContactNotification(saved).catch((error) => console.error('Contact email notification failed:', error.message));
    return res.status(201).json({ ok:true, message:'Message received successfully.', id:saved.id });
  } catch (err) { next(err); }
});

export default router;
