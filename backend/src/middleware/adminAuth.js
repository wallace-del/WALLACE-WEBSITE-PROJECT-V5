import jwt from 'jsonwebtoken';

const cookieName = 'wallace_admin';

export function issueAdminCookie(res, admin) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET must be at least 32 characters.');
  const token = jwt.sign({ sub: String(admin.id), email: admin.email, role: 'admin' }, secret, { expiresIn: '8h' });
  res.cookie(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000,
    path: '/'
  });
}

export function clearAdminCookie(res) {
  res.clearCookie(cookieName, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
}

export function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.[cookieName];
    if (!token) return res.status(401).json({ ok:false, error:'Authentication required.' });
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ ok:false, error:'Authentication is not configured.' });
    const payload = jwt.verify(token, secret);
    if (payload?.role !== 'admin') return res.status(403).json({ ok:false, error:'Access denied.' });
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ ok:false, error:'Session expired or invalid.' });
  }
}
