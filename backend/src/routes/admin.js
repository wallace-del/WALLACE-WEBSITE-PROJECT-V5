import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();
router.use(requireAdmin);

const uploadDir = path.resolve('uploads');
fs.mkdirSync(uploadDir, { recursive:true });
const storage = multer.diskStorage({
  destination: (_req,_file,cb) => cb(null, uploadDir),
  filename: (_req,file,cb) => {
    const ext = ({'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','image/gif':'.gif'})[file.mimetype] || '';
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  }
});
const upload = multer({
  storage,
  limits:{ fileSize:5*1024*1024 },
  fileFilter:(_req,file,cb) => cb(null, ['image/jpeg','image/png','image/webp','image/gif'].includes(file.mimetype))
});

const projectSchema = z.object({
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(140),
  status: z.string().trim().min(2).max(60),
  text: z.string().trim().min(20).max(4000),
  path: z.string().trim().min(1).max(255),
  imageUrl: z.union([z.string().trim().url().max(500), z.string().trim().regex(/^\/uploads\/[A-Za-z0-9._-]+$/), z.literal('')]).optional().transform(v => v || null),
  technologies: z.array(z.string().trim().min(1).max(80)).max(40).optional().default([]),
  githubUrl: z.union([z.string().trim().url().max(500), z.literal('')]).optional().transform(v => v || null),
  liveUrl: z.union([z.string().trim().url().max(500), z.literal('')]).optional().transform(v => v || null),
  featured: z.coerce.boolean().optional().default(false),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0)
});

router.get('/summary', async (_req, res, next) => {
  try {
    const [messages, unread, projects] = await Promise.all([
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where:{ readAt:null } }),
      prisma.project.count()
    ]);
    res.json({ ok:true, counts:{ messages, unread, projects } });
  } catch (err) { next(err); }
});

router.get('/messages', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const take = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    const [items, total] = await Promise.all([
      prisma.contactMessage.findMany({ orderBy:{ createdAt:'desc' }, skip:(page-1)*take, take }),
      prisma.contactMessage.count()
    ]);
    res.json({ ok:true, page, total, items });
  } catch (err) { next(err); }
});

router.patch('/messages/:id/read', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ ok:false, error:'Invalid message ID.' });
    const item = await prisma.contactMessage.update({ where:{ id }, data:{ readAt:new Date() } });
    res.json({ ok:true, item });
  } catch (err) { if (err?.code === 'P2025') return res.status(404).json({ ok:false, error:'Message not found.' }); next(err); }
});

router.delete('/messages/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ ok:false, error:'Invalid message ID.' });
    await prisma.contactMessage.delete({ where:{ id } });
    res.json({ ok:true });
  } catch (err) { if (err?.code === 'P2025') return res.status(404).json({ ok:false, error:'Message not found.' }); next(err); }
});


router.post('/uploads/project-image', upload.single('image'), (req,res) => {
  if (!req.file) return res.status(400).json({ ok:false, error:'Choose a JPG, PNG, WebP or GIF image up to 5 MB.' });
  res.status(201).json({ ok:true, imageUrl:`/uploads/${req.file.filename}` });
});

router.get('/projects', async (_req, res, next) => {
  try { res.json({ ok:true, items:await prisma.project.findMany({ orderBy:[{ sortOrder:'asc' },{ id:'asc' }] }) }); }
  catch (err) { next(err); }
});

router.post('/projects', async (req, res, next) => {
  try {
    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok:false, error:'Check the project fields and try again.' });
    const item = await prisma.project.create({ data:parsed.data });
    res.status(201).json({ ok:true, item });
  } catch (err) { if (err?.code === 'P2002') return res.status(409).json({ ok:false, error:'That project slug already exists.' }); next(err); }
});

router.put('/projects/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const parsed = projectSchema.safeParse(req.body);
    if (!Number.isInteger(id) || !parsed.success) return res.status(400).json({ ok:false, error:'Check the project fields and try again.' });
    const item = await prisma.project.update({ where:{ id }, data:parsed.data });
    res.json({ ok:true, item });
  } catch (err) {
    if (err?.code === 'P2002') return res.status(409).json({ ok:false, error:'That project slug already exists.' });
    if (err?.code === 'P2025') return res.status(404).json({ ok:false, error:'Project not found.' });
    next(err);
  }
});

router.delete('/projects/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ ok:false, error:'Invalid project ID.' });
    await prisma.project.delete({ where:{ id } });
    res.json({ ok:true });
  } catch (err) { if (err?.code === 'P2025') return res.status(404).json({ ok:false, error:'Project not found.' }); next(err); }
});


const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().min(5).max(220),
  location: z.string().trim().min(2).max(120),
  university: z.string().trim().min(2).max(180),
  studyPeriod: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  githubProfile: z.string().trim().url().max(255),
  githubRepo: z.string().trim().url().max(255),
  linkedin: z.string().trim().url().max(255),
  aboutHeadline: z.string().trim().min(5).max(220),
  aboutText: z.string().trim().min(20).max(4000),
  heroFocus: z.array(z.string().trim().min(1).max(80)).max(20),
  currentlyDeveloping: z.array(z.string().trim().min(1).max(80)).max(30),
  skillGroups: z.array(z.object({ title:z.string().trim().min(1).max(100), items:z.array(z.string().trim().min(1).max(80)).max(40) })).max(12),
  learningGroups: z.array(z.object({ state:z.string().trim().min(1).max(40), title:z.string().trim().min(1).max(140), items:z.array(z.string().trim().min(1).max(80)).max(40) })).max(10),
  availability: z.array(z.string().trim().min(1).max(100)).max(30),
  languages: z.array(z.string().trim().min(1).max(80)).max(20)
});

router.get('/profile', async (_req,res,next) => {
  try {
    const item = await prisma.siteProfile.findUnique({ where:{ id:1 } });
    res.json({ ok:true, item });
  } catch (err) { next(err); }
});

router.put('/profile', async (req,res,next) => {
  try {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok:false, error:'Check the profile fields and list formatting.' });
    const item = await prisma.siteProfile.upsert({ where:{ id:1 }, update:parsed.data, create:{ id:1, ...parsed.data } });
    res.json({ ok:true, item });
  } catch (err) { next(err); }
});

export default router;
