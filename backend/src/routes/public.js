import { Router } from 'express';
import { prisma } from '../db.js';
import { fallbackProfile } from '../services/portfolioKnowledge.js';

const router = Router();
const publicProject = ({ id, createdAt, updatedAt, sortOrder, ...project }) => project;

router.get('/profile', async (_req,res,next) => {
  try {
    const row = await prisma.siteProfile.findUnique({ where:{ id:1 } });
    res.json(row || fallbackProfile);
  } catch (err) { next(err); }
});

router.get('/site-content', async (_req,res,next) => {
  try {
    const [profile, projects] = await Promise.all([
      prisma.siteProfile.findUnique({ where:{ id:1 } }),
      prisma.project.findMany({ orderBy:[{ sortOrder:'asc' },{ id:'asc' }] })
    ]);
    res.json({ profile: profile || fallbackProfile, projects: projects.map(publicProject) });
  } catch (err) { next(err); }
});

router.get('/projects', async (_req,res,next) => {
  try {
    const rows = await prisma.project.findMany({ orderBy:[{ sortOrder:'asc' },{ id:'asc' }] });
    res.json(rows.map(publicProject));
  } catch (err) { next(err); }
});

router.get('/projects/:slug', async (req,res,next) => {
  try {
    const p = await prisma.project.findUnique({ where:{ slug:req.params.slug } });
    if (!p) return res.status(404).json({ error:'Project not found.' });
    res.json(publicProject(p));
  } catch (err) { next(err); }
});
export default router;
