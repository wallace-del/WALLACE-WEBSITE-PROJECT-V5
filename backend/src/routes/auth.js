import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db.js';
import { clearAdminCookie, issueAdminCookie, requireAdmin } from '../middleware/adminAuth.js';

const router = Router();
const loginSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(1).max(200)
});

router.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok:false, error:'Enter a valid email and password.' });
    const email = parsed.data.email.toLowerCase();
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    const valid = admin ? await bcrypt.compare(parsed.data.password, admin.passwordHash) : false;
    if (!valid) return res.status(401).json({ ok:false, error:'Invalid email or password.' });
    issueAdminCookie(res, admin);
    return res.json({ ok:true, admin:{ id:admin.id, email:admin.email } });
  } catch (err) { next(err); }
});

router.post('/logout', (_req, res) => {
  clearAdminCookie(res);
  res.json({ ok:true });
});

router.get('/me', requireAdmin, async (req, res, next) => {
  try {
    const admin = await prisma.adminUser.findUnique({ where:{ id:Number(req.admin.sub) }, select:{ id:true, email:true, createdAt:true } });
    if (!admin) return res.status(401).json({ ok:false, error:'Admin account not found.' });
    res.json({ ok:true, admin });
  } catch (err) { next(err); }
});

export default router;
