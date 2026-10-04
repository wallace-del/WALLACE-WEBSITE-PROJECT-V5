import crypto from 'node:crypto';

export function requestLogger(req, res, next) {
  const requestId = req.get('x-request-id') || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  const started = Date.now();
  res.on('finish', () => {
    const event = {
      level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - started,
      time: new Date().toISOString()
    };
    console.log(JSON.stringify(event));
  });
  next();
}
