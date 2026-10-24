
import { Router } from 'express';
import { z } from 'zod';
import { answerPortfolioQuestion } from '../services/portfolioKnowledge.js';

const router = Router();

const historyItemSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(500)
});

const schema = z.object({
  message: z.string().trim().min(1).max(500),
  history: z.array(historyItemSchema).max(6).optional().default([])
});

router.post('/chat', async (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        error: 'Please provide a message of 1–500 characters and no more than six recent history messages.'
      });
    }

    const result = await answerPortfolioQuestion(
      parsed.data.message,
      parsed.data.history
    );

    return res.json({
      ok: true,
      text: result.text,
      links: Array.isArray(result.links) ? result.links : []
    });
  } catch (error) {
    next(error);
  }
});

export default router;
