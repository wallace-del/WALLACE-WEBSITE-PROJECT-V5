import { Router } from 'express';
import { z } from 'zod';
import { answerPortfolioQuestion } from '../services/portfolioKnowledge.js';

const router = Router();
const schema = z.object({ message: z.string().trim().min(1).max(500) });

router.post('/chat', async (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok:false, error:'Message must be between 1 and 500 characters.' });
    return res.json({ ok:true, ...(await answerPortfolioQuestion(parsed.data.message)) });
  } catch (err) { next(err); }
});

export default router;
